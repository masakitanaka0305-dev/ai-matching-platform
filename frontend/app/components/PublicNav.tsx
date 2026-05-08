"use client";

function NavLinks() {
  return (
    <>
      <a href="/engineer" className="block py-2 md:py-0 hover:text-indigo-600 transition">
        エンジニア登録
      </a>
      <a href="/diagnosis" className="block py-2 md:py-0 hover:text-indigo-600 transition">
        無料診断
      </a>
      <a href="/company/register" className="block py-2 md:py-0 text-orange-600 hover:text-orange-700 transition">
        企業の方はこちら
      </a>
    </>
  );
}

export default function PublicNav() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="text-lg sm:text-xl font-bold text-indigo-600">
          AI Matching
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
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border rounded-xl shadow-lg py-2 px-4 text-sm font-medium z-50">
            <NavLinks />
          </div>
        </details>
      </div>
    </nav>
  );
}
