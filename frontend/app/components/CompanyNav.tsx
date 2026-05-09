"use client";

function NavLinks() {
  return (
    <>
      <a
        href="/company"
        className="block py-2 md:py-0 text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
      >
        ダッシュボード
      </a>
      <a
        href="/company/postings/new"
        className="block py-2 md:py-0 text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
      >
        求人作成
      </a>
      <a
        href="/company/pricing"
        className="block py-2 md:py-0 text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
      >
        料金プラン
      </a>
      <a
        href="/company/register"
        className="block py-2 md:py-0 text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
      >
        企業登録
      </a>
    </>
  );
}

export default function CompanyNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 text-gray-800 px-4 sm:px-6 py-3 sm:py-4">
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
          <span className="text-lg sm:text-xl font-bold text-gray-900">
            AI Matching
          </span>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-bold border border-indigo-200">
            企業管理
          </span>
        </a>
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <NavLinks />
        </div>
        <details className="md:hidden relative">
          <summary className="list-none cursor-pointer p-2 -mr-2">
            <svg
              className="w-6 h-6 text-gray-600"
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
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-3 px-5 text-sm font-medium z-50 space-y-1">
            <NavLinks />
          </div>
        </details>
      </div>
    </nav>
  );
}
