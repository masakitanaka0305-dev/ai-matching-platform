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
      setCompanyId(company.id);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">&#127970;</div>
        <h2 className="text-2xl font-bold mb-2">企業登録完了</h2>
        <p className="text-gray-600 mb-6">
          求人を作成し、AIマッチングエンジンがAI人材をご紹介します。
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/company"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium"
          >
            ダッシュボードへ
          </a>
          <a
            href={`/company/postings/new?company_id=${companyId}`}
            className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-medium"
          >
            求人を作成する
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">企業登録</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        )}

        <div className="bg-white p-6 rounded-xl border space-y-4">
          <h2 className="font-bold text-lg">企業情報</h2>
          <div>
            <label className="block text-sm font-medium mb-1">企業名 *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">担当者名 *</label>
              <input
                type="text"
                required
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">担当者メール *</label>
              <input
                type="email"
                required
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">業種</label>
              <select
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">選択してください</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">従業員数</label>
              <input
                type="number"
                min={1}
                value={form.employee_count ?? ""}
                onChange={(e) =>
                  setForm({ ...form, employee_count: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Webサイト</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">企業紹介</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 h-24"
              placeholder="事業内容やAI活用の方針など"
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
