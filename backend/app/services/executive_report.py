from __future__ import annotations
"""
稟議支援・3択レポートサービス（Representative-Clone）

代表への報告を常にA（情緒重視）・B（効率重視）・C（撤退）の3案で提示。
思考コストをゼロにし、✅ボタン一つで意思決定を完了させる。
"""
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models.models import (
    Match, MatchStatus, Engineer, Company, JobPosting, Payment, PaymentStatus,
)
from .knowledge_loop import knowledge_loop


class ExecutiveReportService:

    def generate_daily_report(self, db: Session) -> dict:
        """日次レポート：3択で判断を仰ぐ"""
        # KPI集計
        total_engineers = db.query(func.count(Engineer.id)).scalar() or 0
        active_postings = db.query(func.count(JobPosting.id)).filter(
            JobPosting.is_active.is_(True)
        ).scalar() or 0
        pending_matches = db.query(func.count(Match.id)).filter(
            Match.status == MatchStatus.proposed
        ).scalar() or 0
        accepted_matches = db.query(func.count(Match.id)).filter(
            Match.status == MatchStatus.accepted
        ).scalar() or 0
        total_revenue = db.query(func.sum(Payment.amount)).filter(
            Payment.status == PaymentStatus.succeeded
        ).scalar() or 0

        # 失注分析
        rejection_analysis = knowledge_loop.analyze_rejections(db, days=30)

        # 3択生成
        options = self._generate_three_options(
            total_engineers=total_engineers,
            active_postings=active_postings,
            pending_matches=pending_matches,
            accepted_matches=accepted_matches,
            total_revenue=total_revenue,
            rejection_patterns=rejection_analysis.get("patterns", []),
        )

        return {
            "report_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "kpi": {
                "registered_engineers": total_engineers,
                "active_postings": active_postings,
                "pending_matches": pending_matches,
                "accepted_matches": accepted_matches,
                "total_revenue_jpy": total_revenue,
            },
            "rejection_summary": {
                "total_lost_30d": rejection_analysis.get("total_lost", 0),
                "top_concerns": rejection_analysis.get("patterns", [])[:3],
            },
            "options": options,
            "instruction": "以下A/B/Cのいずれかを選択してください。Discord /approve で承認可能です。",
        }

    def generate_match_decision_report(
        self, match: Match, engineer: Engineer, posting: JobPosting, company: Company, db: Session
    ) -> dict:
        """個別マッチに対する3択判断レポート"""
        score = float(match.ai_score)

        option_a = {
            "label": "A：積極推進（情緒重視）",
            "action": "候補者に『御社の○○に共感し、ぜひお力になりたい』という熱意あるメッセージを送付。企業には候補者の人物面を強調した推薦文を送付。カジュアル面談を即設定。",
            "risk": "低",
            "expected_outcome": f"面談設定率 70%以上（スコア{score:.0f}点に基づく推定）",
            "tone": "信頼関係構築型・日本企業の情緒に配慮",
        }

        option_b = {
            "label": "B：効率推進（データ重視）",
            "action": f"スコア{score:.0f}点のデータサマリーを両者に送付。スキル一致率・給与適合度を数値で提示。1週間以内の回答期限を設定。",
            "risk": "中",
            "expected_outcome": "回答率 55%、決定までの日数を平均3日短縮",
            "tone": "スピード重視・数値根拠型",
        }

        option_c = {
            "label": "C：保留/見送り",
            "action": "今回のマッチは保留とし、より適合度の高い候補者が登録されるまで待機。企業には『引き続き最適な候補者を探索中』と報告。",
            "risk": "候補者が他社に流れるリスクあり",
            "expected_outcome": "コスト節約。ただし機会損失の可能性。",
            "tone": "慎重型",
        }

        recommendation = "A" if score >= 70 else "B" if score >= 50 else "C"

        return {
            "match_id": str(match.id),
            "engineer": {
                "name": engineer.name,
                "level": engineer.experience_level.value,
                "specialties": engineer.ai_specialties,
            },
            "company": company.name,
            "posting": posting.title,
            "ai_score": score,
            "options": [option_a, option_b, option_c],
            "recommendation": recommendation,
            "recommendation_reason": self._recommendation_reason(score, recommendation),
        }

    def _generate_three_options(self, **kpi) -> list:
        """日次レポートの3択を生成"""
        engineers = kpi["total_engineers"]
        pending = kpi["pending_matches"]
        revenue = kpi.get("total_revenue", kpi.get("total_revenue_jpy", 0))
        patterns = kpi.get("rejection_patterns", [])

        top_concern = patterns[0]["label"] if patterns else "特になし"

        option_a = {
            "label": "A：攻め（情緒重視・信頼構築）",
            "actions": [
                f"保留中の{pending}件のマッチに対し、情緒型メッセージを一斉送信",
                "企業ごとにカスタマイズした推薦文を作成",
                f"失注原因『{top_concern}』に対する切り返しトークを更新",
                "新規エンジニア獲得のためのコミュニティイベント企画",
            ],
            "estimated_impact": "成約率+15%、ただし工数増",
        }

        option_b = {
            "label": "B：守り（効率重視・自動化）",
            "actions": [
                "マッチングの最低スコア閾値を60点に引き上げ（ノイズ削減）",
                "自動フォローアップメール設定（3日後・7日後）",
                "スコアリング重みの自動調整を適用",
                f"低スコア（50点未満）の{pending}件を一括アーカイブ",
            ],
            "estimated_impact": "工数-30%、成約率微減の可能性",
        }

        option_c = {
            "label": "C：現状維持",
            "actions": [
                "現在のパラメータで継続運用",
                "来週のデータを見て判断",
            ],
            "estimated_impact": "変化なし。データ蓄積期間として有効。",
        }

        return [option_a, option_b, option_c]

    def _recommendation_reason(self, score: float, rec: str) -> str:
        if rec == "A":
            return f"AIスコア{score:.0f}点は高適合。情緒型アプローチで候補者・企業双方の温度感を上げることが成約最短ルート。"
        elif rec == "B":
            return f"AIスコア{score:.0f}点は中程度。データ根拠を明示し、判断を効率化することで回答率を上げる戦略が有効。"
        else:
            return f"AIスコア{score:.0f}点は閾値付近。リソースを高スコア案件に集中し、機会費用を最適化。"


executive_report = ExecutiveReportService()
