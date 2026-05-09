"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { postingApi, type JobPostingCreate } from "@/lib/api";

const AI_DOMAINS = ["NLP", "Computer Vision", "LLM", "MLOps", "Recommendation", "Speech", "Robotics", "Data Engineering"];
const TECH_STACKS = ["PyTorch", "TensorFlow", "JAX", "LangChain", "Hugging Face", "scikit-learn", "OpenCV", "Ray", "Kubernetes", "AWS SageMaker"];

export default function NewPostingPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">読み込み中...</div>}>
      <NewPostingForm />
    </Suspense>
  );
}

function NewPostingForm() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("company_id") || "";

  const [form, setForm] = useState<JobPostingCreate>({
    company_id: companyId,
    title: "",
    description: "",
    experience_level_min: "mid",
    salary_min: undefined,
    salary_max: undefined,
    work_style: "hybrid",
    location: "",
    ai_domain: [],
    tech_stack: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggleArray = (field: "ai_domain" | "tech_stack", value: string) => {
    setForm((prev) => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.company_id) {
      setError("企業IDが必要です。先に企業登録を行ってください。");
      return;
    }
    try {
      await postingApi.create(form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <div className="card inline-flex p-8 flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">求人作成完了</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            AIマッチングエンジンが最適な候補者を自動スコアリングします。
          </p>
          <a href="/company" className="btn-primary px-6 py-3">
            ダッシュボードへ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold mb-1 text-[#0f172a]">求人作成</h1>
      <p className="text-sm text-gray-500 mb-6">AI/MLエンジニアに最適化された求人を作成します。</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            {error}
          </div>
        )}

        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-bold text-lg text-[#0f172a] flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            求人情報
          </h2>

          {!companyId && (
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">企業ID *</label>
              <input
                type="text"
                required
                value={form.company_id}
                onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                className="form-input"
                placeholder="企業登録時に発行されたID"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">求人タイトル *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="form-input"
              placeholder="例: シニアMLエンジニア（LLM基盤開発）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">求人詳細 *</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-input h-32 resize-none"
              placeholder="業務内容・求めるスキル・チーム体制など"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">最低経験レベル</label>
              <select
                value={form.experience_level_min}
                onChange={(e) => setForm({ ...form, experience_level_min: e.target.value })}
                className="form-input"
              >
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">勤務形態</label>
              <select
                value={form.work_style}
                onChange={(e) => setForm({ ...form, work_style: e.target.value })}
                className="form-input"
              >
                <option value="remote">フルリモート</option>
                <option value="hybrid">ハイブリッド</option>
                <option value="onsite">オンサイト</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">年収下限（万円）</label>
              <input
                type="number"
                value={form.salary_min ?? ""}
                onChange={(e) =>
                  setForm({ ...form, salary_min: e.target.value ? Number(e.target.value) : undefined })
                }
                className="form-input"
                placeholder="600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">年収上限（万円）</label>
              <input
                type="number"
                value={form.salary_max ?? ""}
                onChange={(e) =>
                  setForm({ ...form, salary_max: e.target.value ? Number(e.target.value) : undefined })
                }
                className="form-input"
                placeholder="1200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">勤務地</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="form-input"
              placeholder="東京都渋谷区"
            />
          </div>
        </div>

        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-bold text-lg text-[#0f172a] flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            技術要件
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#0f172a]">AI領域</label>
            <div className="flex flex-wrap gap-2">
              {AI_DOMAINS.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleArray("ai_domain", d)}
                  className={`px-3 py-1.5 rounded-full text-sm border-2 transition font-medium ${
                    form.ai_domain?.includes(d)
                      ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#4f46e5]/50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#0f172a]">技術スタック</label>
            <div className="flex flex-wrap gap-2">
              {TECH_STACKS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleArray("tech_stack", t)}
                  className={`px-3 py-1.5 rounded-full text-sm border-2 transition font-medium ${
                    form.tech_stack?.includes(t)
                      ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#4f46e5]/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3.5 text-base"
        >
          求人を作成する
        </button>
      </form>
    </div>
  );
}
