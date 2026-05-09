import PublicNav from "../components/PublicNav";
import Footer from "../components/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
