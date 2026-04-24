import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import PasswordGate from '@/components/PasswordGate';
import { LangProvider } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CSS 4 JOBS — AI-Powered CV & Career Tools',
  description: 'Tailor your CV, optimize LinkedIn, search jobs worldwide and prepare interviews with AI. Built for professionals who want to work anywhere.',
  keywords: 'CV tailoring, ATS, LinkedIn optimization, job search, interview prep, career coaching',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CSS4JOBS" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className={inter.className}>
        <LangProvider>
          <PasswordGate>
            <Navbar />
            <main>{children}</main>
            <footer className="border-t border-gray-800 mt-20 py-10 text-center text-sm text-gray-500">
              <p>© 2025 CSS 4 JOBS · by <span className="text-indigo-400 font-semibold">CareerStrategy Studio</span></p>
            </footer>
          </PasswordGate>
        </LangProvider>
      </body>
    </html>
  );
}
