"""マッチング エンドポイント"""
from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models import get_db, Match, MatchEvent, MatchStatus, Engineer, JobPosting, Company
from ..schemas.schemas import MatchResponse, MatchStatusUpdate
from ..services.discord_notifier import notifier

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/", response_model=List[MatchResponse])
def list_matches(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    q = db.query(Match)
    if status:
        q = q.filter(Match.status == MatchStatus(status))
    return q.order_by(Match.ai_score.desc()).offset(skip).limit(limit).all()


@router.get("/{match_id}", response_model=MatchResponse)
def get_match(match_id: UUID, db: Session = Depends(get_db)):
    m = db.query(Match).filter(Match.id == match_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")
    return m


@router.patch("/{match_id}/status", response_model=MatchResponse)
async def update_match_status(
    match_id: UUID,
    payload: MatchStatusUpdate,
    db: Session = Depends(get_db),
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    old_status = match.status.value
    new_status = MatchStatus(payload.status)
    match.status = new_status

    if payload.rejection_reason:
        match.rejection_reason = payload.rejection_reason
    if payload.notes:
        match.notes = payload.notes
    if new_status in (MatchStatus.accepted, MatchStatus.rejected, MatchStatus.withdrawn):
        match.resolved_at = datetime.utcnow()

    # イベントログ記録
    event = MatchEvent(
        match_id=match.id,
        event_type="status_change",
        old_value=old_status,
        new_value=new_status.value,
        actor="api",
    )
    db.add(event)
    db.commit()
    db.refresh(match)

    # Discord通知
    try:
        engineer = db.query(Engineer).filter(Engineer.id == match.engineer_id).first()
        posting = db.query(JobPosting).filter(JobPosting.id == match.posting_id).first()
        company = db.query(Company).filter(Company.id == posting.company_id).first()
        await notifier.notify_status_change(
            match_id=str(match.id),
            engineer_name=engineer.name,
            company_name=company.name,
            old_status=old_status,
            new_status=new_status.value,
        )
    except Exception:
        pass

    return match
