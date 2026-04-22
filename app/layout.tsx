import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CSS 4 JOBS — AI-Powered CV & LinkedIn Optimizer',
  description: 'Tailor your CV to any job in seconds and optimize your LinkedIn profile with AI. Built for Hispanic professionals worldwide.',
  keywords: 'CV tailoring, ATS, LinkedIn optimization, job search, career coaching, hispanos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-gray-800 mt-20 py-10 text-center text-sm text-gray-500">
          <p>© 2025 CSS 4 JOBS · by <span className="text-indigo-400 font-semibold">CareerStrategy Studio</span> · Todos los derechos reservados</p>
        </footer>
      </body>
    </html>
  );
}
