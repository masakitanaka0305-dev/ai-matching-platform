import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Matching Platform",
  description: "AI人材特化型マッチングプラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-indigo-600">
              AI Matching
            </a>
            <div className="flex gap-6 text-sm font-medium">
              <a href="/engineer" className="hover:text-indigo-600">
                エンジニア登録
              </a>
              <a href="/diagnosis" className="hover:text-indigo-600">
                無料診断
              </a>
              <a href="/company/register" className="hover:text-indigo-600">
                企業登録
              </a>
              <a href="/company" className="hover:text-indigo-600">
                企業ダッシュボード
              </a>
              <a href="/admin" className="hover:text-indigo-600">
                管理
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
