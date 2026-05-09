"use client";

interface AssessmentReportProps {
  report: Record<string, unknown>;
}

export default function AssessmentReport({ report }: AssessmentReportProps) {
  const candidateSummary = (report.candidate_summary || {}) as Record<string, unknown>;
  const scoring = (report.ai_scoring_breakdown || {}) as Record<string, unknown>;
  const skills = (report.skill_analysis || {}) as Record<string, unknown>;
  const market = (report.market_value_comparison || {}) as Record<string, unknown>;
  const questions = (report.recommended_interview_questions || []) as string[];
  const salary = (market.salary_estimate || {}) as Record<string, unknown>;
  const generatedAt = String(report.generated_at || "");

  return (
    <div className="card-premium border-2 border-amber-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-6 py-4 border-b border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h2 className="text-lg font-bold text-amber-900">技術鑑定書</h2>
          </div>
          {generatedAt && (
            <span className="text-xs text-amber-700">
              生成日: {new Date(generatedAt).toLocaleDateString("ja-JP")}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Candidate Summary */}
        <section>
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
            候補者概要
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <InfoRow label="氏名" value={String(candidateSummary.name || "N/A")} />
            <InfoRow label="経験レベル" value={String(candidateSummary.experience_level || "N/A")} />
            <InfoRow label="経験年数" value={`${candidateSummary.years_of_experience ?? "N/A"}年`} />
            <InfoRow label="AI専門領域" value={(candidateSummary.ai_specialties as string[] || []).join(", ") || "N/A"} />
          </div>
        </section>

        {/* AI Scoring */}
        <section>
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
            AIスコア内訳
          </h3>
          <div className="space-y-2">
            <ScoreBar label="総合スコア" value={Number(scoring.total_score || 0)} max={100} color="indigo" />
            <ScoreBar label="スキル一致率" value={Number(scoring.skill_match_rate || 0)} max={100} color="blue" />
            <ScoreBar label="カルチャーフィット" value={Number(scoring.culture_fit_score || 0)} max={100} color="purple" />
          </div>
        </section>

        {/* Skill Analysis */}
        <section>
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
            スキル適合分析
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">必須スキル</div>
              <div className="font-bold text-gray-800">
                {String(skills.required_matched ?? 0)} / {String(skills.required_total ?? 0)} 一致
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">歓迎スキル</div>
              <div className="font-bold text-gray-800">
                {String(skills.nice_matched ?? 0)} / {String(skills.nice_total ?? 0)} 一致
              </div>
            </div>
          </div>
        </section>

        {/* Market Value */}
        <section>
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
            市場価値比較
          </h3>
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between">
            <div>
              <div className="text-sm text-indigo-700">市場価値レベル</div>
              <div className="text-3xl font-black text-indigo-600">{String(market.level || "N/A")}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-indigo-700">推定年収レンジ</div>
              <div className="text-lg font-bold text-indigo-800">
                {String(salary.min ?? "?")}〜{String(salary.max ?? "?")} {String(salary.unit ?? "万円")}
              </div>
            </div>
          </div>
        </section>

        {/* Interview Questions */}
        {questions.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              推奨面接質問
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              {questions.map((q, i) => (
                <li key={i} className="leading-relaxed">{q}</li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500 text-xs w-20 shrink-0">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const colors: Record<string, string> = {
    indigo: "from-indigo-500 to-indigo-400",
    blue: "from-blue-500 to-blue-400",
    purple: "from-purple-500 to-purple-400",
  };
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-32 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colors[color] || colors.indigo}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-bold text-gray-800 w-12 text-right">{value}</span>
    </div>
  );
}
