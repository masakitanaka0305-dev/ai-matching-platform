from __future__ import annotations
"""決済 エンドポイント"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..models import get_db, Company, Match, Payment
from ..services.stripe_service import stripe_service
from ..services.discord_notifier import notifier

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
