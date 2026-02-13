import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';

export const metadata: Metadata = {
  title: 'EduSlide',
  description: 'Optimize your PDFs for studying.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased animated-gradient-background text-foreground">
        <div className="flex min-h-screen flex-col">
            <main className="flex-grow relative z-10">{children}</main>
            <Footer />
        </div>
        {/* This spacer creates room for the fixed mobile nav, making the footer clickable */}
        <div className="h-16 md:hidden" />
        <MobileNav />
        <Toaster />
      </body>
    </html>
  );
}
