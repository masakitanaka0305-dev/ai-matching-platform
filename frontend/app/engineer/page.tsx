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
      await engineerApi.create(form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">登録完了</h2>
        <p className="text-gray-600">
          AIマッチングエンジンがあなたに最適な求人を探します。
          マッチングが見つかり次第ご連絡いたします。
        </p>
        <a href="/diagnosis" className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg">
          無料で市場価値を診断する →
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">エンジニア登録</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        )}

        {/* 基本情報 */}
        <div className="bg-white p-6 rounded-xl border space-y-4">
          <h2 className="font-bold text-lg">基本情報</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">名前 *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">メール *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">GitHub URL</label>
              <input
                type="url"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">X (Twitter)</label>
              <input
                type="text"
                value={form.x_handle}
                onChange={(e) => setForm({ ...form, x_handle: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="@username"
              />
            </div>
          </div>
        </div>

        {/* 経験 */}
        <div className="bg-white p-6 rounded-xl border space-y-4">
          <h2 className="font-bold text-lg">経験・スキル</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">経験レベル *</label>
              <select
                value={form.experience_level}
                onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">経験年数 *</label>
              <input
                type="number"
                min={0}
                max={40}
                value={form.years_of_experience}
                onChange={(e) => setForm({ ...form, years_of_experience: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">AI専門領域</label>
            <div className="flex flex-wrap gap-2">
              {AI_SPECIALTIES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggle("ai_specialties", s)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    form.ai_specialties.includes(s)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 hover:border-indigo-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">フレームワーク</label>
            <div className="flex flex-wrap gap-2">
              {FRAMEWORKS.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => toggle("preferred_frameworks", f)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    form.preferred_frameworks.includes(f)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 hover:border-indigo-400"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 希望条件 */}
        <div className="bg-white p-6 rounded-xl border space-y-4">
          <h2 className="font-bold text-lg">希望条件</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">希望年収（下限・万円）</label>
              <input
                type="number"
                value={form.desired_salary_min ?? ""}
                onChange={(e) =>
                  setForm({ ...form, desired_salary_min: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">希望年収（上限・万円）</label>
              <input
                type="number"
                value={form.desired_salary_max ?? ""}
                onChange={(e) =>
                  setForm({ ...form, desired_salary_max: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="1200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">勤務形態</label>
            <select
              value={form.desired_work_style}
              onChange={(e) => setForm({ ...form, desired_work_style: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="remote">フルリモート</option>
              <option value="hybrid">ハイブリッド</option>
              <option value="onsite">オンサイト</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">自己紹介</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 h-24"
              placeholder="経歴やプロジェクトの概要など"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          登録する
        </button>
      </form>
    </div>
  );
}
