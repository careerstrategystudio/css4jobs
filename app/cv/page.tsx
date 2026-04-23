'use client';
import { useState, useRef } from 'react';
import { Upload, FileText, Clipboard, Download, Zap, AlertCircle, CheckCircle, Copy, Mail, Lock, Star } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { usePro } from '@/lib/pro';

/* eslint-disable @typescript-eslint/no-explicit-any */
async function downloadAsPDF(text: string, filename: string) {
  const win = window as any;
  if (!win.jspdf) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('jsPDF load failed'));
      document.head.appendChild(script);
    });
  }

  const { jsPDF } = win.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const ML = 20, MR = 20, PW = 210;
  const CW = PW - ML - MR;
  let y = 22;
  const newPage = () => { doc.addPage(); y = 22; };
  const checkY = (h: number) => { if (y + h > 280) newPage(); };

  const rawLines = text.split('\n');
  let headersDone = false;
  let nameWritten = false;
  let titleWritten = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) {
      if (headersDone) y += 2.5;
      continue;
    }

    // — NAME (first non-empty line) —
    if (!nameWritten) {
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 15, 15);
      checkY(12);
      doc.text(line, ML, y);
      y += 9;
      nameWritten = true;
      continue;
    }

    // — TITLE (second non-empty line, not all caps) —
    if (!titleWritten) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(79, 70, 229); // indigo-600
      checkY(7);
      doc.text(line, ML, y);
      y += 5;
      // Separator line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.4);
      doc.line(ML, y, PW - MR, y);
      y += 7;
      doc.setTextColor(40, 40, 40);
      titleWritten = true;
      headersDone = true;
      continue;
    }

    // — Contact line (phone, email, linkedin — short line with | or @) —
    const isContact = (line.includes('@') || line.includes('linkedin') || line.match(/\+\d/)) && line.length < 120;
    if (isContact && y < 50) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const parts = doc.splitTextToSize(line, CW);
      for (const p of parts) {
        checkY(5);
        doc.text(p, ML, y);
        y += 4.5;
      }
      y += 2;
      doc.setTextColor(40, 40, 40);
      continue;
    }

    // — SECTION HEADER (all caps, short, no bullets) —
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
    const isHeader =
      !isBullet &&
      line.length < 55 &&
      line === line.toUpperCase() &&
      /[A-ZÁÉÍÓÚÑ]/.test(line) &&
      !line.match(/^\d/);

    if (isHeader) {
      y += 4;
      checkY(10);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 15, 15);
      doc.text(line, ML, y);
      y += 2;
      doc.setDrawColor(80, 80, 80);
      doc.setLineWidth(0.5);
      doc.line(ML, y, PW - MR, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      continue;
    }

    // — Bullet point —
    if (isBullet) {
      const indent = ML + 5;
      const bw = CW - 5;
      const bulletText = line.replace(/^[•\-\*]\s*/, '');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      // Draw bullet dot
      checkY(5);
      doc.setFillColor(79, 70, 229);
      doc.circle(ML + 1.5, y - 1.2, 0.8, 'F');
      const wrapped = doc.splitTextToSize(bulletText, bw);
      for (let wi = 0; wi < wrapped.length; wi++) {
        checkY(5);
        doc.text(wrapped[wi], indent, y);
        y += 5;
      }
      continue;
    }

    // — Date / company line (contains date patterns) —
    const isDateLine = line.match(/\d{2}\/\d{4}|\d{4}\s*[-–]\s*(\d{4}|present|presente|actual)/i);
    if (isDateLine) {
      checkY(6);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      const wrapped = doc.splitTextToSize(line, CW);
      for (const l of wrapped) {
        checkY(5);
        doc.text(l, ML, y);
        y += 4.8;
      }
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      continue;
    }

    // — Regular body text —
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const wrapped = doc.splitTextToSize(line, CW);
    for (const wl of wrapped) {
      checkY(5);
      doc.text(wl, ML, y);
      y += 5;
    }
  }

  doc.save(filename);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Small inline Pro unlock form
function ProUnlockInline({ onUnlock }: { onUnlock: (code: string) => boolean }) {
  const { t } = useLang();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handle = () => {
    if (onUnlock(code)) {
      setSuccess(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (success) {
    return (
      <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
        <Star size={12} className="fill-emerald-400" /> {t('pro_unlocked_msg')}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Lock size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="password"
          value={code}
          onChange={e => { setCode(e.target.value); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && handle()}
          className={`pl-6 pr-2 py-1.5 rounded-lg bg-gray-800 border text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500 w-36 ${error ? 'border-red-500/50' : 'border-gray-600'}`}
          placeholder={t('pro_unlock_placeholder')}
        />
      </div>
      <button onClick={handle} className="btn-primary text-xs py-1.5 px-3">
        {t('pro_unlock_btn')}
      </button>
      {error && <span className="text-red-400 text-xs">{t('pro_unlock_error')}</span>}
    </div>
  );
}

export default function CVTailoringPage() {
  const { t } = useLang();
  const { isPro, ready, unlockPro } = usePro();

  const [cvText, setCvText]           = useState('');
  const [jobDesc, setJobDesc]         = useState('');
  const [result, setResult]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [copied, setCopied]           = useState(false);
  const [language, setLanguage]       = useState('es');
  const [activeTab, setActiveTab]     = useState<'paste'|'upload'>('paste');
  const [pdfLoading, setPdfLoading]   = useState(false);
  const [showProForm, setShowProForm] = useState(false);

  // Cover letter state
  const [clResult, setClResult]         = useState('');
  const [clLoading, setClLoading]       = useState(false);
  const [clError, setClError]           = useState('');
  const [clCopied, setClCopied]         = useState(false);
  const [clPdfLoading, setClPdfLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCvText(text);
    setActiveTab('paste');
  };

  const handleSubmit = async () => {
    if (!cvText.trim() || !jobDesc.trim()) { setError(t('cv_error')); return; }
    setError(''); setResult(''); setClResult('');
    setLoading(true);
    try {
      const res = await fetch('/api/tailor-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription: jobDesc, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setResult(data.tailoredCV);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'CV-CSS4JOBS.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCVPDF = async () => {
    setPdfLoading(true);
    try { await downloadAsPDF(result, 'CV-CSS4JOBS.pdf'); }
    catch { alert('Error al generar PDF. Intentá de nuevo.'); }
    finally { setPdfLoading(false); }
  };

  const generateCoverLetter = async () => {
    if (!result.trim() || !jobDesc.trim()) return;
    setClError(''); setClResult(''); setClLoading(true);
    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: result, jobDescription: jobDesc, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setClResult(data.coverLetter);
    } catch (err) {
      setClError(err instanceof Error ? err.message : 'Error');
    } finally {
      setClLoading(false);
    }
  };

  const copyClResult = () => {
    navigator.clipboard.writeText(clResult);
    setClCopied(true);
    setTimeout(() => setClCopied(false), 2000);
  };

  const downloadClPDF = async () => {
    setClPdfLoading(true);
    try { await downloadAsPDF(clResult, 'CoverLetter-CSS4JOBS.pdf'); }
    catch { alert('Error al generar PDF. Intentá de nuevo.'); }
    finally { setClPdfLoading(false); }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Zap size={12} /> {t('cv_badge')}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{t('cv_h1')}</h1>
          <p className="text-gray-400 max-w-xl mx-auto">{t('cv_desc')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-indigo-400" /> {t('cv_label')}
                </h2>
                <div className="flex gap-1">
                  <button onClick={() => setActiveTab('paste')} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === 'paste' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                    <Clipboard size={12} className="inline mr-1" />{t('cv_paste')}
                  </button>
                  <button onClick={() => fileRef.current?.click()} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                    <Upload size={12} className="inline mr-1" />{t('cv_upload')}
                  </button>
                  <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleFile} />
                </div>
              </div>
              <textarea value={cvText} onChange={e => setCvText(e.target.value)} className="textarea" rows={14} placeholder={t('cv_placeholder')} />
              <p className="text-xs text-gray-600 mt-2">{cvText.length} chars</p>
            </div>

            <div className="card py-4">
              <label className="text-sm font-semibold text-gray-300 mb-3 block">{t('cv_lang_label')}</label>
              <div className="flex gap-2">
                {[{ v: 'es', label: '🇪🇸 Español' }, { v: 'en', label: '🇬🇧 English' }, { v: 'pt', label: '🇧🇷 Português' }].map(l => (
                  <button key={l.v} onClick={() => setLanguage(l.v)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${language === l.v ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-bold text-white flex items-center gap-2 mb-4">
              <FileText size={16} className="text-emerald-400" /> {t('cv_job_label')}
            </h2>
            <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="textarea" rows={18} placeholder={t('cv_job_placeholder')} />
            <p className="text-xs text-gray-600 mt-2">{jobDesc.length} chars</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button onClick={handleSubmit} disabled={loading} className="btn-primary text-base px-10 py-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{t('cv_loading')}</>
            ) : (
              <><Zap size={18} /> {t('cv_submit')}</>
            )}
          </button>
        </div>

        {/* Tailored CV Result */}
        {result && (
          <div className="mt-8 card">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="font-bold text-white flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" /> {t('cv_result_title')}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={copyResult} className="btn-outline text-xs py-1.5 px-3">
                  {copied ? <><CheckCircle size={12} /> {t('cv_copied')}</> : <><Copy size={12} /> {t('cv_copy')}</>}
                </button>
                <button onClick={downloadTxt} className="btn-outline text-xs py-1.5 px-3">
                  <Download size={12} /> {t('cv_download')}
                </button>

                {/* PDF — Pro only */}
                {ready && (
                  isPro ? (
                    <button onClick={downloadCVPDF} disabled={pdfLoading} className="btn-primary text-xs py-1.5 px-3 disabled:opacity-60">
                      {pdfLoading
                        ? <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> PDF...</>
                        : <><Download size={12} /> {t('cv_download_pdf')}</>
                      }
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {!showProForm ? (
                        <button
                          onClick={() => setShowProForm(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-xs text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition-all"
                        >
                          <Lock size={11} /> {t('cv_download_pdf')} <span className="ml-1 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">{t('pro_locked_label')}</span>
                        </button>
                      ) : (
                        <ProUnlockInline onUnlock={unlockPro} />
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
            <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-gray-800/50 rounded-xl p-6 max-h-[600px] overflow-y-auto">{result}</pre>
          </div>
        )}

        {/* Cover Letter Section */}
        {result && (
          <div className="mt-6 card border-2 border-indigo-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <Mail size={17} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="font-bold text-white">{t('cl_title')}</h2>
                <p className="text-gray-500 text-xs">{t('cl_desc')}</p>
              </div>
            </div>

            {clError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs">{clError}</p>
              </div>
            )}

            {!clResult && (
              <button onClick={generateCoverLetter} disabled={clLoading} className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {clLoading ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{t('cl_loading')}</>
                ) : (
                  <><Mail size={15} /> {t('cl_generate')}</>
                )}
              </button>
            )}

            {clResult && (
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" /> {t('cl_result_title')}
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={copyClResult} className="btn-outline text-xs py-1.5 px-3">
                      {clCopied ? <><CheckCircle size={12} /> {t('cl_copied')}</> : <><Copy size={12} /> {t('cl_copy')}</>}
                    </button>
                    {ready && isPro && (
                      <button onClick={downloadClPDF} disabled={clPdfLoading} className="btn-primary text-xs py-1.5 px-3 disabled:opacity-60">
                        {clPdfLoading
                          ? <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> PDF...</>
                          : <><Download size={12} /> {t('cl_download_pdf')}</>
                        }
                      </button>
                    )}
                  </div>
                </div>
                <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-gray-800/50 rounded-xl p-6 max-h-[500px] overflow-y-auto">{clResult}</pre>
                <button onClick={() => { setClResult(''); setClError(''); }} className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  ↺ {language === 'en' ? 'Regenerate' : 'Regenerar'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
