export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#0f172a]">プライバシーポリシー</h1>
      <p className="text-sm text-gray-500 mb-8">最終更新日：2025年4月1日</p>

      <div className="card p-6 sm:p-8 space-y-8">
        <div>
          <p className="text-sm text-gray-600 leading-relaxed">
            AI Matching株式会社（以下「当社」）は、ユーザーの個人情報の保護を重要な責務と考え、以下のとおりプライバシーポリシーを定め、適切な管理・保護に努めます。
          </p>
        </div>

        {[
          {
            title: "1. 収集する情報",
            content:
              "当社は、以下の情報を収集する場合があります。\n\n・氏名、メールアドレス、電話番号\n・職務経歴、スキル情報、GitHub URL、Xハンドル\n・企業名、担当者情報、業種、従業員数\n・診断結果、マッチング履歴\n・アクセスログ、Cookie情報、端末情報",
          },
          {
            title: "2. 利用目的",
            content:
              "収集した個人情報は、以下の目的で利用します。\n\n・マッチングサービスの提供・改善\n・AIスコアリングによるスキル評価\n・市場価値診断レポートの作成\n・お問い合わせへの対応\n・サービスに関するお知らせの送信\n・統計データの作成（個人を特定しない形式）",
          },
          {
            title: "3. 第三者提供",
            content:
              "当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。\n\n・ユーザーの同意がある場合\n・マッチング目的で企業ユーザーに提供する場合（エンジニアユーザーのプロフィール情報）\n・法令に基づく場合\n・人の生命・身体・財産の保護に必要な場合",
          },
          {
            title: "4. 安全管理措置",
            content:
              "当社は、個人情報の漏洩・滅失・毀損を防止するため、SSL暗号化通信の使用、アクセス制御、従業者教育などの安全管理措置を講じます。",
          },
          {
            title: "5. 開示・訂正・削除",
            content:
              "ユーザーは、当社に対して自己の個人情報の開示・訂正・削除を請求することができます。請求があった場合は、本人確認の上、合理的な範囲で速やかに対応いたします。",
          },
          {
            title: "6. Cookieの使用",
            content:
              "当社は、サービスの利便性向上のためCookieを使用しています。ユーザーはブラウザの設定によりCookieの受け入れを拒否することができますが、一部サービスが利用できなくなる場合があります。",
          },
          {
            title: "7. お問い合わせ",
            content:
              "個人情報の取扱いに関するお問い合わせは、お問い合わせフォームまたは以下の連絡先までご連絡ください。\n\nAI Matching株式会社 個人情報保護担当\nメール：privacy@ai-matching.jp",
          },
        ].map((section) => (
          <div key={section.title}>
            <h2 className="text-base font-bold mb-2 text-[#0f172a]">{section.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
