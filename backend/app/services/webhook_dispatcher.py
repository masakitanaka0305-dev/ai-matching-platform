from __future__ import annotations
"""
Make.com / 外部Webhook ディスパッチャー

各イベント発生時に外部Webhookへ通知を送信する。
Make.comシナリオのトリガーとして機能。
"""
import os
import httpx
from typing import Optional

MAKE_WEBHOOKS = {
    "new_engineer": os.getenv("MAKE_WEBHOOK_NEW_ENGINEER", ""),
    "new_company": os.getenv("MAKE_WEBHOOK_NEW_COMPANY", ""),
    "match_created": os.getenv("MAKE_WEBHOOK_MATCH_CREATED", ""),
    "match_status_changed": os.getenv("MAKE_WEBHOOK_MATCH_STATUS", ""),
    "payment_completed": os.getenv("MAKE_WEBHOOK_PAYMENT", ""),
}


class WebhookDispatcher:

    async def dispatch(self, event_type: str, payload: dict) -> Optional[dict]:
        """イベントを外部Webhookに送信"""
        url = MAKE_WEBHOOKS.get(event_type, "")
        if not url:
            return None

        data = {"event": event_type, **payload}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=data)
                return {"status": resp.status_code, "event": event_type}
        except Exception:
            return {"status": "error", "event": event_type}

    async def notify_new_engineer(self, engineer_id: str, name: str, email: str,
                                   experience_level: str, ai_specialties: list):
        await self.dispatch("new_engineer", {
            "engineer_id": engineer_id,
            "name": name,
            "email": email,
            "experience_level": experience_level,
            "ai_specialties": ai_specialties,
        })

    async def notify_new_company(self, company_id: str, name: str,
                                  contact_name: str, contact_email: str, industry: str):
        await self.dispatch("new_company", {
            "company_id": company_id,
            "name": name,
            "contact_name": contact_name,
            "contact_email": contact_email,
            "industry": industry,
        })

    async def notify_match_created(self, match_id: str, engineer_name: str,
                                    company_name: str, posting_title: str, ai_score: float):
        await self.dispatch("match_created", {
            "match_id": match_id,
            "engineer_name": engineer_name,
            "company_name": company_name,
            "posting_title": posting_title,
            "ai_score": ai_score,
        })

    async def notify_payment(self, company_name: str, amount: int, payment_type: str):
        await self.dispatch("payment_completed", {
            "company_name": company_name,
            "amount": amount,
            "payment_type": payment_type,
        })


webhook_dispatcher = WebhookDispatcher()
