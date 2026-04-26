'use client';
import { useState } from 'react';
import { Key, Copy, CheckCircle, Lock, Zap } from 'lucide-react';

export default function AdminPage() {
  const [pw,      setPw]      = useState('');
  const [authed,  setAuthed]  = useState(false);
  const [pwError, setPwError] = useState(false);

  const [email,   setEmail]   = useState('');
  const [limit,   setLimit]   = useState('10');
  const [months,  setMonths]  = useState('1');
  const [loading, setLoading] = useState(false);
  const [genKey,  setGenKey]  = useState('');
  const [error,   setError]   = useState('');
  const [copied,  setCopied]  = useState(false);

  const checkPw = () => {
    if (pw.trim()) { setAuthed(true); setPwError(false); }
    else setPwError(true);
  };

  const generate = async () => {
    if (!email.trim()) { setError('Ingresa el email del cliente'); return; }
    setLoading(true); setError(''); setGenKey(''); setCopied(false);
    try {
      const res  = await fetch('/api/admin/generate-key', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ adminPassword: pw, email: email.trim(), limit: Number(limit), months: Number(months) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error'); }
      else { setGenKey(data.key); }
    } catch { setError('Error de conexión'); }
    finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(genKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-sm w-full">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={18} className="text-indigo-400" />
            <h1 className="text-slate-900 font-bold text-lg">Admin — CSS 4 JOBS</h1>
          </div>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setPwError(false); }}
            onKeyDown={e => e.key === 'Enter' && checkPw()}
            className={`w-full px-4 py-3 rounded-xl bg-slate-100 border text-white placeholder-slate-400 outline-none focus:border-indigo-500 mb-3 ${pwError ? 'border-red-500' : 'border-slate-300'}`}
            placeholder="Contraseña de admin..."
          />
          {pwError && <p className="text-red-400 text-xs mb-3">Ingresa la contraseña</p>}
          <button onClick={checkPw} className="btn-primary w-full justify-center py-3">
            <Lock size={14} /> Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Key size={20} className="text-indigo-400" />
          <h1 className="text-slate-900 text-2xl font-bold">Generador de Claves Pro</h1>
        </div>

        <div className="card space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Email del cliente</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500"
              placeholder="cliente@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">CVs por mes</label>
              <select
                value={limit}
                onChange={e => setLimit(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 outline-none focus:border-indigo-500"
              >
                <option value="5">5 CVs/mes</option>
                <option value="10">10 CVs/mes</option>
                <option value="20">20 CVs/mes</option>
                <option value="50">50 CVs/mes</option>
                <option value="999">Ilimitado (999)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Validez</label>
              <select
                value={months}
                onChange={e => setMonths(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 outline-none focus:border-indigo-500"
              >
                <option value="1">1 mes</option>
                <option value="3">3 meses</option>
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={generate}
            disabled={loading}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50"
          >
            {loading ? <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Generando...</> : <><Zap size={15} /> Generar Clave Pro</>}
          </button>
        </div>

        {genKey && (
          <div className="mt-6 card border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold text-sm">Clave generada</span>
              <span className="text-slate-400 text-xs">· {limit} CVs/mes · {months} {months === '1' ? 'mes' : 'meses'}</span>
            </div>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-xs bg-white px-4 py-3 rounded-xl text-emerald-300 break-all font-mono border border-slate-300">
                {genKey}
              </code>
              <button
                onClick={copy}
                className="flex-shrink-0 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all"
                title="Copiar"
              >
                {copied ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-500" />}
              </button>
            </div>
            <p className="text-slate-400 text-xs mt-3">
              Envía esta clave al cliente ({email}). La clave solo funciona con ese email exacto.
            </p>
          </div>
        )}

        <div className="mt-8 card border border-slate-300/50 bg-white/50 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-500 mb-2">Instrucciones para el cliente:</p>
          <p>1. Ir a CSS 4 JOBS → Optimización de CV</p>
          <p>2. Tailorar un CV y hacer clic en &ldquo;Descargar PDF&rdquo;</p>
          <p>3. Ingresar su email y esta clave en el formulario que aparece</p>
          <p>4. El plan Pro se activa automáticamente</p>
        </div>
      </div>
    </div>
  );
}
