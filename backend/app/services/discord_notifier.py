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


# シングルトン
notifier = DiscordNotifier()
