import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CountryProvider } from '@/components/providers/country-provider';

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CountryProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </CountryProvider>
  );
}
