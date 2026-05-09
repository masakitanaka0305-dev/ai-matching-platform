from __future__ import annotations
"""
Discord通知サービス

マッチングイベント発生時にDiscordチャンネルへ通知を送信する。
- 新規マッチ提案
- ステータス変更
- 新規エンジニア登録
- 新規企業登録
- 決済完了
"""
import httpx
from datetime import datetime
from typing import Optional

from ..core.config import settings

DISCORD_API_BASE = "https://discord.com/api/v10"


class DiscordNotifier:
    """Discord Bot APIを使った通知送信"""

    def __init__(self):
        self.token = settings.discord_bot_token
        self.channel_id = settings.discord_notification_channel_id
        self.headers = {
            "Authorization": f"Bot {self.token}",
            "Content-Type": "application/json",
        }

    async def _send_message(self, channel_id: str, embed: dict) -> dict:
        """Discordチャンネルにembed付きメッセージを送信"""
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{DISCORD_API_BASE}/channels/{channel_id}/messages",
                headers=self.headers,
                json={"embeds": [embed]},
            )
            resp.raise_for_status()
            return resp.json()

    # ------------------------------------------------------------------
    # 通知テンプレート
    # ------------------------------------------------------------------

    async def notify_new_match(
        self,
        engineer_name: str,
        company_name: str,
        posting_title: str,
        ai_score: float,
        match_id: str,
        channel_id: Optional[str] = None,
    ):
        """新規マッチング提案通知"""
        score_bar = "🟩" * int(ai_score // 10) + "⬜" * (10 - int(ai_score // 10))

        embed = {
            "title": "🤝 新規マッチング提案",
            "color": 0x5865F2,  # Discord Blurple
            "fields": [
                {"name": "エンジニア", "value": engineer_name, "inline": True},
                {"name": "企業・案件", "value": f"{company_name}\n{posting_title}", "inline": True},
                {"name": "AIスコア", "value": f"`{ai_score:.1f}` {score_bar}", "inline": False},
                {"name": "Match ID", "value": f"`{match_id}`", "inline": False},
            ],
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "AI Matching Platform"},
        }
        target = channel_id or self.channel_id
        return await self._send_message(target, embed)

    async def notify_status_change(
        self,
        match_id: str,
        engineer_name: str,
        company_name: str,
        old_status: str,
        new_status: str,
        channel_id: Optional[str] = None,
    ):
        """マッチングステータス変更通知"""
        status_emoji = {
            "proposed": "📋",
            "company_reviewed": "👀",
            "approach_unlocked": "🔓",
            "scout_sent": "🚀",
            "engineer_interested": "💡",
            "interview_scheduled": "📅",
            "accepted": "🎉",
            "rejected": "❌",
            "withdrawn": "🚪",
        }
        emoji = status_emoji.get(new_status, "🔄")

        embed = {
            "title": f"{emoji} ステータス更新",
            "color": 0x57F287 if new_status == "accepted" else 0xFEE75C,
            "fields": [
                {"name": "マッチ", "value": f"{engineer_name} ↔ {company_name}", "inline": False},
                {"name": "変更", "value": f"`{old_status}` → `{new_status}`", "inline": False},
                {"name": "Match ID", "value": f"`{match_id}`", "inline": True},
            ],
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "AI Matching Platform"},
        }
        target = channel_id or self.channel_id
        return await self._send_message(target, embed)

    async def notify_new_engineer(
        self,
        name: str,
        experience_level: str,
        specialties: list[str],
        source: str,
        channel_id: Optional[str] = None,
    ):
        """新規エンジニア登録通知"""
        embed = {
            "title": "👤 新規エンジニア登録",
            "color": 0x3498DB,
            "fields": [
                {"name": "名前", "value": name, "inline": True},
                {"name": "レベル", "value": experience_level, "inline": True},
                {"name": "AI専門領域", "value": ", ".join(specialties) if specialties else "未設定", "inline": False},
                {"name": "流入元", "value": source, "inline": True},
            ],
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "AI Matching Platform"},
        }
        target = channel_id or self.channel_id
        return await self._send_message(target, embed)

    async def notify_new_company(
        self,
        name: str,
        industry: str,
        contact_name: str,
        channel_id: Optional[str] = None,
    ):
        """新規企業登録通知"""
        embed = {
            "title": "🏢 新規企業登録",
            "color": 0xE67E22,
            "fields": [
                {"name": "企業名", "value": name, "inline": True},
                {"name": "業種", "value": industry or "未設定", "inline": True},
                {"name": "担当者", "value": contact_name, "inline": True},
            ],
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "AI Matching Platform"},
        }
        target = channel_id or self.channel_id
        return await self._send_message(target, embed)

    async def notify_payment(
        self,
        company_name: str,
        amount: int,
        payment_type: str,
        channel_id: Optional[str] = None,
    ):
        """決済完了通知"""
        embed = {
            "title": "💰 決済完了",
            "color": 0x2ECC71,
            "fields": [
                {"name": "企業", "value": company_name, "inline": True},
                {"name": "金額", "value": f"¥{amount:,}", "inline": True},
                {"name": "種別", "value": payment_type, "inline": True},
            ],
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "AI Matching Platform"},
        }
        target = channel_id or self.channel_id
        return await self._send_message(target, embed)


    async def notify_approach_sent(
        self,
        company_name: str,
        engineer_name: str,
        match_id: str,
        channel_id: Optional[str] = None,
    ):
        """アプローチメッセージ送信通知"""
        embed = {
            "title": "📨 アプローチ送信",
            "color": 0x9B59B6,
            "fields": [
                {"name": "企業", "value": company_name, "inline": True},
                {"name": "候補者", "value": engineer_name, "inline": True},
                {"name": "Match ID", "value": f"`{match_id}`", "inline": False},
            ],
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "AI Matching Platform"},
        }
        target = channel_id or self.channel_id
        return await self._send_message(target, embed)

    async def notify_scout_approach_unlocked(
        self,
        company_name: str,
        engineer_name: str,
        amount: int,
        match_id: str,
        channel_id: Optional[str] = None,
    ):
        """優先アプローチ権解放通知"""
        embed = {
            "title": "🔓 優先アプローチ権 解放",
            "color": 0xF1C40F,
            "fields": [
                {"name": "企業", "value": company_name, "inline": True},
                {"name": "候補者", "value": engineer_name, "inline": True},
                {"name": "金額", "value": f"¥{amount:,}", "inline": True},
                {"name": "Match ID", "value": f"`{match_id}`", "inline": False},
            ],
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "AI Matching Platform — 技術鑑定書生成完了"},
        }
        target = channel_id or self.channel_id
        return await self._send_message(target, embed)

    async def notify_scout_sent(
        self,
        company_name: str,
        engineer_name: str,
        posting_title: str,
        match_id: str,
        channel_id: Optional[str] = None,
    ):
        """スカウト送信通知"""
        embed = {
            "title": "🚀 スカウト送信",
            "color": 0x8B5CF6,
            "fields": [
                {"name": "企業", "value": company_name, "inline": True},
                {"name": "候補者", "value": engineer_name, "inline": True},
                {"name": "ポジション", "value": posting_title, "inline": False},
                {"name": "Match ID", "value": f"`{match_id}`", "inline": False},
            ],
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "AI Matching Platform — スカウト送信完了"},
        }
        target = channel_id or self.channel_id
        return await self._send_message(target, embed)

    async def notify_message_received(
        self,
        sender_type: str,
        sender_name: str,
        recipient_name: str,
        match_id: str,
        channel_id: Optional[str] = None,
    ):
        """メッセージ受信通知"""
        emoji = "💬" if sender_type == "engineer" else "📨"
        embed = {
            "title": f"{emoji} メッセージ受信",
            "color": 0x06B6D4,
            "fields": [
                {"name": "送信者", "value": f"{sender_name}（{sender_type}）", "inline": True},
                {"name": "宛先", "value": recipient_name, "inline": True},
                {"name": "Match ID", "value": f"`{match_id}`", "inline": False},
            ],
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "AI Matching Platform"},
        }
        target = channel_id or self.channel_id
        return await self._send_message(target, embed)

    async def notify_interview_proposed(
        self,
        proposer_name: str,
        other_name: str,
        times_count: int,
        match_id: str,
        channel_id: Optional[str] = None,
    ):
        """面談日程提案通知"""
        embed = {
            "title": "📅 面談日程提案",
            "color": 0x0EA5E9,
            "fields": [
                {"name": "提案者", "value": proposer_name, "inline": True},
                {"name": "相手", "value": other_name, "inline": True},
                {"name": "候補日数", "value": f"{times_count}件", "inline": True},
                {"name": "Match ID", "value": f"`{match_id}`", "inline": False},
            ],
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "AI Matching Platform"},
        }
        target = channel_id or self.channel_id
        return await self._send_message(target, embed)

    async def notify_interview_confirmed(
        self,
        engineer_name: str,
        company_name: str,
        selected_time: str,
        match_id: str,
        channel_id: Optional[str] = None,
    ):
        """面談確定通知"""
        embed = {
            "title": "✅ 面談確定",
            "color": 0x10B981,
            "fields": [
                {"name": "企業", "value": company_name, "inline": True},
                {"name": "候補者", "value": engineer_name, "inline": True},
                {"name": "日時", "value": selected_time, "inline": False},
                {"name": "Match ID", "value": f"`{match_id}`", "inline": False},
            ],
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "AI Matching Platform — 面談スケジュール確定"},
        }
        target = channel_id or self.channel_id
        return await self._send_message(target, embed)

    async def _send_to_channel(self, content: str, channel_id: str | None = None):
        """テキストメッセージをチャンネルに送信（スケジューラ用）"""
        target = channel_id or self.channel_id
        if not target or not self.token:
            print(f"[Discord] Skip (no token/channel): {content[:80]}")
            return
        async with httpx.AsyncClient() as client:
            try:
                await client.post(
                    f"{DISCORD_API_BASE}/channels/{target}/messages",
                    headers=self.headers,
                    json={"content": content},
                )
            except Exception as e:
                print(f"[Discord] Send error: {e}")

    async def notify_match_created(
        self,
        engineer_name: str,
        company_name: str,
        posting_title: str,
        ai_score: float,
        match_id: str,
        channel_id: str | None = None,
    ):
        """マッチ作成通知（スケジューラ互換）"""
        return await self.notify_new_match(
            engineer_name=engineer_name,
            company_name=company_name,
            posting_title=posting_title,
            ai_score=ai_score,
            match_id=match_id,
            channel_id=channel_id,
        )


# シングルトン
notifier = DiscordNotifier()
