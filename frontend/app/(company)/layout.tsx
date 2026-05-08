import CompanyNav from "../components/CompanyNav";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CompanyNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </>
  );
}
