"use client";

function NavLinks() {
  return (
    <>
      <a
        href="/admin"
        className="flex items-center gap-1.5 py-2 md:py-0 text-sm font-medium text-gray-300 hover:text-white transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        管理画面
      </a>
      <a
        href="/"
        className="flex items-center gap-1.5 py-2 md:py-0 text-sm font-medium text-gray-400 hover:text-gray-200 transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        公開サイトへ
      </a>
    </>
  );
}

export default function AdminNav() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0f172a] text-gray-200 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/admin" className="flex items-center gap-2.5">
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
          <span className="relative text-xs bg-red-600 text-white px-2.5 py-0.5 rounded-full font-bold tracking-wide">
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-400 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-400 rounded-full" />
            ADMIN
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
