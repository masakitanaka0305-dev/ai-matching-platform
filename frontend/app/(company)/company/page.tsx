"use client";

import { useEffect, useState } from "react";
import { matchApi, postingApi, type Match, type JobPosting } from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  proposed: { label: "提案中", color: "bg-blue-50 text-blue-700 border-blue-200" },
  company_reviewed: { label: "確認済", color: "bg-amber-50 text-amber-700 border-amber-200" },
  engineer_interested: { label: "興味あり", color: "bg-purple-50 text-purple-700 border-purple-200" },
  interview_scheduled: { label: "面談設定", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  accepted: { label: "成約", color: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "不成立", color: "bg-red-50 text-red-700 border-red-200" },
  withdrawn: { label: "辞退", color: "bg-gray-50 text-gray-600 border-gray-200" },
};

type Tab = "matches" | "postings";

export default function CompanyDashboard() {
  const [tab, setTab] = useState<Tab>("matches");

  // Matches
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState("proposed");
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Postings
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loadingPostings, setLoadingPostings] = useState(false);

  useEffect(() => {
    if (tab === "matches") {
      setLoadingMatches(true);
      matchApi
        .list(filter)
        .then(setMatches)
        .catch(() => setMatches([]))
        .finally(() => setLoadingMatches(false));
    }
  }, [filter, tab]);

  useEffect(() => {
    if (tab === "postings") {
      setLoadingPostings(true);
      postingApi
        .list({ active_only: false })
        .then(setPostings)
        .catch(() => setPostings([]))
        .finally(() => setLoadingPostings(false));
    }
  }, [tab]);

  const handleAction = async (matchId: string, status: string) => {
    try {
      const updated = await matchApi.updateStatus(matchId, status);
      setMatches((prev) => prev.map((m) => (m.id === matchId ? updated : m)));
    } catch {
      alert("更新に失敗しました");
    }
  };

  const handleDeactivate = async (postingId: string) => {
    try {
      await postingApi.deactivate(postingId);
      setPostings((prev) =>
        prev.map((p) => (p.id === postingId ? { ...p, is_active: false } : p))
      );
    } catch {
      alert("無効化に失敗しました");
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card p-5 sm:p-6 bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">企業ダッシュボード</h1>
            <p className="text-sm text-gray-400 mt-1">マッチング状況と求人を管理</p>
          </div>
          <a
            href="/company/register"
            className="px-5 py-2.5 bg-[#f59e0b] text-[#0f172a] rounded-xl text-sm font-bold hover:bg-[#fbbf24] transition shadow-sm text-center"
          >
            新規企業登録
          </a>
        </div>
      </div>

      {/* Pill Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("matches")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition ${
            tab === "matches" ? "bg-white text-[#4f46e5] shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          マッチング管理
        </button>
        <button
          onClick={() => setTab("postings")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition ${
            tab === "postings" ? "bg-white text-[#4f46e5] shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          求人管理
        </button>
      </div>

      {/* マッチング管理タブ */}
      {tab === "matches" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition ${
                  filter === key ? "bg-[#4f46e5] text-white border-[#4f46e5]" : "bg-white border-gray-200 text-gray-600 hover:border-[#4f46e5]/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loadingMatches ? (
            <div className="text-center py-12 text-gray-500">読み込み中...</div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              該当するマッチングはありません
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((m) => {
                const st = STATUS_LABELS[m.status] || { label: m.status, color: "bg-gray-100" };
                return (
                  <div key={m.id} className="card p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${st.color}`}>
                            {st.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(m.proposed_at).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">ID: {m.id.slice(0, 8)}...</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl sm:text-3xl font-black text-[#4f46e5]">{m.ai_score}</div>
                        <div className="text-xs text-gray-500">AIスコア</div>
                      </div>
                    </div>

                    {m.pitch_to_company && (
                      <div className="bg-gray-50 p-4 rounded-xl text-sm whitespace-pre-line mb-4 border border-gray-100">
                        {m.pitch_to_company}
                      </div>
                    )}

                    {m.status === "proposed" && (
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                          onClick={() => handleAction(m.id, "company_reviewed")}
                          className="flex-1 sm:flex-none btn-primary px-5 py-2 text-sm"
                        >
                          確認済み
                        </button>
                        <button
                          onClick={() => handleAction(m.id, "accepted")}
                          className="flex-1 sm:flex-none px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition shadow-sm"
                        >
                          承認
                        </button>
                        <button
                          onClick={() => handleAction(m.id, "rejected")}
                          className="flex-1 sm:flex-none px-5 py-2 border-2 border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition"
                        >
                          却下
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 求人管理タブ */}
      {tab === "postings" && (
        <>
          <div className="flex justify-end">
            <a
              href="/company/postings/new"
              className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition shadow-sm"
            >
              求人を作成
            </a>
          </div>

          {loadingPostings ? (
            <div className="text-center py-12 text-gray-500">読み込み中...</div>
          ) : postings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              求人がありません。「求人を作成」から始めましょう。
            </div>
          ) : (
            <div className="space-y-4">
              {postings.map((p) => (
                <div key={p.id} className="card p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            p.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {p.is_active ? "公開中" : "非公開"}
                        </span>
                        <h3 className="font-bold text-[#0f172a]">{p.title}</h3>
                      </div>
                      <div className="text-sm text-gray-400">ID: {p.id.slice(0, 8)}...</div>
                      {p.ai_domain.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {p.ai_domain.map((d) => (
                            <span key={d} className="px-2.5 py-0.5 bg-[#4f46e5]/10 text-[#4f46e5] rounded-full text-xs font-medium">
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(p.created_at).toLocaleDateString("ja-JP")} 作成
                      </div>
                    </div>
                    {p.is_active && (
                      <button
                        onClick={() => handleDeactivate(p.id)}
                        className="px-3 py-1.5 border-2 border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition"
                      >
                        非公開にする
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
