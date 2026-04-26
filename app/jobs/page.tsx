'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Search, MapPin, Building2, Zap, Target, CheckCircle, XCircle,
  Mail, Copy, Globe, Lock, Star, Bookmark, Heart, ChevronDown, ChevronUp, X, AlertCircle,
  Link2, ExternalLink, AlignLeft, Upload,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { usePro } from '@/lib/pro';
import QuickProfileForm from '@/components/QuickProfileForm';

const COUNTRY_FLAGS: Record<string, string> = {
  us:'🇺🇸',gb:'🇬🇧',au:'🇦🇺',ca:'🇨🇦',de:'🇩🇪',fr:'🇫🇷',
  es:'🇪🇸',nl:'🇳🇱',sg:'🇸🇬',br:'🇧🇷',at:'🇦🇹',nz:'🇳🇿',
  pl:'🇵🇱',in:'🇮🇳',za:'🇿🇦',ie:'🇮🇪',it:'🇮🇹',
  mx:'🇲🇽',ar:'🇦🇷',co:'🇨🇴',cl:'🇨🇱',pe:'🇵🇪',
  remote:'🌐',latam:'🌎',
};
const COUNTRY_NAMES: Record<string, string> = {
  us:'USA',gb:'UK',au:'Australia',ca:'Canada',de:'Germany',fr:'France',
  es:'España',nl:'Netherlands',sg:'Singapore',br:'Brasil',at:'Austria',
  nz:'New Zealand',pl:'Poland',in:'India',za:'South Africa',ie:'Irlanda',
  it:'Italia',mx:'México',ar:'Argentina',co:'Colombia',cl:'Chile',pe:'Perú',
  remote:'Remoto',latam:'LatAm',
};

const COUNTRY_FILTERS = [
  { id: 'all',    flag: '🌍', label: 'Todo' },
  { id: 'remote', flag: '🌐', label: 'Remoto' },
  { id: 'es',     flag: '🇪🇸', label: 'España' },
  { id: 'latam',  flag: '🌎', label: 'LatAm' },
  { id: 'mx',     flag: '🇲🇽', label: 'México' },
  { id: 'br',     flag: '🇧🇷', label: 'Brasil' },
  { id: 'ar',     flag: '🇦🇷', label: 'Argentina' },
  { id: 'co',     flag: '🇨🇴', label: 'Colombia' },
  { id: 'cl',     flag: '🇨🇱', label: 'Chile' },
  { id: 'pe',     flag: '🇵🇪', label: 'Perú' },
  { id: 'gb',     flag: '🇬🇧', label: 'UK' },
  { id: 'ie',     flag: '🇮🇪', label: 'Irlanda' },
  { id: 'de',     flag: '🇩🇪', label: 'Alemania' },
  { id: 'fr',     flag: '🇫🇷', label: 'Francia' },
  { id: 'it',     flag: '🇮🇹', label: 'Italia' },
  { id: 'nl',     flag: '🇳🇱', label: 'P. Bajos' },
];

interface Job {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  created: string;
  redirect_url: string;
  _country: string;
}

interface MatchResult {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  topKeywords: string[];
}

// ── Gauge loading skeleton ────────────────────────────────────────────────────
function MatchGaugeLoading() {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="38" fill="none" stroke="#E5E8F5" strokeWidth="8" />
        <circle cx="45" cy="45" r="38" fill="none" stroke="#5B6CFF" strokeWidth="8"
          strokeDasharray="239" strokeDashoffset="180" strokeLinecap="round"
          transform="rotate(-90 45 45)" className="animate-pulse" />
        <text x="45" y="49" textAnchor="middle" fill="#64748B" fontSize="13" fontWeight="700">···</text>
      </svg>
      <span className="text-[10px] font-bold text-brand-600 animate-pulse">ANALIZANDO</span>
    </div>
  );
}

// ── Circular match gauge ──────────────────────────────────────────────────────
function MatchGauge({ score }: { score: number }) {
  const r     = 38;
  const circ  = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color  = score >= 80 ? '#2CBFAE' : score >= 60 ? '#5B6CFF' : '#F47A2A';
  const label  = score >= 80 ? 'STRONG MATCH' : score >= 60 ? 'GOOD MATCH' : 'FAIR MATCH';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#E5E8F5" strokeWidth="8" />
        <circle
          cx="45" cy="45" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="49" textAnchor="middle" fill="#0F172A" fontSize="18" fontWeight="800">
          {score}%
        </text>
      </svg>
      <span className="text-[10px] font-bold tracking-wider" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Company logo initial ──────────────────────────────────────────────────────
const LOGO_COLORS = [
  'bg-brand-600','bg-accent-500','bg-highlight-500','bg-brand-500',
  'bg-accent-600','bg-highlight-600','bg-brand-700','bg-accent-700',
];
function CompanyLogo({ name }: { name: string }) {
  const idx   = name.charCodeAt(0) % LOGO_COLORS.length;
  const color = LOGO_COLORS[idx];
  return (
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0 text-white font-black text-lg shadow-soft`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Filter chip ───────────────────────────────────────────────────────────────
function Chip({ value, current, set, label }: { value: string; current: string; set: (v: string) => void; label: string }) {
  const active = current === value;
  return (
    <button
      onClick={() => set(active ? '' : value)}
      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border whitespace-nowrap ${
        active
          ? 'bg-brand-600 border-brand-500 text-white shadow-sm shadow-glow'
          : 'bg-slate-100 border-slate-300 text-slate-500 hover:text-brand-700 hover:border-brand-600/50'
      }`}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const { lang } = useLang();
  const { isPro, ready } = usePro();
  const es = lang === 'es';

  const [query,    setQuery]    = useState('');
  const [days,     setDays]     = useState('');
  const [jobType,  setJobType]  = useState('');
  const [workMode, setWorkMode] = useState('');
  const [expLevel, setExpLevel] = useState('');
  const [country,  setCountry]  = useState('all');

  const [jobs,     setJobs]     = useState<Job[]>([]);
  const [portals,  setPortals]  = useState<Array<{ name: string; url: string }>>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [searched, setSearched] = useState(false);

  const [cvText,   setCvText]   = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [matching, setMatching] = useState<string | null>(null);
  const [matches,  setMatches]  = useState<Record<string, MatchResult>>({});
  const [saved,    setSaved]    = useState<Record<string, boolean>>({});
  const [liked,    setLiked]    = useState<Record<string, boolean>>({});

  const [clLoading, setClLoading] = useState<string | null>(null);
  const [clTexts,   setClTexts]   = useState<Record<string, string>>({});
  const [clCopied,  setClCopied]  = useState<string | null>(null);

  const [adaptedCVs,   setAdaptedCVs]   = useState<Record<string, string>>({});
  const [adaptLoading, setAdaptLoading] = useState<string | null>(null);
  const [adaptCopied,  setAdaptCopied]  = useState<string | null>(null);

  // Auto-matching (runs silently after search)
  const [autoMatching, setAutoMatching] = useState<Set<string>>(new Set());
  const cvRef = useRef(cvText);
  useEffect(() => { cvRef.current = cvText; }, [cvText]);

  // Persist CV in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('css4jobs_cv');
    if (saved) setCvText(saved);
  }, []);
  useEffect(() => {
    if (cvText) localStorage.setItem('css4jobs_cv', cvText);
  }, [cvText]);

  // File upload with OCR fallback
  const fileRef      = useRef<HTMLInputElement>(null);
  const liScreenRef  = useRef<HTMLInputElement>(null);   // screenshot upload for LinkedIn
  const [ocrLoading,    setOcrLoading]    = useState(false);
  const [liOcrLoading,  setLiOcrLoading]  = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const isPdf   = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isImage = file.type.startsWith('image/');
    if (!isPdf && !isImage) {
      setCvText(await file.text());
      setCvTab('text');
      return;
    }
    if (isPdf) {
      try {
        const raw = await file.text();
        const readable = raw.replace(/[^\x20-\x7E\n\r\t]/g, '').trim();
        if (readable.length > 200) { setCvText(readable); setCvTab('text'); return; }
      } catch { /* fall through */ }
    }
    setOcrLoading(true); setCvTab('text');
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('/api/ocr-cv', { method: 'POST', body: form });
      const data = await res.json();
      if (data.text) setCvText(data.text);
    } catch { /* ignore */ } finally { setOcrLoading(false); }
  };

  // LinkedIn screenshot handler (mobile: user takes screenshot of their profile)
  const handleLinkedInScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setLiOcrLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('/api/linkedin-ocr', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success && data.cvText) {
        setCvText(data.cvText);
        setCvTab('text');
        setLiStep('done');
      } else {
        setLiStep('pdf'); // show options again
      }
    } catch { setLiStep('pdf'); } finally { setLiOcrLoading(false); }
  };

  // LinkedIn import state
  const [cvTab,        setCvTab]        = useState<'text' | 'linkedin'>('text');
  const [linkedinUrl,  setLinkedinUrl]  = useState('');
  const [liLoading,    setLiLoading]    = useState(false);
  const [liMessage,    setLiMessage]    = useState<{ type: 'blocked' | 'partial'; text: string } | null>(null);

  const [liStep, setLiStep] = useState<'idle' | 'loading' | 'done' | 'pdf' | 'form'>('idle');

  const importLinkedIn = async () => {
    if (!linkedinUrl.trim()) return;
    setLiStep('loading'); setLiMessage(null);
    try {
      const res  = await fetch('/api/linkedin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkedinUrl.trim() }),
      });
      const data = await res.json();
      if (data.success && data.cvText) {
        setCvText(data.cvText);
        setCvTab('text');
        setLiStep('done');
      } else if (data.blocked) {
        setLiStep('pdf');
      } else if (data.error) {
        setLiMessage({ type: 'blocked', text: data.error });
        setLiStep('idle');
      }
    } catch {
      setLiStep('idle');
    } finally { setLiLoading(false); }
  };

  // Silent auto-match for a list of jobs
  const autoMatchJobs = useCallback(async (jobList: Job[], cv: string) => {
    const calls = jobList.map(async (job) => {
      setAutoMatching(prev => new Set([...prev, job.id]));
      try {
        const res  = await fetch('/api/job-match', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cvText: cv,
            jobDescription: job.title + '\n' + job.company.display_name + '\n' + job.description,
            language: 'es',
          }),
        });
        const data = await res.json();
        setMatches(prev => ({ ...prev, [job.id]: data }));
      } catch { /* silent */ } finally {
        setAutoMatching(prev => { const s = new Set(prev); s.delete(job.id); return s; });
      }
    });
    await Promise.all(calls);
  }, []);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true); setError(''); setSearched(true);
    try {
      const params = new URLSearchParams({ q: query });
      if (days)     params.set('days',    days);
      if (jobType)  params.set('type',    jobType);
      if (workMode) params.set('mode',    workMode);
      if (expLevel) params.set('exp',     expLevel);
      if (country)  params.set('country', country);
      const res  = await fetch(`/api/search-jobs?${params}`);
      const data = await res.json();
      const results: Job[] = data.results || [];
      setJobs(results);
      setPortals(Array.isArray(data.portals) ? data.portals : []);
      setMatches({});
      // Auto-match first 8 jobs if CV is loaded
      const cv = cvRef.current.trim();
      if (cv && results.length > 0) {
        autoMatchJobs(results.slice(0, 8), cv);
      }
    } catch {
      setError(es ? 'Error al buscar empleos.' : 'Error searching jobs.');
    } finally {
      setLoading(false);
    }
  }, [query, days, jobType, workMode, expLevel, country, es, autoMatchJobs]);

  const generateCoverLetter = async (job: Job) => {
    if (!cvText.trim()) return;
    setClLoading(job.id);
    try {
      const jobDesc = `${job.title}\n${job.company.display_name}\n${job.location.display_name}\n\n${job.description}`;
      const res  = await fetch('/api/generate-cover-letter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription: jobDesc, language: lang }),
      });
      const data = await res.json();
      setClTexts(prev => ({ ...prev, [job.id]: data.coverLetter || '' }));
    } catch { /* ignore */ } finally { setClLoading(null); }
  };

  const adaptCV = async (job: Job) => {
    if (!cvText.trim()) return;
    setAdaptLoading(job.id);
    try {
      const jobDesc = `${job.title}\n${job.company.display_name}\n${job.location.display_name}\n\n${job.description}`;
      const res  = await fetch('/api/tailor-cv', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription: jobDesc, language: lang }),
      });
      const data = await res.json();
      setAdaptedCVs(prev => ({ ...prev, [job.id]: data.tailoredCV || data.cv || '' }));
    } catch { /* ignore */ } finally { setAdaptLoading(null); }
  };

  const matchCV = async (job: Job) => {
    if (!cvText.trim()) return;
    setMatching(job.id);
    try {
      const res  = await fetch('/api/job-match', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription: job.title + '\n' + job.company.display_name + '\n' + job.description, language: lang }),
      });
      const data = await res.json();
      setMatches(prev => ({ ...prev, [job.id]: data }));
    } catch { /* ignore */ } finally { setMatching(null); }
  };

  const fmtDate = (d: string) => {
    const diff = Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000));
    if (diff === 0) return es ? 'Hoy' : 'Today';
    if (diff === 1) return es ? 'Ayer' : 'Yesterday';
    if (diff < 7)   return es ? `Hace ${diff} días` : `${diff}d ago`;
    if (diff < 30)  return es ? `Hace ${Math.ceil(diff / 7)} sem.` : `${Math.ceil(diff / 7)}w ago`;
    return es ? `Hace ${Math.ceil(diff / 30)} mes.` : `${Math.ceil(diff / 30)}mo ago`;
  };

  const fmtSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return null;
  };

  const Spinner = () => (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );

  return (
    <div className="min-h-screen py-6 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
            <Search size={12} /> {es ? 'Búsqueda Global de Empleo' : 'Global Job Search'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 leading-tight">
            {es ? 'Encuentra tu próximo empleo' : 'Find your next job'}
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-sm px-2">
            {es
              ? 'Busca en más de 10 países. Sube tu CV para ver el % de match.'
              : 'Search across 10+ countries. Upload your CV to see match %.'}
          </p>
        </div>

        {/* ── CV input ── */}
        <div className="card mb-4 border border-brand-500/20 bg-gradient-to-br from-white to-brand-100/30 p-3 sm:p-5">
          {/* Row 1: title + saved badge */}
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-brand-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-900">
              {es ? 'Tu CV' : 'Your CV'}
            </span>
            {cvText.trim() && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle size={9} /> {es ? 'Guardado' : 'Saved'}
              </span>
            )}
          </div>
          {/* Row 2: tabs — full width on mobile */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-3 w-full">
            <button onClick={() => setCvTab('text')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${cvTab === 'text' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-brand-700'}`}>
              <AlignLeft size={13} />
              <span>{es ? 'Texto' : 'Text'}</span>
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-brand-700 transition-all">
              <Upload size={13} />
              <span>{es ? 'Archivo' : 'File'}</span>
            </button>
            <button onClick={() => setCvTab('linkedin')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${cvTab === 'linkedin' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-brand-700'}`}>
              <Link2 size={13} />
              <span>LinkedIn</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" className="hidden" onChange={handleFile} />


          {cvTab === 'text' ? (
            ocrLoading ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 rounded-xl bg-brand-50 border border-brand-200">
                <svg className="animate-spin h-6 w-6 text-brand-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="text-xs text-brand-400 font-semibold">{es ? 'Leyendo tu CV con IA…' : 'Reading your CV with AI…'}</p>
              </div>
            ) : (
              <textarea
                value={cvText}
                onChange={e => setCvText(e.target.value)}
                rows={3}
                placeholder={es ? 'Pega tu CV aquí para ver cuánto haces match con cada empleo...' : 'Paste your CV here to see how well you match each job...'}
                className="textarea text-sm"
              />
            )
          ) : (
            <div className="space-y-3">
              {liStep === 'done' ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">{es ? '¡Perfil importado!' : 'Profile imported!'}</p>
                    <p className="text-xs text-slate-500">{es ? 'Tu CV está listo. Revisa y completa si hace falta.' : 'Your CV is ready. Review and fill in if needed.'}</p>
                  </div>
                  <button onClick={() => { setLiStep('idle'); setLinkedinUrl(''); }} className="ml-auto text-xs text-slate-400 hover:text-slate-700">
                    <X size={13} />
                  </button>
                </div>
              ) : liStep === 'pdf' ? (
                <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-4 space-y-2.5">
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    {es ? 'LinkedIn requiere sesión iniciada — elige cómo continuar:' : 'LinkedIn requires login — choose how to continue:'}
                  </p>

                  {/* Option A: Screenshot — AI reads it (mobile & desktop) */}
                  {liOcrLoading ? (
                    <div className="flex items-center gap-3 w-full p-3 rounded-xl bg-brand-600/20 border border-brand-500/40">
                      <Spinner />
                      <p className="text-sm text-brand-300 font-semibold">
                        {es ? 'Leyendo tu perfil con IA…' : 'Reading your profile with AI…'}
                      </p>
                    </div>
                  ) : (
                    <button onClick={() => liScreenRef.current?.click()}
                      className="flex items-center gap-3 w-full p-3 rounded-xl bg-brand-600/20 border border-brand-500/40 hover:bg-brand-600/30 text-left transition-all">
                      <div className="w-9 h-9 rounded-lg bg-brand-600/40 flex items-center justify-center flex-shrink-0 text-lg">
                        📸
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {es ? 'Subir captura de pantalla de LinkedIn' : 'Upload LinkedIn screenshot'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {es ? 'La IA lee tu perfil de la imagen — rápido desde móvil o PC'
                               : 'AI reads your profile from the image — fast on mobile or PC'}
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Option B: Upload PDF (desktop) */}
                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-100 border border-slate-300 hover:border-brand-500/50 text-left transition-all">
                    <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <Upload size={15} className="text-slate-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {es ? 'Subir PDF de LinkedIn' : 'Upload LinkedIn PDF'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {es ? 'Perfil → Más (···) → Guardar como PDF' : 'Profile → More (···) → Save to PDF'}
                      </p>
                    </div>
                  </button>

                  {/* Option C: Quick form (mobile only) */}
                  <button onClick={() => setLiStep('form')}
                    className="md:hidden flex items-center gap-3 w-full p-3 rounded-xl bg-slate-100/60 border border-slate-300 hover:border-brand-500/50 text-left transition-all">
                    <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <AlignLeft size={15} className="text-slate-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {es ? 'Completar perfil manualmente' : 'Fill profile manually'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {es ? 'Formulario rápido — sin archivos' : 'Quick form — no file needed'}
                      </p>
                    </div>
                  </button>

                  <button onClick={() => setLiStep('idle')}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-500 transition-colors pt-1">
                    {es ? 'Volver' : 'Back'}
                  </button>

                  {/* Hidden inputs */}
                  <input ref={liScreenRef} type="file" accept="image/*" capture="environment"
                    className="hidden" onChange={handleLinkedInScreenshot} />
                </div>

              ) : liStep === 'form' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-1">
                    <button onClick={() => setLiStep('pdf')}
                      className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors">
                      ← {es ? 'Volver' : 'Back'}
                    </button>
                    <p className="text-sm font-semibold text-slate-900">
                      {es ? 'Completa tu perfil' : 'Fill your profile'}
                    </p>
                  </div>
                  <QuickProfileForm
                    lang={lang}
                    onSubmit={(text) => { setCvText(text); setCvTab('text'); setLiStep('done'); }}
                    onCancel={() => setLiStep('pdf')}
                  />
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={linkedinUrl}
                      onChange={e => setLinkedinUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && importLinkedIn()}
                      placeholder="https://www.linkedin.com/in/tu-perfil"
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
                    />
                    <button
                      onClick={importLinkedIn}
                      disabled={liStep === 'loading' || !linkedinUrl.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {liStep === 'loading' ? <Spinner /> : <Link2 size={13} />}
                      {es ? 'Importar' : 'Import'}
                    </button>
                  </div>
                  {liMessage?.type === 'blocked' && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{liMessage.text}</p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    {es ? 'Pega tu URL de LinkedIn y lo importamos automáticamente.' : 'Paste your LinkedIn URL and we import it automatically.'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Search + filters ── */}
        <div className="card mb-4 border border-slate-300/50 p-3 sm:p-5">
          {/* Search bar — stacks on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder={es ? 'Cargo, habilidad o empresa...' : 'Job title, skill or company...'}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 text-sm transition-all"
              />
            </div>
            <button
              onClick={search}
              disabled={loading || !query.trim()}
              className="btn-primary py-3 px-6 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-bold"
            >
              {loading ? <Spinner /> : <Search size={15} />}
              {es ? 'Buscar empleos' : 'Search jobs'}
            </button>
          </div>

          {/* Country chips — scrollable row on mobile */}
          <div className="mb-3">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Globe size={10} /> {es ? 'País' : 'Country'}
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
              {COUNTRY_FILTERS.map(cf => (
                <button key={cf.id} onClick={() => setCountry(cf.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap flex-shrink-0 ${
                    country === cf.id
                      ? 'bg-brand-600 border-brand-500 text-white shadow-sm shadow-glow'
                      : 'bg-slate-100 border-slate-300 text-slate-500 hover:text-brand-700 hover:border-brand-600/40'
                  }`}>
                  <span>{cf.flag}</span>{cf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Other filters — scrollable on mobile */}
          <div className="flex gap-x-4 gap-y-3 overflow-x-auto pb-1 scrollbar-hide flex-nowrap sm:flex-wrap">
            <div className="flex-shrink-0">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">{es ? 'Fecha' : 'Date'}</p>
              <div className="flex gap-1.5">
                <Chip value="1"  current={days}     set={setDays}     label="24h" />
                <Chip value="7"  current={days}     set={setDays}     label={es ? 'Semana' : 'Week'} />
                <Chip value="30" current={days}     set={setDays}     label={es ? 'Mes' : 'Month'} />
              </div>
            </div>
            <div className="flex-shrink-0">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">{es ? 'Modalidad' : 'Mode'}</p>
              <div className="flex gap-1.5">
                <Chip value="remote"  current={workMode} set={setWorkMode} label="Remote" />
                <Chip value="hybrid"  current={workMode} set={setWorkMode} label="Hybrid" />
                <Chip value="on-site" current={workMode} set={setWorkMode} label="On-site" />
              </div>
            </div>
            <div className="flex-shrink-0">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">{es ? 'Tipo' : 'Type'}</p>
              <div className="flex gap-1.5">
                <Chip value="full_time" current={jobType} set={setJobType} label={es ? 'Completo' : 'Full-time'} />
                <Chip value="part_time" current={jobType} set={setJobType} label={es ? 'Parcial' : 'Part-time'} />
                <Chip value="contract"  current={jobType} set={setJobType} label={es ? 'Contrato' : 'Contract'} />
              </div>
            </div>
            <div className="flex-shrink-0">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">{es ? 'Nivel' : 'Level'}</p>
              <div className="flex gap-1.5">
                <Chip value="entry level" current={expLevel} set={setExpLevel} label="Junior" />
                <Chip value="mid senior"  current={expLevel} set={setExpLevel} label="Senior" />
                <Chip value="director"    current={expLevel} set={setExpLevel} label="Director" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 mb-4">
            <AlertCircle size={14} className="text-red-400" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* ── Results count ── */}
        {searched && !loading && (
          <p className="text-slate-500 text-sm mb-4">
            {jobs.length === 0
              ? (es ? 'No se encontraron resultados.' : 'No results found.')
              : (es ? `${jobs.length} empleos encontrados` : `${jobs.length} jobs found`)}
          </p>
        )}

        {/* ── Native portals (deep search) ── */}
        {searched && !loading && portals.length > 0 && (
          <div className="card-soft mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-brand-700 mr-1">
              {es ? 'Buscar también en los portales del país:' : 'Search also on the country portals:'}
            </span>
            {portals.map(p => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="chip chip-brand hover:bg-brand-100 transition-colors"
              >
                {p.name} <ExternalLink size={11} />
              </a>
            ))}
          </div>
        )}

        {/* ── Job cards ── */}
        <div className="space-y-3">
          {jobs.map(job => {
            const isOpen      = expanded === job.id;
            const match       = matches[job.id];
            const salary      = fmtSalary(job.salary_min, job.salary_max);
            const isMatch     = matching === job.id;
            const isAutoMatch = autoMatching.has(job.id);
            const isSaved     = saved[job.id];
            const isLiked     = liked[job.id];

            return (
              <div key={job.id} className="card border border-slate-300/50 hover:border-brand-300 transition-all p-0 overflow-hidden">

                {/* Top accent line */}
                <div className="h-0.5 bg-gradient-to-r from-brand-600 via-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-100" />

                {/* Main body */}
                <div className="flex items-start gap-3 p-3 sm:p-5">
                  <CompanyLogo name={job.company.display_name} />

                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] text-slate-400">{fmtDate(job.created)}</span>
                      <span className="text-slate-500 text-[10px]">·</span>
                      <span className="text-[10px]">{COUNTRY_FLAGS[job._country] || '🌍'} {COUNTRY_NAMES[job._country] || job._country.toUpperCase()}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-sm sm:text-[15px] leading-snug mb-1">{job.title}</h3>

                    {/* Company */}
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                      <Building2 size={11} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{job.company.display_name}</span>
                    </p>

                    {/* Pills — scroll on mobile */}
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-500 text-[10px] whitespace-nowrap flex-shrink-0">
                        <MapPin size={9} /> {job.location.display_name}
                      </span>
                      {job.contract_time && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-500 text-[10px] whitespace-nowrap flex-shrink-0">
                          💼 {job.contract_time.replace('_', '-')}
                        </span>
                      )}
                      {salary && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold whitespace-nowrap flex-shrink-0">
                          💰 {salary}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match gauge — right side */}
                  {(isAutoMatch || match) && (
                    <div className="flex-shrink-0 bg-white border border-brand-300 rounded-xl p-2 sm:p-3 flex flex-col items-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[110px] shadow-lg shadow-brand-100/40">
                      {isAutoMatch && !match
                        ? <MatchGaugeLoading />
                        : match && (
                          <>
                            <MatchGauge score={match.score} />
                            <div className="hidden sm:flex flex-col gap-1 w-full">
                              {match.strengths?.slice(0, 2).map((s, i) => (
                                <div key={i} className="flex items-start gap-1 text-[10px] text-slate-500 w-full">
                                  <span className="text-brand-400 font-bold flex-shrink-0">✓</span>
                                  <span className="leading-tight">{s}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )
                      }
                    </div>
                  )}
                </div>

                {/* Action bar */}
                <div className="flex items-center gap-2 px-3 sm:px-5 pb-3 sm:pb-4 flex-wrap">
                  <button
                    onClick={() => setSaved(prev => ({ ...prev, [job.id]: !prev[job.id] }))}
                    className={`p-2 rounded-lg border transition-all ${isSaved ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' : 'bg-slate-100 border-slate-300 text-slate-400 hover:text-brand-400 hover:border-brand-400'}`}
                    title={es ? 'Guardar' : 'Save'}
                  >
                    <Bookmark size={13} className={isSaved ? 'fill-brand-500' : ''} />
                  </button>
                  <button
                    onClick={() => setLiked(prev => ({ ...prev, [job.id]: !prev[job.id] }))}
                    className={`p-2 rounded-lg border transition-all ${isLiked ? 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-400' : 'bg-slate-100 border-slate-300 text-slate-400 hover:text-fuchsia-400 hover:border-fuchsia-700/50'}`}
                    title={es ? 'Me gusta' : 'Like'}
                  >
                    <Heart size={13} className={isLiked ? 'fill-fuchsia-400' : ''} />
                  </button>

                  <button
                    onClick={() => setExpanded(isOpen ? null : job.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-500 hover:text-brand-700 text-xs transition-all"
                  >
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {es ? 'Descripción' : 'Description'}
                  </button>

                  {cvText.trim() && !match && !isAutoMatch && (
                    <button
                      onClick={() => matchCV(job)}
                      disabled={isMatch}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all disabled:opacity-50 shadow-sm shadow-soft"
                    >
                      {isMatch ? <Spinner /> : <Target size={12} />}
                      {es ? 'Analizar Match' : 'Match my CV'}
                    </button>
                  )}

                  <a
                    href={job.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs font-bold transition-all ml-auto shadow-sm shadow-soft"
                  >
                    <Zap size={12} />
                    {es ? 'Aplicar →' : 'Apply →'}
                  </a>
                </div>

                {/* Expanded description */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-3 border-t border-slate-300/50">
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-6">{job.description}</p>
                    <button onClick={() => setExpanded(null)} className="mt-2 text-xs text-slate-500 hover:text-slate-500 flex items-center gap-1">
                      <X size={10} /> {es ? 'Cerrar' : 'Close'}
                    </button>
                  </div>
                )}

                {/* Match detail panel */}
                {match && (
                  <div className="px-5 pb-5 border-t border-slate-300/50 pt-4">
                    <p className="text-sm text-slate-700 italic mb-3">{match.summary}</p>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs font-semibold text-brand-400 mb-2 flex items-center gap-1"><CheckCircle size={11} /> {es ? 'Fortalezas' : 'Strengths'}</p>
                        {match.strengths?.map((s, i) => (
                          <p key={i} className="text-xs text-slate-500 mb-1 pl-3 border-l border-brand-500/30">{s}</p>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><XCircle size={11} /> {es ? 'Brechas' : 'Gaps'}</p>
                        {match.gaps?.map((g, i) => (
                          <p key={i} className="text-xs text-slate-500 mb-1 pl-3 border-l border-red-500/30">{g}</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {match.topKeywords?.map((k, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[10px] font-medium">{k}</span>
                      ))}
                    </div>

                    {/* Cover letter */}
                    {cvText.trim() && !clTexts[job.id] && ready && (
                      isPro ? (
                        <button onClick={() => generateCoverLetter(job)} disabled={clLoading === job.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold hover:bg-brand-500/20 transition-all disabled:opacity-50 mb-2">
                          {clLoading === job.id ? <><Spinner /> {es ? 'Generando...' : 'Generating...'}</> : <><Mail size={12} /> {es ? 'Generar carta de presentación' : 'Generate cover letter'}</>}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100/50 border border-slate-300/50 mb-2">
                          <Lock size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="text-slate-400 text-xs">{es ? 'Carta de presentación — ' : 'Cover letter — '}</span>
                          <a href="/pricing" className="text-brand-400 text-xs font-semibold hover:text-brand-300 flex items-center gap-1">
                            <Star size={10} className="fill-brand-500" /> {es ? 'Solo Pro' : 'Pro only'}
                          </a>
                        </div>
                      )
                    )}
                    {clTexts[job.id] && (
                      <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-brand-400 flex items-center gap-1.5"><Mail size={11} /> {es ? 'Carta de Presentación' : 'Cover Letter'}</span>
                          <button onClick={() => { navigator.clipboard.writeText(clTexts[job.id]); setClCopied(job.id); setTimeout(() => setClCopied(null), 2000); }}
                            className="flex items-center gap-1 text-slate-500 hover:text-brand-700 text-xs">
                            {clCopied === job.id ? <><CheckCircle size={11} className="text-emerald-400" /> {es ? 'Copiada' : 'Copied'}</> : <><Copy size={11} /> {es ? 'Copiar' : 'Copy'}</>}
                          </button>
                        </div>
                        <pre className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">{clTexts[job.id]}</pre>
                      </div>
                    )}

                    {/* Adapt CV */}
                    {match.score < 89 && cvText.trim() && ready && !adaptedCVs[job.id] && (
                      isPro ? (
                        <button onClick={() => adaptCV(job)} disabled={adaptLoading === job.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-semibold hover:bg-fuchsia-500/20 transition-all disabled:opacity-50 w-full justify-center">
                          {adaptLoading === job.id
                            ? <><Spinner /> {es ? 'Adaptando CV...' : 'Tailoring CV...'}</>
                            : <><Zap size={12} /> {es ? `Adaptar CV para este cargo (match: ${match.score}%)` : `Tailor CV for this job (match: ${match.score}%)`}</>}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100/50 border border-slate-300/50">
                          <Lock size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="text-slate-400 text-xs">{es ? 'Adaptar CV — ' : 'Tailor CV — '}</span>
                          <a href="/pricing" className="text-brand-400 text-xs font-semibold hover:text-brand-300 flex items-center gap-1">
                            <Star size={10} className="fill-brand-500" /> {es ? 'Solo Pro' : 'Pro only'}
                          </a>
                        </div>
                      )
                    )}
                    {adaptedCVs[job.id] && (
                      <div className="p-4 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/20 mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-fuchsia-400 flex items-center gap-1.5"><Zap size={11} /> {es ? 'CV Adaptado' : 'Tailored CV'}</span>
                          <button onClick={() => { navigator.clipboard.writeText(adaptedCVs[job.id]); setAdaptCopied(job.id); setTimeout(() => setAdaptCopied(null), 2000); }}
                            className="flex items-center gap-1 text-slate-500 hover:text-brand-700 text-xs">
                            {adaptCopied === job.id ? <><CheckCircle size={11} className="text-emerald-400" /> {es ? 'Copiado' : 'Copied'}</> : <><Copy size={11} /> {es ? 'Copiar' : 'Copy'}</>}
                          </button>
                        </div>
                        <pre className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">{adaptedCVs[job.id]}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
                            <Star size={10} className="fill-brand-500" /> {es ? 'Solo Pro' : 'Pro only'}
                          </a>
                        </div>
                      )
                    )}
                    {adaptedCVs[job.id] && (
                      <div className="p-4 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/20 mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-fuchsia-400 flex items-center gap-1.5"><Zap size={11} /> {es ? 'CV Adaptado' : 'Tailored CV'}</span>
                          <button onClick={() => { navigator.clipboard.writeText(adaptedCVs[job.id]); setAdaptCopied(job.id); setTimeout(() => setAdaptCopied(null), 2000); }}
                            className="flex items-center gap-1 text-slate-500 hover:text-brand-700 text-xs">
                            {adaptCopied === job.id ? <><CheckCircle size={11} className="text-emerald-400" /> {es ? 'Copiado' : 'Copied'}</> : <><Copy size={11} /> {es ? 'Copiar' : 'Copy'}</>}
                          </button>
                        </div>
                        <pre className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">{adaptedCVs[job.id]}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
