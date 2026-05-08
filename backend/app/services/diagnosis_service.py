from __future__ import annotations
"""
無料診断サービス

フロー:
  1. エンジニアがアンケート回答 → diagnosis作成（pending）
  2. GitHub URLがあればリポジトリ解析
  3. AIスコアリング → 市場価値スコア算出
  4. 無料サマリー生成（即表示）
  5. 有料版：詳細レポート（Stripe Checkout経由で購入後に閲覧可能）
"""
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from ..models.models import Diagnosis, Engineer, DiagnosisStatus


# ---------------------------------------------------------------------------
# スコアリングロジック（ルールベース、将来LLM置換）
# ---------------------------------------------------------------------------
DOMAIN_MARKET_VALUE = {
    "LLM": 15, "NLP": 12, "Computer Vision": 10, "MLOps": 11,
    "Recommendation": 9, "Speech": 8, "Robotics": 10, "Data Engineering": 7,
}

DEPTH_SCORE = {
    "フレームワークを使って実装できる": 5,
    "モデルのカスタマイズ・チューニングができる": 12,
    "論文を読んで実装に落とせる": 20,
    "独自アーキテクチャを設計できる": 28,
}

EXP_SCORE = {
    "1年未満": 3, "1-2年": 8, "3-5年": 18, "6-9年": 28, "10年以上": 35,
}

PROJECT_SCORE = {
    "個人・PoC": 3,
    "チーム（3-5人）の本番導入": 10,
    "部門横断プロジェクト": 16,
    "全社基盤・プロダクトコア": 22,
    "OSS / 論文発表あり": 28,
}

LEADERSHIP_SCORE = {
    "個人貢献者": 3,
    "テックリード": 10,
    "チームマネジメント兼務": 15,
    "組織設計・採用にも関与": 20,
}


class DiagnosisService:

    def create_diagnosis(
        self, engineer_id: str, questionnaire: dict, db: Session
    ) -> Diagnosis:
        """診断を作成し、即座にスコアリング"""
        engineer = db.query(Engineer).filter(Engineer.id == engineer_id).first()

        diag = Diagnosis(
            engineer_id=engineer_id,
            questionnaire=questionnaire,
            status=DiagnosisStatus.pending,
        )
        db.add(diag)
        db.flush()

        # スコアリング
        score, report = self._analyze(questionnaire, engineer)
        diag.market_value_score = score
        diag.report = report
        diag.status = DiagnosisStatus.completed
        diag.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(diag)
        return diag

    def _analyze(self, q: dict, engineer: Optional[Engineer] = None) -> tuple:
        """アンケート回答からスコアとレポートを生成"""
        score = 0

        # 1. 専門領域
        domain = q.get("primary_domain", "")
        domain_pts = 0
        for key, val in DOMAIN_MARKET_VALUE.items():
            if key.lower() in domain.lower():
                domain_pts = val
                break
        score += domain_pts

        # 2. 経験年数
        exp = q.get("experience_years", "")
        exp_pts = EXP_SCORE.get(exp, 5)
        score += exp_pts

        # 3. プロジェクト規模
        project = q.get("recent_project", "")
        proj_pts = 0
        for key, val in PROJECT_SCORE.items():
            if key in project:
                proj_pts = val
                break
        score += proj_pts

        # 4. 技術深度
        depth = q.get("tech_depth", "")
        depth_pts = 0
        for key, val in DEPTH_SCORE.items():
            if key in depth:
                depth_pts = val
                break
        score += depth_pts

        # 5. リーダーシップ
        lead = q.get("leadership", "")
        lead_pts = 0
        for key, val in LEADERSHIP_SCORE.items():
            if key in lead:
                lead_pts = val
                break
        score += lead_pts

        # エンジニア登録情報からのボーナス
        if engineer:
            if engineer.github_url:
                score += 3
            if len(engineer.ai_specialties or []) >= 2:
                score += 2

        score = min(score, 99)
        level = "S" if score >= 85 else "A" if score >= 70 else "B" if score >= 55 else "C" if score >= 40 else "D"

        # レポート生成
        strengths = [s for s in [domain, depth, lead] if s and s != "個人貢献者"]
        gaps = []
        if exp_pts < 18:
            gaps.append("実務経験の蓄積（特にプロダクション環境）")
        if depth_pts < 12:
            gaps.append("技術的深度の向上（論文実装・独自アーキテクチャ設計）")
        if lead_pts < 10:
            gaps.append("テックリード・組織設計への関与")
        if domain_pts < 10:
            gaps.append("需要の高いAI領域（LLM/NLP/CV）への専門特化")

        recommendations = []
        if score < 70:
            recommendations.append("専門領域を1つに絞り、深掘りすることで市場価値が大幅に向上します")
        if depth_pts < 20:
            recommendations.append("最新論文のキャッチアップと再実装を週1ペースで継続")
        if lead_pts < 10:
            recommendations.append("社内勉強会の主催やOSS貢献でリーダーシップ実績を構築")
        recommendations.append("GitHubプロフィールの充実（ピン留めリポジトリ・README整備）")
        recommendations.append("技術ブログやカンファレンス登壇で知名度を構築")

        salary_range = self._estimate_salary(score, domain)

        report = {
            "score": score,
            "level": level,
            "summary": self._generate_summary(score, level),
            "strengths": strengths,
            "gaps": gaps,
            "recommendations": recommendations,
            "salary_estimate": salary_range,
            "market_demand": self._get_market_demand(domain),
            "detailed_scores": {
                "domain": domain_pts,
                "experience": exp_pts,
                "project_scale": proj_pts,
                "tech_depth": depth_pts,
                "leadership": lead_pts,
            },
        }
        return score, report

    def _generate_summary(self, score: int, level: str) -> str:
        if score >= 85:
            return "トップクラスのAI人材です。複数企業から即座にオファーが期待できます。現在のスキルセットは市場で非常に高い需要があります。"
        elif score >= 70:
            return "市場価値が高く、積極的な転職活動で複数のオファーを獲得できる水準です。専門性をさらに深めることで、より高い報酬を狙えます。"
        elif score >= 55:
            return "着実にスキルを積み上げている段階です。専門領域を絞り込み、実績を積むことで、1年以内に大幅な市場価値向上が見込めます。"
        elif score >= 40:
            return "基礎力があり、成長ポテンシャルは十分です。実務経験と技術的深度を伸ばすことが最優先です。"
        else:
            return "AI分野でのキャリアのスタート段階です。まずは1つの専門領域を決め、集中的に学習・実践を積みましょう。"

    def _estimate_salary(self, score: int, domain: str) -> dict:
        base_min = 400
        base_max = 600
        if score >= 85:
            base_min, base_max = 1200, 2000
        elif score >= 70:
            base_min, base_max = 800, 1400
        elif score >= 55:
            base_min, base_max = 600, 1000
        elif score >= 40:
            base_min, base_max = 450, 750

        # LLM/NLPは市場プレミアム
        if "LLM" in domain or "NLP" in domain:
            base_min = int(base_min * 1.15)
            base_max = int(base_max * 1.15)

        return {"min": base_min, "max": base_max, "unit": "万円/年"}

    def _get_market_demand(self, domain: str) -> dict:
        demand_map = {
            "LLM": {"level": "非常に高い", "trend": "急上昇", "competition": "中"},
            "NLP": {"level": "高い", "trend": "上昇", "competition": "中〜高"},
            "Computer Vision": {"level": "高い", "trend": "安定", "competition": "高"},
            "MLOps": {"level": "高い", "trend": "上昇", "competition": "低〜中"},
            "Recommendation": {"level": "中", "trend": "安定", "competition": "中"},
            "Speech": {"level": "中", "trend": "やや上昇", "competition": "低"},
        }
        for key, val in demand_map.items():
            if key.lower() in domain.lower():
                return val
        return {"level": "中", "trend": "安定", "competition": "中"}

    def get_free_report(self, diagnosis: Diagnosis) -> dict:
        """無料版：サマリーのみ返却"""
        report = diagnosis.report or {}
        return {
            "score": diagnosis.market_value_score,
            "level": report.get("level", "?"),
            "summary": report.get("summary", ""),
            "strengths": report.get("strengths", []),
            "salary_estimate": report.get("salary_estimate", {}),
            "market_demand": report.get("market_demand", {}),
            "is_paid": False,
            "locked_sections": ["gaps", "recommendations", "detailed_scores"],
        }

    def get_paid_report(self, diagnosis: Diagnosis) -> dict:
        """有料版：全データ返却"""
        report = diagnosis.report or {}
        return {
            **report,
            "is_paid": True,
            "locked_sections": [],
        }


diagnosis_service = DiagnosisService()
