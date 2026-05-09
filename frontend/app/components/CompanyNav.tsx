"use client";

function NavLinks() {
  return (
    <>
      <a
        href="/company"
        className="block py-2 md:py-0 text-sm font-medium text-gray-300 hover:text-[#f59e0b] transition"
      >
        ダッシュボード
      </a>
      <a
        href="/company/postings/new"
        className="block py-2 md:py-0 text-sm font-medium text-gray-300 hover:text-[#f59e0b] transition"
      >
        求人作成
      </a>
      <a
        href="/company/register"
        className="block py-2 md:py-0 text-sm font-medium text-gray-300 hover:text-[#f59e0b] transition"
      >
        企業登録
      </a>
    </>
  );
}

export default function CompanyNav() {
  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-gray-200 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/company" className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#4f46e5" />
            <path
              d="M8 20V8l6 6 6-6v12"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-lg sm:text-xl font-bold text-white">
            AI Matching
          </span>
          <span className="text-xs bg-[#f59e0b]/20 text-[#f59e0b] px-2.5 py-0.5 rounded-full font-bold border border-[#f59e0b]/30">
            企業管理
          </span>
        </a>
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <NavLinks />
        </div>
        <details className="md:hidden relative">
          <summary className="list-none cursor-pointer p-2 -mr-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </summary>
          <div className="absolute right-0 top-full mt-2 w-56 bg-[#1e293b] border border-gray-700 rounded-2xl shadow-xl py-3 px-5 text-sm font-medium z-50 space-y-1">
            <NavLinks />
          </div>
        </details>
      </div>
    </nav>
  );
}
