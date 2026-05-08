import MinimalNav from "../components/MinimalNav";

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MinimalNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </>
  );
}
