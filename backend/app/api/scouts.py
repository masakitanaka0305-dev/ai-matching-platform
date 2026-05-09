from __future__ import annotations
"""スカウト・インボックス・面談日程調整 エンドポイント"""
from uuid import UUID
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models import (
    get_db, Match, MatchEvent, MatchStatus,
    Engineer, JobPosting, Company, ApproachMessage, InterviewSchedule,
)
from ..schemas.schemas import (
    ScoutSendRequest, ScoutSendResponse,
    InboxMessageResponse, InboxReplyRequest,
    InterviewProposeRequest, InterviewSelectRequest, InterviewResponse,
)
from ..services.discord_notifier import notifier
from ..services.email_service import email_service
from ..services.engagement_service import engagement_service

router = APIRouter(prefix="/scouts", tags=["scouts"])


# ------------------------------------------------------------------
# スカウト送信（企業 → エンジニア）
# ------------------------------------------------------------------
@router.post("/send", response_model=ScoutSendResponse)
async def send_scout(
    payload: ScoutSendRequest,
    db: Session = Depends(get_db),
):
    """
    企業がスカウトを送信する。
    前提: match.is_unlocked == True（アプローチ権解放済み）
    """
    match = db.query(Match).filter(Match.id == str(payload.match_id)).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if not match.is_unlocked:
        raise HTTPException(status_code=403, detail="アプローチ権が未解放です。先に決済を完了してください。")

    engineer: Engineer = match.engineer
    posting: JobPosting = match.posting
    company: Company = posting.company

    # メッセージ保存（AI最適化付き）
    result = engagement_service.optimize_approach_message(
        match=match,
        subject=payload.subject,
        body=payload.body,
        db=db,
    )

    # ステータス更新
    old_status = match.status.value
    match.status = MatchStatus.scout_sent
    event = MatchEvent(
        match_id=match.id,
        event_type="scout_sent",
        old_value=old_status,
        new_value="scout_sent",
        actor="company",
    )
    db.add(event)
    db.commit()

    # メール通知（エンジニアへ）
    email_sent = email_service.send_scout_notification(
        engineer_email=engineer.email,
        engineer_name=engineer.name,
        company_name=company.name,
        posting_title=posting.title,
        message_preview=payload.body,
        match_id=str(match.id),
    )

    # Discord通知
    try:
        await notifier.notify_scout_sent(
            company_name=company.name,
            engineer_name=engineer.name,
            posting_title=posting.title,
            match_id=str(match.id),
        )
    except Exception:
        pass

    return ScoutSendResponse(
        message_id=result["message_id"],
        status="sent",
        email_sent=email_sent,
    )


# ------------------------------------------------------------------
# エンジニア向けインボックス
# ------------------------------------------------------------------
@router.get("/inbox/{engineer_id}", response_model=List[InboxMessageResponse])
def get_inbox(
    engineer_id: UUID,
    db: Session = Depends(get_db),
):
    """エンジニアが受信したスカウト・メッセージ一覧"""
    engineer = db.query(Engineer).filter(Engineer.id == str(engineer_id)).first()
    if not engineer:
        raise HTTPException(status_code=404, detail="Engineer not found")

    # エンジニアのマッチIDを取得
    match_ids = [m.id for m in db.query(Match).filter(Match.engineer_id == str(engineer_id)).all()]
    if not match_ids:
        return []

    messages = (
        db.query(ApproachMessage)
        .filter(ApproachMessage.match_id.in_(match_ids))
        .order_by(ApproachMessage.created_at.desc())
        .all()
    )

    results = []
    for msg in messages:
        match = db.query(Match).filter(Match.id == msg.match_id).first()
        posting = db.query(JobPosting).filter(JobPosting.id == match.posting_id).first() if match else None
        company = db.query(Company).filter(Company.id == posting.company_id).first() if posting else None

        if msg.sender_type == "company":
            sender_name = company.name if company else "企業"
        else:
            sender_name = engineer.name

        results.append(InboxMessageResponse(
            id=str(msg.id),
            match_id=str(msg.match_id),
            sender_type=msg.sender_type,
            sender_name=sender_name,
            subject=msg.subject,
            body=msg.body,
            read_at=msg.read_at.isoformat() if msg.read_at else None,
            created_at=msg.created_at.isoformat(),
            company_name=company.name if company else None,
            posting_title=posting.title if posting else None,
            ai_score=float(match.ai_score) if match else None,
        ))

    return results


# ------------------------------------------------------------------
# メッセージスレッド取得（マッチ単位）
# ------------------------------------------------------------------
@router.get("/thread/{match_id}", response_model=List[InboxMessageResponse])
def get_thread(
    match_id: UUID,
    db: Session = Depends(get_db),
):
    """特定マッチのメッセージスレッドを取得"""
    match = db.query(Match).filter(Match.id == str(match_id)).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    messages = (
        db.query(ApproachMessage)
        .filter(ApproachMessage.match_id == str(match_id))
        .order_by(ApproachMessage.created_at.asc())
        .all()
    )

    engineer = db.query(Engineer).filter(Engineer.id == match.engineer_id).first()
    posting = db.query(JobPosting).filter(JobPosting.id == match.posting_id).first()
    company = db.query(Company).filter(Company.id == posting.company_id).first() if posting else None

    results = []
    for msg in messages:
        sender_name = (company.name if company else "企業") if msg.sender_type == "company" else (engineer.name if engineer else "エンジニア")
        results.append(InboxMessageResponse(
            id=str(msg.id),
            match_id=str(msg.match_id),
            sender_type=msg.sender_type,
            sender_name=sender_name,
            subject=msg.subject,
            body=msg.body,
            read_at=msg.read_at.isoformat() if msg.read_at else None,
            created_at=msg.created_at.isoformat(),
            company_name=company.name if company else None,
            posting_title=posting.title if posting else None,
            ai_score=float(match.ai_score) if match else None,
        ))

    return results


# ------------------------------------------------------------------
# メッセージ既読マーク
# ------------------------------------------------------------------
@router.patch("/messages/{message_id}/read")
def mark_as_read(
    message_id: UUID,
    db: Session = Depends(get_db),
):
    """メッセージを既読にする"""
    msg = db.query(ApproachMessage).filter(ApproachMessage.id == str(message_id)).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if not msg.read_at:
        msg.read_at = datetime.utcnow()
        db.commit()
    return {"status": "read"}


# ------------------------------------------------------------------
# エンジニアからの返信
# ------------------------------------------------------------------
@router.post("/thread/{match_id}/reply")
async def reply_to_thread(
    match_id: UUID,
    payload: InboxReplyRequest,
    db: Session = Depends(get_db),
):
    """エンジニアがスレッドに返信する"""
    match = db.query(Match).filter(Match.id == str(match_id)).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    engineer = db.query(Engineer).filter(Engineer.id == str(payload.engineer_id)).first()
    if not engineer:
        raise HTTPException(status_code=404, detail="Engineer not found")

    # メッセージ保存
    msg = ApproachMessage(
        match_id=str(match_id),
        sender_type="engineer",
        sender_id=str(payload.engineer_id),
        body=payload.body,
        ai_optimized=False,
    )
    db.add(msg)

    # ステータス更新（まだengineer_interestedでなければ更新）
    if match.status in (MatchStatus.scout_sent, MatchStatus.approach_unlocked):
        old_status = match.status.value
        match.status = MatchStatus.engineer_interested
        event = MatchEvent(
            match_id=match.id,
            event_type="status_change",
            old_value=old_status,
            new_value="engineer_interested",
            actor="engineer",
        )
        db.add(event)

    db.commit()
    db.refresh(msg)

    # Discord通知
    posting = db.query(JobPosting).filter(JobPosting.id == match.posting_id).first()
    company = db.query(Company).filter(Company.id == posting.company_id).first() if posting else None
    try:
        await notifier.notify_message_received(
            sender_type="engineer",
            sender_name=engineer.name,
            recipient_name=company.name if company else "企業",
            match_id=str(match.id),
        )
    except Exception:
        pass

    return {
        "message_id": str(msg.id),
        "status": "sent",
    }


# ------------------------------------------------------------------
# 面談日程提案
# ------------------------------------------------------------------
@router.post("/interviews", response_model=InterviewResponse)
async def propose_interview(
    payload: InterviewProposeRequest,
    db: Session = Depends(get_db),
):
    """面談の候補日程を提案"""
    match = db.query(Match).filter(Match.id == str(payload.match_id)).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    interview = InterviewSchedule(
        match_id=str(payload.match_id),
        proposed_by=payload.proposed_by,
        proposed_times=payload.proposed_times,
        status="proposed",
        location=payload.location,
        meeting_url=payload.meeting_url,
        notes=payload.notes,
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    # メール通知
    engineer = db.query(Engineer).filter(Engineer.id == match.engineer_id).first()
    posting = db.query(JobPosting).filter(JobPosting.id == match.posting_id).first()
    company = db.query(Company).filter(Company.id == posting.company_id).first() if posting else None

    if payload.proposed_by == "company" and engineer:
        email_service.send_interview_notification(
            to_email=engineer.email,
            to_name=engineer.name,
            from_name=company.name if company else "企業",
            match_id=str(match.id),
            proposed_times=payload.proposed_times,
        )

    # Discord通知
    try:
        proposer_name = (company.name if company else "企業") if payload.proposed_by == "company" else (engineer.name if engineer else "エンジニア")
        other_name = (engineer.name if engineer else "エンジニア") if payload.proposed_by == "company" else (company.name if company else "企業")
        await notifier.notify_interview_proposed(
            proposer_name=proposer_name,
            other_name=other_name,
            times_count=len(payload.proposed_times),
            match_id=str(match.id),
        )
    except Exception:
        pass

    return InterviewResponse(
        id=str(interview.id),
        match_id=str(interview.match_id),
        proposed_by=interview.proposed_by,
        proposed_times=interview.proposed_times,
        selected_time=None,
        status=interview.status,
        location=interview.location,
        meeting_url=interview.meeting_url,
        notes=interview.notes,
        created_at=interview.created_at.isoformat(),
    )


# ------------------------------------------------------------------
# 面談日程選択（確定）
# ------------------------------------------------------------------
@router.patch("/interviews/{interview_id}/select", response_model=InterviewResponse)
async def select_interview_time(
    interview_id: UUID,
    payload: InterviewSelectRequest,
    db: Session = Depends(get_db),
):
    """面談の日程を確定する"""
    interview = db.query(InterviewSchedule).filter(InterviewSchedule.id == str(interview_id)).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    interview.selected_time = datetime.fromisoformat(payload.selected_time)
    interview.status = "confirmed"
    if payload.meeting_url:
        interview.meeting_url = payload.meeting_url
    db.commit()
    db.refresh(interview)

    # マッチステータスをinterview_scheduledに更新
    match = db.query(Match).filter(Match.id == interview.match_id).first()
    if match and match.status != MatchStatus.interview_scheduled:
        old_status = match.status.value
        match.status = MatchStatus.interview_scheduled
        event = MatchEvent(
            match_id=match.id,
            event_type="status_change",
            old_value=old_status,
            new_value="interview_scheduled",
            actor="system",
        )
        db.add(event)
        db.commit()

    # メール通知（両者に）
    engineer = db.query(Engineer).filter(Engineer.id == match.engineer_id).first()
    posting = db.query(JobPosting).filter(JobPosting.id == match.posting_id).first()
    company = db.query(Company).filter(Company.id == posting.company_id).first() if posting else None

    selected_str = payload.selected_time
    if engineer:
        email_service.send_interview_confirmed(
            to_email=engineer.email,
            to_name=engineer.name,
            other_name=company.name if company else "企業",
            selected_time=selected_str,
            meeting_url=interview.meeting_url,
        )
    if company:
        email_service.send_interview_confirmed(
            to_email=company.contact_email,
            to_name=company.contact_name,
            other_name=engineer.name if engineer else "エンジニア",
            selected_time=selected_str,
            meeting_url=interview.meeting_url,
        )

    # Discord通知
    try:
        await notifier.notify_interview_confirmed(
            engineer_name=engineer.name if engineer else "?",
            company_name=company.name if company else "?",
            selected_time=selected_str,
            match_id=str(match.id),
        )
    except Exception:
        pass

    return InterviewResponse(
        id=str(interview.id),
        match_id=str(interview.match_id),
        proposed_by=interview.proposed_by,
        proposed_times=interview.proposed_times,
        selected_time=interview.selected_time.isoformat() if interview.selected_time else None,
        status=interview.status,
        location=interview.location,
        meeting_url=interview.meeting_url,
        notes=interview.notes,
        created_at=interview.created_at.isoformat(),
    )


# ------------------------------------------------------------------
# マッチに紐づく面談一覧
# ------------------------------------------------------------------
@router.get("/interviews/match/{match_id}", response_model=List[InterviewResponse])
def get_interviews_for_match(
    match_id: UUID,
    db: Session = Depends(get_db),
):
    """特定マッチの面談スケジュール一覧"""
    interviews = (
        db.query(InterviewSchedule)
        .filter(InterviewSchedule.match_id == str(match_id))
        .order_by(InterviewSchedule.created_at.desc())
        .all()
    )
    return [
        InterviewResponse(
            id=str(i.id),
            match_id=str(i.match_id),
            proposed_by=i.proposed_by,
            proposed_times=i.proposed_times,
            selected_time=i.selected_time.isoformat() if i.selected_time else None,
            status=i.status,
            location=i.location,
            meeting_url=i.meeting_url,
            notes=i.notes,
            created_at=i.created_at.isoformat(),
        )
        for i in interviews
    ]
