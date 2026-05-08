from __future__ import annotations
"""
定期タスクスケジューラ

- 毎日9:00 JST: マッチングエンジン自動実行
- 毎日9:30 JST: 日次レポートをDiscord通知
- 毎週月曜 10:00 JST: Knowledge-Loop分析
"""
import asyncio
import threading
import time
from datetime import datetime, timedelta, timezone

from ..models.database import SessionLocal
from .scoring_engine import matching_service
from .executive_report import executive_report
from .knowledge_loop import knowledge_loop
from .discord_notifier import notifier

JST = timezone(timedelta(hours=9))


class Scheduler:
    def __init__(self):
        self._running = False
        self._thread = None

    def start(self):
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._run_loop, daemon=True)
        self._thread.start()
        print("[Scheduler] Started - matching daily@09:00 JST, report daily@09:30 JST")

    def stop(self):
        self._running = False

    def _run_loop(self):
        last_matching = None
        last_report = None
        last_knowledge = None

        while self._running:
            now = datetime.now(JST)
            today = now.date()
            weekday = now.weekday()  # 0=Monday

            # 毎日 09:00 JST - マッチング自動実行
            if now.hour == 9 and now.minute < 5 and last_matching != today:
                last_matching = today
                self._run_matching()

            # 毎日 09:30 JST - 日次レポート送信
            if now.hour == 9 and 30 <= now.minute < 35 and last_report != today:
                last_report = today
                self._run_daily_report()

            # 毎週月曜 10:00 JST - Knowledge-Loop分析
            if weekday == 0 and now.hour == 10 and now.minute < 5 and last_knowledge != today:
                last_knowledge = today
                self._run_knowledge_loop()

            time.sleep(60)  # 1分ごとにチェック

    def _run_matching(self):
        """マッチングエンジン自動実行"""
        try:
            db = SessionLocal()
            result = matching_service.run_matching(db=db, min_score=50)
            count = len(result.get("new_matches", []))
            print(f"[Scheduler] Auto-matching complete: {count} new matches")

            # Discord通知
            if count > 0:
                asyncio.run(notifier.notify_match_created(
                    engineer_name="自動マッチング",
                    company_name=f"{count}件の新規マッチ",
                    posting_title="定期スケジュール実行",
                    ai_score=0,
                    match_id="auto",
                ))
            db.close()
        except Exception as e:
            print(f"[Scheduler] Matching error: {e}")

    def _run_daily_report(self):
        """日次3択レポートをDiscord送信"""
        try:
            db = SessionLocal()
            report = executive_report.generate_daily_report(db)
            db.close()

            # Discord通知（レポートサマリー）
            kpi = report.get("kpi", {})
            options = report.get("options", [])
            message = f"**日次レポート {report.get('report_date', '')}**\n"
            message += f"エンジニア: {kpi.get('registered_engineers', 0)} | "
            message += f"求人: {kpi.get('active_postings', 0)} | "
            message += f"保留マッチ: {kpi.get('pending_matches', 0)}\n\n"
            for opt in options:
                message += f"**{opt.get('label', '')}**\n"
                for action in opt.get("actions", [])[:2]:
                    message += f"  - {action}\n"
                message += f"  効果: {opt.get('estimated_impact', '')}\n\n"

            asyncio.run(notifier._send_to_channel(message))
            print(f"[Scheduler] Daily report sent to Discord")
        except Exception as e:
            print(f"[Scheduler] Daily report error: {e}")

    def _run_knowledge_loop(self):
        """週次Knowledge-Loop分析"""
        try:
            db = SessionLocal()
            result = knowledge_loop.analyze_rejections(db, days=30)
            db.close()

            patterns = result.get("patterns", [])
            if patterns:
                message = "**週次 Knowledge-Loop分析**\n"
                for p in patterns[:5]:
                    message += f"- {p['label']}: {p['count']}件 ({p.get('pct', 0):.0f}%)\n"
                asyncio.run(notifier._send_to_channel(message))

            print(f"[Scheduler] Knowledge-loop analysis complete")
        except Exception as e:
            print(f"[Scheduler] Knowledge-loop error: {e}")


scheduler = Scheduler()
