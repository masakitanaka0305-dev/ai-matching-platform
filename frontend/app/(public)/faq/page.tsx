"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    category: "エンジニアの方",
    questions: [
      {
        q: "利用料金はかかりますか？",
        a: "エンジニアの方は完全無料でご利用いただけます。登録、市場価値診断、マッチングまですべて無料です。費用は採用企業側のみが負担する成功報酬型のため、エンジニアの方に費用が発生することはありません。",
      },
      {
        q: "登録にはどのくらい時間がかかりますか？",
        a: "基本情報の登録は約5分で完了します。GitHub連携をしていただくと、AIが自動的にスキルを分析し、より精度の高いマッチングが可能になります。",
      },
      {
        q: "市場価値診断とは何ですか？",
        a: "5つの質問に回答するだけで、あなたのAI/MLエンジニアとしての市場価値をスコアリングします。推定年収レンジ、業界内ポジション、スキル別評価、マッチング可能企業数などを即座に確認できます。登録不要で、個人情報の入力も不要です。",
      },
      {
        q: "どのような企業とマッチングできますか？",
        a: "AI/LLMスタートアップ、大手テック企業、研究開発型企業、事業会社のAI部門など、幅広い業界・規模の300社以上の企業が登録しています。AIスコアリングにより、あなたのスキルセットに最適な企業を優先的にご紹介します。",
      },
      {
        q: "現在転職を考えていなくても登録できますか？",
        a: "はい、もちろんです。市場価値の把握やキャリアの選択肢を知るためにご登録いただくことも可能です。すぐに転職する必要はありません。",
      },
    ],
  },
  {
    category: "企業の方",
    questions: [
      {
        q: "料金体系を教えてください。",
        a: "成功報酬型の料金体系です。マッチングが成立し、採用に至った場合にのみ費用が発生します。求人掲載やスカウト送信は無料です。詳細はお問い合わせください。",
      },
      {
        q: "AIスコアリングとは何ですか？",
        a: "AI/ML分野に特化した独自のスコアリングエンジンで、エンジニアのスキルセットと企業の技術要件を多次元的に分析します。技術スタック適合度、経験レベル、プロジェクト規模、専門領域の深さなどを100点満点で評価し、精度の高いマッチングを実現します。",
      },
      {
        q: "マッチングにはどのくらい時間がかかりますか？",
        a: "平均48時間以内に最初のマッチング候補をご提案します。AIスコアリングにより、適合度の高い候補者から優先的にご紹介するため、効率的な採用活動が可能です。",
      },
      {
        q: "どのような職種に対応していますか？",
        a: "NLP、コンピュータビジョン、LLM/生成AI、MLOps、推薦システム、音声処理、ロボティクス、データエンジニアリングなど、AI/ML分野の幅広い職種に対応しています。",
      },
    ],
  },
  {
    category: "サービス全般",
    questions: [
      {
        q: "個人情報は安全に管理されていますか？",
        a: "はい。SSL暗号化通信を使用し、ISO 27001に準拠したセキュリティ体制でお客様の情報を保護しています。詳細はプライバシーポリシーをご確認ください。",
      },
      {
        q: "退会はできますか？",
        a: "はい、いつでも退会可能です。お問い合わせフォームから退会申請をいただければ、速やかに対応いたします。退会後、登録情報は当社のプライバシーポリシーに従い適切に処理します。",
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm font-bold text-[#0f172a]">{q}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#0f172a]">よくある質問</h1>
      <p className="text-sm text-gray-500 mb-10">
        お問い合わせの前に、こちらをご確認ください。
      </p>

      <div className="space-y-8">
        {FAQ_ITEMS.map((section) => (
          <div key={section.category}>
            <h2 className="text-lg font-bold mb-4 text-[#4f46e5] flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#4f46e5] rounded-full" />
              {section.category}
            </h2>
            <div className="card p-5 sm:p-6">
              {section.questions.map((item) => (
                <AccordionItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 sm:p-8 mt-10 text-center bg-gray-50">
        <p className="text-sm text-gray-600 mb-4">
          解決しない場合はお気軽にお問い合わせください。
        </p>
        <a href="/contact" className="btn-primary px-6 py-3 text-sm">
          お問い合わせ
        </a>
      </div>
    </div>
  );
}
