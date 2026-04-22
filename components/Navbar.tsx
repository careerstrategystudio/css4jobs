'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export default function Navbar() {
  const path = usePathname();
  const { lang, setLang, t } = useLang();
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
          <Link href="/cv" className={`transition-colors ${active('/cv')}`}>{t('nav_cv')}</Link>
          <Link href="/linkedin" className={`transition-colors ${active('/linkedin')}`}>{t('nav_linkedin')}</Link>
          <Link href="/pricing" className={`transition-colors ${active('/pricing')}`}>{t('nav_pricing')}</Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all text-sm font-semibold text-gray-300 hover:text-white border border-gray-700"
            title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <span>{lang === 'es' ? '🇬🇧' : '🇪🇸'}</span>
            <span>{lang === 'es' ? 'EN' : 'ES'}</span>
          </button>

          <Link href="/cv" className="btn-primary text-xs px-4 py-2">
            <Zap size={13} />
            {t('nav_cta')}
          </Link>
        </div>
      </div>
    </nav>
  );
}
