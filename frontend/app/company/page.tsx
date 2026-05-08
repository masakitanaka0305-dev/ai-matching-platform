"use client";

import { useEffect, useState } from "react";
import { matchApi, postingApi, type Match, type JobPosting } from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  proposed: { label: "提案中", color: "bg-blue-100 text-blue-800" },
  company_reviewed: { label: "確認済", color: "bg-yellow-100 text-yellow-800" },
  engineer_interested: { label: "興味あり", color: "bg-purple-100 text-purple-800" },
  interview_scheduled: { label: "面談設定", color: "bg-cyan-100 text-cyan-800" },
  accepted: { label: "成約", color: "bg-green-100 text-green-800" },
  rejected: { label: "不成立", color: "bg-red-100 text-red-800" },
  withdrawn: { label: "辞退", color: "bg-gray-100 text-gray-800" },
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">企業ダッシュボード</h1>
        <a
          href="/company/register"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          新規企業登録
        </a>
      </div>

      {/* Tab切り替え */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setTab("matches")}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition ${
            tab === "matches" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"
          }`}
        >
          マッチング管理
        </button>
        <button
          onClick={() => setTab("postings")}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition ${
            tab === "postings" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"
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
                className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                  filter === key ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
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
                  <div key={m.id} className="bg-white p-6 rounded-xl border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${st.color}`}>
                            {st.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(m.proposed_at).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">ID: {m.id.slice(0, 8)}...</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-600">{m.ai_score}</div>
                        <div className="text-xs text-gray-500">AIスコア</div>
                      </div>
                    </div>

                    {m.pitch_to_company && (
                      <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-line mb-4">
                        {m.pitch_to_company}
                      </div>
                    )}

                    {m.status === "proposed" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(m.id, "company_reviewed")}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                        >
                          確認済みにする
                        </button>
                        <button
                          onClick={() => handleAction(m.id, "accepted")}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                        >
                          承認
                        </button>
                        <button
                          onClick={() => handleAction(m.id, "rejected")}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
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
                <div key={p.id} className="bg-white p-6 rounded-xl border">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            p.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {p.is_active ? "公開中" : "非公開"}
                        </span>
                        <h3 className="font-bold">{p.title}</h3>
                      </div>
                      <div className="text-sm text-gray-500">ID: {p.id.slice(0, 8)}...</div>
                      {p.ai_domain.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {p.ai_domain.map((d) => (
                            <span key={d} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
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
                        className="px-3 py-1 border border-red-300 text-red-600 rounded text-xs hover:bg-red-50"
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
