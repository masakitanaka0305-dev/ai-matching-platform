export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-[#0f172a]">運営会社</h1>

      <div className="card p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold mb-4 text-[#0f172a]">会社概要</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {[
              ["会社名", "AI Matching株式会社"],
              ["設立", "2024年4月"],
              ["代表取締役", "田中 将貴"],
              ["所在地", "東京都渋谷区神宮前6丁目"],
              ["事業内容", "AI/MLエンジニア特化型マッチングプラットフォームの開発・運営"],
              ["資本金", "1,000万円"],
              ["従業員数", "15名（業務委託含む）"],
            ].map(([label, value]) => (
              <tr key={label}>
                <td className="py-3 pr-4 font-medium text-gray-500 whitespace-nowrap w-32">{label}</td>
                <td className="py-3 text-[#0f172a]">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold mb-4 text-[#0f172a]">ミッション</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          AI/ML領域における人材と企業の最適なマッチングを実現し、日本のAI産業の発展に貢献します。
        </p>
        <p className="text-gray-600 leading-relaxed">
          従来の人材紹介では困難だったAI/ML固有のスキル評価を、独自のAIスコアリングエンジンで多角的に分析。エンジニアのキャリア発展と企業の技術力強化を同時に支援します。
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <h2 className="text-lg font-bold mb-4 text-[#0f172a]">沿革</h2>
        <div className="space-y-4">
          {[
            ["2024年4月", "AI Matching株式会社 設立"],
            ["2024年7月", "AI Matchingプラットフォーム β版リリース"],
            ["2024年10月", "登録エンジニア500名突破"],
            ["2025年3月", "提携企業200社突破、AIスコアリングエンジンv2リリース"],
            ["2025年9月", "登録エンジニア1,200名・提携企業300社突破"],
          ].map(([date, event]) => (
            <div key={date} className="flex gap-4">
              <span className="text-sm font-bold text-[#4f46e5] whitespace-nowrap w-24 shrink-0">{date}</span>
              <span className="text-sm text-gray-600">{event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
