'use client';
import { useState, useRef } from 'react';
import { Upload, FileText, Clipboard, Download, Zap, AlertCircle, CheckCircle, Copy } from 'lucide-react';

export default function CVTailoringPage() {
  const [cvText, setCvText]             = useState('');
  const [jobDesc, setJobDesc]           = useState('');
  const [result, setResult]             = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [copied, setCopied]             = useState(false);
  const [language, setLanguage]         = useState('es');
  const [activeTab, setActiveTab]       = useState<'paste'|'upload'>('paste');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCvText(text);
    setActiveTab('paste');
  };

  const handleSubmit = async () => {
    if (!cvText.trim() || !jobDesc.trim()) {
      setError('Por favor ingresá tu CV y la descripción del puesto.');
      return;
    }
    setError('');
    setResult('');
    setLoading(true);
    try {
      const res = await fetch('/api/tailor-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription: jobDesc, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar');
      setResult(data.tailoredCV);
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
    a.download = 'CV-Tailoreado-CSS4JOBS.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Zap size={12} /> CV Tailoring · Powered by Claude AI
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Tailoreá tu CV con IA</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Pegá tu CV y la descripción del puesto. La IA lo adapta en segundos para maximizar tu match ATS.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Inputs */}
          <div className="space-y-5">
            {/* CV Input */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2"><FileText size={16} className="text-indigo-400" /> Tu CV actual</h2>
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab('paste')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === 'paste' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Clipboard size={12} className="inline mr-1" />Pegar texto
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Upload size={12} className="inline mr-1" />Subir archivo
                  </button>
                  <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleFile} />
                </div>
              </div>
              <textarea
                value={cvText}
                onChange={e => setCvText(e.target.value)}
                className="textarea"
                rows={14}
                placeholder="Pegá aquí el texto completo de tu CV actual...&#10;&#10;Incluí: nombre, contacto, resumen, experiencia, educación, habilidades..."
              />
              <p className="text-xs text-gray-600 mt-2">{cvText.length} caracteres</p>
            </div>

            {/* Language */}
            <div className="card py-4">
              <label className="text-sm font-semibold text-gray-300 mb-3 block">Idioma del CV tailoreado</label>
              <div className="flex gap-2">
                {[{ v: 'es', label: '🇪🇸 Español' }, { v: 'en', label: '🇬🇧 English' }, { v: 'pt', label: '🇧🇷 Português' }].map(l => (
                  <button
                    key={l.v}
                    onClick={() => setLanguage(l.v)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${language === l.v ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Job Description */}
          <div className="card">
            <h2 className="font-bold text-white flex items-center gap-2 mb-4">
              <FileText size={16} className="text-emerald-400" /> Descripción del puesto
            </h2>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              className="textarea"
              rows={18}
              placeholder="Pegá aquí la descripción completa del trabajo al que querés aplicar...&#10;&#10;Incluí todo: responsabilidades, requisitos, empresa, beneficios..."
            />
            <p className="text-xs text-gray-600 mt-2">{jobDesc.length} caracteres</p>
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
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Tailoreando tu CV con IA...
              </>
            ) : (
              <><Zap size={18} /> Tailorear mi CV ahora</>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-8 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" /> CV Tailoreado — Listo para enviar
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
            <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-gray-800/50 rounded-xl p-6 max-h-[600px] overflow-y-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
