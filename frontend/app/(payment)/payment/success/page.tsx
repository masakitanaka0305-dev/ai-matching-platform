export default function PaymentSuccess() {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">お支払い完了</h1>
      <p className="text-gray-600 mb-6">
        決済が正常に処理されました。領収書はメールにて送信いたします。
      </p>
      <a
        href="/company"
        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium"
      >
        ダッシュボードに戻る
      </a>
    </div>
  );
}
