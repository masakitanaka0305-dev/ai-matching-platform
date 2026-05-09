export default function PaymentSuccess() {
  return (
    <div className="max-w-lg mx-auto text-center py-16 px-4">
      <div className="card inline-flex p-8 sm:p-10 flex-col items-center">
        {/* Animated Check */}
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-[bounce_1s_ease-in-out]"
          >
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-[#0f172a]">お支払い完了</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          決済が正常に処理されました。
          <br />
          領収書はメールにて送信いたします。
        </p>
        <a
          href="/company"
          className="btn-primary px-8 py-3"
        >
          ダッシュボードに戻る
        </a>
        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          安全な決済処理が完了しました
        </p>
      </div>
    </div>
  );
}
