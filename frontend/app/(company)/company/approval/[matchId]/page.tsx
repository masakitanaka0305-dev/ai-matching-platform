"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { scoutApproachApi, type ApprovalData } from "@/lib/api";
import AssessmentReport from "@/app/components/AssessmentReport";

export default function ApprovalPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const [data, setData] = useState<ApprovalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const companyId = localStorage.getItem("company_id") || "";
    scoutApproachApi
      .getApprovalData(matchId, companyId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "データの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">読み込み中...</div>;
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {error || "データが見つかりません"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 print:py-4 print:px-0">
      {/* Print Button */}
      <div className="flex justify-end mb-6 no-print">
        <button
          onClick={() => window.print()}
          className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          PDFとして保存（印刷）
        </button>
      </div>

      {/* Document Header */}
      <div className="text-center mb-8 print:mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">採用候補者 社内稟議書</h1>
        <p className="text-sm text-gray-500">
          作成日: {data.generated_at ? new Date(data.generated_at).toLocaleDateString("ja-JP") : new Date().toLocaleDateString("ja-JP")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: 概要 */}
        <section className="card p-6 print:border print:shadow-none">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-indigo-500 rounded-full" />
            候補者概要
          </h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <ApprovalRow label="氏名" value={data.candidate.name} />
              <ApprovalRow label="経験レベル" value={data.candidate.experience_level} />
              <ApprovalRow label="経験年数" value={`${data.candidate.years_of_experience}年`} />
              <ApprovalRow label="AI専門領域" value={data.candidate.ai_specialties.join(", ")} />
              <ApprovalRow label="保有スキル" value={data.candidate.skills.join(", ")} />
            </tbody>
          </table>
        </section>

        {/* Section 2: AI評価 */}
        <section className="card p-6 print:border print:shadow-none">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-indigo-500 rounded-full" />
            AI評価サマリー
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-indigo-50 rounded-xl p-4 text-center print:border print:bg-white">
              <div className="text-sm text-indigo-600 mb-1">総合AIスコア</div>
              <div className="text-3xl font-black text-indigo-700">{data.ai_evaluation.total_score}</div>
              <div className="text-xs text-indigo-500 mt-1">/ 100点</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center print:border print:bg-white">
              <div className="text-sm text-blue-600 mb-1">スキル一致率</div>
              <div className="text-3xl font-black text-blue-700">{data.ai_evaluation.skill_match_rate}%</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center print:border print:bg-white">
              <div className="text-sm text-purple-600 mb-1">市場価値レベル</div>
              <div className="text-3xl font-black text-purple-700">{data.ai_evaluation.level}</div>
            </div>
          </div>
        </section>

        {/* Section 3: 求人情報 */}
        <section className="card p-6 print:border print:shadow-none">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-indigo-500 rounded-full" />
            対象求人
          </h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <ApprovalRow label="企業名" value={data.company.name} />
              <ApprovalRow label="業種" value={data.company.industry || "N/A"} />
              <ApprovalRow label="ポジション" value={data.posting.title} />
              <ApprovalRow
                label="年収レンジ"
                value={`${data.posting.salary_min ?? "応相談"}〜${data.posting.salary_max ?? "応相談"}万円`}
              />
            </tbody>
          </table>
        </section>

        {/* Section 4: コスト比較 */}
        <section className="card p-6 print:border print:shadow-none">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-indigo-500 rounded-full" />
            コスト比較
          </h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <ApprovalRow
                label={data.cost_comparison.approach_fee_label}
                value={`¥${data.cost_comparison.approach_fee.toLocaleString()}`}
              />
              <ApprovalRow label="一般エージェント手数料" value={data.cost_comparison.typical_agent_fee} />
              <ApprovalRow label="コスト優位性" value={data.cost_comparison.saving_note} />
            </tbody>
          </table>
        </section>

        {/* Section 5: ROI */}
        <section className="card p-6 print:border print:shadow-none">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-indigo-500 rounded-full" />
            ROI概算
          </h2>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-2 print:border print:bg-white">
            <p>
              <span className="font-medium">推定年収レンジ:</span>{" "}
              {data.roi_estimate.salary_estimate.min}〜{data.roi_estimate.salary_estimate.max} {data.roi_estimate.salary_estimate.unit}
            </p>
            <p className="text-gray-600">{data.roi_estimate.note}</p>
          </div>
        </section>

        {/* Section 6: 技術鑑定書 */}
        {data.assessment_report && (
          <AssessmentReport report={data.assessment_report} />
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400 print:mt-4">
        AI Matching Platform — 自動生成稟議書 — {new Date().toLocaleDateString("ja-JP")}
      </div>
    </div>
  );
}

function ApprovalRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="py-2.5 pr-4 text-gray-500 font-medium w-40">{label}</td>
      <td className="py-2.5 text-gray-800">{value}</td>
    </tr>
  );
}
