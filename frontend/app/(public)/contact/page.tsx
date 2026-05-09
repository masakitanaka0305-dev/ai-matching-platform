"use client";

import { useState } from "react";

const INQUIRY_TYPES = [
  "サービスについて",
  "エンジニア登録について",
  "企業利用について",
  "料金について",
  "技術的な問題",
  "退会について",
  "その他",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">送信完了</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            お問い合わせを受け付けました。
            <br />
            通常2営業日以内にご返信いたします。
          </p>
          <a href="/" className="btn-primary px-6 py-3">
            トップページへ戻る
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#0f172a]">お問い合わせ</h1>
      <p className="text-sm text-gray-500 mb-8">
        ご質問・ご要望がございましたら、以下のフォームよりお気軽にお問い合わせください。
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">お問い合わせ種別 *</label>
            <select required className="form-input">
              <option value="">選択してください</option>
              {INQUIRY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">お名前 *</label>
              <input type="text" required className="form-input" placeholder="山田 太郎" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#0f172a]">メールアドレス *</label>
              <input type="email" required className="form-input" placeholder="example@email.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">会社名（任意）</label>
            <input type="text" className="form-input" placeholder="株式会社〇〇" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#0f172a]">お問い合わせ内容 *</label>
            <textarea
              required
              className="form-input h-32 resize-none"
              placeholder="お問い合わせ内容をご記入ください"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3.5 text-base">
          送信する
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
