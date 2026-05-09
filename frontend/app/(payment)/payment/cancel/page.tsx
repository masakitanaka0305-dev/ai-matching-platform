export default function PaymentCancel() {
  return (
    <div className="max-w-lg mx-auto text-center py-16 px-4">
      <div className="card inline-flex p-8 sm:p-10 flex-col items-center">
        {/* Cancel Icon */}
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 14 4 9 9 4" />
            <path d="M20 20v-7a4 4 0 00-4-4H4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-[#0f172a]">お支払いがキャンセルされました</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          お支払いは処理されていません。
          <br />
          ご不明点がございましたらお問い合わせください。
        </p>
        <a
          href="/company"
          className="btn-secondary px-8 py-3"
        >
          ダッシュボードに戻る
        </a>
      </div>
    </div>
  );
}
