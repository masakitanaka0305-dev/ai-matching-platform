"""
AI人材マッチングプラットフォーム - DBモデル定義
SQLite / PostgreSQL 両対応
"""
import uuid
import json
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    Column, String, Text, Integer, Boolean, DateTime,
    ForeignKey, Numeric, Enum, Table, Index, CheckConstraint,
    TypeDecorator,
)
from sqlalchemy.orm import relationship

from .database import Base


# ---------------------------------------------------------------------------
# カスタム型（SQLite互換）
# ---------------------------------------------------------------------------
class JSONType(TypeDecorator):
    """JSON型 - PostgreSQLではJSONB、SQLiteではTEXTにシリアライズ"""
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value, ensure_ascii=False)
        return None

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return None


class ArrayType(TypeDecorator):
    """配列型 - PostgreSQLではARRAY、SQLiteではJSON配列としてTEXTに保存"""
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value, ensure_ascii=False)
        return "[]"

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return []


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------
class MatchStatus(str, PyEnum):
    proposed = "proposed"
    company_reviewed = "company_reviewed"
    approach_unlocked = "approach_unlocked"
    engineer_interested = "engineer_interested"
    interview_scheduled = "interview_scheduled"
    accepted = "accepted"
    rejected = "rejected"
    withdrawn = "withdrawn"


class DiagnosisStatus(str, PyEnum):
    pending = "pending"
    completed = "completed"
    report_sent = "report_sent"


class PaymentStatus(str, PyEnum):
    pending = "pending"
    succeeded = "succeeded"
    failed = "failed"
    refunded = "refunded"


class ExperienceLevel(str, PyEnum):
    junior = "junior"
    mid = "mid"
    senior = "senior"
    lead = "lead"
    executive = "executive"


# ---------------------------------------------------------------------------
# 中間テーブル
# ---------------------------------------------------------------------------
engineer_skills = Table(
    "engineer_skills",
    Base.metadata,
    Column("engineer_id", String(36), ForeignKey("engineers.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", String(36), ForeignKey("skill_tags.id", ondelete="CASCADE"), primary_key=True),
    Column("years", Integer, nullable=True),
    Column("proficiency", Integer, default=3),
)

posting_skills = Table(
    "posting_skills",
    Base.metadata,
    Column("posting_id", String(36), ForeignKey("job_postings.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", String(36), ForeignKey("skill_tags.id", ondelete="CASCADE"), primary_key=True),
    Column("required", Boolean, default=True),
)


def _uuid():
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# スキルタグマスタ
# ---------------------------------------------------------------------------
class SkillTag(Base):
    __tablename__ = "skill_tags"

    id = Column(String(36), primary_key=True, default=_uuid)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(50), nullable=False)
    aliases = Column(ArrayType, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# エンジニア
# ---------------------------------------------------------------------------
class Engineer(Base):
    __tablename__ = "engineers"

    id = Column(String(36), primary_key=True, default=_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    github_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    x_handle = Column(String(100), nullable=True)

    experience_level = Column(Enum(ExperienceLevel), nullable=False)
    years_of_experience = Column(Integer, nullable=False)
    current_company = Column(String(200), nullable=True)
    current_role = Column(String(200), nullable=True)
    bio = Column(Text, nullable=True)
    resume_url = Column(String(500), nullable=True)

    ai_specialties = Column(ArrayType, default=[])
    preferred_frameworks = Column(ArrayType, default=[])
    notable_projects = Column(JSONType, default=[])

    desired_salary_min = Column(Integer, nullable=True)
    desired_salary_max = Column(Integer, nullable=True)
    desired_work_style = Column(String(50), default="hybrid")
    desired_location = Column(String(100), nullable=True)
    open_to_offers = Column(Boolean, default=True)

    source = Column(String(50), default="organic")
    discord_user_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    skills = relationship("SkillTag", secondary=engineer_skills, backref="engineers")
    matches = relationship("Match", back_populates="engineer")
    diagnoses = relationship("Diagnosis", back_populates="engineer")


# ---------------------------------------------------------------------------
# 企業
# ---------------------------------------------------------------------------
class Company(Base):
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=_uuid)
    name = Column(String(200), nullable=False)
    website = Column(String(500), nullable=True)
    industry = Column(String(100), nullable=True)
    employee_count = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)

    contact_name = Column(String(100), nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(20), nullable=True)

    stripe_customer_id = Column(String(100), nullable=True)
    billing_plan = Column(String(50), default="pay_per_match")

    discord_channel_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    postings = relationship("JobPosting", back_populates="company")
    payments = relationship("Payment", back_populates="company")


# ---------------------------------------------------------------------------
# 求人案件
# ---------------------------------------------------------------------------
class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(String(36), primary_key=True, default=_uuid)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)

    experience_level_min = Column(Enum(ExperienceLevel), default=ExperienceLevel.mid)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    work_style = Column(String(50), default="hybrid")
    location = Column(String(100), nullable=True)

    ai_domain = Column(ArrayType, default=[])
    tech_stack = Column(ArrayType, default=[])
    team_size = Column(Integer, nullable=True)
    project_description = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="postings")
    required_skills = relationship("SkillTag", secondary=posting_skills, backref="postings")
    matches = relationship("Match", back_populates="posting")


# ---------------------------------------------------------------------------
# マッチング
# ---------------------------------------------------------------------------
class Match(Base):
    __tablename__ = "matches"

    id = Column(String(36), primary_key=True, default=_uuid)
    engineer_id = Column(String(36), ForeignKey("engineers.id", ondelete="CASCADE"), nullable=False)
    posting_id = Column(String(36), ForeignKey("job_postings.id", ondelete="CASCADE"), nullable=False)

    ai_score = Column(Numeric(5, 2), nullable=False)
    skill_match_rate = Column(Numeric(5, 2), nullable=True)
    culture_fit_score = Column(Numeric(5, 2), nullable=True)
    scoring_details = Column(JSONType, default={})

    status = Column(Enum(MatchStatus), default=MatchStatus.proposed, nullable=False)
    proposed_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    pitch_to_engineer = Column(Text, nullable=True)
    pitch_to_company = Column(Text, nullable=True)

    is_unlocked = Column(Boolean, default=False, nullable=False)
    unlocked_at = Column(DateTime, nullable=True)
    assessment_report = Column(JSONType, nullable=True)

    rejection_reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    engineer = relationship("Engineer", back_populates="matches")
    posting = relationship("JobPosting", back_populates="matches")
    events = relationship("MatchEvent", back_populates="match", order_by="MatchEvent.created_at")


# ---------------------------------------------------------------------------
# マッチングイベントログ
# ---------------------------------------------------------------------------
class MatchEvent(Base):
    __tablename__ = "match_events"

    id = Column(String(36), primary_key=True, default=_uuid)
    match_id = Column(String(36), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)
    old_value = Column(String(100), nullable=True)
    new_value = Column(String(100), nullable=True)
    actor = Column(String(100), default="system")
    detail = Column(JSONType, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    match = relationship("Match", back_populates="events")


# ---------------------------------------------------------------------------
# 無料診断
# ---------------------------------------------------------------------------
class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(String(36), primary_key=True, default=_uuid)
    engineer_id = Column(String(36), ForeignKey("engineers.id", ondelete="CASCADE"), nullable=False)

    questionnaire = Column(JSONType, nullable=False)
    github_analysis = Column(JSONType, nullable=True)

    market_value_score = Column(Integer, nullable=True)
    report = Column(JSONType, nullable=True)
    status = Column(Enum(DiagnosisStatus), default=DiagnosisStatus.pending)

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    engineer = relationship("Engineer", back_populates="diagnoses")


# ---------------------------------------------------------------------------
# 決済記録
# ---------------------------------------------------------------------------
class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=_uuid)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    match_id = Column(String(36), ForeignKey("matches.id"), nullable=True)

    stripe_payment_intent_id = Column(String(200), nullable=True)
    amount = Column(Integer, nullable=False)
    currency = Column(String(3), default="jpy")
    description = Column(String(500), nullable=True)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)

    payment_type = Column(String(50), nullable=False)
    invoice_url = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)

    company = relationship("Company", back_populates="payments")


# ---------------------------------------------------------------------------
# プラットフォーム内アプローチメッセージ
# ---------------------------------------------------------------------------
class ApproachMessage(Base):
    __tablename__ = "approach_messages"

    id = Column(String(36), primary_key=True, default=_uuid)
    match_id = Column(String(36), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    sender_type = Column(String(20), nullable=False)  # "company" or "engineer"
    sender_id = Column(String(36), nullable=False)
    subject = Column(String(300), nullable=True)
    body = Column(Text, nullable=False)
    ai_optimized = Column(Boolean, default=False)
    ai_suggestions = Column(JSONType, nullable=True)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    match = relationship("Match")


# ---------------------------------------------------------------------------
# エンゲージメントインサイト（AI生成）
# ---------------------------------------------------------------------------
class EngagementInsight(Base):
    __tablename__ = "engagement_insights"

    id = Column(String(36), primary_key=True, default=_uuid)
    match_id = Column(String(36), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    insight_type = Column(String(50), nullable=False)  # contact_preference, tech_interest, response_tip
    content = Column(Text, nullable=False)
    confidence = Column(Numeric(3, 2), default=0.8)
    created_at = Column(DateTime, default=datetime.utcnow)

    match = relationship("Match")
