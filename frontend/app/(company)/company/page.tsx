"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  companyMatchApi,
  scoutApproachApi,
  postingApi,
  type CompanyMatch,
  type JobPosting,
} from "@/lib/api";
import CandidateCard from "@/app/components/CandidateCard";

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

type Tab = "matches" | "postings";

export default function CompanyDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("matches");
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Matches
  const [matches, setMatches] = useState<CompanyMatch[]>([]);
  const [filter, setFilter] = useState("");
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Postings
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loadingPostings, setLoadingPostings] = useState(false);

  // companyId をlocalStorageから取得
  useEffect(() => {
    const id = localStorage.getItem("company_id");
    setCompanyId(id);
  }, []);

  // マッチ一覧取得
  useEffect(() => {
    if (tab !== "matches" || !companyId) return;
    setLoadingMatches(true);
    companyMatchApi
      .list(companyId, filter)
      .then(setMatches)
      .catch(() => setMatches([]))
      .finally(() => setLoadingMatches(false));
  }, [filter, tab, companyId]);

  // 求人一覧取得
  useEffect(() => {
    if (tab === "postings") {
      setLoadingPostings(true);
      postingApi
        .list({ active_only: false, company_id: companyId || undefined })
        .then(setPostings)
        .catch(() => setPostings([]))
        .finally(() => setLoadingPostings(false));
    }
  }, [tab, companyId]);

  // 優先アプローチ権の解放
  const handleUnlock = async (matchId: string) => {
    if (!companyId) {
      alert("企業IDが見つかりません。企業登録を先に行ってください。");
      return;
    }
    try {
      const result = await scoutApproachApi.createCheckout(companyId, matchId);
      window.location.href = result.checkout_url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "決済の開始に失敗しました");
    }
  };

  // 稟議PDF
  const handleApprovalPdf = (matchId: string) => {
    router.push(`/company/approval/${matchId}`);
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
      {/* Welcome Header — ホワイトベース */}
      <div className="card p-5 sm:p-6 bg-white border-2 border-indigo-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">企業ダッシュボード</h1>
            <p className="text-sm text-gray-500 mt-1">
              マッチング状況と求人を管理
              <span className="ml-2 inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold border border-green-200">求人投稿 無料・無制限</span>
            </p>
          </div>
          <a
            href="/company/register"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm text-center"
          >
            新規企業登録
          </a>
        </div>
      </div>

      {!companyId && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
          企業IDが設定されていません。<a href="/company/register" className="underline font-bold">企業登録</a>を行うと、マッチング候補者が表示されます。
        </div>
      )}

      {/* Pill Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("matches")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition ${
            tab === "matches" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          マッチング管理
        </button>
        <button
          onClick={() => setTab("postings")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition ${
            tab === "postings" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          求人管理
        </button>
      </div>

      {/* マッチング管理タブ */}
      {tab === "matches" && (
        <>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition ${
                filter === "" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
              }`}
            >
              すべて
            </button>
            {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition ${
                  filter === key ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
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
              {matches.map((m) => (
                <CandidateCard
                  key={m.id}
                  match={m}
                  companyId={companyId}
                  onUnlock={handleUnlock}
                  onApprovalPdf={handleApprovalPdf}
                />
              ))}
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
                        <h3 className="font-bold text-gray-900">{p.title}</h3>
                      </div>
                      <div className="text-sm text-gray-400">ID: {p.id.slice(0, 8)}...</div>
                      {p.ai_domain.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {p.ai_domain.map((d) => (
                            <span key={d} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
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
