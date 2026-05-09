export default function Home() {
  return (
    <div className="space-y-0">
      {/* Hero — ホワイトベース */}
      <section className="relative bg-white overflow-hidden">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(79,70,229,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,.2) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500 opacity-[0.05] blur-[120px]" />

        <div className="relative max-w-5xl mx-auto text-center py-20 sm:py-28 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight text-gray-900">
            AI/MLエンジニア専門
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">マッチング</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            1,200名以上のAI/MLエンジニアと300社以上の企業が利用する、
            <br className="hidden sm:block" />
            AI人材に特化したマッチングプラットフォーム。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
            <a href="/engineer" className="btn-primary text-base px-8 sm:px-10 py-4">
              エンジニア登録
            </a>
            <a href="/diagnosis" className="btn-secondary text-base px-8 sm:px-10 py-4">
              無料で市場価値診断
            </a>
          </div>
        </div>
      </section>

      {/* 導入企業ロゴバー */}
      <section className="bg-white border-b border-gray-100 py-8 sm:py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-6">
            導入企業・パートナー
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap opacity-40 grayscale">
            {["TechCorp", "AI Labs", "DataFlow", "NeuralSoft", "CloudAI"].map((name) => (
              <span key={name} className="text-lg sm:text-xl font-bold text-gray-600 tracking-wide">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* サービスの流れ */}
      <section className="py-16 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#0f172a]">サービスの流れ</h2>
          <p className="text-gray-500 mb-12 sm:mb-16">3ステップで最適な企業とマッチング</p>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            {/* Step 1 */}
            <div className="card p-6 sm:p-8 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#4f46e5]/10 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#4f46e5] text-white text-xs font-bold flex items-center justify-center shadow-md">
                  1
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#0f172a]">プロフィール登録</h3>
              <p className="text-sm text-gray-600 mb-3">
                技術スタック・実装経験・希望条件を登録。GitHub連携で自動的にスキルを分析します。
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  所要時間：約5分
                </li>
                <li className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  完全無料
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="card p-6 sm:p-8 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#4f46e5]/10 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#4f46e5] text-white text-xs font-bold flex items-center justify-center shadow-md">
                  2
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#0f172a]">AI分析＆マッチング</h3>
              <p className="text-sm text-gray-600 mb-3">
                あなたのスキルと企業の技術要件をAIが多次元分析。適合度の高い企業から優先アプローチが届きます。
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  技術スタック適合度
                </li>
                <li className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  年収・開発環境の相性
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="card p-6 sm:p-8 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#4f46e5]/10 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#4f46e5] text-white text-xs font-bold flex items-center justify-center shadow-md">
                  3
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#0f172a]">企業と面談・選考</h3>
              <p className="text-sm text-gray-600 mb-3">
                興味のある企業とカジュアル面談を実施。技術的な質問や開発環境について直接確認できます。
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  オンライン面談可能
                </li>
                <li className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  選考サポート付き
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 実績バナー */}
      <section className="bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#4f46e5] py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
          <div>
            <div className="text-3xl sm:text-4xl font-black">1,200+</div>
            <div className="text-sm mt-1 text-indigo-200">登録エンジニア数</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black">300+</div>
            <div className="text-sm mt-1 text-indigo-200">提携企業数</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black">92%</div>
            <div className="text-sm mt-1 text-indigo-200">マッチング満足度</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black">48h</div>
            <div className="text-sm mt-1 text-indigo-200">平均マッチング時間</div>
          </div>
        </div>
      </section>

      {/* マッチングする企業 */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#0f172a]">マッチングする企業</h2>
          <p className="text-gray-500 mb-12">幅広い業界・規模の企業が登録中</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="card p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h4 className="font-bold mb-1 text-[#0f172a]">AI/LLMスタートアップ</h4>
              <p className="text-xs text-gray-500">最新技術を使った開発、急成長中の環境</p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a4 4 0 00-8 0v2" />
                </svg>
              </div>
              <h4 className="font-bold mb-1 text-[#0f172a]">大手テック企業</h4>
              <p className="text-xs text-gray-500">安定した環境、充実した待遇</p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                </svg>
              </div>
              <h4 className="font-bold mb-1 text-[#0f172a]">研究開発型企業</h4>
              <p className="text-xs text-gray-500">論文化・特許取得を目指す環境</p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h4 className="font-bold mb-1 text-[#0f172a]">事業会社のAI部門</h4>
              <p className="text-xs text-gray-500">ビジネスインパクトの大きい開発</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Matchingを選ぶ理由 */}
      <section className="bg-gray-50 py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-12 text-[#0f172a]">AI Matchingを選ぶ理由</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card p-6 text-left border-l-4 border-l-[#4f46e5]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#4f46e5]/10 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h4 className="font-bold text-[#0f172a]">AI特化のスコアリング</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                汎用マッチングでは測れないAI/ML固有のスキルセットを100点満点で多角的に評価。ノイズのない精度の高いマッチングを実現します。
              </p>
            </div>
            <div className="card p-6 text-left border-l-4 border-l-[#22c55e]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h4 className="font-bold text-[#0f172a]">エンジニア完全無料</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                登録・診断・マッチングまですべて無料。費用は採用企業側のみが負担するため、エンジニアは安心して利用できます。
              </p>
            </div>
            <div className="card p-6 text-left border-l-4 border-l-[#f59e0b]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h4 className="font-bold text-[#0f172a]">市場価値の可視化</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                無料診断であなたのAIスキルの市場価値をスコアリング。推定年収レンジや業界内ポジションを即座に把握できます。
              </p>
            </div>
            <div className="card p-6 text-left border-l-4 border-l-[#8b5cf6]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <h4 className="font-bold text-[#0f172a]">カジュアル面談から</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                まずはカジュアル面談で双方の相性を確認。技術的な深い話ができる場を提供し、ミスマッチを防ぎます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* お客様の声 */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#0f172a]">お客様の声</h2>
          <p className="text-gray-500 mb-12">実際にご利用いただいた方々の声をご紹介</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                name: "田中 太郎",
                role: "MLエンジニア / 6年目",
                text: "市場価値診断で自分の強みと弱みを客観的に把握でき、年収交渉の材料にもなりました。マッチした企業の質も高く、3社から内定をいただけました。",
                stars: 5,
              },
              {
                name: "佐藤 花子",
                role: "AIリサーチャー / 4年目",
                text: "NLP特化のポジションが豊富で驚きました。大手エージェントでは見つからなかった研究開発型の企業とマッチングでき、理想的な転職ができました。",
                stars: 5,
              },
              {
                name: "鈴木 一郎",
                role: "採用責任者 / AI企業",
                text: "AIスコアリングの精度が高く、紹介いただく候補者の質が他社と段違いです。採用コストの削減にも繋がっています。",
                stars: 5,
              },
            ].map((review, i) => (
              <div key={i} className="card p-6 text-left">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: review.stars }).map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">{review.text}</p>
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[#4f46e5] font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0f172a]">{review.name}</div>
                    <div className="text-xs text-gray-500">{review.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最終CTA — ホワイトベース */}
      <section className="relative bg-white overflow-hidden border-t border-gray-100">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500 opacity-[0.04] blur-[100px]" />
        <div className="relative max-w-3xl mx-auto text-center py-16 sm:py-24 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            あなたのキャリアを、
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">次のステージへ。</span>
          </h2>
          <p className="text-gray-500 mb-10 leading-relaxed">
            AI/MLエンジニアとしての市場価値を無料で診断。
            <br className="hidden sm:block" />
            最適な企業との出会いが、ここから始まります。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/engineer" className="btn-primary text-base px-10 py-4">
              エンジニア登録（無料）
            </a>
            <a href="/company/register" className="btn-secondary text-base px-10 py-4">
              企業の方はこちら
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
