"use client";

import { useEffect, useState } from "react";
import { postingApi, type JobPosting } from "@/lib/api";

const WORK_STYLE_LABELS: Record<string, string> = {
  remote: "フルリモート",
  hybrid: "ハイブリッド",
  onsite: "オンサイト",
};

const AI_DOMAINS = ["すべて", "NLP", "Computer Vision", "LLM", "MLOps", "Recommendation", "Speech", "Robotics", "Data Engineering"];

export default function JobsPage() {
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState("すべて");

  useEffect(() => {
    postingApi
      .list({ active_only: true })
      .then(setPostings)
      .catch(() => setPostings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = domainFilter === "すべて"
    ? postings
    : postings.filter((p) => p.ai_domain.includes(domainFilter));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-green-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          会員登録なしで閲覧可能
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
          AI/ML求人一覧
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          AI・機械学習エンジニアに特化した求人を掲載中。
          気になる求人があれば、無料登録してマッチング精度を確認できます。
        </p>
      </div>

      {/* Domain Filter */}
      <div className="flex gap-2 flex-wrap justify-center mb-8">
        {AI_DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => setDomainFilter(d)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition ${
              domainFilter === d
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="text-center text-sm text-gray-500 mb-6">
        {filtered.length} 件の求人
      </div>

      {/* Job Listings */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">該当する求人はありません</p>
          <a href="/engineer" className="btn-primary px-6 py-3 text-sm">
            エンジニア登録してマッチングを受ける
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <JobCard key={p.id} posting={p} />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <div className="card p-8 sm:p-10 border-2 border-indigo-100 bg-indigo-50/30">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            気になる求人は見つかりましたか？
          </h2>
          <p className="text-gray-600 text-sm mb-6 max-w-lg mx-auto">
            無料登録するだけで、AIがあなたのスキルと求人の適合度をスコアリング。
            最適な企業からアプローチが届きます。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a href="/engineer" className="btn-primary px-8 py-3 text-base">
              無料でエンジニア登録
            </a>
            <a href="/diagnosis" className="btn-secondary px-8 py-3 text-base">
              まず市場価値を診断
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobCard({ posting }: { posting: JobPosting }) {
  return (
    <div className="card p-5 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {posting.ai_domain.map((d) => (
              <span key={d} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                {d}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{posting.title}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{new Date(posting.created_at).toLocaleDateString("ja-JP")} 掲載</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <a
            href="/engineer"
            className="btn-primary px-5 py-2 text-sm"
          >
            応募する（無料）
          </a>
          <span className="text-xs text-gray-400">登録後にAIマッチング</span>
        </div>
      </div>
    </div>
  );
}
