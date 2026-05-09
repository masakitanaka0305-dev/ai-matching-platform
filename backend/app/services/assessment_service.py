from __future__ import annotations
"""
技術鑑定書（Assessment Report）生成サービス

マッチングスコアの分解データと候補者情報を結合し、
企業が採用判断に使える構造化レポートを生成する。
"""
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from ..models.models import Match, Engineer, JobPosting


class AssessmentService:

    def generate_report(self, match: Match, db: Session) -> dict:
        """技術鑑定書JSONを生成して返却"""
        engineer: Engineer = match.engineer
        posting: JobPosting = match.posting

        scoring = match.scoring_details or {}
        skill_detail = scoring.get("skill", {})
        experience_detail = scoring.get("experience", {})
        salary_detail = scoring.get("salary", {})

        # スキル分析
        matched_skills = skill_detail.get("matched", [])
        required_total = skill_detail.get("required_total", 0)
        required_matched = skill_detail.get("required_matched", 0)

        # 市場価値レベル
        total_score = float(match.ai_score or 0)
        level = self._score_to_level(total_score)

        # 推定年収
        salary_estimate = self._estimate_salary(engineer)

        # 推奨面接質問
        questions = self._generate_interview_questions(engineer, posting)

        report = {
            "generated_at": datetime.utcnow().isoformat(),
            "candidate_summary": {
                "name": engineer.name,
                "experience_level": engineer.experience_level.value if engineer.experience_level else "unknown",
                "years_of_experience": engineer.years_of_experience,
                "ai_specialties": engineer.ai_specialties or [],
                "skills": [s.name for s in engineer.skills],
                "current_company": engineer.current_company,
                "current_role": engineer.current_role,
                "bio": engineer.bio,
            },
            "ai_scoring_breakdown": {
                "total_score": total_score,
                "skill_match_rate": float(match.skill_match_rate or 0),
                "culture_fit_score": float(match.culture_fit_score or 0),
                "experience_score": scoring.get("experience", {}).get("diff", 0),
                "details": scoring,
            },
            "skill_analysis": {
                "matched_skills": matched_skills,
                "required_total": required_total,
                "required_matched": required_matched,
                "nice_matched": skill_detail.get("nice_matched", 0),
                "nice_total": skill_detail.get("nice_total", 0),
                "engineer_frameworks": engineer.preferred_frameworks or [],
                "posting_tech_stack": posting.tech_stack or [],
            },
            "market_value_comparison": {
                "score": total_score,
                "level": level,
                "salary_estimate": salary_estimate,
            },
            "recommended_interview_questions": questions,
        }

        return report

    def _score_to_level(self, score: float) -> str:
        if score >= 85:
            return "S"
        elif score >= 70:
            return "A"
        elif score >= 55:
            return "B"
        elif score >= 40:
            return "C"
        else:
            return "D"

    def _estimate_salary(self, engineer: Engineer) -> dict:
        """経験年数とレベルから推定年収を算出"""
        base_ranges = {
            "junior": (350, 500),
            "mid": (500, 750),
            "senior": (700, 1100),
            "lead": (900, 1400),
            "executive": (1200, 2000),
        }
        level = engineer.experience_level.value if engineer.experience_level else "mid"
        min_sal, max_sal = base_ranges.get(level, (500, 750))

        # 経験年数による微調整
        years = engineer.years_of_experience or 0
        adjustment = min(years * 20, 200)

        return {
            "min": min_sal + adjustment,
            "max": max_sal + adjustment,
            "median": (min_sal + max_sal) // 2 + adjustment,
            "unit": "万円",
        }

    def _generate_interview_questions(
        self, engineer: Engineer, posting: JobPosting
    ) -> list[str]:
        """候補者の専門領域に基づく推奨面接質問を生成"""
        questions = []
        specialties = engineer.ai_specialties or []

        # AI専門領域に基づく質問
        domain_questions = {
            "LLM": "大規模言語モデルのファインチューニング経験と、プロンプトエンジニアリングのベストプラクティスについて教えてください。",
            "NLP": "自然言語処理で最も困難だったプロジェクトと、その課題をどう解決したか教えてください。",
            "CV": "コンピュータビジョンの実装で、推論速度とモデル精度のトレードオフをどのように管理していますか？",
            "MLOps": "ML パイプラインの本番運用で直面した課題と、モニタリング・再学習戦略について教えてください。",
            "データ分析": "ビジネスKPIに直結するデータ分析プロジェクトの経験と、ステークホルダーへの報告方法を教えてください。",
            "強化学習": "強化学習の報酬設計で工夫した点と、実環境適用時の課題について教えてください。",
        }

        for specialty in specialties[:3]:
            q = domain_questions.get(specialty)
            if q:
                questions.append(q)

        # 汎用質問
        questions.extend([
            "チーム開発でのコードレビュープロセスと品質管理の取り組みについて教えてください。",
            "技術選定の際にどのような基準で判断しますか？直近の事例を教えてください。",
        ])

        return questions[:5]


assessment_service = AssessmentService()
