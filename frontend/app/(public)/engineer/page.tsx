"use client";

import { useState } from "react";
import { engineerApi, type EngineerCreate } from "@/lib/api";

const AI_SPECIALTIES = ["NLP", "Computer Vision", "LLM", "MLOps", "Recommendation", "Speech", "Robotics", "Data Engineering"];
const FRAMEWORKS = ["PyTorch", "TensorFlow", "JAX", "LangChain", "Hugging Face", "scikit-learn", "OpenCV", "Ray"];
const LEVELS = [
  { value: "junior", label: "Junior（0-2年）" },
  { value: "mid", label: "Mid（3-5年）" },
  { value: "senior", label: "Senior（6-9年）" },
  { value: "lead", label: "Lead（10年+）" },
  { value: "executive", label: "Executive（CTO/VP級）" },
];

export default function EngineerRegistration() {
  const [form, setForm] = useState<EngineerCreate>({
    name: "",
    email: "",
    experience_level: "mid",
    years_of_experience: 3,
    ai_specialties: [],
    preferred_frameworks: [],
    desired_salary_min: undefined,
    desired_salary_max: undefined,
    desired_work_style: "hybrid",
    bio: "",
    github_url: "",
    x_handle: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggle = (field: "ai_specialties" | "preferred_frameworks", value: string) => {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await engineerApi.create(form);
      localStorage.setItem("engineer_id", result.id);
      localStorage.setItem("engineer_name", form.name);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
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
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">登録完了</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            AIマッチングエンジンがあなたに最適な求人を探します。
            <br />
            マッチングが見つかり次第ご連絡いたします。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/engineer/inbox" className="btn-primary px-6 py-3">
              インボックスを開く
            </a>
            <a href="/diagnosis" className="btn-secondary px-6 py-3">
              無料で市場価値を診断する
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold mb-1 text-[#0f172a]">エンジニア登録</h1>
      <p className="text-sm text-gray-500 mb-6">登録は無料です。AI/MLに特化したスカウトが届きます。</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            {error}
          </div>
        )}

        {/* 基本情報 */}
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-bold text-lg text-[#0f172a]">基本情報</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">名前 *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">メール *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">GitHub URL</label>
              <input
                type="url"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                className="form-input"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">X (Twitter)</label>
              <input
                type="text"
                value={form.x_handle}
                onChange={(e) => setForm({ ...form, x_handle: e.target.value })}
                className="form-input"
                placeholder="@username"
              />
            </div>
          </div>
        </div>

        {/* 経験 */}
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-bold text-lg text-[#0f172a]">経験・スキル</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">経験レベル *</label>
              <select
                value={form.experience_level}
                onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
                className="form-input"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">経験年数 *</label>
              <input
                type="number"
                min={0}
                max={40}
                value={form.years_of_experience}
                onChange={(e) => setForm({ ...form, years_of_experience: Number(e.target.value) })}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#0f172a]">AI専門領域</label>
            <div className="flex flex-wrap gap-2">
              {AI_SPECIALTIES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggle("ai_specialties", s)}
                  className={`px-3 py-1.5 rounded-full text-sm border-2 transition font-medium ${
                    form.ai_specialties.includes(s)
                      ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#4f46e5]/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#0f172a]">フレームワーク</label>
            <div className="flex flex-wrap gap-2">
              {FRAMEWORKS.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => toggle("preferred_frameworks", f)}
                  className={`px-3 py-1.5 rounded-full text-sm border-2 transition font-medium ${
                    form.preferred_frameworks.includes(f)
                      ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#4f46e5]/50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 希望条件 */}
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-bold text-lg text-[#0f172a]">希望条件</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">希望年収（下限・万円）</label>
              <input
                type="number"
                value={form.desired_salary_min ?? ""}
                onChange={(e) =>
                  setForm({ ...form, desired_salary_min: e.target.value ? Number(e.target.value) : undefined })
                }
                className="form-input"
                placeholder="600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">希望年収（上限・万円）</label>
              <input
                type="number"
                value={form.desired_salary_max ?? ""}
                onChange={(e) =>
                  setForm({ ...form, desired_salary_max: e.target.value ? Number(e.target.value) : undefined })
                }
                className="form-input"
                placeholder="1200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">勤務形態</label>
            <select
              value={form.desired_work_style}
              onChange={(e) => setForm({ ...form, desired_work_style: e.target.value })}
              className="form-input"
            >
              <option value="remote">フルリモート</option>
              <option value="hybrid">ハイブリッド</option>
              <option value="onsite">オンサイト</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">自己紹介</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="form-input h-24 resize-none"
              placeholder="経歴やプロジェクトの概要など"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3.5 text-base"
        >
          登録する
        </button>
        <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          SSL暗号化通信で安全に送信されます
        </p>
      </form>
    </div>
  );
}
