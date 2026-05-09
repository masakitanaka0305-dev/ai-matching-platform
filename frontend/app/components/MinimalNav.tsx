export default function MinimalNav() {
  return (
    <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto">
        <a href="/" className="flex items-center gap-2.5 w-fit">
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
          <span className="text-lg sm:text-xl font-bold text-[#0f172a]">
            AI Matching
          </span>
        </a>
      </div>
    </nav>
  );
}
