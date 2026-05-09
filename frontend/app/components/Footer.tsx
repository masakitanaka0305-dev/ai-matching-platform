export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="6" fill="#4f46e5" />
                <path d="M8 20V8l6 6 6-6v12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-lg font-bold text-white">AI Matching</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              AI/MLエンジニアに特化した<br />
              マッチングプラットフォーム
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold text-[#f59e0b] mb-4 tracking-wider">サービス</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/engineer" className="hover:text-white transition">エンジニア登録</a></li>
              <li><a href="/diagnosis" className="hover:text-white transition">無料市場価値診断</a></li>
              <li><a href="/company/register" className="hover:text-white transition">企業登録</a></li>
              <li><a href="/company/postings/new" className="hover:text-white transition">求人作成</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-[#f59e0b] mb-4 tracking-wider">会社情報</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition">運営会社</a></li>
              <li><a href="#" className="hover:text-white transition">利用規約</a></li>
              <li><a href="#" className="hover:text-white transition">プライバシーポリシー</a></li>
              <li><a href="#" className="hover:text-white transition">特定商取引法に基づく表記</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-[#f59e0b] mb-4 tracking-wider">サポート</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition">よくある質問</a></li>
              <li><a href="#" className="hover:text-white transition">お問い合わせ</a></li>
              <li><a href="#" className="hover:text-white transition">導入事例</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Security & Trust */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                SSL暗号化通信
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                ISO 27001準拠
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span><strong className="text-gray-300">1,200+</strong> エンジニア登録</span>
              <span><strong className="text-gray-300">300+</strong> 提携企業</span>
              <span><strong className="text-gray-300">92%</strong> 満足度</span>
            </div>

            {/* Copyright */}
            <div className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} AI Matching Platform. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
