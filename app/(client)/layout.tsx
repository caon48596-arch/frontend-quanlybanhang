import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Thanh menu cố định */}
      <Navbar />

      {/* Nội dung chính */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* Chân trang */}
      <Footer />
    </>
  );
}
