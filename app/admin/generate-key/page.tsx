'use client';
import { useState } from 'react';
import { Mail, Copy, CheckCircle, AlertCircle, Zap } from 'lucide-react';

const PLANS = [
  { id: 'monthly', label: 'Mensual (30 días)', months: 1 },
  { id: 'quadrimestral', label: 'Cuatrimestral (120 días)', months: 4 },
  { id: 'semestral', label: 'Semestral (180 días)', months: 6 },
];

export default function AdminGenerateKey() {
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateKey = async () => {
    if (!email || !plan) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/generate-pro-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer CSS4J_ADMIN_2025_SECURE`,
        },
        body: JSON.stringify({ email, plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al generar clave');
        return;
      }

      setResult(data);
      setEmail('');
      setPlan('monthly');
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    if (result?.proKey) {
      navigator.clipboard.writeText(result.proKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-brand-500" size={28} />
            <h1 className="text-3xl font-bold text-white">Generar Clave Pro</h1>
          </div>

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email del Cliente
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Plan
              </label>
              <div className="grid grid-cols-1 gap-3">
                {PLANS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition ${
                      plan === p.id
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={p.id}
                      checked={plan === p.id}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 font-medium text-white">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateKey}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
            >
              {loading ? 'Generando...' : 'Generar Clave Pro'}
            </button>

            {/* Result */}
            {result && (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-bold text-emerald-300">¡Clave generada exitosamente!</p>
                    <p className="text-sm text-emerald-300/70">Email enviado a {result.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Clave Pro:</p>
                    <div className="flex items-center gap-2 p-3 bg-slate-900 rounded border border-slate-700">
                      <code className="text-sm font-mono text-emerald-300 flex-1 truncate">
                        {result.proKey}
                      </code>
                      <button
                        onClick={copyKey}
                        className="p-2 hover:bg-slate-800 rounded transition flex-shrink-0"
                      >
                        {copied ? (
                          <CheckCircle size={18} className="text-emerald-400" />
                        ) : (
                          <Copy size={18} className="text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Plan</p>
                      <p className="font-semibold text-white">{result.plan}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Vigencia</p>
                      <p className="font-semibold text-white">{result.expiresIn}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">
                    ✅ El cliente ya recibió un email con su clave. Está lista para usar.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-400">
          <p className="font-semibold text-slate-300 mb-2">💡 Instrucciones:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Ingresa el email del cliente</li>
            <li>Selecciona el plan que compró</li>
            <li>Click en "Generar Clave Pro"</li>
            <li>¡Listo! El cliente recibe la clave por email</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
