"use client";

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">料金プラン</h1>
        <p className="text-gray-500 text-lg">
          まず無料で体験。価値を実感してから、必要な時だけ課金。
        </p>
      </div>

      {/* Free Tier */}
      <div className="card p-6 sm:p-8 border-2 border-green-200 bg-green-50/30 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">ずっと無料で使える機能</h2>
            <p className="text-sm text-green-700">登録するだけで今すぐ使えます</p>
          </div>
          <span className="ml-auto text-3xl font-black text-green-600">¥0</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
            求人投稿（無制限・何件でも無料）
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
            AIマッチング（自動スコアリング）
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
            候補者の簡易プロフィール閲覧
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
            AIスコア・スキルタグの確認
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
            応募の受付・管理
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
            求人の公開・非公開切替
          </div>
        </div>
        <div className="mt-5">
          <a href="/company/register" className="btn-primary px-6 py-3 text-sm">
            無料で始める
          </a>
        </div>
      </div>

      {/* Paid Plans */}
      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">もっと成果を出したい時に</h2>
      <p className="text-sm text-gray-500 text-center mb-6">候補者に直接アプローチする際にのみ費用が発生します</p>
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {/* Plan 1: 優先アプローチ権 */}
        <div className="card border-2 border-amber-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-xl">
            おすすめ
          </div>
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">優先アプローチ権</h2>
            <p className="text-sm text-gray-500 mb-4">候補者1名あたり</p>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-gray-900">¥30,000</span>
              <span className="text-gray-500 text-sm">（税込）</span>
            </div>

            <ul className="space-y-3 mb-8">
              <PricingFeature text="候補者のフルプロフィール開示" />
              <PricingFeature text="連絡先（メール・電話）の開示" />
              <PricingFeature text="AI技術鑑定書（PDF出力対応）" />
              <PricingFeature text="AIスコア内訳・スキル適合分析" />
              <PricingFeature text="推奨面接質問の自動生成" />
              <PricingFeature text="社内稟議用PDF生成機能" />
              <PricingFeature text="プラットフォーム内アプローチ送信" highlight />
              <PricingFeature text="AIフォローアップ最適化" highlight />
              <PricingFeature text="エンゲージメントインサイト" highlight />
            </ul>

            <a
              href="/company"
              className="btn-gold w-full py-3.5 text-center text-base"
            >
              ダッシュボードで候補者を確認
            </a>
          </div>
        </div>

        {/* Plan 2: 成功報酬 */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">成功報酬プラン</h2>
          <p className="text-sm text-gray-500 mb-4">採用成約時のみ</p>

          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-black text-gray-900">¥500,000</span>
            <span className="text-gray-500 text-sm">（税込）</span>
          </div>

          <ul className="space-y-3 mb-8">
            <PricingFeature text="採用成約時のみ費用発生" />
            <PricingFeature text="一般エージェント（年収の30〜35%）と比較して大幅削減" />
            <PricingFeature text="不成立の場合は費用ゼロ" />
            <PricingFeature text="請求書払い対応" />
          </ul>

          <a
            href="/contact"
            className="btn-secondary w-full py-3.5 text-center text-base"
          >
            お問い合わせ
          </a>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">他サービスとの比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">項目</th>
                <th className="py-3 px-4 text-center font-bold text-indigo-600 bg-indigo-50 rounded-t-xl">AI Matching</th>
                <th className="py-3 px-4 text-center text-gray-600">一般エージェント</th>
                <th className="py-3 px-4 text-center text-gray-600">求人サイト</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <ComparisonRow
                label="初期費用"
                values={["無料", "無料〜数十万円", "20〜100万円/年"]}
                highlight={0}
              />
              <ComparisonRow
                label="アプローチ費用"
                values={["¥30,000/人", "無料（成約時に高額）", "ポイント制"]}
                highlight={0}
              />
              <ComparisonRow
                label="成約時コスト"
                values={["¥500,000固定", "年収の30〜35%", "なし"]}
                highlight={0}
              />
              <ComparisonRow
                label="年収600万の場合"
                values={["¥530,000", "¥1,800,000〜", "掲載費のみ"]}
                highlight={0}
              />
              <ComparisonRow
                label="AI技術鑑定書"
                values={["付属", "なし", "なし"]}
                highlight={0}
              />
              <ComparisonRow
                label="AI/ML特化スコアリング"
                values={["100点満点多軸", "担当者の主観", "なし"]}
                highlight={0}
              />
              <ComparisonRow
                label="返信率最適化AI"
                values={["搭載", "なし", "なし"]}
                highlight={0}
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Value */}
      <div className="card p-6 sm:p-8 border-2 border-indigo-100 bg-indigo-50/30">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          なぜプラットフォーム経由のアプローチが有利なのか
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">AI返信率最適化</h4>
            <p className="text-xs text-gray-600">候補者の行動データに基づき、最適な連絡タイミングとトーンをAIがアドバイス</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">フォローアップ管理</h4>
            <p className="text-xs text-gray-600">返信がない場合の最適なフォローアップタイミングをAIが自動提案</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">継続的な技術分析</h4>
            <p className="text-xs text-gray-600">候補者の最新スキルアップデートやGitHub活動に基づく週次レポート</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">よくある質問</h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          <FaqItem
            q="求人掲載に費用はかかりますか？"
            a="求人掲載・AIマッチングの実行は完全無料です。費用が発生するのは、候補者にアプローチする際（¥30,000/人）と採用成約時（¥500,000）のみです。"
          />
          <FaqItem
            q="アプローチ権を購入したら、どこまで情報が見られますか？"
            a="候補者のフルネーム、連絡先（メール・電話）、GitHub URL、希望年収、職務経歴、AI技術鑑定書（スコア内訳・スキル分析・推奨面接質問）のすべてが開示されます。"
          />
          <FaqItem
            q="プラットフォーム外で直接連絡を取ることはできますか？"
            a="連絡先は開示されますが、プラットフォーム経由でのアプローチを推奨しています。AI返信率最適化やフォローアップ管理など、プラットフォーム限定の機能により、返信率が平均40%向上します。"
          />
          <FaqItem
            q="請求書払いは可能ですか？"
            a="成功報酬プランでは請求書払いに対応しています。アプローチ権はクレジットカード決済（Stripe）となります。"
          />
        </div>
      </div>
    </div>
  );
}

function PricingFeature({ text, highlight }: { text: string; highlight?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={highlight ? "#f59e0b" : "#22c55e"} strokeWidth="2.5" className="mt-0.5 shrink-0">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span className={`text-sm ${highlight ? "font-bold text-amber-800" : "text-gray-700"}`}>{text}</span>
    </li>
  );
}

function ComparisonRow({ label, values, highlight }: { label: string; values: string[]; highlight: number }) {
  return (
    <tr>
      <td className="py-3 px-4 text-gray-600 font-medium">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-3 px-4 text-center ${
            i === highlight ? "font-bold text-indigo-700 bg-indigo-50/50" : "text-gray-600"
          }`}
        >
          {v}
        </td>
      ))}
    </tr>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="card p-0 group">
      <summary className="cursor-pointer px-5 py-4 flex items-center justify-between gap-3 text-sm font-bold text-gray-900">
        {q}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 transition-transform group-open:rotate-180">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{a}</div>
    </details>
  );
}
