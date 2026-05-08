from __future__ import annotations
"""企業 CRUD エンドポイント"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models import get_db, Company
from ..schemas.schemas import CompanyCreate, CompanyResponse
from ..services.discord_notifier import notifier

router = APIRouter(prefix="/companies", tags=["companies"])


@router.post("/", response_model=CompanyResponse, status_code=201)
async def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    company = Company(
        name=payload.name,
        contact_name=payload.contact_name,
        contact_email=payload.contact_email,
        website=payload.website,
        industry=payload.industry,
        employee_count=payload.employee_count,
        description=payload.description,
    )
    db.add(company)
    db.commit()
    db.refresh(company)

    try:
        await notifier.notify_new_company(
            name=company.name,
            industry=company.industry or "",
            contact_name=company.contact_name,
        )
    except Exception:
        pass

    return company


@router.get("/", response_model=list[CompanyResponse])
def list_companies(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(Company).order_by(Company.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(company_id: UUID, db: Session = Depends(get_db)):
    comp = db.query(Company).filter(Company.id == company_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")
    return comp
