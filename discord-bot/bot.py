"""
AI Matching Platform - Discord Bot

役割:
  1. マッチング通知の受信・表示
  2. スラッシュコマンドで管理操作
  3. 日次レポート・失注分析表示
"""
import os
import httpx
import discord
from discord import app_commands
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("DISCORD_BOT_TOKEN", "")
API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000/api/v1")

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)


# ---------------------------------------------------------------------------
# イベント
# ---------------------------------------------------------------------------
@bot.event
async def on_ready():
    print(f"Bot起動: {bot.user} (ID: {bot.user.id})")
    try:
        synced = await bot.tree.sync()
        print(f"スラッシュコマンド同期: {len(synced)}件")
    except Exception as e:
        print(f"コマンド同期エラー: {e}")


# ---------------------------------------------------------------------------
# スラッシュコマンド
# ---------------------------------------------------------------------------
@bot.tree.command(name="stats", description="プラットフォームの統計情報を表示")
async def stats(interaction: discord.Interaction):
    """エンジニア数・企業数・マッチ数を取得して表示"""
    async with httpx.AsyncClient() as client:
        try:
            eng_resp = await client.get(f"{API_BASE}/engineers/?limit=1")
            comp_resp = await client.get(f"{API_BASE}/companies/?limit=1")
            match_resp = await client.get(f"{API_BASE}/matches/?limit=1")

            embed = discord.Embed(title="プラットフォーム統計", color=0x5865F2)
            embed.add_field(name="エンジニア", value=f"{len(eng_resp.json())}件取得", inline=True)
            embed.add_field(name="企業", value=f"{len(comp_resp.json())}件取得", inline=True)
            embed.add_field(name="マッチ", value=f"{len(match_resp.json())}件取得", inline=True)
            embed.set_footer(text="AI Matching Platform")
            await interaction.response.send_message(embed=embed)
        except Exception as e:
            await interaction.response.send_message(f"API接続エラー: {e}", ephemeral=True)


@bot.tree.command(name="matches", description="最新のマッチング一覧を表示")
@app_commands.describe(status="フィルタするステータス（proposed/accepted等）")
async def list_matches(interaction: discord.Interaction, status: str = "proposed"):
    """マッチング一覧をembedで表示"""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{API_BASE}/matches/", params={"status": status, "limit": 5})
            matches = resp.json()

            if not matches:
                await interaction.response.send_message(f"該当するマッチ（{status}）はありません。", ephemeral=True)
                return

            embed = discord.Embed(
                title=f"マッチング一覧（{status}）",
                color=0x57F287,
            )
            for m in matches:
                embed.add_field(
                    name=f"Score: {m['ai_score']}",
                    value=f"ID: `{m['id'][:8]}...`\nStatus: `{m['status']}`",
                    inline=False,
                )

            await interaction.response.send_message(embed=embed)
        except Exception as e:
            await interaction.response.send_message(f"エラー: {e}", ephemeral=True)


@bot.tree.command(name="approve", description="マッチングを承認する（accepted に変更）")
@app_commands.describe(match_id="マッチID")
async def approve_match(interaction: discord.Interaction, match_id: str):
    """代表がDiscord上でマッチングを承認"""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.patch(
                f"{API_BASE}/matches/{match_id}/status",
                json={"status": "accepted"},
            )
            if resp.status_code == 200:
                embed = discord.Embed(
                    title="マッチング承認完了",
                    color=0x2ECC71,
                    description=f"Match `{match_id[:8]}...` を **accepted** に更新しました。",
                )
                await interaction.response.send_message(embed=embed)
            else:
                await interaction.response.send_message(f"更新失敗: {resp.text}", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"エラー: {e}", ephemeral=True)


@bot.tree.command(name="reject", description="マッチングを却下する")
@app_commands.describe(match_id="マッチID", reason="却下理由")
async def reject_match(interaction: discord.Interaction, match_id: str, reason: str = ""):
    """マッチングを却下"""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.patch(
                f"{API_BASE}/matches/{match_id}/status",
                json={"status": "rejected", "rejection_reason": reason},
            )
            if resp.status_code == 200:
                embed = discord.Embed(
                    title="マッチング却下",
                    color=0xE74C3C,
                    description=f"Match `{match_id[:8]}...` を **rejected** に更新しました。",
                )
                if reason:
                    embed.add_field(name="理由", value=reason)
                await interaction.response.send_message(embed=embed)
            else:
                await interaction.response.send_message(f"更新失敗: {resp.text}", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"エラー: {e}", ephemeral=True)


# ---------------------------------------------------------------------------
# レポート系コマンド
# ---------------------------------------------------------------------------
@bot.tree.command(name="daily-report", description="日次3択レポートを表示（代表向け）")
async def daily_report(interaction: discord.Interaction):
    """日次KPIレポートをA/B/C 3択で表示"""
    await interaction.response.defer()
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get(f"{API_BASE}/reports/daily")
            data = resp.json()

            embed = discord.Embed(
                title=f"日次レポート {data.get('report_date', '')}",
                color=0x9B59B6,
            )

            # KPI
            kpi = data.get("kpi", {})
            kpi_text = "\n".join(f"**{k}**: {v}" for k, v in kpi.items())
            embed.add_field(name="KPI", value=kpi_text or "データなし", inline=False)

            # 失注サマリー
            rej = data.get("rejection_summary", {})
            embed.add_field(
                name="失注（30日）",
                value=f"{rej.get('total_lost_30d', 0)}件",
                inline=True,
            )

            # 3択
            for opt in data.get("options", []):
                actions = opt.get("actions", [])
                actions_text = "\n".join(f"- {a}" for a in actions[:3]) if actions else "詳細なし"
                embed.add_field(
                    name=opt.get("label", "選択肢"),
                    value=f"{actions_text}\n*効果: {opt.get('estimated_impact', 'N/A')}*",
                    inline=False,
                )

            embed.set_footer(text=data.get("instruction", "A/B/C から選択してください"))
            await interaction.followup.send(embed=embed)
        except Exception as e:
            await interaction.followup.send(f"エラー: {e}")


@bot.tree.command(name="match-decision", description="個別マッチの3択判断レポートを表示")
@app_commands.describe(match_id="マッチID")
async def match_decision(interaction: discord.Interaction, match_id: str):
    """個別マッチに対するA/B/C判断を表示"""
    await interaction.response.defer()
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get(f"{API_BASE}/reports/match/{match_id}/decision")
            if resp.status_code != 200:
                await interaction.followup.send(f"エラー: {resp.text}")
                return

            data = resp.json()

            embed = discord.Embed(
                title=f"マッチ判断: {data.get('engineer', {}).get('name', '?')} x {data.get('company', '?')}",
                color=0x3498DB,
            )
            embed.add_field(name="AIスコア", value=f"{data.get('ai_score', 0):.0f}点", inline=True)
            embed.add_field(name="推奨", value=data.get("recommendation", "?"), inline=True)
            embed.add_field(
                name="推奨理由",
                value=data.get("recommendation_reason", ""),
                inline=False,
            )

            for opt in data.get("options", []):
                embed.add_field(
                    name=opt.get("label", ""),
                    value=f"{opt.get('action', '')}\n*リスク: {opt.get('risk', 'N/A')}*",
                    inline=False,
                )

            await interaction.followup.send(embed=embed)
        except Exception as e:
            await interaction.followup.send(f"エラー: {e}")


@bot.tree.command(name="knowledge-loop", description="失注パターン分析を表示")
@app_commands.describe(days="分析期間（日数、デフォルト90）")
async def knowledge_loop_cmd(interaction: discord.Interaction, days: int = 90):
    """失注分析レポートを表示"""
    await interaction.response.defer()
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get(f"{API_BASE}/reports/knowledge-loop", params={"days": days})
            data = resp.json()

            embed = discord.Embed(
                title=f"Knowledge-Loop分析（過去{days}日）",
                color=0xE67E22,
            )
            embed.add_field(name="失注合計", value=f"{data.get('total_lost', 0)}件", inline=True)

            # パターン
            patterns = data.get("patterns", [])
            if patterns:
                pat_text = "\n".join(
                    f"**{p['label']}**: {p['count']}件 ({p.get('pct', 0):.0f}%)"
                    for p in patterns[:5]
                )
                embed.add_field(name="失注パターン", value=pat_text, inline=False)

            # 切り返しトーク
            counter = data.get("counter_talks", {})
            if counter:
                ct_text = "\n".join(
                    f"**{k}** → {v[:60]}..." if len(v) > 60 else f"**{k}** → {v}"
                    for k, v in list(counter.items())[:3]
                )
                embed.add_field(name="切り返しトーク", value=ct_text, inline=False)

            await interaction.followup.send(embed=embed)
        except Exception as e:
            await interaction.followup.send(f"エラー: {e}")


# ---------------------------------------------------------------------------
# 起動
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if not TOKEN:
        print("DISCORD_BOT_TOKEN が設定されていません。.env を確認してください。")
    else:
        bot.run(TOKEN)
