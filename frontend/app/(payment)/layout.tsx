import MinimalNav from "../components/MinimalNav";

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MinimalNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
      {/* Minimal Footer */}
      <footer className="border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            SSL暗号化通信で安全にお支払い
          </span>
          <span>&copy; {new Date().getFullYear()} AI Matching Platform</span>
        </div>
      </footer>
    </>
  );
}
