from __future__ import annotations
"""求人案件 CRUD エンドポイント"""
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models import get_db, JobPosting, Company, ExperienceLevel
from ..schemas.schemas import JobPostingCreate, JobPostingResponse

router = APIRouter(prefix="/postings", tags=["postings"])


@router.post("", response_model=JobPostingResponse, status_code=201)
def create_posting(payload: JobPostingCreate, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == str(payload.company_id)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    posting = JobPosting(
        company_id=str(payload.company_id),
        title=payload.title,
        description=payload.description,
        experience_level_min=ExperienceLevel(payload.experience_level_min),
        salary_min=payload.salary_min,
        salary_max=payload.salary_max,
        work_style=payload.work_style,
        location=payload.location,
        ai_domain=payload.ai_domain,
        tech_stack=payload.tech_stack,
    )
    db.add(posting)
    db.commit()
    db.refresh(posting)
    return posting


@router.get("", response_model=List[JobPostingResponse])
def list_postings(
    active_only: bool = True,
    company_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    q = db.query(JobPosting)
    if active_only:
        q = q.filter(JobPosting.is_active.is_(True))
    if company_id:
        q = q.filter(JobPosting.company_id == company_id)
    return q.order_by(JobPosting.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{posting_id}", response_model=JobPostingResponse)
def get_posting(posting_id: UUID, db: Session = Depends(get_db)):
    p = db.query(JobPosting).filter(JobPosting.id == str(posting_id)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Posting not found")
    return p


@router.patch("/{posting_id}/deactivate")
def deactivate_posting(posting_id: UUID, db: Session = Depends(get_db)):
    p = db.query(JobPosting).filter(JobPosting.id == str(posting_id)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Posting not found")
    p.is_active = False
    db.commit()
    return {"status": "deactivated", "posting_id": str(posting_id)}
