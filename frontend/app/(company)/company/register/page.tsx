"use client";

import { useState } from "react";
import { companyApi, type CompanyCreate } from "@/lib/api";

const INDUSTRIES = [
  "IT・ソフトウェア",
  "AI・機械学習",
  "金融・フィンテック",
  "製造業",
  "医療・ヘルスケア",
  "教育",
  "コンサルティング",
  "広告・メディア",
  "その他",
];

export default function CompanyRegisterPage() {
  const [form, setForm] = useState<CompanyCreate>({
    name: "",
    contact_name: "",
    contact_email: "",
    website: "",
    industry: "",
    employee_count: undefined,
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const company = await companyApi.create(form);
      localStorage.setItem("company_id", company.id);
      setCompanyId(company.id);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <div className="card inline-flex p-8 flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#4f46e5]/10 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a4 4 0 00-8 0v2" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">企業登録完了</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            求人を作成し、AIマッチングエンジンがAI人材をご紹介します。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href="/company"
              className="btn-primary px-6 py-3"
            >
              ダッシュボードへ
            </a>
            <a
              href={`/company/postings/new?company_id=${companyId}`}
              className="btn-secondary px-6 py-3"
            >
              求人を作成する
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold mb-1 text-[#0f172a]">企業登録</h1>
      <p className="text-sm text-gray-500 mb-6">AI/MLに特化した人材マッチングをご利用いただけます。</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            {error}
          </div>
        )}

        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-bold text-lg text-[#0f172a]">企業情報</h2>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">企業名 *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">担当者名 *</label>
              <input
                type="text"
                required
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">担当者メール *</label>
              <input
                type="email"
                required
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">業種</label>
              <select
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="form-input"
              >
                <option value="">選択してください</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">従業員数</label>
              <input
                type="number"
                min={1}
                value={form.employee_count ?? ""}
                onChange={(e) =>
                  setForm({ ...form, employee_count: e.target.value ? Number(e.target.value) : undefined })
                }
                className="form-input"
                placeholder="100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">Webサイト</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="form-input"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">企業紹介</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-input h-24 resize-none"
              placeholder="事業内容やAI活用の方針など"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3.5 text-base"
        >
          登録する
        </button>
      </form>
    </div>
  );
}
