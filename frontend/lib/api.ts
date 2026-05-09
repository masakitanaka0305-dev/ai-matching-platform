/**
 * APIクライアント - FastAPIバックエンドとの通信
 */
const API_BASE = "/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "API error");
  }
  return res.json();
}

// ------------------------------------------------------------------
// Engineers
// ------------------------------------------------------------------
export interface Engineer {
  id: string;
  name: string;
  email: string;
  experience_level: string;
  years_of_experience: number;
  ai_specialties: string[];
  open_to_offers: boolean;
  created_at: string;
}

export interface EngineerCreate {
  name: string;
  email: string;
  experience_level: string;
  years_of_experience: number;
  ai_specialties: string[];
  preferred_frameworks: string[];
  desired_salary_min?: number;
  desired_salary_max?: number;
  desired_work_style: string;
  bio?: string;
  github_url?: string;
  x_handle?: string;
}

export const engineerApi = {
  list: (params?: { open_only?: boolean }) =>
    request<Engineer[]>(`/engineers?open_only=${params?.open_only ?? true}`),
  get: (id: string) => request<Engineer>(`/engineers/${id}`),
  create: (data: EngineerCreate) =>
    request<Engineer>("/engineers", { method: "POST", body: JSON.stringify(data) }),
};

// ------------------------------------------------------------------
// Companies
// ------------------------------------------------------------------
export interface Company {
  id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  industry: string | null;
  created_at: string;
}

export interface CompanyCreate {
  name: string;
  contact_name: string;
  contact_email: string;
  website?: string;
  industry?: string;
  employee_count?: number;
  description?: string;
}

export const companyApi = {
  list: () => request<Company[]>("/companies"),
  get: (id: string) => request<Company>(`/companies/${id}`),
  create: (data: CompanyCreate) =>
    request<Company>("/companies", { method: "POST", body: JSON.stringify(data) }),
};

// ------------------------------------------------------------------
// Job Postings
// ------------------------------------------------------------------
export interface JobPosting {
  id: string;
  company_id: string;
  title: string;
  ai_domain: string[];
  is_active: boolean;
  created_at: string;
}

export interface JobPostingCreate {
  company_id: string;
  title: string;
  description: string;
  experience_level_min?: string;
  salary_min?: number;
  salary_max?: number;
  work_style?: string;
  location?: string;
  ai_domain?: string[];
  tech_stack?: string[];
}

export const postingApi = {
  list: (params?: { active_only?: boolean; company_id?: string }) => {
    const sp = new URLSearchParams();
    if (params?.active_only !== undefined) sp.set("active_only", String(params.active_only));
    if (params?.company_id) sp.set("company_id", params.company_id);
    return request<JobPosting[]>(`/postings?${sp.toString()}`);
  },
  get: (id: string) => request<JobPosting>(`/postings/${id}`),
  create: (data: JobPostingCreate) =>
    request<JobPosting>("/postings", { method: "POST", body: JSON.stringify(data) }),
  deactivate: (id: string) =>
    request<{ status: string }>(`/postings/${id}/deactivate`, { method: "PATCH" }),
};

// ------------------------------------------------------------------
// Matches
// ------------------------------------------------------------------
export interface Match {
  id: string;
  engineer_id: string;
  posting_id: string;
  ai_score: number;
  status: string;
  pitch_to_engineer: string | null;
  pitch_to_company: string | null;
  proposed_at: string;
}

export const matchApi = {
  list: (status?: string) =>
    request<Match[]>(`/matches?status=${status || ""}`),
  get: (id: string) => request<Match>(`/matches/${id}`),
  updateStatus: (id: string, status: string, reason?: string) =>
    request<Match>(`/matches/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, rejection_reason: reason }),
    }),
};

// ------------------------------------------------------------------
// Company Matches (マスキング対応)
// ------------------------------------------------------------------
export interface MaskedCandidate {
  initials: string;
  experience_level: string;
  years_of_experience: number;
  ai_specialties: string[];
  skill_tags: string[];
  work_style: string;
}

export interface UnlockedCandidate extends MaskedCandidate {
  name: string;
  email: string;
  phone?: string;
  github_url?: string;
  linkedin_url?: string;
  desired_salary_min?: number;
  desired_salary_max?: number;
  bio?: string;
  current_company?: string;
  current_role?: string;
  pitch_to_company?: string;
}

export interface CompanyMatch {
  id: string;
  posting_id: string;
  posting_title: string;
  ai_score: number;
  skill_match_rate?: number;
  culture_fit_score?: number;
  status: string;
  is_unlocked: boolean;
  proposed_at: string;
  candidate: MaskedCandidate | UnlockedCandidate;
  assessment_report?: Record<string, unknown>;
}

export interface ApprovalData {
  match_id: string;
  company: { name: string; industry: string | null };
  posting: { title: string; salary_min: number | null; salary_max: number | null };
  candidate: { name: string; experience_level: string; years_of_experience: number; ai_specialties: string[]; skills: string[] };
  ai_evaluation: { total_score: number; skill_match_rate: number; level: string };
  cost_comparison: { approach_fee: number; approach_fee_label: string; typical_agent_fee: string; saving_note: string };
  roi_estimate: { salary_estimate: { min: number; max: number; median: number; unit: string }; note: string };
  assessment_report: Record<string, unknown>;
  generated_at: string | null;
}

export const companyMatchApi = {
  list: (companyId: string, status?: string) =>
    request<CompanyMatch[]>(`/matches/company/${companyId}?status=${status || ""}`),
};

// ------------------------------------------------------------------
// Engagement Insights & Approach
// ------------------------------------------------------------------
export interface EngagementInsight {
  insight_type: string;
  content: string;
  confidence: number;
}

export interface FollowupStatus {
  total_messages: number;
  read_count: number;
  last_sent_at: string | null;
  recommend_followup: boolean;
  followup_reason: string;
}

export interface InsightsResponse {
  match_id: string;
  insights: EngagementInsight[];
  followup_status: FollowupStatus;
}

export interface ApproachResult {
  message_id: string;
  suggestions: string[];
  optimization_score: number;
}

export const engagementApi = {
  getInsights: (matchId: string) =>
    request<InsightsResponse>(`/matches/${matchId}/insights`),
  sendApproach: (matchId: string, companyId: string, subject: string, body: string) =>
    request<ApproachResult>(`/matches/${matchId}/approach`, {
      method: "POST",
      body: JSON.stringify({ company_id: companyId, subject, body }),
    }),
  getFollowup: (matchId: string) =>
    request<FollowupStatus>(`/matches/${matchId}/followup`),
};

export const scoutApproachApi = {
  createCheckout: (companyId: string, matchId: string) =>
    request<{ checkout_url: string; session_id: string; payment_id: string }>(
      "/payments/checkout/scout-approach",
      {
        method: "POST",
        body: JSON.stringify({ company_id: companyId, match_id: matchId }),
      }
    ),
  getApprovalData: (matchId: string, companyId: string) =>
    request<ApprovalData>(`/payments/approval/${matchId}?company_id=${companyId}`),
};

// ------------------------------------------------------------------
// Scout / Inbox / Interview
// ------------------------------------------------------------------
export interface InboxMessage {
  id: string;
  match_id: string;
  sender_type: "company" | "engineer";
  sender_name: string;
  subject?: string;
  body: string;
  read_at: string | null;
  created_at: string;
  company_name?: string;
  posting_title?: string;
  ai_score?: number;
}

export interface InterviewSchedule {
  id: string;
  match_id: string;
  proposed_by: string;
  proposed_times: { datetime: string; duration_min?: number }[];
  selected_time: string | null;
  status: string;
  location?: string;
  meeting_url?: string;
  notes?: string;
  created_at: string;
}

export const scoutApi = {
  send: (companyId: string, matchId: string, subject: string, body: string) =>
    request<{ message_id: string; status: string; email_sent: boolean }>(
      "/scouts/send",
      {
        method: "POST",
        body: JSON.stringify({ company_id: companyId, match_id: matchId, subject, body }),
      }
    ),
};

export const inboxApi = {
  list: (engineerId: string) =>
    request<InboxMessage[]>(`/scouts/inbox/${engineerId}`),
  thread: (matchId: string) =>
    request<InboxMessage[]>(`/scouts/thread/${matchId}`),
  markRead: (messageId: string) =>
    request<{ status: string }>(`/scouts/messages/${messageId}/read`, { method: "PATCH" }),
  reply: (matchId: string, engineerId: string, body: string) =>
    request<{ message_id: string; status: string }>(
      `/scouts/thread/${matchId}/reply`,
      {
        method: "POST",
        body: JSON.stringify({ engineer_id: engineerId, body }),
      }
    ),
};

export const interviewApi = {
  propose: (
    matchId: string,
    proposedBy: string,
    proposedTimes: { datetime: string; duration_min?: number }[],
    opts?: { location?: string; meeting_url?: string; notes?: string }
  ) =>
    request<InterviewSchedule>("/scouts/interviews", {
      method: "POST",
      body: JSON.stringify({
        match_id: matchId,
        proposed_by: proposedBy,
        proposed_times: proposedTimes,
        ...opts,
      }),
    }),
  select: (interviewId: string, selectedTime: string, meetingUrl?: string) =>
    request<InterviewSchedule>(`/scouts/interviews/${interviewId}/select`, {
      method: "PATCH",
      body: JSON.stringify({ selected_time: selectedTime, meeting_url: meetingUrl }),
    }),
  listForMatch: (matchId: string) =>
    request<InterviewSchedule[]>(`/scouts/interviews/match/${matchId}`),
};

// ------------------------------------------------------------------
// Matching Engine
// ------------------------------------------------------------------
export const matchingApi = {
  run: (minScore = 50) =>
    request<{ new_matches_count: number; matches: Match[] }>("/matching/run", {
      method: "POST",
      body: JSON.stringify({ min_score: minScore }),
    }),
  preview: (engineerId: string, postingId: string) =>
    request<Record<string, unknown>>("/matching/preview", {
      method: "POST",
      body: JSON.stringify({ engineer_id: engineerId, posting_id: postingId }),
    }),
};

// ------------------------------------------------------------------
// Diagnosis
// ------------------------------------------------------------------
export interface DiagnosisResult {
  id: string;
  engineer_id: string;
  market_value_score: number | null;
  status: string;
  created_at: string;
}

export interface DiagnosisFreeReport {
  score: number;
  level: string;
  summary: string;
  strengths: string[];
}

export interface DiagnosisPaidReport extends DiagnosisFreeReport {
  salary_estimate: { min: number; max: number; median: number };
  market_demand: string;
  recommendations: string[];
  detail_scores: Record<string, number>;
}

export const diagnosisApi = {
  create: (engineerId: string, questionnaire: Record<string, string>) =>
    request<DiagnosisResult>("/diagnosis", {
      method: "POST",
      body: JSON.stringify({ engineer_id: engineerId, questionnaire }),
    }),
  freeReport: (diagnosisId: string) =>
    request<DiagnosisFreeReport>(`/diagnosis/${diagnosisId}/free`),
  paidReport: (diagnosisId: string) =>
    request<DiagnosisPaidReport>(`/diagnosis/${diagnosisId}/paid`),
  listByEngineer: (engineerId: string) =>
    request<{ id: string; score: number; status: string; created_at: string }[]>(
      `/diagnosis/engineer/${engineerId}`
    ),
};

// ------------------------------------------------------------------
// Reports (Executive / Knowledge-Loop)
// ------------------------------------------------------------------
export interface DailyReport {
  report_date: string;
  kpi: Record<string, number>;
  rejection_summary: { total_lost_30d: number; top_concerns: { label: string; count: number }[] };
  options: { label: string; actions?: string[]; estimated_impact: string }[];
  instruction: string;
}

export interface KnowledgeLoopReport {
  total_lost: number;
  patterns: { label: string; count: number; pct: number }[];
  weight_adjustments: Record<string, unknown>[];
  counter_talks: Record<string, string>;
}

export const reportApi = {
  daily: () => request<DailyReport>("/reports/daily"),
  matchDecision: (matchId: string) =>
    request<Record<string, unknown>>(`/reports/match/${matchId}/decision`),
  knowledgeLoop: (days = 90) =>
    request<KnowledgeLoopReport>(`/reports/knowledge-loop?days=${days}`),
};

// ------------------------------------------------------------------
// Payments
// ------------------------------------------------------------------
export const paymentApi = {
  createCheckout: (companyId: string, matchId: string) =>
    request<{ checkout_url: string }>("/payments/checkout/success-fee", {
      method: "POST",
      body: JSON.stringify({ company_id: companyId, match_id: matchId }),
    }),
  createDiagnosisCheckout: (engineerId: string) =>
    request<{ checkout_url: string }>("/payments/checkout/diagnosis", {
      method: "POST",
      body: JSON.stringify({ engineer_id: engineerId }),
    }),
  history: (companyId: string) =>
    request<Record<string, unknown>[]>(`/payments/history/${companyId}`),
};
