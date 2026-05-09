"""マッチング エンドポイント"""
from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models import get_db, Match, MatchEvent, MatchStatus, Engineer, JobPosting, Company
from ..schemas.schemas import (
    MatchResponse, MatchStatusUpdate,
    CompanyMatchResponse, MaskedCandidateInfo, UnlockedCandidateInfo,
)
from ..services.discord_notifier import notifier

router = APIRouter(prefix="/matches", tags=["matches"])


# ------------------------------------------------------------------
# 企業向けマッチ一覧（マスキング付き）
# ------------------------------------------------------------------
@router.get("/company/{company_id}", response_model=List[CompanyMatchResponse])
def list_company_matches(
    company_id: UUID,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """企業に紐づくマッチ一覧を返却。未unlock候補者はマスキング表示。"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # 企業の全求人IDを取得
    posting_ids = [
        p.id for p in db.query(JobPosting).filter(JobPosting.company_id == company_id).all()
    ]
    if not posting_ids:
        return []

    q = db.query(Match).filter(Match.posting_id.in_(posting_ids))
    if status:
        q = q.filter(Match.status == MatchStatus(status))
    matches = q.order_by(Match.ai_score.desc()).offset(skip).limit(limit).all()

    results = []
    for m in matches:
        engineer: Engineer = m.engineer
        posting: JobPosting = m.posting

        if m.is_unlocked:
            candidate = UnlockedCandidateInfo(
                initials=engineer.name[0] if engineer.name else "?",
                experience_level=engineer.experience_level.value if engineer.experience_level else "unknown",
                years_of_experience=engineer.years_of_experience or 0,
                ai_specialties=engineer.ai_specialties or [],
                skill_tags=[s.name for s in engineer.skills],
                work_style=engineer.desired_work_style or "hybrid",
                name=engineer.name,
                email=engineer.email,
                phone=engineer.phone,
                github_url=engineer.github_url,
                linkedin_url=engineer.linkedin_url,
                desired_salary_min=engineer.desired_salary_min,
                desired_salary_max=engineer.desired_salary_max,
                bio=engineer.bio,
                current_company=engineer.current_company,
                current_role=engineer.current_role,
                pitch_to_company=m.pitch_to_company,
            )
        else:
            candidate = MaskedCandidateInfo(
                initials=engineer.name[0] if engineer.name else "?",
                experience_level=engineer.experience_level.value if engineer.experience_level else "unknown",
                years_of_experience=engineer.years_of_experience or 0,
                ai_specialties=engineer.ai_specialties or [],
                skill_tags=[s.name for s in engineer.skills],
                work_style=engineer.desired_work_style or "hybrid",
            )

        results.append(CompanyMatchResponse(
            id=str(m.id),
            posting_id=str(m.posting_id),
            posting_title=posting.title,
            ai_score=float(m.ai_score),
            skill_match_rate=float(m.skill_match_rate) if m.skill_match_rate else None,
            culture_fit_score=float(m.culture_fit_score) if m.culture_fit_score else None,
            status=m.status.value,
            is_unlocked=m.is_unlocked,
            proposed_at=m.proposed_at.isoformat() if m.proposed_at else "",
            candidate=candidate,
            assessment_report=m.assessment_report if m.is_unlocked else None,
        ))

    return results


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
