from __future__ import annotations
"""
マッチングスコアリングエンジン

スコア構成（100点満点）:
  - スキル一致率        : 35点
  - 経験レベル適合度     : 20点
  - 給与レンジ適合度     : 15点
  - 勤務形態一致        : 10点
  - AI専門領域一致      : 15点
  - カルチャーフィット    : 5点（将来拡張）

失注データからの学習ループ:
  match_events の rejection_reason を集計し、重み調整に使用する（第六段階で実装）
"""
from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from ..models.models import (
    Engineer, JobPosting, Company, Match, MatchEvent, MatchStatus,
    ExperienceLevel, engineer_skills, posting_skills, SkillTag,
)


# ---------------------------------------------------------------------------
# 重み設定
# ---------------------------------------------------------------------------
WEIGHTS = {
    "skill_match": 35.0,
    "experience_level": 20.0,
    "salary_fit": 15.0,
    "work_style": 10.0,
    "ai_domain": 15.0,
    "culture_fit": 5.0,
}

# 経験レベルの序数マッピング
LEVEL_ORDER = {
    ExperienceLevel.junior: 1,
    ExperienceLevel.mid: 2,
    ExperienceLevel.senior: 3,
    ExperienceLevel.lead: 4,
    ExperienceLevel.executive: 5,
}


@dataclass
class ScoringResult:
    total_score: float
    skill_match_rate: float
    experience_score: float
    salary_score: float
    work_style_score: float
    ai_domain_score: float
    culture_fit_score: float
    details: dict


# ---------------------------------------------------------------------------
# スコアリングロジック
# ---------------------------------------------------------------------------
class ScoringEngine:

    def score(self, engineer: Engineer, posting: JobPosting, db: Session) -> ScoringResult:
        """エンジニアと求人のマッチスコアを算出"""

        # 1. スキル一致率
        skill_score, skill_detail = self._calc_skill_match(engineer, posting, db)

        # 2. 経験レベル適合度
        exp_score, exp_detail = self._calc_experience_match(engineer, posting)

        # 3. 給与レンジ適合度
        salary_score, salary_detail = self._calc_salary_match(engineer, posting)

        # 4. 勤務形態一致
        ws_score, ws_detail = self._calc_work_style_match(engineer, posting)

        # 5. AI専門領域一致
        ai_score, ai_detail = self._calc_ai_domain_match(engineer, posting)

        # 6. カルチャーフィット（将来拡張、現在は基礎値）
        culture_score = 0.5

        # 加重合計
        total = (
            skill_score * WEIGHTS["skill_match"]
            + exp_score * WEIGHTS["experience_level"]
            + salary_score * WEIGHTS["salary_fit"]
            + ws_score * WEIGHTS["work_style"]
            + ai_score * WEIGHTS["ai_domain"]
            + culture_score * WEIGHTS["culture_fit"]
        )

        details = {
            "skill": skill_detail,
            "experience": exp_detail,
            "salary": salary_detail,
            "work_style": ws_detail,
            "ai_domain": ai_detail,
            "weights": WEIGHTS,
        }

        return ScoringResult(
            total_score=round(total, 2),
            skill_match_rate=round(skill_score * 100, 1),
            experience_score=round(exp_score * 100, 1),
            salary_score=round(salary_score * 100, 1),
            work_style_score=round(ws_score * 100, 1),
            ai_domain_score=round(ai_score * 100, 1),
            culture_fit_score=round(culture_score * 100, 1),
            details=details,
        )

    # ------------------------------------------------------------------
    # 個別スコア算出
    # ------------------------------------------------------------------

    def _calc_skill_match(
        self, engineer: Engineer, posting: JobPosting, db: Session
    ) -> tuple[float, dict]:
        """スキルタグの一致率（必須スキルに重み2倍）"""
        eng_skill_ids = {s.id for s in engineer.skills}

        # 求人のスキル（required / nice-to-have 区別）
        required_rows = db.execute(
            posting_skills.select().where(
                posting_skills.c.posting_id == posting.id,
                posting_skills.c.required.is_(True),
            )
        ).fetchall()
        nice_rows = db.execute(
            posting_skills.select().where(
                posting_skills.c.posting_id == posting.id,
                posting_skills.c.required.is_(False),
            )
        ).fetchall()

        required_ids = {r.skill_id for r in required_rows}
        nice_ids = {r.skill_id for r in nice_rows}

        if not required_ids and not nice_ids:
            # スキルタグ未設定の求人 → フレームワーク文字列比較にフォールバック
            return self._fallback_skill_match(engineer, posting)

        # 必須スキル一致（重み2）
        req_matched = len(eng_skill_ids & required_ids)
        req_total = len(required_ids) if required_ids else 1

        # 歓迎スキル一致（重み1）
        nice_matched = len(eng_skill_ids & nice_ids)
        nice_total = len(nice_ids) if nice_ids else 1

        weighted_score = (req_matched / req_total * 2 + nice_matched / nice_total) / 3

        detail = {
            "required_matched": req_matched,
            "required_total": len(required_ids),
            "nice_matched": nice_matched,
            "nice_total": len(nice_ids),
        }
        return min(weighted_score, 1.0), detail

    def _fallback_skill_match(
        self, engineer: Engineer, posting: JobPosting
    ) -> tuple[float, dict]:
        """skill_tags未使用時のフォールバック（テキスト比較）"""
        eng_set = set(s.lower() for s in (engineer.preferred_frameworks or []))
        post_set = set(s.lower() for s in (posting.tech_stack or []))

        if not post_set:
            return 0.5, {"method": "fallback", "note": "no tech_stack on posting"}

        overlap = len(eng_set & post_set)
        rate = overlap / len(post_set)
        return min(rate, 1.0), {
            "method": "fallback",
            "matched": list(eng_set & post_set),
            "required": list(post_set),
        }

    def _calc_experience_match(
        self, engineer: Engineer, posting: JobPosting
    ) -> tuple[float, dict]:
        """経験レベルの距離（近いほど高スコア）"""
        eng_level = LEVEL_ORDER.get(engineer.experience_level, 2)
        req_level = LEVEL_ORDER.get(posting.experience_level_min, 2)

        diff = eng_level - req_level
        if diff >= 0:
            # 要件以上 → 高スコア（過剰レベルは若干減点）
            score = max(1.0 - diff * 0.15, 0.5)
        else:
            # 要件未満 → ペナルティ大
            score = max(1.0 + diff * 0.35, 0.0)

        detail = {
            "engineer_level": engineer.experience_level.value,
            "required_min": posting.experience_level_min.value if posting.experience_level_min else "mid",
            "diff": diff,
        }
        return score, detail

    def _calc_salary_match(
        self, engineer: Engineer, posting: JobPosting
    ) -> tuple[float, dict]:
        """給与レンジの重なり度"""
        e_min = engineer.desired_salary_min or 0
        e_max = engineer.desired_salary_max or 99999
        p_min = posting.salary_min or 0
        p_max = posting.salary_max or 99999

        overlap_start = max(e_min, p_min)
        overlap_end = min(e_max, p_max)

        if overlap_end < overlap_start:
            # 重なりなし → ギャップの大きさで減点
            gap = overlap_start - overlap_end
            score = max(0.0, 1.0 - gap / 500)  # 500万円差でゼロ
        else:
            # 重なりあり
            overlap = overlap_end - overlap_start
            total_range = max(e_max - e_min, p_max - p_min, 1)
            score = min(overlap / total_range + 0.5, 1.0)

        detail = {
            "engineer_range": [e_min, e_max],
            "posting_range": [p_min, p_max],
        }
        return score, detail

    def _calc_work_style_match(
        self, engineer: Engineer, posting: JobPosting
    ) -> tuple[float, dict]:
        """勤務形態の一致"""
        e_style = (engineer.desired_work_style or "hybrid").lower()
        p_style = (posting.work_style or "hybrid").lower()

        if e_style == p_style:
            score = 1.0
        elif "hybrid" in (e_style, p_style):
            score = 0.7  # hybrid はどちらとも部分一致
        else:
            score = 0.2  # remote ↔ onsite は大きなミスマッチ

        return score, {"engineer": e_style, "posting": p_style}

    def _calc_ai_domain_match(
        self, engineer: Engineer, posting: JobPosting
    ) -> tuple[float, dict]:
        """AI専門領域（NLP, CV, LLM等）の一致率"""
        eng_domains = set(d.lower() for d in (engineer.ai_specialties or []))
        post_domains = set(d.lower() for d in (posting.ai_domain or []))

        if not post_domains:
            return 0.5, {"note": "posting has no ai_domain specified"}

        overlap = len(eng_domains & post_domains)
        rate = overlap / len(post_domains)

        return min(rate, 1.0), {
            "matched": list(eng_domains & post_domains),
            "posting_domains": list(post_domains),
        }


# ---------------------------------------------------------------------------
# マッチング実行サービス
# ---------------------------------------------------------------------------
class MatchingService:
    """全アクティブ求人 × 全転職可能エンジニアの組み合わせをスコアリング"""

    def __init__(self):
        self.engine = ScoringEngine()

    def run_matching(
        self,
        db: Session,
        min_score: float = 50.0,
        posting_id: Optional[UUID] = None,
    ) -> list[Match]:
        """
        マッチングを実行し、閾値以上のペアをmatchesテーブルに保存。
        posting_id を指定すると単一求人に対してのみ実行。
        """
        # 対象取得
        engineers = db.query(Engineer).filter(Engineer.open_to_offers.is_(True)).all()

        postings_q = db.query(JobPosting).filter(JobPosting.is_active.is_(True))
        if posting_id:
            postings_q = postings_q.filter(JobPosting.id == posting_id)
        postings = postings_q.all()

        # 既存マッチを取得（重複防止）
        existing = set()
        for m in db.query(Match.engineer_id, Match.posting_id).all():
            existing.add((m.engineer_id, m.posting_id))

        new_matches = []

        for posting in postings:
            for engineer in engineers:
                if (engineer.id, posting.id) in existing:
                    continue

                result = self.engine.score(engineer, posting, db)

                if result.total_score < min_score:
                    continue

                # 推薦文生成（テンプレートベース、将来LLMに置換）
                pitch_eng = self._generate_pitch_to_engineer(engineer, posting, result)
                pitch_comp = self._generate_pitch_to_company(engineer, posting, result)

                match = Match(
                    engineer_id=engineer.id,
                    posting_id=posting.id,
                    ai_score=result.total_score,
                    skill_match_rate=result.skill_match_rate,
                    culture_fit_score=result.culture_fit_score,
                    scoring_details=result.details,
                    status=MatchStatus.proposed,
                    pitch_to_engineer=pitch_eng,
                    pitch_to_company=pitch_comp,
                )
                db.add(match)
                new_matches.append(match)

                # イベントログ
                db.flush()  # match.id を確定
                event = MatchEvent(
                    match_id=match.id,
                    event_type="auto_proposed",
                    new_value="proposed",
                    actor="scoring_engine",
                    detail={"score": result.total_score},
                )
                db.add(event)

        db.commit()
        return new_matches

    def _generate_pitch_to_engineer(
        self, engineer: Engineer, posting: JobPosting, result: ScoringResult
    ) -> str:
        """エンジニア向け推薦文（テンプレート版）"""
        company = posting.company
        return (
            f"【おすすめ求人】{company.name}の{posting.title}\n\n"
            f"あなたの専門領域（{', '.join(engineer.ai_specialties[:3])}）と"
            f"高い親和性があります（マッチ率 {result.total_score:.0f}%）。\n"
            f"勤務形態: {posting.work_style}\n"
            f"年収レンジ: {posting.salary_min or '応相談'}〜{posting.salary_max or '応相談'}万円"
        )

    def _generate_pitch_to_company(
        self, engineer: Engineer, posting: JobPosting, result: ScoringResult
    ) -> str:
        """企業向け推薦文（テンプレート版）"""
        return (
            f"【候補者ご紹介】{engineer.name}（{engineer.experience_level.value}）\n\n"
            f"AI専門: {', '.join(engineer.ai_specialties[:3])}\n"
            f"経験年数: {engineer.years_of_experience}年\n"
            f"スキル一致率: {result.skill_match_rate:.0f}%\n"
            f"総合スコア: {result.total_score:.0f}点\n"
            f"現職: {engineer.current_company or '非公開'} / {engineer.current_role or '非公開'}"
        )


# シングルトン
scoring_engine = ScoringEngine()
matching_service = MatchingService()
