"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  companyMatchApi,
  scoutApproachApi,
  postingApi,
  inboxApi,
  interviewApi,
  matchApi,
  type CompanyMatch,
  type JobPosting,
  type InboxMessage,
  type InterviewSchedule,
} from "@/lib/api";
import CandidateCard from "@/app/components/CandidateCard";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  proposed: { label: "提案中", color: "bg-blue-50 text-blue-700 border-blue-200" },
  company_reviewed: { label: "確認済", color: "bg-amber-50 text-amber-700 border-amber-200" },
  approach_unlocked: { label: "アプローチ権解放済", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  scout_sent: { label: "スカウト送信済", color: "bg-violet-50 text-violet-700 border-violet-200" },
  engineer_interested: { label: "興味あり", color: "bg-purple-50 text-purple-700 border-purple-200" },
  interview_scheduled: { label: "面談設定", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  accepted: { label: "成約", color: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "不成立", color: "bg-red-50 text-red-700 border-red-200" },
  withdrawn: { label: "辞退", color: "bg-gray-50 text-gray-600 border-gray-200" },
};

const PIPELINE_STAGES = [
  { key: "proposed", label: "提案中", icon: "📋" },
  { key: "approach_unlocked", label: "解放済", icon: "🔓" },
  { key: "scout_sent", label: "スカウト済", icon: "🚀" },
  { key: "engineer_interested", label: "興味あり", icon: "💡" },
  { key: "interview_scheduled", label: "面談設定", icon: "📅" },
  { key: "accepted", label: "成約", icon: "🎉" },
];

type Tab = "matches" | "inbox" | "pipeline" | "postings";

export default function CompanyDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("matches");
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Matches
  const [matches, setMatches] = useState<CompanyMatch[]>([]);
  const [filter, setFilter] = useState("");
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Inbox
  const [threads, setThreads] = useState<Record<string, InboxMessage[]>>({});
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<InboxMessage[]>([]);
  const [threadInterviews, setThreadInterviews] = useState<InterviewSchedule[]>([]);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  // Interview scheduling
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleTimes, setScheduleTimes] = useState<string[]>([""]);
  const [scheduleMeetingUrl, setScheduleMeetingUrl] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");

  // Postings
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loadingPostings, setLoadingPostings] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("company_id");
    setCompanyId(id);
  }, []);

  // Fetch matches
  useEffect(() => {
    if ((tab !== "matches" && tab !== "pipeline") || !companyId) return;
    setLoadingMatches(true);
    companyMatchApi
      .list(companyId, tab === "matches" ? filter : "")
      .then(setMatches)
      .catch(() => setMatches([]))
      .finally(() => setLoadingMatches(false));
  }, [filter, tab, companyId]);

  // Fetch inbox threads (company side — get all threads from all matches)
  useEffect(() => {
    if (tab !== "inbox" || !companyId) return;
    setLoadingInbox(true);
    companyMatchApi
      .list(companyId)
      .then(async (allMatches) => {
        // Fetch threads for matches that have been unlocked
        const threadMap: Record<string, InboxMessage[]> = {};
        const unlockedMatches = allMatches.filter(
          (m) => m.is_unlocked && ["scout_sent", "engineer_interested", "interview_scheduled", "accepted"].includes(m.status)
        );
        await Promise.all(
          unlockedMatches.map(async (m) => {
            try {
              const msgs = await inboxApi.thread(m.id);
              if (msgs.length > 0) {
                threadMap[m.id] = msgs;
              }
            } catch {}
          })
        );
        setThreads(threadMap);
      })
      .catch(() => setThreads({}))
      .finally(() => setLoadingInbox(false));
  }, [tab, companyId]);

  // Fetch postings
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

  // Open thread in inbox
  const openThread = async (matchId: string) => {
    setSelectedThread(matchId);
    try {
      const [msgs, ivs] = await Promise.all([
        inboxApi.thread(matchId),
        interviewApi.listForMatch(matchId),
      ]);
      setThreadMessages(msgs);
      setThreadInterviews(ivs);
    } catch {
      setThreadMessages([]);
      setThreadInterviews([]);
    }
  };

  // Company reply in thread
  const handleCompanyReply = async () => {
    if (!selectedThread || !companyId || !replyText.trim()) return;
    setReplying(true);
    try {
      // Use the engagement approach API for company messages
      const { engagementApi } = await import("@/lib/api");
      await engagementApi.sendApproach(selectedThread, companyId, "", replyText.trim());
      setReplyText("");
      const msgs = await inboxApi.thread(selectedThread);
      setThreadMessages(msgs);
    } catch {
      alert("送信に失敗しました");
    } finally {
      setReplying(false);
    }
  };

  // Propose interview
  const handleProposeInterview = async () => {
    if (!selectedThread) return;
    const validTimes = scheduleTimes.filter((t) => t.trim());
    if (validTimes.length === 0) return;
    try {
      await interviewApi.propose(
        selectedThread,
        "company",
        validTimes.map((t) => ({ datetime: t, duration_min: 60 })),
        {
          meeting_url: scheduleMeetingUrl || undefined,
          notes: scheduleNotes || undefined,
        }
      );
      setShowScheduleForm(false);
      setScheduleTimes([""]);
      setScheduleMeetingUrl("");
      setScheduleNotes("");
      // Refresh
      const ivs = await interviewApi.listForMatch(selectedThread);
      setThreadInterviews(ivs);
    } catch {
      alert("面談日程の提案に失敗しました");
    }
  };

  // Update match status
  const handleStatusUpdate = async (matchId: string, newStatus: string) => {
    try {
      await matchApi.updateStatus(matchId, newStatus);
      // Refresh matches
      if (companyId) {
        const updated = await companyMatchApi.list(companyId);
        setMatches(updated);
      }
    } catch {
      alert("ステータス更新に失敗しました");
    }
  };

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

  const handleApprovalPdf = (matchId: string) => {
    router.push(`/company/approval/${matchId}`);
  };

  const handleSuccessFee = async (matchId: string) => {
    if (!companyId) {
      alert("企業IDが見つかりません。");
      return;
    }
    try {
      const { paymentApi } = await import("@/lib/api");
      const result = await paymentApi.createCheckout(companyId, matchId);
      window.location.href = result.checkout_url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "成功報酬決済の開始に失敗しました");
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
      <div className="card p-5 sm:p-6 bg-white border-2 border-indigo-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">企業ダッシュボード</h1>
            <p className="text-sm text-gray-500 mt-1">
              AIスカウト・インボックス・選考管理を一元管理
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

      {/* 4-Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {([
          { key: "matches" as Tab, label: "AIスカウト", icon: "🚀" },
          { key: "inbox" as Tab, label: "インボックス", icon: "💬" },
          { key: "pipeline" as Tab, label: "選考管理", icon: "📊" },
          { key: "postings" as Tab, label: "求人管理", icon: "📝" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSelectedThread(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              tab === t.key ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ━━━━━ AIスカウト タブ ━━━━━ */}
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

      {/* ━━━━━ インボックス タブ ━━━━━ */}
      {tab === "inbox" && (
        <>
          {selectedThread ? (
            // Thread detail view
            <div className="space-y-4">
              <button
                onClick={() => setSelectedThread(null)}
                className="flex items-center gap-2 text-sm text-indigo-600 font-bold hover:text-indigo-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                スレッド一覧に戻る
              </button>

              {/* Thread header */}
              {threadMessages.length > 0 && (
                <div className="card p-4 bg-indigo-50/50 border-indigo-100">
                  <p className="font-bold text-gray-900">{threadMessages[0].posting_title}</p>
                  <p className="text-sm text-gray-500">
                    候補者とのメッセージスレッド — Match ID: {selectedThread.slice(0, 8)}...
                  </p>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-3">
                {threadMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl ${
                      msg.sender_type === "company"
                        ? "bg-indigo-50 border border-indigo-100 ml-8"
                        : "bg-white border border-gray-200 mr-8"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">
                        {msg.sender_type === "company" ? "自社" : msg.sender_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(msg.created_at).toLocaleString("ja-JP")}
                      </span>
                    </div>
                    {msg.subject && (
                      <p className="text-sm font-bold text-gray-900 mb-1">{msg.subject}</p>
                    )}
                    <p className="text-sm text-gray-700 whitespace-pre-line">{msg.body}</p>
                  </div>
                ))}
              </div>

              {/* Interview Schedules */}
              {threadInterviews.length > 0 && (
                <div className="card p-4 sm:p-5 border-cyan-200 bg-cyan-50/30">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    面談日程
                  </h3>
                  {threadInterviews.map((iv) => (
                    <div key={iv.id} className="mb-3 last:mb-0">
                      {iv.status === "confirmed" && iv.selected_time ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-bold text-green-700 flex items-center gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                            確定: {new Date(iv.selected_time).toLocaleString("ja-JP")}
                          </p>
                          {iv.meeting_url && (
                            <a href={iv.meeting_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 underline mt-1 block">
                              ミーティングリンク
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-1">
                            {iv.proposed_by === "company" ? "自社" : "候補者"}が提案（回答待ち）
                          </p>
                          <div className="space-y-1">
                            {iv.proposed_times.map((t, idx) => (
                              <p key={idx} className="text-sm text-gray-700">• {t.datetime}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Interview scheduling form */}
              {showScheduleForm ? (
                <div className="card p-4 sm:p-5 border-2 border-cyan-200">
                  <h3 className="font-bold text-gray-900 mb-3">面談日程を提案</h3>
                  <div className="space-y-3">
                    {scheduleTimes.map((t, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="datetime-local"
                          value={t}
                          onChange={(e) => {
                            const newTimes = [...scheduleTimes];
                            newTimes[idx] = e.target.value;
                            setScheduleTimes(newTimes);
                          }}
                          className="form-input flex-1"
                        />
                        {scheduleTimes.length > 1 && (
                          <button
                            onClick={() => setScheduleTimes(scheduleTimes.filter((_, i) => i !== idx))}
                            className="text-red-500 text-sm px-2"
                          >
                            削除
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setScheduleTimes([...scheduleTimes, ""])}
                      className="text-sm text-indigo-600 font-bold"
                    >
                      + 候補日を追加
                    </button>
                    <input
                      type="url"
                      placeholder="ミーティングURL（任意）"
                      value={scheduleMeetingUrl}
                      onChange={(e) => setScheduleMeetingUrl(e.target.value)}
                      className="form-input"
                    />
                    <textarea
                      placeholder="備考（任意）"
                      value={scheduleNotes}
                      onChange={(e) => setScheduleNotes(e.target.value)}
                      className="form-input h-16 resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleProposeInterview} className="btn-primary px-5 py-2 text-sm">
                        候補日を送信
                      </button>
                      <button onClick={() => setShowScheduleForm(false)} className="btn-secondary px-4 py-2 text-sm">
                        キャンセル
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="btn-secondary px-5 py-2 text-sm flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  面談日程を提案する
                </button>
              )}

              {/* Reply form */}
              <div className="card p-4 sm:p-5">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="form-input h-24 resize-none mb-3"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleCompanyReply}
                    disabled={replying || !replyText.trim()}
                    className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
                  >
                    {replying ? "送信中..." : "送信"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Thread list view
            <>
              {loadingInbox ? (
                <div className="text-center py-12 text-gray-500">読み込み中...</div>
              ) : Object.keys(threads).length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-2">メッセージスレッドはありません</p>
                  <p className="text-sm text-gray-400">
                    AIスカウトタブからスカウトを送信すると、ここにスレッドが表示されます。
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(threads).map(([matchId, msgs]) => {
                    const latest = msgs[msgs.length - 1];
                    const hasEngineerReply = msgs.some((m) => m.sender_type === "engineer");
                    return (
                      <button
                        key={matchId}
                        onClick={() => openThread(matchId)}
                        className="card p-4 sm:p-5 w-full text-left hover:border-indigo-200 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {hasEngineerReply && (
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" title="返信あり" />
                              )}
                              <span className="font-bold text-gray-900 truncate">
                                {latest.posting_title}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 truncate">
                              {latest.sender_type === "company" ? "自社: " : "候補者: "}
                              {latest.body.slice(0, 80)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-gray-400">
                              {new Date(latest.created_at).toLocaleDateString("ja-JP")}
                            </p>
                            <p className="text-xs text-gray-400">{msgs.length}件</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ━━━━━ 選考管理 タブ ━━━━━ */}
      {tab === "pipeline" && (
        <>
          {loadingMatches ? (
            <div className="text-center py-12 text-gray-500">読み込み中...</div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              マッチングデータがありません
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pipeline summary */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PIPELINE_STAGES.map((stage) => {
                  const count = matches.filter((m) => m.status === stage.key).length;
                  return (
                    <div
                      key={stage.key}
                      className={`card p-3 text-center cursor-pointer transition ${
                        filter === stage.key ? "border-indigo-400 bg-indigo-50/50" : ""
                      }`}
                      onClick={() => setFilter(filter === stage.key ? "" : stage.key)}
                    >
                      <div className="text-2xl mb-1">{stage.icon}</div>
                      <div className="text-2xl font-black text-gray-900">{count}</div>
                      <div className="text-xs text-gray-500 font-medium">{stage.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Pipeline cards */}
              <div className="space-y-3">
                {(filter ? matches.filter((m) => m.status === filter) : matches).map((m) => {
                  const st = STATUS_LABELS[m.status] || { label: m.status, color: "bg-gray-100" };
                  const unlocked = m.is_unlocked && "name" in m.candidate;
                  return (
                    <div key={m.id} className="card p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                            unlocked ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-400"
                          }`}>
                            {m.candidate.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${st.color}`}>
                                {st.label}
                              </span>
                              <span className="font-bold text-gray-900 truncate">
                                {unlocked ? (m.candidate as { name: string }).name : `候補者 ${m.candidate.initials}***`}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{m.posting_title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-lg font-black text-indigo-600">{m.ai_score}</span>
                          {/* Status progression buttons */}
                          {m.status === "engineer_interested" && (
                            <button
                              onClick={() => handleStatusUpdate(m.id, "interview_scheduled")}
                              className="text-xs bg-cyan-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-cyan-700 transition"
                            >
                              面談設定
                            </button>
                          )}
                          {m.status === "interview_scheduled" && (
                            <button
                              onClick={() => handleStatusUpdate(m.id, "accepted")}
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-green-700 transition"
                            >
                              成約
                            </button>
                          )}
                          {m.status === "accepted" && (
                            <button
                              onClick={() => handleSuccessFee(m.id)}
                              className="text-xs bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-lg font-bold hover:from-amber-600 hover:to-yellow-600 transition shadow-sm"
                            >
                              成功報酬を決済（¥500,000）
                            </button>
                          )}
                          {!["accepted", "rejected", "withdrawn"].includes(m.status) && (
                            <button
                              onClick={() => handleStatusUpdate(m.id, "rejected")}
                              className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded-lg font-bold hover:bg-red-50 transition"
                            >
                              不成立
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ━━━━━ 求人管理 タブ ━━━━━ */}
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
