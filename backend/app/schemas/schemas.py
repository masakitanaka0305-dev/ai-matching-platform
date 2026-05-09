from __future__ import annotations
"""Pydantic スキーマ（API リクエスト/レスポンス）"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


# ---------------------------------------------------------------------------
# Engineer
# ---------------------------------------------------------------------------
class EngineerCreate(BaseModel):
    name: str
    email: EmailStr
    experience_level: str  # junior / mid / senior / lead / executive
    years_of_experience: int
    ai_specialties: list[str] = []
    preferred_frameworks: list[str] = []
    desired_salary_min: Optional[int] = None
    desired_salary_max: Optional[int] = None
    desired_work_style: str = "hybrid"
    bio: Optional[str] = None
    github_url: Optional[str] = None
    x_handle: Optional[str] = None


class EngineerResponse(BaseModel):
    id: UUID
    name: str
    email: str
    experience_level: str
    years_of_experience: int
    ai_specialties: list[str]
    open_to_offers: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Company
# ---------------------------------------------------------------------------
class CompanyCreate(BaseModel):
    name: str
    contact_name: str
    contact_email: EmailStr
    website: Optional[str] = None
    industry: Optional[str] = None
    employee_count: Optional[int] = None
    description: Optional[str] = None


class CompanyResponse(BaseModel):
    id: UUID
    name: str
    contact_name: str
    contact_email: str
    industry: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# JobPosting
# ---------------------------------------------------------------------------
class JobPostingCreate(BaseModel):
    company_id: UUID
    title: str
    description: str
    experience_level_min: str = "mid"
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    work_style: str = "hybrid"
    location: Optional[str] = None
    ai_domain: list[str] = []
    tech_stack: list[str] = []


class JobPostingResponse(BaseModel):
    id: UUID
    company_id: UUID
    title: str
    ai_domain: list[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Match
# ---------------------------------------------------------------------------
class MatchResponse(BaseModel):
    id: UUID
    engineer_id: UUID
    posting_id: UUID
    ai_score: float
    status: str
    pitch_to_engineer: Optional[str]
    pitch_to_company: Optional[str]
    proposed_at: datetime

    model_config = {"from_attributes": True}


class MatchStatusUpdate(BaseModel):
    status: str  # MatchStatus の値
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None


# ---------------------------------------------------------------------------
# Company Match (マスキング / 解放済み)
# ---------------------------------------------------------------------------
class MaskedCandidateInfo(BaseModel):
    initials: str
    experience_level: str
    years_of_experience: int
    ai_specialties: list[str]
    skill_tags: list[str]
    work_style: str

class UnlockedCandidateInfo(MaskedCandidateInfo):
    name: str
    email: str
    phone: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    desired_salary_min: Optional[int] = None
    desired_salary_max: Optional[int] = None
    bio: Optional[str] = None
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    pitch_to_company: Optional[str] = None

class CompanyMatchResponse(BaseModel):
    id: str
    posting_id: str
    posting_title: str
    ai_score: float
    skill_match_rate: Optional[float] = None
    culture_fit_score: Optional[float] = None
    status: str
    is_unlocked: bool
    proposed_at: str
    candidate: MaskedCandidateInfo | UnlockedCandidateInfo
    assessment_report: Optional[dict] = None


# ---------------------------------------------------------------------------
# Scout Approach Checkout
# ---------------------------------------------------------------------------
class ScoutApproachCheckoutRequest(BaseModel):
    company_id: UUID
    match_id: UUID


class ScoutApproachCheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str
    payment_id: str


# ---------------------------------------------------------------------------
# Diagnosis
# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# Scout / Inbox / Interview
# ---------------------------------------------------------------------------
class ScoutSendRequest(BaseModel):
    company_id: UUID
    match_id: UUID
    subject: str
    body: str

class ScoutSendResponse(BaseModel):
    message_id: str
    status: str
    email_sent: bool

class InboxMessageResponse(BaseModel):
    id: str
    match_id: str
    sender_type: str
    sender_name: str
    subject: Optional[str] = None
    body: str
    read_at: Optional[str] = None
    created_at: str
    company_name: Optional[str] = None
    posting_title: Optional[str] = None
    ai_score: Optional[float] = None

class InboxReplyRequest(BaseModel):
    body: str
    engineer_id: UUID

class InterviewProposeRequest(BaseModel):
    match_id: UUID
    proposed_by: str  # "company" or "engineer"
    proposed_times: list[dict]
    location: Optional[str] = None
    meeting_url: Optional[str] = None
    notes: Optional[str] = None

class InterviewSelectRequest(BaseModel):
    selected_time: str
    meeting_url: Optional[str] = None

class InterviewResponse(BaseModel):
    id: str
    match_id: str
    proposed_by: str
    proposed_times: list[dict]
    selected_time: Optional[str] = None
    status: str
    location: Optional[str] = None
    meeting_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: str


class DiagnosisRequest(BaseModel):
    engineer_id: UUID
    questionnaire: dict  # フロントから送られる回答JSON


class DiagnosisResponse(BaseModel):
    id: UUID
    engineer_id: UUID
    market_value_score: Optional[int]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
