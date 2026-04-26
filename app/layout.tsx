import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import PasswordGate from '@/components/PasswordGate';
import { LangProvider } from '@/lib/i18n';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CSS 4 JOBS — Empleos con IA',
  description: 'Busca empleo, analiza tu match con IA y genera cartas de presentación en segundos. Para profesionales hispanos en Europa y Latinoamérica.',
  keywords: 'buscar empleo, CV con IA, ATS, carta de presentación, trabajo Europa, trabajo Irlanda, CSS 4 JOBS',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CSS 4 JOBS',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5B6CFF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CSS 4 JOBS" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
      </head>
      <body className={inter.className}>
        <LangProvider>
          <PasswordGate>
            <Navbar />
            <main>{children}</main>
            <footer className="border-t border-slate-200 mt-20 py-10 text-center text-sm text-slate-500">
              <p>© 2025 CSS 4 JOBS · by <span className="text-brand-700 font-semibold">CareerStrategy Studio</span></p>
            </footer>
          </PasswordGate>
        </LangProvider>

        {/* Register Service Worker */}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function() {});
            });
          }
        `}</Script>
      </body>
    </html>
  );
}
