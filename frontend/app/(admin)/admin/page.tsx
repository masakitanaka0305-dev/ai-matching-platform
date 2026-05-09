"use client";

import { useState } from "react";
import { matchingApi, reportApi, type DailyReport, type KnowledgeLoopReport } from "@/lib/api";

export default function AdminPage() {
  const [minScore, setMinScore] = useState(50);
  const [matchResult, setMatchResult] = useState<{ new_matches_count: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  // Daily Report
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);

  // Knowledge Loop
  const [klReport, setKlReport] = useState<KnowledgeLoopReport | null>(null);
  const [klLoading, setKlLoading] = useState(false);
  const [klDays, setKlDays] = useState(90);

  const runMatching = async () => {
    setRunning(true);
    setError("");
    setMatchResult(null);
    try {
      const res = await matchingApi.run(minScore);
      setMatchResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "実行失敗");
    } finally {
      setRunning(false);
    }
  };

  const fetchDailyReport = async () => {
    setDailyLoading(true);
    try {
      const res = await reportApi.daily();
      setDailyReport(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "レポート取得失敗");
    } finally {
      setDailyLoading(false);
    }
  };

  const fetchKnowledgeLoop = async () => {
    setKlLoading(true);
    try {
      const res = await reportApi.knowledgeLoop(klDays);
      setKlReport(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析取得失敗");
    } finally {
      setKlLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-[#0f172a]">管理画面</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          {error}
        </div>
      )}

      {/* マッチング実行 */}
      <div className="card p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-4 text-[#0f172a] flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          マッチングエンジン実行
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          全アクティブ求人 x 転職可能エンジニアをスコアリングし、
          閾値以上のペアを自動マッチングします。
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">最低スコア閾値</label>
            <input
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="form-input w-full sm:w-24"
            />
          </div>
          <button
            onClick={runMatching}
            disabled={running}
            className="btn-primary px-6 py-2.5 w-full sm:w-auto disabled:opacity-50"
          >
            {running ? "実行中..." : "マッチング実行"}
          </button>
        </div>

        {matchResult && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            <span className="font-bold">{matchResult.new_matches_count}</span> 件の新規マッチが生成されました。
            Discord に通知済みです。
          </div>
        )}
      </div>

      {/* 日次レポート（3択） */}
      <div className="card p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-4 text-[#0f172a] flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          日次3択レポート（代表向け）
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          KPI集計と失注分析に基づき、A（攻め）/ B（守り）/ C（現状維持）の3択を生成します。
        </p>
        <button
          onClick={fetchDailyReport}
          disabled={dailyLoading}
          className="px-6 py-2.5 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] disabled:opacity-50 transition shadow-sm"
        >
          {dailyLoading ? "生成中..." : "レポート生成"}
        </button>

        {dailyReport && (
          <div className="mt-4 space-y-4">
            <div className="text-sm text-gray-500">{dailyReport.report_date}</div>

            {/* KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(dailyReport.kpi).map(([key, val]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                  <div className="text-xl font-black text-[#0f172a]">{typeof val === "number" ? val.toLocaleString() : val}</div>
                  <div className="text-xs text-gray-500">{key}</div>
                </div>
              ))}
            </div>

            {/* 3択 */}
            <div className="space-y-3">
              {dailyReport.options.map((opt, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border-2 ${
                    i === 0
                      ? "border-green-200 bg-green-50"
                      : i === 1
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="font-bold mb-2 text-[#0f172a]">{opt.label}</div>
                  {opt.actions && (
                    <ul className="text-sm space-y-1 mb-2">
                      {opt.actions.map((a, j) => (
                        <li key={j} className="flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="text-xs text-gray-600">
                    想定効果: {opt.estimated_impact}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-600 bg-[#f59e0b]/10 border border-[#f59e0b]/20 p-3 rounded-xl">
              {dailyReport.instruction}
            </div>
          </div>
        )}
      </div>

      {/* Knowledge-Loop分析 */}
      <div className="card p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-4 text-[#0f172a] flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Knowledge-Loop（失注分析）
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          却下・辞退データから「なぜマッチしなかったか」を分析し、改善策を提示します。
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">分析期間（日）</label>
            <input
              type="number"
              min={7}
              max={365}
              value={klDays}
              onChange={(e) => setKlDays(Number(e.target.value))}
              className="form-input w-full sm:w-24"
            />
          </div>
          <button
            onClick={fetchKnowledgeLoop}
            disabled={klLoading}
            className="px-6 py-2.5 bg-[#f59e0b] text-[#0f172a] rounded-xl font-bold hover:bg-[#fbbf24] disabled:opacity-50 transition shadow-sm w-full sm:w-auto"
          >
            {klLoading ? "分析中..." : "分析実行"}
          </button>
        </div>

        {klReport && (
          <div className="mt-4 space-y-4">
            <div className="text-sm">
              過去{klDays}日間の失注: <span className="font-black text-[#0f172a]">{klReport.total_lost}件</span>
            </div>

            {klReport.patterns.length > 0 && (
              <div>
                <h3 className="text-sm font-bold mb-2 text-[#0f172a]">失注パターン</h3>
                <div className="space-y-2">
                  {klReport.patterns.map((p, i) => (
                    <div key={i} className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
                      <div className="text-sm truncate sm:w-32 text-[#0f172a] font-medium">{p.label}</div>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 bg-gray-100 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-red-400 to-red-500 h-3 rounded-full"
                            style={{ width: `${Math.min(p.pct, 100)}%` }}
                          />
                        </div>
                        <div className="text-sm text-gray-600 whitespace-nowrap font-medium">
                          {p.count}件 ({p.pct.toFixed(0)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {klReport.counter_talks && Object.keys(klReport.counter_talks).length > 0 && (
              <div>
                <h3 className="text-sm font-bold mb-2 text-[#0f172a]">切り返しトーク</h3>
                <div className="space-y-2">
                  {Object.entries(klReport.counter_talks).map(([concern, talk]) => (
                    <div key={concern} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="text-xs font-bold text-red-600 mb-1">{concern}</div>
                      <div className="text-sm text-[#0f172a]">{talk}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* API情報 */}
      <div className="card p-5 sm:p-6 overflow-x-auto">
        <h2 className="text-lg font-bold mb-4 text-[#0f172a] flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          API エンドポイント
        </h2>
        <div className="space-y-2 font-mono text-sm">
          {[
            { method: "GET", color: "bg-green-50 text-green-700 border-green-200", path: "/api/v1/engineers/" },
            { method: "POST", color: "bg-blue-50 text-blue-700 border-blue-200", path: "/api/v1/engineers/" },
            { method: "GET", color: "bg-green-50 text-green-700 border-green-200", path: "/api/v1/companies/" },
            { method: "POST", color: "bg-blue-50 text-blue-700 border-blue-200", path: "/api/v1/companies/" },
            { method: "GET", color: "bg-green-50 text-green-700 border-green-200", path: "/api/v1/postings/" },
            { method: "POST", color: "bg-blue-50 text-blue-700 border-blue-200", path: "/api/v1/postings/" },
            { method: "GET", color: "bg-green-50 text-green-700 border-green-200", path: "/api/v1/matches/" },
            { method: "POST", color: "bg-blue-50 text-blue-700 border-blue-200", path: "/api/v1/matching/run" },
            { method: "POST", color: "bg-blue-50 text-blue-700 border-blue-200", path: "/api/v1/diagnosis/" },
            { method: "GET", color: "bg-green-50 text-green-700 border-green-200", path: "/api/v1/reports/daily" },
            { method: "GET", color: "bg-green-50 text-green-700 border-green-200", path: "/api/v1/reports/knowledge-loop" },
            { method: "POST", color: "bg-blue-50 text-blue-700 border-blue-200", path: "/api/v1/payments/checkout/success-fee" },
            { method: "POST", color: "bg-blue-50 text-blue-700 border-blue-200", path: "/api/v1/payments/webhook" },
          ].map((ep) => (
            <div key={`${ep.method}-${ep.path}`} className="flex gap-2 items-center">
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold border ${ep.color}`}
              >
                {ep.method}
              </span>
              <span className="text-[#0f172a]">{ep.path}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Swagger UI: <a href="http://localhost:8000/docs" className="text-[#4f46e5] underline hover:text-[#3730a3] transition">http://localhost:8000/docs</a>
        </p>
      </div>
    </div>
  );
}
