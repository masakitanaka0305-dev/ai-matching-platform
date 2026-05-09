from __future__ import annotations
"""エンジニア CRUD エンドポイント"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models import get_db, Engineer, ExperienceLevel
from ..schemas.schemas import EngineerCreate, EngineerResponse
from ..services.discord_notifier import notifier

router = APIRouter(prefix="/engineers", tags=["engineers"])


@router.post("", response_model=EngineerResponse, status_code=201)
async def create_engineer(payload: EngineerCreate, db: Session = Depends(get_db)):
    engineer = Engineer(
        name=payload.name,
        email=payload.email,
        experience_level=ExperienceLevel(payload.experience_level),
        years_of_experience=payload.years_of_experience,
        ai_specialties=payload.ai_specialties,
        preferred_frameworks=payload.preferred_frameworks,
        desired_salary_min=payload.desired_salary_min,
        desired_salary_max=payload.desired_salary_max,
        desired_work_style=payload.desired_work_style,
        bio=payload.bio,
        github_url=payload.github_url,
        x_handle=payload.x_handle,
        source="organic",
    )
    db.add(engineer)
    db.commit()
    db.refresh(engineer)

    # Discord通知（非同期・失敗しても登録は成功させる）
    try:
        await notifier.notify_new_engineer(
            name=engineer.name,
            experience_level=engineer.experience_level.value,
            specialties=engineer.ai_specialties,
            source=engineer.source,
        )
    except Exception:
        pass  # 通知失敗は握りつぶす

    return engineer


@router.get("", response_model=list[EngineerResponse])
def list_engineers(
    skip: int = 0,
    limit: int = 20,
    open_only: bool = True,
    db: Session = Depends(get_db),
):
    q = db.query(Engineer)
    if open_only:
        q = q.filter(Engineer.open_to_offers.is_(True))
    return q.order_by(Engineer.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{engineer_id}", response_model=EngineerResponse)
def get_engineer(engineer_id: UUID, db: Session = Depends(get_db)):
    eng = db.query(Engineer).filter(Engineer.id == engineer_id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engineer not found")
    return eng
