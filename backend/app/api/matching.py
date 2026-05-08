from __future__ import annotations
"""マッチング実行・スコアリング エンドポイント"""
from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..models import get_db, Match, Engineer, JobPosting, Company
from ..schemas.schemas import MatchResponse
from ..services.scoring_engine import matching_service, scoring_engine, ScoringResult
from ..services.discord_notifier import notifier

router = APIRouter(prefix="/matching", tags=["matching"])


class RunMatchingRequest(BaseModel):
    min_score: float = 50.0
    posting_id: Optional[UUID] = None


class RunMatchingResponse(BaseModel):
    new_matches_count: int
    matches: list[MatchResponse]


class ScorePreviewRequest(BaseModel):
    engineer_id: UUID
    posting_id: UUID


class ScorePreviewResponse(BaseModel):
    total_score: float
    skill_match_rate: float
    experience_score: float
    salary_score: float
    work_style_score: float
    ai_domain_score: float
    culture_fit_score: float
    details: dict


@router.post("/run", response_model=RunMatchingResponse)
async def run_matching(
    payload: RunMatchingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    マッチングエンジンを実行。
    全アクティブ求人 × 転職可能エンジニアをスコアリングし、
    閾値以上のペアをmatchesに保存。
    """
    new_matches = matching_service.run_matching(
        db=db,
        min_score=payload.min_score,
        posting_id=payload.posting_id,
    )

    # Discord通知をバックグラウンドで送信
    for match in new_matches:
        engineer = db.query(Engineer).filter(Engineer.id == match.engineer_id).first()
        posting = db.query(JobPosting).filter(JobPosting.id == match.posting_id).first()
        company = db.query(Company).filter(Company.id == posting.company_id).first()

        background_tasks.add_task(
            notifier.notify_new_match,
            engineer_name=engineer.name,
            company_name=company.name,
            posting_title=posting.title,
            ai_score=float(match.ai_score),
            match_id=str(match.id),
            channel_id=company.discord_channel_id,
        )

    return RunMatchingResponse(
        new_matches_count=len(new_matches),
        matches=[MatchResponse.model_validate(m) for m in new_matches],
    )


@router.post("/preview", response_model=ScorePreviewResponse)
def preview_score(
    payload: ScorePreviewRequest,
    db: Session = Depends(get_db),
):
    """
    特定のエンジニア×求人ペアのスコアをプレビュー（保存しない）。
    管理画面での確認用。
    """
    engineer = db.query(Engineer).filter(Engineer.id == payload.engineer_id).first()
    if not engineer:
        raise HTTPException(status_code=404, detail="Engineer not found")

    posting = db.query(JobPosting).filter(JobPosting.id == payload.posting_id).first()
    if not posting:
        raise HTTPException(status_code=404, detail="JobPosting not found")

    result = scoring_engine.score(engineer, posting, db)

    return ScorePreviewResponse(
        total_score=result.total_score,
        skill_match_rate=result.skill_match_rate,
        experience_score=result.experience_score,
        salary_score=result.salary_score,
        work_style_score=result.work_style_score,
        ai_domain_score=result.ai_domain_score,
        culture_fit_score=result.culture_fit_score,
        details=result.details,
    )
