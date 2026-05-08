import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Matching Platform",
  description: "AI人材特化型マッチングプラットフォーム",
};

function NavContent() {
  return (
    <>
      <a href="/engineer" className="block py-2 md:py-0 hover:text-indigo-600">
        エンジニア登録
      </a>
      <a href="/diagnosis" className="block py-2 md:py-0 hover:text-indigo-600">
        無料診断
      </a>
      <a href="/company/register" className="block py-2 md:py-0 hover:text-indigo-600">
        企業登録
      </a>
      <a href="/company" className="block py-2 md:py-0 hover:text-indigo-600">
        企業ダッシュボード
      </a>
      <a href="/admin" className="block py-2 md:py-0 hover:text-indigo-600">
        管理
      </a>
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="text-lg sm:text-xl font-bold text-indigo-600">
              AI Matching
            </a>
            {/* Desktop nav */}
            <div className="hidden md:flex gap-6 text-sm font-medium">
              <NavContent />
            </div>
            {/* Mobile nav toggle */}
            <details className="md:hidden relative">
              <summary className="list-none cursor-pointer p-2 -mr-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </summary>
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border rounded-xl shadow-lg py-2 px-4 text-sm font-medium z-50">
                <NavContent />
              </div>
            </details>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
      </body>
    </html>
  );
}
