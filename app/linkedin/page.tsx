'use client';
import { useState } from 'react';
import { Linkedin, Target, Zap, AlertCircle, CheckCircle, Copy, Download } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export default function LinkedInPage() {
  const { t } = useLang();
  const [linkedinData, setLinkedinData] = useState('');
  const [targetRole, setTargetRole]     = useState('');
  const [result, setResult]             = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [copied, setCopied]             = useState(false);
  const [language, setLanguage]         = useState('es');

  const handleSubmit = async () => {
    if (\!linkedinData.trim()) {
      setError(t('li_error'));
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
      if (\!res.ok) throw new Error(data.error || 'Error');
      setResult(data.analysis);
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

  const downloadResult = () => {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LinkedIn-CSS4JOBS.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <Linkedin size={12} /> {t('li_badge')}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{t('li_h1')}</h1>
          <p className="text-gray-400 max-w-xl mx-auto">{t('li_desc')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="card">
              <h2 className="font-bold text-white flex items-center gap-2 mb-4">
                <Linkedin size={16} className="text-blue-400" /> {t('li_label')}
              </h2>
              <textarea value={linkedinData} onChange={e => setLinkedinData(e.target.value)} className="textarea" rows={16} placeholder={t('li_placeholder')} />
              <p className="text-xs text-gray-600 mt-2">{linkedinData.length} chars</p>
            </div>

            <div className="card py-4">
              <label className="text-sm font-semibold text-gray-300 mb-2 block flex items-center gap-2">
                <Target size={14} className="text-blue-400" /> {t('li_role_label')}
              </label>
              <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} className="input" placeholder={t('li_role_placeholder')} />
              <p className="text-xs text-gray-500 mt-2">{t('li_role_hint')}</p>
            </div>

            <div className="card py-4">
              <label className="text-sm font-semibold text-gray-300 mb-3 block">{t('li_lang_label')}</label>
              <div className="flex gap-2">
                {[{ v: 'es', label: '🇪🇸 Español' }, { v: 'en', label: '🇬🇧 English' }, { v: 'pt', label: '🇧🇷 Português' }].map(l => (
                  <button key={l.v} onClick={() => setLanguage(l.v)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${language === l.v ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="card border-blue-500/20">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Zap size={16} className="text-blue-400" /> {t('li_tips_title')}
              </h3>
              <div className="space-y-3">
                {[t('li_tip1'), t('li_tip2'), t('li_tip3'), t('li_tip4')].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50">
                    <span className="text-lg">{['🎯','📊','🔑','📈'][i]}</span>
                    <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card border-blue-500/20">
              <h3 className="font-bold text-white mb-4">📋 {t('li_get_title')}</h3>
              <div className="space-y-2">
                {['📊 Score (0-100)','🎯 Headline','📝 About / Summary','💼 Experience','🔑 10 Keywords','📈 Quick Wins','🌟 Missing Sections'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle size={13} className="text-blue-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="card py-4 border-gray-700/50 bg-gray-900/30">
              <h3 className="font-semibold text-gray-300 mb-2 text-sm">💡 {t('li_how_title')}</h3>
              <ol className="space-y-1 text-xs text-gray-500 list-decimal list-inside">
                <li>{t('li_how1')}</li>
                <li>{t('li_how2')}</li>
                <li>{t('li_how3')}</li>
                <li>{t('li_how4')}</li>
              </ol>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button onClick={handleSubmit} disabled={loading} className="btn-primary text-base px-10 py-4 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}>
            {loading ? (
              <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{t('li_loading')}</>
            ) : (
              <><Linkedin size={18} /> {t('li_submit')}</>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-8 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-400" /> {t('li_result_title')}
              </h2>
              <div className="flex gap-2">
                <button onClick={copyResult} className="btn-outline text-xs py-1.5 px-3">
                  {copied ? <><CheckCircle size={12} /> {t('cv_copied')}</> : <><Copy size={12} /> {t('cv_copy')}</>}
                </button>
                <button onClick={downloadResult} className="btn-primary text-xs py-1.5 px-3">
                  <Download size={12} /> {t('cv_download')}
                </button>
              </div>
            </div>
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-gray-800/50 rounded-xl p-6 max-h-[700px] overflow-y-auto">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
