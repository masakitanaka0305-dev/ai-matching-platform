"use client";

function NavLinks() {
  return (
    <>
      <a href="/company" className="block py-2 md:py-0 hover:text-orange-400 transition">
        ダッシュボード
      </a>
      <a href="/company/postings/new" className="block py-2 md:py-0 hover:text-orange-400 transition">
        求人作成
      </a>
      <a href="/company/register" className="block py-2 md:py-0 hover:text-orange-400 transition">
        企業登録
      </a>
    </>
  );
}

export default function CompanyNav() {
  return (
    <nav className="bg-slate-900 text-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/company" className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-bold text-orange-500">AI Matching</span>
          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-medium">
            企業管理
          </span>
        </a>
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <NavLinks />
        </div>
        <details className="md:hidden relative">
          <summary className="list-none cursor-pointer p-2 -mr-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>
          <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-lg py-2 px-4 text-sm font-medium z-50">
            <NavLinks />
          </div>
        </details>
      </div>
    </nav>
  );
}
