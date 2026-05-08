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
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">管理画面</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* マッチング実行 */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border">
        <h2 className="text-lg font-bold mb-4">マッチングエンジン実行</h2>
        <p className="text-sm text-gray-600 mb-4">
          全アクティブ求人 x 転職可能エンジニアをスコアリングし、
          閾値以上のペアを自動マッチングします。
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">最低スコア閾値</label>
            <input
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-full sm:w-24"
            />
          </div>
          <button
            onClick={runMatching}
            disabled={running}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 w-full sm:w-auto"
          >
            {running ? "実行中..." : "マッチング実行"}
          </button>
        </div>

        {matchResult && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <span className="font-bold">{matchResult.new_matches_count}</span> 件の新規マッチが生成されました。
            Discord に通知済みです。
          </div>
        )}
      </div>

      {/* 日次レポート（3択） */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border">
        <h2 className="text-lg font-bold mb-4">日次3択レポート（代表向け）</h2>
        <p className="text-sm text-gray-600 mb-4">
          KPI集計と失注分析に基づき、A（攻め）/ B（守り）/ C（現状維持）の3択を生成します。
        </p>
        <button
          onClick={fetchDailyReport}
          disabled={dailyLoading}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {dailyLoading ? "生成中..." : "レポート生成"}
        </button>

        {dailyReport && (
          <div className="mt-4 space-y-4">
            <div className="text-sm text-gray-500">{dailyReport.report_date}</div>

            {/* KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(dailyReport.kpi).map(([key, val]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold">{typeof val === "number" ? val.toLocaleString() : val}</div>
                  <div className="text-xs text-gray-500">{key}</div>
                </div>
              ))}
            </div>

            {/* 3択 */}
            <div className="space-y-3">
              {dailyReport.options.map((opt, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border-2 ${
                    i === 0
                      ? "border-green-300 bg-green-50"
                      : i === 1
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="font-bold mb-2">{opt.label}</div>
                  {opt.actions && (
                    <ul className="text-sm space-y-1 mb-2">
                      {opt.actions.map((a, j) => (
                        <li key={j}>- {a}</li>
                      ))}
                    </ul>
                  )}
                  <div className="text-xs text-gray-600">
                    想定効果: {opt.estimated_impact}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
              {dailyReport.instruction}
            </div>
          </div>
        )}
      </div>

      {/* Knowledge-Loop分析 */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border">
        <h2 className="text-lg font-bold mb-4">Knowledge-Loop（失注分析）</h2>
        <p className="text-sm text-gray-600 mb-4">
          却下・辞退データから「なぜマッチしなかったか」を分析し、改善策を提示します。
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">分析期間（日）</label>
            <input
              type="number"
              min={7}
              max={365}
              value={klDays}
              onChange={(e) => setKlDays(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-full sm:w-24"
            />
          </div>
          <button
            onClick={fetchKnowledgeLoop}
            disabled={klLoading}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 w-full sm:w-auto"
          >
            {klLoading ? "分析中..." : "分析実行"}
          </button>
        </div>

        {klReport && (
          <div className="mt-4 space-y-4">
            <div className="text-sm">
              過去{klDays}日間の失注: <span className="font-bold">{klReport.total_lost}件</span>
            </div>

            {klReport.patterns.length > 0 && (
              <div>
                <h3 className="text-sm font-bold mb-2">失注パターン</h3>
                <div className="space-y-2">
                  {klReport.patterns.map((p, i) => (
                    <div key={i} className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
                      <div className="text-sm truncate sm:w-32">{p.label}</div>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-red-500 h-4 rounded-full"
                            style={{ width: `${Math.min(p.pct, 100)}%` }}
                          />
                        </div>
                        <div className="text-sm text-gray-600 whitespace-nowrap">
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
                <h3 className="text-sm font-bold mb-2">切り返しトーク</h3>
                <div className="space-y-2">
                  {Object.entries(klReport.counter_talks).map(([concern, talk]) => (
                    <div key={concern} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs font-bold text-red-600 mb-1">{concern}</div>
                      <div className="text-sm">{talk}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* API情報 */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border overflow-x-auto">
        <h2 className="text-lg font-bold mb-4">API エンドポイント</h2>
        <div className="space-y-2 font-mono text-sm">
          {[
            { method: "GET", color: "green", path: "/api/v1/engineers/" },
            { method: "POST", color: "blue", path: "/api/v1/engineers/" },
            { method: "GET", color: "green", path: "/api/v1/companies/" },
            { method: "POST", color: "blue", path: "/api/v1/companies/" },
            { method: "GET", color: "green", path: "/api/v1/postings/" },
            { method: "POST", color: "blue", path: "/api/v1/postings/" },
            { method: "GET", color: "green", path: "/api/v1/matches/" },
            { method: "POST", color: "blue", path: "/api/v1/matching/run" },
            { method: "POST", color: "blue", path: "/api/v1/diagnosis/" },
            { method: "GET", color: "green", path: "/api/v1/reports/daily" },
            { method: "GET", color: "green", path: "/api/v1/reports/knowledge-loop" },
            { method: "POST", color: "blue", path: "/api/v1/payments/checkout/success-fee" },
            { method: "POST", color: "blue", path: "/api/v1/payments/webhook" },
          ].map((ep) => (
            <div key={`${ep.method}-${ep.path}`} className="flex gap-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  ep.color === "green" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {ep.method}
              </span>
              <span>{ep.path}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Swagger UI: <a href="http://localhost:8000/docs" className="text-indigo-600 underline">http://localhost:8000/docs</a>
        </p>
      </div>
    </div>
  );
}
