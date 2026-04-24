'use client';
import { useState, useEffect } from 'react';
import { Zap, Lock } from 'lucide-react';

const PASSWORD = process.env.NEXT_PUBLIC_ACCESS_PASSWORD || 'css4jobs2025';
const STORAGE_KEY = 'css4jobs_access';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput]       = useState('');
  const [error, setError]       = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setUnlocked(true);
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setInput('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-gray-950 to-gray-950 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/images/logo.png"
            alt="CSS 4 JOBS"
            className="h-16 w-auto object-contain mx-auto mb-4"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }}
          />
          <h1 className="text-2xl font-bold text-white mb-1">CSS <span className="text-indigo-400">4 JOBS</span></h1>
          <p className="text-gray-400 text-sm">Acceso privado · Beta</p>
        </div>

        {/* Card */}
        <div className="card border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Lock size={15} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Acceso restringido</p>
              <p className="text-gray-500 text-xs">Ingresá tu código de acceso</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={input}
                onChange={e => { setInput(e.target.value); setError(false); }}
                className={`input w-full ${error ? 'border-red-500/50 focus:border-red-500' : ''}`}
                placeholder="Código de acceso..."
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-xs mt-2">Código incorrecto. Pedíselo a Javier.</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3">
              <Zap size={15} />
              Ingresar
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          ¿No tenés acceso? Contactá a{' '}
          <a href="mailto:careerstrategystudio@gmail.com" className="text-indigo-400 hover:underline">
            CareerStrategy Studio
          </a>
        </p>
      </div>
    </div>
  );
}
