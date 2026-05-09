"use client";

function NavLinks() {
  return (
    <>
      <a
        href="/engineer/inbox"
        className="block py-2 md:py-0 text-sm font-medium text-gray-700 hover:text-[#4f46e5] transition relative group"
      >
        インボックス
        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#4f46e5] transition-all group-hover:w-full hidden md:block" />
      </a>
      <a
        href="/engineer"
        className="block py-2 md:py-0 text-sm font-medium text-gray-700 hover:text-[#4f46e5] transition relative group"
      >
        エンジニア登録
        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#4f46e5] transition-all group-hover:w-full hidden md:block" />
      </a>
      <a
        href="/diagnosis"
        className="block py-2 md:py-0 text-sm font-medium text-gray-700 hover:text-[#4f46e5] transition relative group"
      >
        無料診断
        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#4f46e5] transition-all group-hover:w-full hidden md:block" />
      </a>
      <a
        href="/company/register"
        className="block py-2 md:py-0 md:ml-2 text-sm font-bold text-white bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-5 py-2 rounded-lg shadow-sm hover:shadow-md transition"
      >
        企業の方はこちら
      </a>
    </>
  );
}

export default function PublicNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#4f46e5" />
            <path
              d="M8 20V8l6 6 6-6v12"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-lg sm:text-xl font-bold text-[#0f172a]">
            AI Matching
          </span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          <NavLinks />
        </div>
        <details className="md:hidden relative">
          <summary className="list-none cursor-pointer p-2 -mr-2">
            <svg
              className="w-6 h-6 text-gray-700"
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
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl py-3 px-5 text-sm font-medium z-50 space-y-1">
            <NavLinks />
          </div>
        </details>
      </div>
    </nav>
  );
}
