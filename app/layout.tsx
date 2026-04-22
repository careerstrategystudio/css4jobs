import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { LangProvider } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CSS 4 JOBS — AI-Powered CV & LinkedIn Optimizer',
  description: 'Tailor your CV to any job in seconds and optimize your LinkedIn profile with AI. Built for professionals worldwide.',
  keywords: 'CV tailoring, ATS, LinkedIn optimization, job search, career coaching',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <LangProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="border-t border-gray-800 mt-20 py-10 text-center text-sm text-gray-500">
            <p>© 2025 CSS 4 JOBS · by <span className="text-indigo-400 font-semibold">CareerStrategy Studio</span></p>
          </footer>
        </LangProvider>
      </body>
    </html>
  );
}
