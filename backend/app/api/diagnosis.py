from __future__ import annotations
"""診断 エンドポイント"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models import get_db, Diagnosis, Engineer, Payment, PaymentStatus
from ..schemas.schemas import DiagnosisRequest, DiagnosisResponse
from ..services.diagnosis_service import diagnosis_service

router = APIRouter(prefix="/diagnosis", tags=["diagnosis"])


@router.post("/", response_model=DiagnosisResponse, status_code=201)
def create_diagnosis(payload: DiagnosisRequest, db: Session = Depends(get_db)):
    engineer = db.query(Engineer).filter(Engineer.id == str(payload.engineer_id)).first()
    if not engineer:
        raise HTTPException(status_code=404, detail="Engineer not found")

    diag = diagnosis_service.create_diagnosis(
        engineer_id=str(payload.engineer_id),
        questionnaire=payload.questionnaire,
        db=db,
    )
    return diag


@router.get("/{diagnosis_id}/free")
def get_free_report(diagnosis_id: UUID, db: Session = Depends(get_db)):
    """無料版レポート（サマリーのみ）"""
    diag = db.query(Diagnosis).filter(Diagnosis.id == str(diagnosis_id)).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    return diagnosis_service.get_free_report(diag)


@router.get("/{diagnosis_id}/paid")
def get_paid_report(diagnosis_id: UUID, db: Session = Depends(get_db)):
    """有料版レポート（決済確認後にアクセス可能）"""
    diag = db.query(Diagnosis).filter(Diagnosis.id == str(diagnosis_id)).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Diagnosis not found")

    # 決済確認：engineer_idに紐づくdiagnosis_report型のsucceeded決済があるか
    paid = db.query(Payment).filter(
        Payment.payment_type == "diagnosis_report",
        Payment.status == PaymentStatus.succeeded,
    ).first()
    if not paid:
        raise HTTPException(
            status_code=402,
            detail="有料レポートの購入が必要です。/payments/checkout/diagnosis で決済してください。",
        )
    return diagnosis_service.get_paid_report(diag)


@router.get("/engineer/{engineer_id}")
def list_diagnoses(engineer_id: UUID, db: Session = Depends(get_db)):
    """エンジニアの診断履歴"""
    results = (
        db.query(Diagnosis)
        .filter(Diagnosis.engineer_id == str(engineer_id))
        .order_by(Diagnosis.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(d.id),
            "score": d.market_value_score,
            "status": d.status.value if d.status else "unknown",
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in results
    ]
