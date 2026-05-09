export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-[#0f172a]">特定商取引法に基づく表記</h1>

      <div className="card p-6 sm:p-8">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {[
              ["販売業者", "AI Matching株式会社"],
              ["代表責任者", "田中 将貴"],
              ["所在地", "東京都渋谷区神宮前6丁目"],
              ["電話番号", "03-XXXX-XXXX（お問い合わせフォームをご利用ください）"],
              ["メールアドレス", "support@ai-matching.jp"],
              ["販売URL", "https://ai-matching.jp"],
              ["販売価格", "各サービスページに記載の価格（税込）"],
              ["追加手数料", "なし"],
              [
                "支払い方法",
                "クレジットカード（Visa, Mastercard, American Express, JCB）",
              ],
              ["支払い時期", "サービス申込時に即時決済"],
              [
                "商品引渡し時期",
                "・市場価値診断レポート：決済完了後即時\n・マッチングサービス：登録完了後順次",
              ],
              [
                "返品・キャンセル",
                "・診断レポート：購入後30日以内であれば全額返金\n・マッチングサービス（成功報酬）：マッチング成立前はキャンセル可能",
              ],
              [
                "動作環境",
                "・推奨ブラウザ：Chrome, Safari, Firefox, Edge（最新版）\n・対応デバイス：PC, スマートフォン, タブレット",
              ],
            ].map(([label, value]) => (
              <tr key={label}>
                <td className="py-4 pr-6 font-medium text-gray-500 whitespace-nowrap align-top w-36">
                  {label}
                </td>
                <td className="py-4 text-[#0f172a] whitespace-pre-line">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
