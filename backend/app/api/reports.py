from __future__ import annotations
"""レポート・稟議支援エンドポイント"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models import get_db, Match, Engineer, JobPosting, Company
from ..services.executive_report import executive_report
from ..services.knowledge_loop import knowledge_loop

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/daily")
def daily_report(db: Session = Depends(get_db)):
    """日次3択レポート（代表向け）"""
    return executive_report.generate_daily_report(db)


@router.get("/match/{match_id}/decision")
def match_decision_report(match_id: UUID, db: Session = Depends(get_db)):
    """個別マッチの3択判断レポート"""
    match = db.query(Match).filter(Match.id == str(match_id)).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    engineer = db.query(Engineer).filter(Engineer.id == match.engineer_id).first()
    posting = db.query(JobPosting).filter(JobPosting.id == match.posting_id).first()
    company = db.query(Company).filter(Company.id == posting.company_id).first()

    return executive_report.generate_match_decision_report(
        match=match, engineer=engineer, posting=posting, company=company, db=db
    )


@router.get("/knowledge-loop")
def rejection_analysis(days: int = 90, db: Session = Depends(get_db)):
    """失注データ分析レポート"""
    return knowledge_loop.analyze_rejections(db, days=days)
