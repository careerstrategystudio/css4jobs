'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Lock, Star, LogOut, X, ChevronDown } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { usePro } from '@/lib/pro';

// ─── Pro Login Modal ─────────────────────────────────────────────────────────
function ProLoginModal({
  activatePro,
  onClose,
}: {
  activatePro: (email: string, key: string) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const [email,   setEmail]   = useState('');
  const [key,     setKey]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handle = async () => {
    if (!email.trim() || !key.trim()) { setError('Ingresa tu email y clave Pro'); return; }
    setLoading(true); setError('');
    const result = await activatePro(email.trim(), key.trim());
    setLoading(false);
    if (result.success) { setSuccess(true); setTimeout(onClose, 1400); }
    else setError(result.error || 'Clave inválida o email incorrecto. Contacta a soporte.');
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handle(); };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Star size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Acceso Plan Pro</h2>
              <p className="text-gray-500 text-xs">Ingresa tu email y clave de cliente</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <Star size={30} className="text-emerald-400 fill-emerald-400" />
            </div>
            <p className="text-emerald-400 font-bold text-lg">¡Plan Pro activado!</p>
            <p className="text-gray-500 text-sm mt-1">Cerrando ventana...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={handleKey}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors"
                placeholder="tu@email.com"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Clave Pro</label>
              <input
                type="text"
                value={key}
                onChange={e => { setKey(e.target.value); setError(''); }}
                onKeyDown={handleKey}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors font-mono tracking-wider"
                placeholder="CSS4J.xxx..."
              />
              <p className="text-gray-600 text-[11px] mt-1.5">La clave te la envía Javier tras tu pago.</p>
            </div>

            {error && (
              <div className="py-2 px-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              onClick={handle}
              disabled={loading}
              className="w-full btn-primary justify-center py-2.5 text-sm disabled:opacity-60"
            >
              {loading
                ? 'Verificando...'
                : <><Lock size={13} /> Iniciar sesión Pro</>
              }
            </button>

            <p className="text-center text-xs text-gray-600 pt-1">
              ¿No tienes plan Pro?{' '}
              <a href="/pricing" onClick={onClose} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Ver planes →
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pro User Dropdown ────────────────────────────────────────────────────────
function ProUserBadge({
  email,
  onLogout,
}: {
  email: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = email.charAt(0).toUpperCase();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all"
      >
        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
          {initial}
        </div>
        <span className="text-indigo-300 text-xs font-bold hidden sm:block">PRO</span>
        <ChevronDown size={12} className="text-indigo-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-800">
            <p className="text-white text-xs font-semibold truncate">{email}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={10} className="text-indigo-400 fill-indigo-400" />
              <span className="text-indigo-400 text-[11px] font-bold">Plan Pro activo</span>
            </div>
          </div>
          <button
            onClick={() => { onLogout(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 text-xs transition-all"
          >
            <LogOut size={13} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const path = usePathname();
  const { lang, setLang, t } = useLang();
  const { isPro, ready, proData, activatePro, deactivatePro } = usePro();
  const active = (href: string) =>
    path === href ? 'text-white font-semibold' : 'text-gray-400 hover:text-white';

  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
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

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/cv"       className={`transition-colors ${active('/cv')}`}>{t('nav_cv')}</Link>
            <Link href="/linkedin" className={`transition-colors ${active('/linkedin')}`}>{t('nav_linkedin')}</Link>
            <Link href="/jobs"     className={`transition-colors ${active('/jobs')}`}>{lang === 'es' ? 'Empleos' : 'Jobs'}</Link>
            <Link href="/prep"     className={`transition-colors ${active('/prep')}`}>{lang === 'es' ? 'Entrevistas' : 'Interview Prep'}</Link>
            <Link href="/pricing"  className={`transition-colors ${active('/pricing')}`}>{t('nav_pricing')}</Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {/* Lang toggle */}
            <button
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all text-sm font-semibold text-gray-300 hover:text-white border border-gray-700"
              title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <span>{lang === 'es' ? '🇬🇧' : '🇪🇸'}</span>
              <span>{lang === 'es' ? 'EN' : 'ES'}</span>
            </button>

            {/* Pro auth section */}
            {ready && (
              isPro && proData ? (
                <ProUserBadge email={proData.email} onLogout={deactivatePro} />
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 hover:border-indigo-500/50 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold transition-all"
                >
                  <Lock size={12} className="text-gray-500" />
                  {lang === 'es' ? 'Iniciar sesión' : 'Log in'}
                </button>
              )
            )}

            {/* CTA */}
            <Link href="/cv" className="btn-primary text-xs px-4 py-2 hidden sm:flex">
              <Zap size={13} />
              {t('nav_cta')}
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-4 px-4 pb-3 text-sm overflow-x-auto">
          <Link href="/cv"       className={`flex-shrink-0 transition-colors ${active('/cv')}`}>{t('nav_cv')}</Link>
          <Link href="/linkedin" className={`flex-shrink-0 transition-colors ${active('/linkedin')}`}>{t('nav_linkedin')}</Link>
          <Link href="/jobs"     className={`flex-shrink-0 transition-colors ${active('/jobs')}`}>{lang === 'es' ? 'Empleos' : 'Jobs'}</Link>
          <Link href="/prep"     className={`flex-shrink-0 transition-colors ${active('/prep')}`}>{lang === 'es' ? 'Entrevistas' : 'Prep'}</Link>
          <Link href="/pricing"  className={`flex-shrink-0 transition-colors ${active('/pricing')}`}>{t('nav_pricing')}</Link>
          {ready && !isPro && (
            <button
              onClick={() => setShowLogin(true)}
              className="flex-shrink-0 flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-colors"
            >
              <Lock size={11} /> {lang === 'es' ? 'Login Pro' : 'Pro Login'}
            </button>
          )}
        </div>
      </nav>

      {/* Login modal */}
      {showLogin && (
        <ProLoginModal
          activatePro={activatePro}
          onClose={() => setShowLogin(false)}
        />
      )}
    </>
  );
}

// build
