export default function PaymentCancel() {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="text-5xl mb-4">↩️</div>
      <h1 className="text-2xl font-bold mb-2">お支払いがキャンセルされました</h1>
      <p className="text-gray-600 mb-6">
        お支払いは処理されていません。ご不明点がございましたらお問い合わせください。
      </p>
      <a
        href="/company"
        className="inline-block px-6 py-3 border border-gray-300 rounded-lg font-medium"
      >
        ダッシュボードに戻る
      </a>
    </div>
  );
}
