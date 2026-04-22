'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function Navbar() {
  const path = usePathname();
  const active = (href: string) => path === href ? 'text-white font-semibold' : 'text-gray-400 hover:text-white';

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="CSS 4 JOBS"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              const fallback = img.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.removeProperty('display');
            }}
          />
          <span className="font-bold text-white" style={{ display: 'none' }}>
            CSS <span className="text-indigo-400">4 JOBS</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/cv" className={`transition-colors ${active('/cv')}`}>CV Tailoring</Link>
          <Link href="/linkedin" className={`transition-colors ${active('/linkedin')}`}>LinkedIn AI</Link>
          <Link href="/pricing" className={`transition-colors ${active('/pricing')}`}>Precios</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/cv" className="btn-primary text-xs px-4 py-2">
            <Zap size={13} />
            Empezar gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}
