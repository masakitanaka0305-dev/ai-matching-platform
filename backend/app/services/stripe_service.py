from __future__ import annotations
"""
Stripe決済サービス

収益モデル:
  1. 成功報酬（success_fee）: マッチング成約時に企業へ請求（デフォルト50万円）
  2. 月額プラン（monthly）: 月額固定で候補者閲覧し放題
  3. 診断レポート（diagnosis_report）: 有料版詳細レポート
"""
from datetime import datetime
from uuid import UUID
from typing import Optional

from sqlalchemy.orm import Session

from ..core.config import settings
from ..models.models import Payment, PaymentStatus, Company, Match, MatchStatus

try:
    import stripe
    stripe.api_key = settings.stripe_secret_key
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False


class StripeService:

    # ------------------------------------------------------------------
    # 顧客管理
    # ------------------------------------------------------------------
    def _check_stripe(self):
        if not STRIPE_AVAILABLE:
            raise RuntimeError("stripe パッケージ未インストール。pip install stripe を実行してください。")

    async def get_or_create_customer(self, company: Company, db: Session) -> str:
        """企業のStripe Customerを取得 or 作成"""
        self._check_stripe()
        if company.stripe_customer_id:
            return company.stripe_customer_id

        customer = stripe.Customer.create(
            name=company.name,
            email=company.contact_email,
            metadata={"company_id": str(company.id), "platform": "ai_matching"},
        )
        company.stripe_customer_id = customer.id
        db.commit()
        return customer.id

    # ------------------------------------------------------------------
    # 成功報酬 Checkout
    # ------------------------------------------------------------------
    async def create_success_fee_checkout(
        self,
        company: Company,
        match: Match,
        db: Session,
        amount: Optional[int] = None,
        success_url: str = "http://localhost:3000/payment/success",
        cancel_url: str = "http://localhost:3000/payment/cancel",
    ) -> dict:
        """
        マッチング成約時の成功報酬 Checkout Session を作成。
        返却: {checkout_url, session_id, payment_id}
        """
        fee = amount or settings.success_fee_amount
        customer_id = await self.get_or_create_customer(company, db)

        # Payment レコード作成（pending）
        payment = Payment(
            company_id=company.id,
            match_id=match.id,
            amount=fee,
            payment_type="success_fee",
            status=PaymentStatus.pending,
            description=f"成功報酬 - Match {str(match.id)[:8]}",
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        # Stripe Checkout Session
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "jpy",
                    "product_data": {
                        "name": "AI人材マッチング 成功報酬",
                        "description": f"Match ID: {str(match.id)[:8]}",
                    },
                    "unit_amount": fee,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            metadata={
                "payment_id": str(payment.id),
                "match_id": str(match.id),
                "company_id": str(company.id),
                "type": "success_fee",
            },
        )

        payment.stripe_payment_intent_id = session.payment_intent
        db.commit()

        return {
            "checkout_url": session.url,
            "session_id": session.id,
            "payment_id": str(payment.id),
        }

    # ------------------------------------------------------------------
    # 月額サブスクリプション
    # ------------------------------------------------------------------
    async def create_monthly_subscription(
        self,
        company: Company,
        db: Session,
        price_id: str = "",  # Stripe Price ID（事前にダッシュボードで作成）
        success_url: str = "http://localhost:3000/payment/success",
        cancel_url: str = "http://localhost:3000/payment/cancel",
    ) -> dict:
        """月額プランのCheckout Session"""
        customer_id = await self.get_or_create_customer(company, db)

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            metadata={
                "company_id": str(company.id),
                "type": "monthly",
            },
        )

        return {
            "checkout_url": session.url,
            "session_id": session.id,
        }

    # ------------------------------------------------------------------
    # 診断レポート購入
    # ------------------------------------------------------------------
    async def create_diagnosis_checkout(
        self,
        engineer_id: UUID,
        db: Session,
        amount: int = 5000,  # 5,000円
        success_url: str = "http://localhost:3000/diagnosis/success",
        cancel_url: str = "http://localhost:3000/diagnosis/cancel",
    ) -> dict:
        """無料診断→有料レポートの購入Checkout"""
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "jpy",
                    "product_data": {
                        "name": "AI市場価値 詳細診断レポート",
                        "description": "あなたのAIスキルの市場価値を詳細分析",
                    },
                    "unit_amount": amount,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            metadata={
                "engineer_id": str(engineer_id),
                "type": "diagnosis_report",
            },
        )
        return {
            "checkout_url": session.url,
            "session_id": session.id,
        }

    # ------------------------------------------------------------------
    # Webhook 処理
    # ------------------------------------------------------------------
    def handle_webhook_event(self, payload: bytes, sig_header: str, db: Session) -> dict:
        """Stripe Webhookイベントを処理"""
        self._check_stripe()
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.stripe_webhook_secret
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            raise ValueError("Invalid webhook signature")

        if event["type"] == "checkout.session.completed":
            return self._handle_checkout_completed(event["data"]["object"], db)
        elif event["type"] == "payment_intent.succeeded":
            return self._handle_payment_succeeded(event["data"]["object"], db)
        elif event["type"] == "payment_intent.payment_failed":
            return self._handle_payment_failed(event["data"]["object"], db)

        return {"status": "ignored", "type": event["type"]}

    def _handle_checkout_completed(self, session: dict, db: Session) -> dict:
        metadata = session.get("metadata", {})
        payment_id = metadata.get("payment_id")

        if payment_id:
            payment = db.query(Payment).filter(
                Payment.id == payment_id
            ).first()
            if payment:
                payment.status = PaymentStatus.succeeded
                payment.paid_at = datetime.utcnow()
                payment.stripe_payment_intent_id = session.get("payment_intent")
                payment.invoice_url = session.get("invoice")
                db.commit()

        return {"status": "processed", "type": "checkout.session.completed"}

    def _handle_payment_succeeded(self, intent: dict, db: Session) -> dict:
        payment = db.query(Payment).filter(
            Payment.stripe_payment_intent_id == intent["id"]
        ).first()
        if payment:
            payment.status = PaymentStatus.succeeded
            payment.paid_at = datetime.utcnow()
            db.commit()
        return {"status": "processed", "type": "payment_intent.succeeded"}

    def _handle_payment_failed(self, intent: dict, db: Session) -> dict:
        payment = db.query(Payment).filter(
            Payment.stripe_payment_intent_id == intent["id"]
        ).first()
        if payment:
            payment.status = PaymentStatus.failed
            db.commit()
        return {"status": "processed", "type": "payment_intent.payment_failed"}


stripe_service = StripeService()
