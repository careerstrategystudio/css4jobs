'use client';
import { useState, useEffect } from 'react';
import { Zap, Lock } from 'lucide-react';
import * as crypto from 'crypto';

const PASSWORD = process.env.NEXT_PUBLIC_ACCESS_PASSWORD || 'css4jobs2025';
const KEY_SECRET = 'css4jobs-pro-secret-key-2025';
const STORAGE_KEY = 'css4jobs_access';

// Validate Pro key format: CSS4J.{payload}.{signature}
function validateProKey(key: string): boolean {
  if (!key.startsWith('CSS4J.')) return false;
  
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  
  const [_, payloadB64, signature] = parts;
  
  try {
    // Decode payload
    const payload = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const data = JSON.parse(payload);
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', KEY_SECRET);
    hmac.update(payloadB64);
    const expectedSig = hmac.digest('base64url');
    
    // Check if key is still valid (not expired)
    if (data.createdAt) {
      const createdDate = new Date(data.createdAt);
      const months = data.months || 1;
      const expirationDate = new Date(createdDate);
      expirationDate.setMonth(expirationDate.getMonth() + months);
      
      if (new Date() > expirationDate) return false;
    }
    
    return signature === expectedSig;
  } catch {
    return false;
  }
}

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
    const trimmedInput = input.trim();
    
    // Check if it's a Pro key
    if (trimmedInput.startsWith('CSS4J.')) {
      if (validateProKey(trimmedInput)) {
        // Parse and store Pro data
        try {
          const parts = trimmedInput.split('.');
          const payloadB64 = parts[1];
          const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
          
          // Calculate expiration date
          const createdDate = new Date(payload.createdAt);
          const months = payload.months || 1;
          const expirationDate = new Date(createdDate);
          expirationDate.setMonth(expirationDate.getMonth() + months);
          
          // Store Pro data in Pro system format
          const proData = {
            email: payload.email,
            key: trimmedInput,
            limit: payload.limit || 999,
            exp: expirationDate.toISOString(),
            usedMonth: 0,
            resetMonth: new Date().toISOString().slice(0, 7),
          };
          
          localStorage.setItem('css4jobs_pro_v2', JSON.stringify(proData));
        } catch {
          // Silently ignore parsing errors
        }
        
        localStorage.setItem(STORAGE_KEY, 'true');
        setUnlocked(true);
        setError(false);
        return;
      }
    }
    
    // Check if it's the beta password
    if (trimmedInput === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
      setError(false);
      return;
    }
    
    // Invalid
    setError(true);
    setInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-brand-600/10 blur-3xl rounded-full pointer-events-none" />

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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">CSS <span className="text-indigo-400">4 JOBS</span></h1>
          <p className="text-slate-500 text-sm">Acceso privado · Beta</p>
        </div>

        {/* Card */}
        <div className="card border-slate-300">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
              <Lock size={15} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-900 font-semibold text-sm">Acceso restringido</p>
              <p className="text-slate-400 text-xs">Ingresá tu código de acceso</p>
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

        <p className="text-center text-slate-500 text-xs mt-6">
          ¿No tenés acceso? Contactá a{' '}
          <a href="mailto:careerstrategystudio@gmail.com" className="text-indigo-400 hover:underline">
            CareerStrategy Studio
          </a>
        </p>
      </div>
    </div>
  );
}
