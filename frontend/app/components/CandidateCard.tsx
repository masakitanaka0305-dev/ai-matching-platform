"use client";

import { type CompanyMatch, type UnlockedCandidate } from "@/lib/api";

interface CandidateCardProps {
  match: CompanyMatch;
  onUnlock: (matchId: string) => void;
  onApproach?: (matchId: string) => void;
  onApprovalPdf?: (matchId: string) => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  proposed: { label: "提案中", color: "bg-blue-50 text-blue-700 border-blue-200" },
  company_reviewed: { label: "確認済", color: "bg-amber-50 text-amber-700 border-amber-200" },
  approach_unlocked: { label: "アプローチ権解放済", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  engineer_interested: { label: "興味あり", color: "bg-purple-50 text-purple-700 border-purple-200" },
  interview_scheduled: { label: "面談設定", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  accepted: { label: "成約", color: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "不成立", color: "bg-red-50 text-red-700 border-red-200" },
  withdrawn: { label: "辞退", color: "bg-gray-50 text-gray-600 border-gray-200" },
};

function isUnlocked(candidate: CompanyMatch["candidate"]): candidate is UnlockedCandidate {
  return "name" in candidate && "email" in candidate;
}

export default function CandidateCard({ match, onUnlock, onApproach, onApprovalPdf }: CandidateCardProps) {
  const { candidate } = match;
  const st = STATUS_LABELS[match.status] || { label: match.status, color: "bg-gray-100" };
  const unlocked = match.is_unlocked && isUnlocked(candidate);

  return (
    <div className="card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
            unlocked
              ? "bg-indigo-100 text-indigo-700"
              : "bg-gray-100 text-gray-400"
          }`}>
            {candidate.initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${st.color}`}>
                {st.label}
              </span>
              <span className="text-xs text-gray-400">
                {match.posting_title}
              </span>
            </div>
            {unlocked ? (
              <div className="font-bold text-gray-900">{candidate.name}</div>
            ) : (
              <div className="font-bold text-gray-400">候補者 {candidate.initials}***</div>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl sm:text-3xl font-black text-indigo-600">{match.ai_score}</div>
          <div className="text-xs text-gray-500">AIスコア</div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
          {candidate.experience_level} / {candidate.years_of_experience}年
        </span>
        <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
          {candidate.work_style}
        </span>
        {candidate.ai_specialties.map((s) => (
          <span key={s} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
            {s}
          </span>
        ))}
      </div>

      {/* Skill Tags */}
      {candidate.skill_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {candidate.skill_tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Masked overlay */}
      {!unlocked && (
        <div className="relative mb-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200/60 rounded w-3/4 blur-[2px]" />
              <div className="h-4 bg-gray-200/60 rounded w-1/2 blur-[2px]" />
              <div className="h-4 bg-gray-200/60 rounded w-2/3 blur-[2px]" />
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              詳細プロフィール・連絡先・技術鑑定書は解放後に表示されます
            </p>
          </div>
        </div>
      )}

      {/* Unlocked: Full Profile */}
      {unlocked && (
        <div className="space-y-3 mb-4">
          {/* Contact */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span className="text-gray-700">{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                <span className="text-gray-700">{candidate.phone}</span>
              </div>
            )}
            {candidate.github_url && (
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
                <a href={candidate.github_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  GitHub
                </a>
              </div>
            )}
            {(candidate.desired_salary_min || candidate.desired_salary_max) && (
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                <span className="text-gray-700">
                  {candidate.desired_salary_min ?? "?"}〜{candidate.desired_salary_max ?? "?"}万円
                </span>
              </div>
            )}
          </div>

          {/* Bio & Current */}
          {(candidate.current_company || candidate.bio) && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm space-y-1">
              {candidate.current_company && (
                <p className="text-gray-700">
                  <span className="font-medium">現職:</span> {candidate.current_company}
                  {candidate.current_role && ` / ${candidate.current_role}`}
                </p>
              )}
              {candidate.bio && (
                <p className="text-gray-600">{candidate.bio}</p>
              )}
            </div>
          )}

          {/* Pitch */}
          {candidate.pitch_to_company && (
            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 text-sm text-gray-700 whitespace-pre-line">
              {candidate.pitch_to_company}
            </div>
          )}

          {/* Assessment Report */}
          {match.assessment_report && (
            <details className="card-premium rounded-xl border-2 border-amber-200 bg-amber-50/30">
              <summary className="cursor-pointer p-4 font-bold text-sm text-amber-800 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                技術鑑定書を表示
              </summary>
              <div className="px-4 pb-4">
                <AssessmentInline report={match.assessment_report} />
              </div>
            </details>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {!unlocked && (
          <button
            onClick={() => onUnlock(match.id)}
            className="btn-gold flex-1 sm:flex-none px-5 py-2.5 text-sm"
          >
            優先アプローチ権を解放する（技術鑑定書付）
          </button>
        )}
        {unlocked && onApproach && (
          <button
            onClick={() => onApproach(match.id)}
            className="flex-1 sm:flex-none btn-primary px-5 py-2 text-sm"
          >
            アプローチ送信
          </button>
        )}
        {unlocked && onApprovalPdf && (
          <button
            onClick={() => onApprovalPdf(match.id)}
            className="flex-1 sm:flex-none btn-secondary px-5 py-2 text-sm"
          >
            社内稟議用PDFを生成
          </button>
        )}
      </div>
    </div>
  );
}

/** Assessment Report inline display */
function AssessmentInline({ report }: { report: Record<string, unknown> }) {
  const scoring = (report.ai_scoring_breakdown || {}) as Record<string, unknown>;
  const skills = (report.skill_analysis || {}) as Record<string, unknown>;
  const market = (report.market_value_comparison || {}) as Record<string, unknown>;
  const questions = (report.recommended_interview_questions || []) as string[];
  const salary = (market.salary_estimate || {}) as Record<string, unknown>;

  return (
    <div className="space-y-3 text-sm">
      {/* Score */}
      <div>
        <h4 className="font-bold text-gray-800 mb-2">AIスコア内訳</h4>
        <div className="space-y-1.5">
          <ScoreBar label="総合スコア" value={Number(scoring.total_score || 0)} max={100} />
          <ScoreBar label="スキル一致率" value={Number(scoring.skill_match_rate || 0)} max={100} />
          <ScoreBar label="カルチャーフィット" value={Number(scoring.culture_fit_score || 0)} max={100} />
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="font-bold text-gray-800 mb-1">スキル適合分析</h4>
        <p className="text-gray-600">
          必須スキル: {String(skills.required_matched ?? 0)}/{String(skills.required_total ?? 0)} 一致 ／
          歓迎スキル: {String(skills.nice_matched ?? 0)}/{String(skills.nice_total ?? 0)} 一致
        </p>
      </div>

      {/* Market Value */}
      <div>
        <h4 className="font-bold text-gray-800 mb-1">市場価値比較</h4>
        <p className="text-gray-600">
          レベル: <span className="font-bold text-indigo-600">{String(market.level ?? "N/A")}</span> ／
          推定年収: {String(salary.min ?? "?")}〜{String(salary.max ?? "?")} {String(salary.unit ?? "万円")}
        </p>
      </div>

      {/* Questions */}
      {questions.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-800 mb-1">推奨面接質問</h4>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-600 w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-gray-700 font-bold w-10 text-right">{value}</span>
    </div>
  );
}
