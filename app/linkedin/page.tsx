'use client';
import { useState } from 'react';
import { Linkedin, Target, Zap, AlertCircle, CheckCircle, Copy, Download } from 'lucide-react';

export default function LinkedInPage() {
  const [linkedinData, setLinkedinData] = useState('');
  const [targetRole, setTargetRole]     = useState('');
  const [result, setResult]             = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [copied, setCopied]             = useState(false);
  const [language, setLanguage]         = useState('es');

  const handleSubmit = async () => {
    if (!linkedinData.trim()) {
      setError('Por favor pegá tu información de LinkedIn.');
      return;
    }
    setError('');
    setResult('');
    setLoading(true);
    try {
      const res = await fetch('/api/optimize-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinData, targetRole, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar');
      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LinkedIn-Optimizado-CSS4JOBS.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tips = [
    { icon: '🎯', text: 'Pegá tu headline, about/resumen, y al menos 2–3 roles de experiencia' },
    { icon: '📊', text: 'Cuanto más completa sea la info, mejor será el análisis' },
    { icon: '🔑', text: 'Incluí tus skills actuales para recibir recomendaciones de keywords' },
    { icon: '📈', text: 'Podés copiar el texto directo desde tu perfil de LinkedIn' },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <Linkedin size={12} /> LinkedIn Optimizer · Powered by Claude AI
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Optimizá tu LinkedIn con IA</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Pegá tu perfil y recibí un análisis completo con mejoras específicas para aparecer en más búsquedas de reclutadores.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="space-y-5">
            {/* LinkedIn Data */}
            <div className="card">
              <h2 className="font-bold text-white flex items-center gap-2 mb-4">
                <Linkedin size={16} className="text-blue-400" /> Tu perfil de LinkedIn
              </h2>
              <textarea
                value={linkedinData}
                onChange={e => setLinkedinData(e.target.value)}
                className="textarea"
                rows={16}
                placeholder={`Pegá aquí la información de tu perfil de LinkedIn...\n\nEjemplo:\nHEADLINE: Sales Manager | B2B | SaaS\n\nABOUT:\nSoy un profesional con 8 años de experiencia...\n\nEXPERIENCIA:\nSales Manager en Empresa XYZ (2020–presente)\n- Lideré equipo de 5 personas...\n- Aumenté revenue un 40%...\n\nSKILLS: Salesforce, CRM, negociación, B2B...`}
              />
              <p className="text-xs text-gray-600 mt-2">{linkedinData.length} caracteres</p>
            </div>

            {/* Target Role */}
            <div className="card py-4">
              <label className="text-sm font-semibold text-gray-300 mb-2 block flex items-center gap-2">
                <Target size={14} className="text-blue-400" /> Rol objetivo (opcional)
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="input"
                placeholder="Ej: Senior Sales Manager, Product Manager, Data Analyst..."
              />
              <p className="text-xs text-gray-500 mt-2">Si lo especificás, la IA optimizará tu perfil para ese rol en particular.</p>
            </div>

            {/* Language */}
            <div className="card py-4">
              <label className="text-sm font-semibold text-gray-300 mb-3 block">Idioma del análisis</label>
              <div className="flex gap-2">
                {[{ v: 'es', label: '🇪🇸 Español' }, { v: 'en', label: '🇬🇧 English' }, { v: 'pt', label: '🇧🇷 Português' }].map(l => (
                  <button
                    key={l.v}
                    onClick={() => setLanguage(l.v)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${language === l.v ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Tips */}
          <div className="space-y-5">
            {/* Tips card */}
            <div className="card border-blue-500/20">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Zap size={16} className="text-blue-400" /> ¿Qué incluir para mejores resultados?
              </h3>
              <div className="space-y-3">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50">
                    <span className="text-lg">{tip.icon}</span>
                    <p className="text-gray-300 text-sm leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What you get */}
            <div className="card border-blue-500/20">
              <h3 className="font-bold text-white mb-4">📋 Qué recibirás en el análisis</h3>
              <div className="space-y-2">
                {[
                  '📊 Score del perfil (0-100)',
                  '🎯 Headline optimizado con keywords',
                  '📝 Sección About reescrita (3 párrafos)',
                  '💼 Mejoras para cada rol de experiencia',
                  '🔑 10 keywords para agregar',
                  '📈 5 acciones rápidas para hoy',
                  '🌟 Secciones faltantes para completar',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle size={13} className="text-blue-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* How to copy from LinkedIn */}
            <div className="card py-4 border-gray-700/50 bg-gray-900/30">
              <h3 className="font-semibold text-gray-300 mb-2 text-sm">💡 ¿Cómo copiar tu LinkedIn?</h3>
              <ol className="space-y-1 text-xs text-gray-500 list-decimal list-inside">
                <li>Abrí tu perfil de LinkedIn</li>
                <li>Seleccioná el texto de cada sección (Headline, About, Experiencia, Skills)</li>
                <li>Copialo y pegalo aquí en orden</li>
                <li>No necesitás el formato exacto — la IA entiende texto libre</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary text-base px-10 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Analizando tu LinkedIn con IA...
              </>
            ) : (
              <><Linkedin size={18} /> Optimizar mi LinkedIn ahora</>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-8 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-400" /> Análisis LinkedIn — Completado
              </h2>
              <div className="flex gap-2">
                <button onClick={copyResult} className="btn-outline text-xs py-1.5 px-3">
                  {copied ? <><CheckCircle size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                </button>
                <button onClick={downloadResult} className="btn-primary text-xs py-1.5 px-3">
                  <Download size={12} /> Descargar .txt
                </button>
              </div>
            </div>
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-gray-800/50 rounded-xl p-6 max-h-[700px] overflow-y-auto">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
