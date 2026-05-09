export default function CasesPage() {
  const cases = [
    {
      company: "株式会社AIテクノロジーズ",
      industry: "AI/LLMスタートアップ",
      challenge: "LLM基盤開発チームのシニアエンジニア採用に半年以上苦戦。汎用エージェントでは技術レベルの見極めが困難で、ミスマッチが頻発していた。",
      solution: "AI Matchingのスコアリングエンジンでスキルを多角的に評価。技術スタック適合度の高い候補者を優先的にマッチング。",
      result: "登録から2週間でシニアMLエンジニア2名の採用に成功。AIスコア85以上の候補者のみに絞ったことで、面談通過率が従来の3倍に。",
      score: 92,
      period: "2週間",
    },
    {
      company: "メガバンク系フィンテック企業",
      industry: "金融・フィンテック",
      challenge: "MLOpsエンジニアの市場自体が小さく、専門人材の確保が極めて困難。従来の人材紹介では適切な候補者がほぼゼロだった。",
      solution: "MLOps特化のスキル評価とGitHub活動分析により、潜在的な適合候補者を発掘。カジュアル面談から丁寧にアプローチ。",
      result: "通常6ヶ月以上かかるMLOpsエンジニアの採用を1ヶ月で実現。候補者の満足度も高く、入社後の定着率100%。",
      score: 88,
      period: "1ヶ月",
    },
    {
      company: "大手製造業 AI推進室",
      industry: "製造業",
      challenge: "社内にAI人材がおらず、外部からの採用も知見がないため、求人要件の設計自体が困難だった。",
      solution: "AI Matchingのコンサルティング機能で最適な求人要件を設計。市場データに基づいた年収レンジの設定も支援。",
      result: "コンピュータビジョンの専門家とMLOpsエンジニアの2名を同時採用。AI推進室の立ち上げを3ヶ月で実現。",
      score: 85,
      period: "6週間",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#0f172a]">導入事例</h1>
        <p className="text-gray-500">AI Matchingをご利用いただいた企業様の事例をご紹介します</p>
      </div>

      <div className="space-y-8">
        {cases.map((c, i) => (
          <div key={i} className="card p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#4f46e5]/10 text-[#4f46e5] border border-[#4f46e5]/20">
                    {c.industry}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#0f172a]">{c.company}</h2>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-[#4f46e5]">{c.score}</div>
                  <div className="text-xs text-gray-500">AIスコア</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-[#f59e0b]">{c.period}</div>
                  <div className="text-xs text-gray-500">採用期間</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-red-600 mb-1">課題</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{c.challenge}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-600 mb-1">施策</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{c.solution}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-green-600 mb-1">成果</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{c.result}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="card p-6 sm:p-8 mt-10 text-center bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white">
        <h2 className="text-lg font-bold mb-2">御社でもAI人材採用を加速しませんか？</h2>
        <p className="text-sm text-gray-400 mb-6">
          まずは無料で企業登録。AIスコアリングの精度をお確かめください。
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <a href="/company/register" className="px-6 py-3 bg-[#f59e0b] text-[#0f172a] rounded-xl font-bold hover:bg-[#fbbf24] transition shadow-sm">
            企業登録（無料）
          </a>
          <a href="/contact" className="btn-secondary !text-white !border-white/30 hover:!bg-white/10 px-6 py-3">
            お問い合わせ
          </a>
        </div>
      </div>
    </div>
  );
}
