"use client";

import { useEffect, useState } from "react";
import {
  inboxApi,
  interviewApi,
  type InboxMessage,
  type InterviewSchedule,
} from "@/lib/api";

type View = "list" | "thread";

export default function EngineerInboxPage() {
  const [engineerId, setEngineerId] = useState<string | null>(null);
  const [engineerName, setEngineerName] = useState("");
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Thread view
  const [view, setView] = useState<View>("list");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [thread, setThread] = useState<InboxMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  // Interview
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);
  const [selectingInterview, setSelectingInterview] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("engineer_id");
    const name = localStorage.getItem("engineer_name");
    setEngineerId(id);
    setEngineerName(name || "");
  }, []);

  // Fetch inbox
  useEffect(() => {
    if (!engineerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    inboxApi
      .list(engineerId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [engineerId]);

  // Open thread
  const openThread = async (matchId: string) => {
    setSelectedMatchId(matchId);
    setView("thread");
    setThreadLoading(true);
    try {
      const [msgs, ivs] = await Promise.all([
        inboxApi.thread(matchId),
        interviewApi.listForMatch(matchId),
      ]);
      setThread(msgs);
      setInterviews(ivs);
      // Mark unread messages as read
      for (const msg of msgs) {
        if (!msg.read_at && msg.sender_type === "company") {
          inboxApi.markRead(msg.id).catch(() => {});
        }
      }
    } catch {
      setThread([]);
      setInterviews([]);
    } finally {
      setThreadLoading(false);
    }
  };

  // Send reply
  const handleReply = async () => {
    if (!selectedMatchId || !engineerId || !replyText.trim()) return;
    setReplying(true);
    try {
      await inboxApi.reply(selectedMatchId, engineerId, replyText.trim());
      setReplyText("");
      // Refresh thread
      const msgs = await inboxApi.thread(selectedMatchId);
      setThread(msgs);
    } catch {
      alert("送信に失敗しました");
    } finally {
      setReplying(false);
    }
  };

  // Select interview time
  const handleSelectTime = async (interviewId: string, time: string) => {
    try {
      await interviewApi.select(interviewId, time);
      setSelectingInterview(null);
      // Refresh interviews
      if (selectedMatchId) {
        const ivs = await interviewApi.listForMatch(selectedMatchId);
        setInterviews(ivs);
      }
    } catch {
      alert("日程確定に失敗しました");
    }
  };

  // Group messages by match for list view
  const grouped = messages.reduce<Record<string, InboxMessage[]>>((acc, msg) => {
    if (!acc[msg.match_id]) acc[msg.match_id] = [];
    acc[msg.match_id].push(msg);
    return acc;
  }, {});

  if (!engineerId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">インボックス</h1>
          <p className="text-gray-500 mb-6">
            スカウトを受信するには、まずエンジニア登録が必要です。
          </p>
          <a href="/engineer" className="btn-primary px-6 py-3">
            無料で登録する
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {view === "thread" ? (
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 text-sm text-indigo-600 font-bold hover:text-indigo-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            受信一覧に戻る
          </button>
        ) : (
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">インボックス</h1>
            <p className="text-sm text-gray-500 mt-0.5">{engineerName}さんへのスカウト</p>
          </div>
        )}
      </div>

      {/* List View */}
      {view === "list" && (
        <>
          {loading ? (
            <div className="text-center py-12 text-gray-500">読み込み中...</div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">まだスカウトはありません</p>
              <p className="text-sm text-gray-400">
                企業からのスカウトが届くとここに表示されます。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(grouped).map(([matchId, msgs]) => {
                const latest = msgs[0]; // already sorted desc
                const unread = msgs.filter((m) => !m.read_at && m.sender_type === "company").length;
                return (
                  <button
                    key={matchId}
                    onClick={() => openThread(matchId)}
                    className="card p-4 sm:p-5 w-full text-left hover:border-indigo-200 transition group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {unread > 0 && (
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                          )}
                          <span className="font-bold text-gray-900 truncate">
                            {latest.company_name || "企業"}
                          </span>
                          {latest.ai_score && (
                            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold shrink-0">
                              AI {latest.ai_score.toFixed(0)}点
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-medium truncate">
                          {latest.posting_title}
                        </p>
                        <p className="text-sm text-gray-400 truncate mt-1">
                          {latest.body.slice(0, 100)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">
                          {new Date(latest.created_at).toLocaleDateString("ja-JP")}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {msgs.length}件
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Thread View */}
      {view === "thread" && selectedMatchId && (
        <>
          {threadLoading ? (
            <div className="text-center py-12 text-gray-500">読み込み中...</div>
          ) : (
            <div className="space-y-4">
              {/* Thread header */}
              {thread.length > 0 && (
                <div className="card p-4 bg-indigo-50/50 border-indigo-100">
                  <p className="font-bold text-gray-900">{thread[0].company_name}</p>
                  <p className="text-sm text-gray-600">{thread[0].posting_title}</p>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-3">
                {thread.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl ${
                      msg.sender_type === "company"
                        ? "bg-white border border-gray-200 mr-8"
                        : "bg-indigo-50 border border-indigo-100 ml-8"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">
                        {msg.sender_name}
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
              {interviews.length > 0 && (
                <div className="card p-4 sm:p-5 border-cyan-200 bg-cyan-50/30">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    面談日程
                  </h3>
                  {interviews.map((iv) => (
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
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            {iv.proposed_by === "company" ? "企業" : "あなた"}が提案した候補日:
                          </p>
                          <div className="space-y-2">
                            {iv.proposed_times.map((t, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2.5">
                                <span className="text-sm text-gray-700">
                                  {t.datetime}
                                  {t.duration_min && ` (${t.duration_min}分)`}
                                </span>
                                {iv.proposed_by === "company" && iv.status === "proposed" && (
                                  <button
                                    onClick={() => handleSelectTime(iv.id, t.datetime)}
                                    className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-indigo-700 transition"
                                  >
                                    この日程で確定
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          {iv.notes && (
                            <p className="text-xs text-gray-500 mt-2">{iv.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                    onClick={handleReply}
                    disabled={replying || !replyText.trim()}
                    className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
                  >
                    {replying ? "送信中..." : "返信する"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
