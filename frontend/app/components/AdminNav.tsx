"use client";

function NavLinks() {
  return (
    <>
      <a href="/admin" className="block py-2 md:py-0 hover:text-gray-300 transition">
        管理画面
      </a>
      <a href="/" className="block py-2 md:py-0 text-gray-400 hover:text-gray-200 transition">
        公開サイトへ →
      </a>
    </>
  );
}

export default function AdminNav() {
  return (
    <nav className="bg-zinc-900 text-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/admin" className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-bold text-white">AI Matching</span>
          <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded font-bold tracking-wide">
            ADMIN
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
          <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg py-2 px-4 text-sm font-medium z-50">
            <NavLinks />
          </div>
        </details>
      </div>
    </nav>
  );
}
