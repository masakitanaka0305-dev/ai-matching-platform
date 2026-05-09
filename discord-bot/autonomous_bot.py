"""
⚔️ AUTONOMOUS OPERATIONS BOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
無人稼働の自律オペレーション制御システム。
代表の介入ゼロ、全操作はDiscordボタンで完結。

Units:
  1. SelfHealUnit   - 自己修復エージェント（3回失敗で人間通知）
  2. HunterUnit     - ターゲット抽出・リード生成
  3. DashboardUnit  - 日次KPIダッシュボード自動配信
  4. ApprovalUnit   - ワンタップ決裁（ボタンUI）
  5. AutomationUnit - 全タスク実行ログ
"""
from __future__ import annotations

import os
import asyncio
import traceback
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
import discord
from discord import app_commands, ui
from discord.ext import commands, tasks
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# 設定
# ============================================================
TOKEN = os.getenv("DISCORD_BOT_TOKEN", "")
API_BASE = os.getenv("API_BASE_URL", "https://ai-matching-platform-production.up.railway.app/api/v1")

# チャンネルID
CH_CRITICAL = int(os.getenv("CH_CRITICAL", "0"))
CH_HUNTER = int(os.getenv("CH_HUNTER", "0"))
CH_DASHBOARD = int(os.getenv("CH_DASHBOARD", "0"))
CH_APPROVAL = int(os.getenv("CH_APPROVAL", "0"))
CH_AUTOMATION_LOG = int(os.getenv("CH_AUTOMATION_LOG", "0"))
# 旧チャンネルは廃止。全通知は AUTONOMOUS_OPERATIONS カテゴリに統合。

JST = timezone(timedelta(hours=9))

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)


# ============================================================
# ユーティリティ
# ============================================================
async def api_get(path: str, params: dict = None) -> dict | list:
    async with httpx.AsyncClient(timeout=30) as c:
        resp = await c.get(f"{API_BASE}{path}", params=params)
        resp.raise_for_status()
        return resp.json()


async def api_patch(path: str, data: dict) -> dict:
    async with httpx.AsyncClient(timeout=30) as c:
        resp = await c.patch(f"{API_BASE}{path}", json=data)
        resp.raise_for_status()
        return resp.json()


async def api_post(path: str, data: dict = None) -> dict:
    async with httpx.AsyncClient(timeout=30) as c:
        resp = await c.post(f"{API_BASE}{path}", json=data or {})
        resp.raise_for_status()
        return resp.json()


async def send_to(channel_id: int, embed: discord.Embed = None, content: str = None, view: ui.View = None):
    ch = bot.get_channel(channel_id)
    if not ch:
        return
    kwargs = {}
    if embed:
        kwargs["embed"] = embed
    if content:
        kwargs["content"] = content
    if view:
        kwargs["view"] = view
    await ch.send(**kwargs)


async def log_automation(action: str, detail: str, success: bool = True):
    emoji = "✅" if success else "⚠️"
    now = datetime.now(JST).strftime("%H:%M:%S")
    await send_to(CH_AUTOMATION_LOG, content=f"`{now}` {emoji} **{action}** — {detail}")


# ============================================================
# Unit 1: SelfHealUnit — 自己修復エージェント
# ============================================================
class SelfHealUnit:
    """
    API/サービス障害を検知し自動修復を試行。
    3回失敗で🚨緊急チャンネルに報告。
    """

    def __init__(self):
        self._failure_counts: dict[str, int] = {}
        self._max_retries = 3

    async def check_health(self) -> dict:
        checks = {}
        # Backend health
        try:
            async with httpx.AsyncClient(timeout=10) as c:
                resp = await c.get(f"{API_BASE.replace('/api/v1', '')}/health")
                checks["backend"] = resp.status_code == 200
        except Exception:
            checks["backend"] = False

        # DB check (engineers endpoint)
        try:
            await api_get("/engineers/?limit=1")
            checks["database"] = True
        except Exception:
            checks["database"] = False

        return checks

    async def attempt_heal(self, service: str) -> bool:
        """自動修復試行（リクエストリトライベース）"""
        for i in range(self._max_retries):
            await asyncio.sleep(5 * (i + 1))
            try:
                if service == "backend":
                    async with httpx.AsyncClient(timeout=10) as c:
                        resp = await c.get(f"{API_BASE.replace('/api/v1', '')}/health")
                        if resp.status_code == 200:
                            return True
                elif service == "database":
                    await api_get("/engineers/?limit=1")
                    return True
            except Exception:
                continue
        return False

    async def run_diagnostics(self):
        checks = await self.check_health()
        for service, healthy in checks.items():
            if healthy:
                self._failure_counts[service] = 0
                continue

            self._failure_counts[service] = self._failure_counts.get(service, 0) + 1
            await log_automation("SelfHeal", f"{service} 異常検知 (試行 {self._failure_counts[service]}回目)", False)

            healed = await self.attempt_heal(service)
            if healed:
                self._failure_counts[service] = 0
                await log_automation("SelfHeal", f"{service} 自動復旧成功")
            elif self._failure_counts[service] >= self._max_retries:
                # 3回失敗 → 緊急チャンネルに報告
                embed = discord.Embed(
                    title="🚨 自律修復失敗 — 人間介入要",
                    color=0xFF0000,
                    description=f"**{service}** が {self._max_retries}回の自動修復に失敗。",
                )
                embed.add_field(name="障害サービス", value=f"`{service}`", inline=True)
                embed.add_field(name="試行回数", value=f"{self._max_retries}回", inline=True)
                embed.add_field(
                    name="推奨アクション",
                    value="Railway ダッシュボードでサービス再起動",
                    inline=False,
                )
                embed.timestamp = datetime.now(JST)

                view = CriticalActionView(service)
                await send_to(CH_CRITICAL, embed=embed, view=view)
                self._failure_counts[service] = 0


class CriticalActionView(ui.View):
    """緊急チャンネル用ボタン"""

    def __init__(self, service: str):
        super().__init__(timeout=None)
        self.service = service

    @ui.button(label="確認済み", style=discord.ButtonStyle.green, emoji="✅")
    async def ack(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.send_message(
            f"✅ `{self.service}` の障害を確認済みとしてマーク。", ephemeral=True
        )
        button.disabled = True
        await interaction.message.edit(view=self)

    @ui.button(label="再診断", style=discord.ButtonStyle.blurple, emoji="🔄")
    async def recheck(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.defer(ephemeral=True)
        checks = await self_heal.check_health()
        status = "\n".join(f"{'✅' if v else '❌'} {k}" for k, v in checks.items())
        await interaction.followup.send(f"**再診断結果:**\n{status}", ephemeral=True)


# ============================================================
# Unit 2: HunterUnit — ターゲット抽出
# ============================================================
class HunterUnit:
    """
    未マッチのエンジニア・求人を分析し、
    有望なリードをDiscordにボタン付きで提示。
    """

    async def scan_unmatched(self) -> list[dict]:
        """マッチスコア上位の未提案ペアを抽出"""
        try:
            result = await api_post("/matching/run", {"min_score": 60})
            return result.get("matches", [])
        except Exception:
            return []

    async def post_leads(self, leads: list[dict]):
        if not leads:
            await log_automation("Hunter", "新規リード: 0件（全ペア探索済み）")
            return

        await log_automation("Hunter", f"新規リード: {len(leads)}件を抽出")

        for lead in leads[:5]:  # 上位5件を通知
            score = lead.get("ai_score", 0)
            match_id = lead.get("id", "")
            pitch = lead.get("pitch_to_company", "")[:100]

            score_bar = "🟩" * int(score // 10) + "⬜" * (10 - int(score // 10))

            embed = discord.Embed(
                title=f"📡 新規リード検出 — スコア {score:.0f}",
                color=0x00FF88 if score >= 70 else 0xFFAA00,
            )
            embed.add_field(name="AIスコア", value=f"`{score:.1f}` {score_bar}", inline=False)
            embed.add_field(name="提案概要", value=pitch or "自動生成ピッチ", inline=False)
            embed.add_field(name="Match ID", value=f"`{match_id[:12]}...`", inline=True)
            embed.timestamp = datetime.now(JST)

            view = LeadActionView(match_id)
            await send_to(CH_HUNTER, embed=embed, view=view)


class LeadActionView(ui.View):
    """リードに対するボタンアクション"""

    def __init__(self, match_id: str):
        super().__init__(timeout=None)
        self.match_id = match_id

    @ui.button(label="即承認", style=discord.ButtonStyle.green, emoji="✅")
    async def approve(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.defer(ephemeral=True)
        try:
            await api_patch(f"/matches/{self.match_id}/status", {"status": "accepted"})
            await interaction.followup.send(f"✅ `{self.match_id[:8]}...` を **accepted** に更新", ephemeral=True)
            # ボタン無効化
            for child in self.children:
                child.disabled = True
            embed = interaction.message.embeds[0] if interaction.message.embeds else None
            if embed:
                embed.color = 0x2ECC71
                embed.set_footer(text="✅ 承認済み")
            await interaction.message.edit(embed=embed, view=self)
            await log_automation("Approval", f"Match {self.match_id[:8]} → accepted")
        except Exception as e:
            await interaction.followup.send(f"❌ エラー: {e}", ephemeral=True)

    @ui.button(label="却下", style=discord.ButtonStyle.red, emoji="❌")
    async def reject(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.defer(ephemeral=True)
        try:
            await api_patch(f"/matches/{self.match_id}/status", {"status": "rejected", "rejection_reason": "Discord却下"})
            await interaction.followup.send(f"❌ `{self.match_id[:8]}...` を **rejected** に更新", ephemeral=True)
            for child in self.children:
                child.disabled = True
            embed = interaction.message.embeds[0] if interaction.message.embeds else None
            if embed:
                embed.color = 0xE74C3C
                embed.set_footer(text="❌ 却下済み")
            await interaction.message.edit(embed=embed, view=self)
            await log_automation("Approval", f"Match {self.match_id[:8]} → rejected")
        except Exception as e:
            await interaction.followup.send(f"❌ エラー: {e}", ephemeral=True)

    @ui.button(label="詳細", style=discord.ButtonStyle.grey, emoji="📋")
    async def detail(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.defer(ephemeral=True)
        try:
            data = await api_get(f"/matches/{self.match_id}")
            embed = discord.Embed(title="マッチ詳細", color=0x3498DB)
            embed.add_field(name="AIスコア", value=f"{data.get('ai_score', 0):.1f}", inline=True)
            embed.add_field(name="ステータス", value=data.get("status", "?"), inline=True)
            embed.add_field(
                name="エンジニア向けピッチ",
                value=(data.get("pitch_to_engineer", "") or "なし")[:200],
                inline=False,
            )
            embed.add_field(
                name="企業向けピッチ",
                value=(data.get("pitch_to_company", "") or "なし")[:200],
                inline=False,
            )
            await interaction.followup.send(embed=embed, ephemeral=True)
        except Exception as e:
            await interaction.followup.send(f"❌ エラー: {e}", ephemeral=True)


# ============================================================
# Unit 3: DashboardUnit — 日次ダッシュボード
# ============================================================
class DashboardUnit:
    """毎朝自動配信のKPIダッシュボード"""

    async def generate_and_post(self):
        try:
            report = await api_get("/reports/daily")
        except Exception:
            report = {}

        kpi = report.get("kpi", {})
        now = datetime.now(JST)

        # KPIを取得（レポートAPIが空でもDB直接カウント）
        try:
            engineers = await api_get("/engineers/")
            companies = await api_get("/companies/")
            matches = await api_get("/matches/")
            postings = await api_get("/postings/")
        except Exception:
            engineers = companies = matches = postings = []

        total_eng = len(engineers) if isinstance(engineers, list) else 0
        total_comp = len(companies) if isinstance(companies, list) else 0
        total_match = len(matches) if isinstance(matches, list) else 0
        total_post = len(postings) if isinstance(postings, list) else 0

        proposed = sum(1 for m in matches if isinstance(m, dict) and m.get("status") == "proposed")
        unlocked = sum(1 for m in matches if isinstance(m, dict) and m.get("status") == "approach_unlocked")
        scout_sent = sum(1 for m in matches if isinstance(m, dict) and m.get("status") == "scout_sent")
        interested = sum(1 for m in matches if isinstance(m, dict) and m.get("status") == "engineer_interested")
        interview = sum(1 for m in matches if isinstance(m, dict) and m.get("status") == "interview_scheduled")
        accepted = sum(1 for m in matches if isinstance(m, dict) and m.get("status") == "accepted")
        rejected = sum(1 for m in matches if isinstance(m, dict) and m.get("status") == "rejected")

        embed = discord.Embed(
            title=f"📊 日次ダッシュボード — {now.strftime('%Y/%m/%d %A')}",
            color=0x9B59B6,
        )

        # KPIグリッド
        embed.add_field(name="👤 エンジニア", value=f"**{total_eng}**名", inline=True)
        embed.add_field(name="🏢 企業", value=f"**{total_comp}**社", inline=True)
        embed.add_field(name="📝 求人", value=f"**{total_post}**件", inline=True)
        embed.add_field(name="🤝 マッチ合計", value=f"**{total_match}**件", inline=True)

        # 全パイプラインステージ
        embed.add_field(name="📋 提案中", value=f"**{proposed}**件", inline=True)
        embed.add_field(name="🔓 解放済", value=f"**{unlocked}**件", inline=True)
        embed.add_field(name="🚀 スカウト済", value=f"**{scout_sent}**件", inline=True)
        embed.add_field(name="💡 興味あり", value=f"**{interested}**件", inline=True)
        embed.add_field(name="📅 面談設定", value=f"**{interview}**件", inline=True)
        embed.add_field(name="✅ 成約", value=f"**{accepted}**件", inline=True)

        # パイプラインフロー
        if total_match > 0:
            cvr = (accepted / total_match * 100) if total_match else 0
            pipeline = f"提案 {proposed} → 解放 {unlocked} → スカウト {scout_sent} → 興味 {interested} → 面談 {interview} → 成約 {accepted}\n"
            pipeline += f"失注 {rejected} | **CVR: {cvr:.1f}%**"
            embed.add_field(name="📈 パイプライン", value=pipeline, inline=False)

        # 3択レポート
        options = report.get("options", [])
        for opt in options:
            actions = opt.get("actions", [])[:2]
            actions_text = "\n".join(f"• {a}" for a in actions) if actions else "—"
            embed.add_field(
                name=opt.get("label", "選択肢"),
                value=f"{actions_text}\n*効果: {opt.get('estimated_impact', 'N/A')}*",
                inline=False,
            )

        embed.set_footer(text="⚔️ AUTONOMOUS OPERATIONS")
        embed.timestamp = now

        view = DashboardActionView()
        await send_to(CH_DASHBOARD, embed=embed, view=view)
        await log_automation("Dashboard", f"日次ダッシュボード配信完了 (Eng:{total_eng} Co:{total_comp} Match:{total_match})")


class DashboardActionView(ui.View):
    """ダッシュボードのアクションボタン"""

    def __init__(self):
        super().__init__(timeout=None)

    @ui.button(label="マッチング実行", style=discord.ButtonStyle.green, emoji="🚀")
    async def run_matching(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.defer(ephemeral=True)
        try:
            result = await api_post("/matching/run", {"min_score": 50})
            count = result.get("new_matches_count", 0)
            await interaction.followup.send(f"🚀 マッチング実行完了: **{count}件**の新規マッチ", ephemeral=True)
            await log_automation("ManualTrigger", f"手動マッチング実行 → {count}件")
        except Exception as e:
            await interaction.followup.send(f"❌ エラー: {e}", ephemeral=True)

    @ui.button(label="失注分析", style=discord.ButtonStyle.blurple, emoji="🔍")
    async def run_analysis(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.defer(ephemeral=True)
        try:
            data = await api_get("/reports/knowledge-loop", {"days": 30})
            patterns = data.get("patterns", [])
            if patterns:
                text = "\n".join(f"**{p['label']}**: {p['count']}件 ({p.get('pct',0):.0f}%)" for p in patterns[:5])
            else:
                text = "失注データなし"
            embed = discord.Embed(title="🔍 失注パターン分析（30日）", color=0xE67E22, description=text)
            await interaction.followup.send(embed=embed, ephemeral=True)
        except Exception as e:
            await interaction.followup.send(f"❌ エラー: {e}", ephemeral=True)

    @ui.button(label="全マッチ一覧", style=discord.ButtonStyle.grey, emoji="📋")
    async def list_matches(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.defer(ephemeral=True)
        try:
            matches = await api_get("/matches/", {"limit": 10})
            if not matches:
                await interaction.followup.send("マッチデータなし", ephemeral=True)
                return
            embed = discord.Embed(title="📋 最新マッチ一覧", color=0x5865F2)
            for m in matches[:10]:
                status_emoji = {"proposed": "📋", "approach_unlocked": "🔓", "scout_sent": "🚀", "engineer_interested": "💡", "interview_scheduled": "📅", "accepted": "✅", "rejected": "❌", "company_reviewed": "👀", "withdrawn": "🚪"}.get(m.get("status", ""), "🔄")
                embed.add_field(
                    name=f"{status_emoji} Score: {m.get('ai_score', 0):.0f}",
                    value=f"ID: `{m['id'][:8]}...` | Status: `{m['status']}`",
                    inline=False,
                )
            await interaction.followup.send(embed=embed, ephemeral=True)
        except Exception as e:
            await interaction.followup.send(f"❌ エラー: {e}", ephemeral=True)


# ============================================================
# Unit 4: ApprovalUnit — ワンタップ決裁
# ============================================================
class ApprovalUnit:
    """保留中マッチを自動取得し、ボタン付きで承認チャンネルに投稿"""

    async def post_pending_approvals(self):
        try:
            matches = await api_get("/matches/", {"status": "proposed", "limit": 10})
        except Exception:
            matches = []

        if not matches:
            return

        await log_automation("Approval", f"承認待ち {len(matches)}件を配信")

        for m in matches[:5]:
            score = m.get("ai_score", 0)
            match_id = m.get("id", "")
            pitch = (m.get("pitch_to_company", "") or "")[:120]
            score_bar = "🟩" * int(score // 10) + "⬜" * (10 - int(score // 10))

            embed = discord.Embed(
                title=f"🎯 承認待ち — スコア {score:.0f}",
                color=0x5865F2,
            )
            embed.add_field(name="AIスコア", value=f"`{score:.1f}` {score_bar}", inline=False)
            embed.add_field(name="提案", value=pitch or "—", inline=False)
            embed.add_field(name="ID", value=f"`{match_id[:12]}...`", inline=True)
            embed.add_field(name="ステータス", value=f"`{m.get('status', '?')}`", inline=True)
            embed.timestamp = datetime.now(JST)

            view = LeadActionView(match_id)  # 同じボタンUIを再利用
            await send_to(CH_APPROVAL, embed=embed, view=view)


# ============================================================
# Unit インスタンス
# ============================================================
self_heal = SelfHealUnit()
hunter = HunterUnit()
dashboard = DashboardUnit()
approval = ApprovalUnit()


# ============================================================
# 定期タスク（tasks.loop）
# ============================================================
@tasks.loop(minutes=5)
async def health_check_loop():
    """5分毎にヘルスチェック"""
    try:
        await self_heal.run_diagnostics()
    except Exception as e:
        print(f"[SelfHeal] Error: {e}")


@tasks.loop(time=[datetime(2000, 1, 1, 0, 0, tzinfo=JST).timetz()])
async def daily_dashboard():
    """毎日 09:00 JST にダッシュボード配信"""
    await dashboard.generate_and_post()


@tasks.loop(time=[datetime(2000, 1, 1, 0, 15, tzinfo=JST).timetz()])
async def daily_hunter():
    """毎日 09:15 JST にリード探索"""
    leads = await hunter.scan_unmatched()
    await hunter.post_leads(leads)


@tasks.loop(time=[datetime(2000, 1, 1, 0, 30, tzinfo=JST).timetz()])
async def daily_approval():
    """毎日 09:30 JST に承認待ちを配信"""
    await approval.post_pending_approvals()


# tasks.loop の time を JST 09:00 等に設定
# discord.py の time パラメータは UTC なので変換
_utc_0900 = (datetime(2000, 1, 1, 9, 0, tzinfo=JST)).astimezone(timezone.utc).timetz()
_utc_0915 = (datetime(2000, 1, 1, 9, 15, tzinfo=JST)).astimezone(timezone.utc).timetz()
_utc_0930 = (datetime(2000, 1, 1, 9, 30, tzinfo=JST)).astimezone(timezone.utc).timetz()

daily_dashboard.change_interval(time=[_utc_0900])
daily_hunter.change_interval(time=[_utc_0915])
daily_approval.change_interval(time=[_utc_0930])


# ============================================================
# イベント & スラッシュコマンド
# ============================================================
@bot.event
async def on_ready():
    print(f"⚔️ AUTONOMOUS BOT起動: {bot.user} (ID: {bot.user.id})")

    # 定期タスク開始
    if not health_check_loop.is_running():
        health_check_loop.start()
    if not daily_dashboard.is_running():
        daily_dashboard.start()
    if not daily_hunter.is_running():
        daily_hunter.start()
    if not daily_approval.is_running():
        daily_approval.start()

    # コマンド同期
    try:
        synced = await bot.tree.sync()
        print(f"スラッシュコマンド同期: {len(synced)}件")
    except Exception as e:
        print(f"コマンド同期エラー: {e}")

    # 起動通知
    await log_automation("System", "⚔️ AUTONOMOUS OPERATIONS Bot 起動完了")

    # 初回ダッシュボード即時配信
    await dashboard.generate_and_post()


# --- スラッシュコマンド（ボタンUI起点） ---

@bot.tree.command(name="dashboard", description="日次ダッシュボードを即時表示")
async def cmd_dashboard(interaction: discord.Interaction):
    await interaction.response.defer()
    await dashboard.generate_and_post()
    await interaction.followup.send("📊 ダッシュボードを配信しました", ephemeral=True)


@bot.tree.command(name="hunt", description="リード探索を即時実行")
async def cmd_hunt(interaction: discord.Interaction):
    await interaction.response.defer()
    leads = await hunter.scan_unmatched()
    await hunter.post_leads(leads)
    await interaction.followup.send(f"📡 {len(leads)}件のリードを探索", ephemeral=True)


@bot.tree.command(name="approvals", description="承認待ちマッチを一覧表示")
async def cmd_approvals(interaction: discord.Interaction):
    await interaction.response.defer()
    await approval.post_pending_approvals()
    await interaction.followup.send("🎯 承認待ちを配信しました", ephemeral=True)


@bot.tree.command(name="health", description="全システムのヘルスチェック")
async def cmd_health(interaction: discord.Interaction):
    await interaction.response.defer(ephemeral=True)
    checks = await self_heal.check_health()
    embed = discord.Embed(title="🏥 システムヘルスチェック", color=0x2ECC71)
    for service, ok in checks.items():
        embed.add_field(name=service, value="✅ 正常" if ok else "❌ 異常", inline=True)
    embed.timestamp = datetime.now(JST)
    await interaction.followup.send(embed=embed, ephemeral=True)


@bot.tree.command(name="stats", description="プラットフォーム統計を表示")
async def cmd_stats(interaction: discord.Interaction):
    await interaction.response.defer(ephemeral=True)
    try:
        engineers = await api_get("/engineers/")
        companies = await api_get("/companies/")
        matches = await api_get("/matches/")
        embed = discord.Embed(title="📊 プラットフォーム統計", color=0x5865F2)
        embed.add_field(name="エンジニア", value=f"{len(engineers)}名", inline=True)
        embed.add_field(name="企業", value=f"{len(companies)}社", inline=True)
        embed.add_field(name="マッチ", value=f"{len(matches)}件", inline=True)
        embed.set_footer(text="⚔️ AUTONOMOUS OPERATIONS")
        await interaction.followup.send(embed=embed, ephemeral=True)
    except Exception as e:
        await interaction.followup.send(f"❌ エラー: {e}", ephemeral=True)


@bot.tree.command(name="matches", description="最新マッチング一覧を表示")
@app_commands.describe(status="フィルタ (proposed/accepted/rejected)")
async def cmd_matches(interaction: discord.Interaction, status: str = "proposed"):
    await interaction.response.defer(ephemeral=True)
    try:
        matches = await api_get("/matches/", {"status": status, "limit": 5})
        if not matches:
            await interaction.followup.send(f"該当マッチ（{status}）なし", ephemeral=True)
            return
        embed = discord.Embed(title=f"マッチ一覧（{status}）", color=0x57F287)
        for m in matches:
            embed.add_field(
                name=f"Score: {m['ai_score']:.0f}",
                value=f"ID: `{m['id'][:8]}...` | Status: `{m['status']}`",
                inline=False,
            )
        await interaction.followup.send(embed=embed, ephemeral=True)
    except Exception as e:
        await interaction.followup.send(f"❌ エラー: {e}", ephemeral=True)


@bot.tree.command(name="approve", description="マッチングを承認")
@app_commands.describe(match_id="マッチID")
async def cmd_approve(interaction: discord.Interaction, match_id: str):
    await interaction.response.defer(ephemeral=True)
    try:
        await api_patch(f"/matches/{match_id}/status", {"status": "accepted"})
        await interaction.followup.send(f"✅ `{match_id[:8]}...` → accepted", ephemeral=True)
        await log_automation("Approval", f"Match {match_id[:8]} → accepted (コマンド)")
    except Exception as e:
        await interaction.followup.send(f"❌ エラー: {e}", ephemeral=True)


@bot.tree.command(name="reject", description="マッチングを却下")
@app_commands.describe(match_id="マッチID", reason="却下理由")
async def cmd_reject(interaction: discord.Interaction, match_id: str, reason: str = ""):
    await interaction.response.defer(ephemeral=True)
    try:
        await api_patch(f"/matches/{match_id}/status", {"status": "rejected", "rejection_reason": reason or "Discord却下"})
        await interaction.followup.send(f"❌ `{match_id[:8]}...` → rejected", ephemeral=True)
        await log_automation("Approval", f"Match {match_id[:8]} → rejected (コマンド)")
    except Exception as e:
        await interaction.followup.send(f"❌ エラー: {e}", ephemeral=True)


# ============================================================
# 起動
# ============================================================
if __name__ == "__main__":
    if not TOKEN:
        print("❌ DISCORD_BOT_TOKEN が未設定")
    else:
        bot.run(TOKEN)
