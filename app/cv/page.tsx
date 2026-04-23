'use client';
import { useState, useRef } from 'react';
import { Upload, FileText, Clipboard, Download, Zap, AlertCircle, CheckCircle, Copy, Mail } from 'lucide-react';
import { useLang } from '@/lib/i18n';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Load jsPDF from CDN and generate a PDF download
async function downloadAsPDF(text: string, filename: string) {
  const win = window as any;
  if (!win.jspdf) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load jsPDF'));
      document.head.appendChild(script);
    });
  }
  const { jsPDF } = win.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  const margin = 20;
  const maxWidth = 210 - margin * 2;
  const lineHeight = 5.5;
  let y = margin;

  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    if (para.trim() === '') {
      y += lineHeight * 0.5;
      if (y > 277) { doc.addPage(); y = margin; }
      continue;
    }
    const lines = doc.splitTextToSize(para, maxWidth);
    for (const line of lines) {
      if (y > 277) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += lineHeight;
    }
  }
  doc.save(filename);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function CVTailoringPage() {
  const { t } = useLang();
  const [cvText, setCvText]             = useState('');
  const [jobDesc, setJobDesc]           = useState('');
  const [result, setResult]             = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [copied, setCopied]             = useState(false);
  const [language, setLanguage]         = useState('es');
  const [activeTab, setActiveTab]       = useState<'paste'|'upload'>('paste');
  const [pdfLoading, setPdfLoading]     = useState(false);

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
    if (!cvText.trim() || !jobDesc.trim()) {
      setError(t('cv_error'));
      return;
    }
    setError('');
    setResult('');
    setClResult('');
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
    a.href = url;
    a.download = 'CV-CSS4JOBS.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCVPDF = async () => {
    setPdfLoading(true);
    try {
      await downloadAsPDF(result, 'CV-CSS4JOBS.pdf');
    } catch (_err) {
      alert('Error generating PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Cover letter handlers
  const generateCoverLetter = async () => {
    if (!result.trim() || !jobDesc.trim()) return;
    setClError('');
    setClResult('');
    setClLoading(true);
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
    try {
      await downloadAsPDF(clResult, 'CoverLetter-CSS4JOBS.pdf');
    } catch (_err) {
      alert('Error generating PDF. Please try again.');
    } finally {
      setClPdfLoading(false);
    }
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
                <h2 className="font-bold text-white flex items-center gap-2"><FileText size={16} className="text-indigo-400" /> {t('cv_label')}</h2>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" /> {t('cv_result_title')}
              </h2>
              <div className="flex gap-2 flex-wrap justify-end">
                <button onClick={copyResult} className="btn-outline text-xs py-1.5 px-3">
                  {copied ? <><CheckCircle size={12} /> {t('cv_copied')}</> : <><Copy size={12} /> {t('cv_copy')}</>}
                </button>
                <button onClick={downloadTxt} className="btn-outline text-xs py-1.5 px-3">
                  <Download size={12} /> {t('cv_download')}
                </button>
                <button onClick={downloadCVPDF} disabled={pdfLoading} className="btn-primary text-xs py-1.5 px-3 disabled:opacity-60">
                  {pdfLoading
                    ? <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> PDF...</>
                    : <><Download size={12} /> {t('cv_download_pdf')}</>
                  }
                </button>
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
              <button
                onClick={generateCoverLetter}
                disabled={clLoading}
                className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clLoading ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{t('cl_loading')}</>
                ) : (
                  <><Mail size={15} /> {t('cl_generate')}</>
                )}
              </button>
            )}

            {clResult && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" /> {t('cl_result_title')}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={copyClResult} className="btn-outline text-xs py-1.5 px-3">
                      {clCopied ? <><CheckCircle size={12} /> {t('cl_copied')}</> : <><Copy size={12} /> {t('cl_copy')}</>}
                    </button>
                    <button onClick={downloadClPDF} disabled={clPdfLoading} className="btn-primary text-xs py-1.5 px-3 disabled:opacity-60">
                      {clPdfLoading
                        ? <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> PDF...</>
                        : <><Download size={12} /> {t('cl_download_pdf')}</>
                      }
                    </button>
                  </div>
                </div>
                <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-gray-800/50 rounded-xl p-6 max-h-[500px] overflow-y-auto">{clResult}</pre>
                <button
                  onClick={() => { setClResult(''); setClError(''); }}
                  className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
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
