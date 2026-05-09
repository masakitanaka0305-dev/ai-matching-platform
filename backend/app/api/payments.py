from __future__ import annotations
"""決済 エンドポイント"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..models import get_db, Company, Match, Payment, Engineer, JobPosting
from ..services.stripe_service import stripe_service
from ..services.discord_notifier import notifier
from ..schemas.schemas import ScoutApproachCheckoutRequest, ScoutApproachCheckoutResponse

router = APIRouter(prefix="/payments", tags=["payments"])


class CheckoutRequest(BaseModel):
    company_id: UUID
    match_id: UUID
    amount: int | None = None


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str
    payment_id: str


class DiagnosisCheckoutRequest(BaseModel):
    engineer_id: UUID
    amount: int = 5000


# ------------------------------------------------------------------
# 成功報酬 Checkout
# ------------------------------------------------------------------
@router.post("/checkout/success-fee", response_model=CheckoutResponse)
async def create_success_fee_checkout(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
):
    company = db.query(Company).filter(Company.id == payload.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    match = db.query(Match).filter(Match.id == payload.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    result = await stripe_service.create_success_fee_checkout(
        company=company,
        match=match,
        db=db,
        amount=payload.amount,
    )
    return CheckoutResponse(**result)


# ------------------------------------------------------------------
# 優先アプローチ権 Checkout
# ------------------------------------------------------------------
@router.post("/checkout/scout-approach", response_model=ScoutApproachCheckoutResponse)
async def create_scout_approach_checkout(
    payload: ScoutApproachCheckoutRequest,
    db: Session = Depends(get_db),
):
    company = db.query(Company).filter(Company.id == payload.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    match = db.query(Match).filter(Match.id == payload.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if match.is_unlocked:
        raise HTTPException(status_code=400, detail="既にアプローチ権は解放済みです")

    result = await stripe_service.create_scout_approach_checkout(
        company=company,
        match=match,
        db=db,
    )
    return ScoutApproachCheckoutResponse(**result)


# ------------------------------------------------------------------
# 診断レポート Checkout
# ------------------------------------------------------------------
@router.post("/checkout/diagnosis")
async def create_diagnosis_checkout(
    payload: DiagnosisCheckoutRequest,
    db: Session = Depends(get_db),
):
    result = await stripe_service.create_diagnosis_checkout(
        engineer_id=payload.engineer_id,
        db=db,
        amount=payload.amount,
    )
    return result


# ------------------------------------------------------------------
# Stripe Webhook
# ------------------------------------------------------------------
@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        result = stripe_service.handle_webhook_event(payload, sig_header, db)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # 決済成功時にDiscord通知
    if result.get("status") == "processed" and "succeeded" in result.get("type", ""):
        # 最新のsucceeded paymentを取得して通知
        latest = (
            db.query(Payment)
            .filter(Payment.status == "succeeded")
            .order_by(Payment.paid_at.desc())
            .first()
        )
        if latest:
            company = db.query(Company).filter(Company.id == latest.company_id).first()
            try:
                await notifier.notify_payment(
                    company_name=company.name if company else "不明",
                    amount=latest.amount,
                    payment_type=latest.payment_type,
                )
            except Exception:
                pass

    return {"received": True, **result}


# ------------------------------------------------------------------
# 稟議用データ取得
# ------------------------------------------------------------------
@router.get("/approval/{match_id}")
def get_approval_data(
    match_id: str,
    company_id: str = "",
    db: Session = Depends(get_db),
):
    """社内稟議用データを返却。is_unlocked必須。"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if not match.is_unlocked:
        raise HTTPException(status_code=403, detail="アプローチ権が未解放です")

    engineer: Engineer = match.engineer
    posting: JobPosting = match.posting
    company: Company = posting.company

    assessment = match.assessment_report or {}
    market = assessment.get("market_value_comparison", {})
    salary_est = market.get("salary_estimate", {})

    return {
        "match_id": str(match.id),
        "company": {
            "name": company.name,
            "industry": company.industry,
        },
        "posting": {
            "title": posting.title,
            "salary_min": posting.salary_min,
            "salary_max": posting.salary_max,
        },
        "candidate": {
            "name": engineer.name,
            "experience_level": engineer.experience_level.value if engineer.experience_level else "unknown",
            "years_of_experience": engineer.years_of_experience,
            "ai_specialties": engineer.ai_specialties or [],
            "skills": [s.name for s in engineer.skills],
        },
        "ai_evaluation": {
            "total_score": float(match.ai_score),
            "skill_match_rate": float(match.skill_match_rate or 0),
            "level": market.get("level", "N/A"),
        },
        "cost_comparison": {
            "approach_fee": 30000,
            "approach_fee_label": "優先アプローチ権（税込）",
            "typical_agent_fee": "想定年収の30〜35%",
            "saving_note": "エージェント経由の採用成功報酬と比較して大幅なコスト削減",
        },
        "roi_estimate": {
            "salary_estimate": salary_est,
            "note": "AIスコアリングによる精度の高いマッチングにより、採用後のミスマッチリスクを低減",
        },
        "assessment_report": assessment,
        "generated_at": match.unlocked_at.isoformat() if match.unlocked_at else None,
    }


# ------------------------------------------------------------------
# 決済履歴
# ------------------------------------------------------------------
@router.get("/history/{company_id}")
def payment_history(
    company_id: UUID,
    db: Session = Depends(get_db),
):
    payments = (
        db.query(Payment)
        .filter(Payment.company_id == company_id)
        .order_by(Payment.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(p.id),
            "amount": p.amount,
            "status": p.status.value,
            "type": p.payment_type,
            "created_at": p.created_at.isoformat(),
            "paid_at": p.paid_at.isoformat() if p.paid_at else None,
        }
        for p in payments
    ]
