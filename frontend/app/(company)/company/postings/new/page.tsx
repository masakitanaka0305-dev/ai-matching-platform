"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { postingApi, type JobPostingCreate } from "@/lib/api";

const AI_DOMAINS = ["NLP", "Computer Vision", "LLM", "MLOps", "Recommendation", "Speech", "Robotics", "Data Engineering"];
const TECH_STACKS = ["PyTorch", "TensorFlow", "JAX", "LangChain", "Hugging Face", "scikit-learn", "OpenCV", "Ray", "Kubernetes", "AWS SageMaker"];

export default function NewPostingPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">読み込み中...</div>}>
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
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">&#9989;</div>
        <h2 className="text-2xl font-bold mb-2">求人作成完了</h2>
        <p className="text-gray-600 mb-6">
          AIマッチングエンジンが最適な候補者を自動スコアリングします。
        </p>
        <a href="/company" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium">
          ダッシュボードへ
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">求人作成</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        )}

        <div className="bg-white p-4 sm:p-6 rounded-xl border space-y-4">
          <h2 className="font-bold text-lg">求人情報</h2>

          {!companyId && (
            <div>
              <label className="block text-sm font-medium mb-1">企業ID *</label>
              <input
                type="text"
                required
                value={form.company_id}
                onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="企業登録時に発行されたID"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">求人タイトル *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="例: シニアMLエンジニア（LLM基盤開発）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">求人詳細 *</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 h-32"
              placeholder="業務内容・求めるスキル・チーム体制など"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">最低経験レベル</label>
              <select
                value={form.experience_level_min}
                onChange={(e) => setForm({ ...form, experience_level_min: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">勤務形態</label>
              <select
                value={form.work_style}
                onChange={(e) => setForm({ ...form, work_style: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="remote">フルリモート</option>
                <option value="hybrid">ハイブリッド</option>
                <option value="onsite">オンサイト</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">年収下限（万円）</label>
              <input
                type="number"
                value={form.salary_min ?? ""}
                onChange={(e) =>
                  setForm({ ...form, salary_min: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">年収上限（万円）</label>
              <input
                type="number"
                value={form.salary_max ?? ""}
                onChange={(e) =>
                  setForm({ ...form, salary_max: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="1200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">勤務地</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="東京都渋谷区"
            />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border space-y-4">
          <h2 className="font-bold text-lg">技術要件</h2>

          <div>
            <label className="block text-sm font-medium mb-2">AI領域</label>
            <div className="flex flex-wrap gap-2">
              {AI_DOMAINS.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleArray("ai_domain", d)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    form.ai_domain?.includes(d)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 hover:border-indigo-400"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">技術スタック</label>
            <div className="flex flex-wrap gap-2">
              {TECH_STACKS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleArray("tech_stack", t)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    form.tech_stack?.includes(t)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 hover:border-indigo-400"
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
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          求人を作成する
        </button>
      </form>
    </div>
  );
}
