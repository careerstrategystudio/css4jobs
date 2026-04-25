'use client';
import { useState, useCallback } from 'react';
import {
  Search, MapPin, Building2, Zap, Target, CheckCircle, XCircle,
  Mail, Copy, Globe, Lock, Star, Bookmark, Heart, ChevronDown, ChevronUp, X, AlertCircle,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { usePro } from '@/lib/pro';

const COUNTRY_FLAGS: Record<string, string> = {
  us:'🇺🇸',gb:'🇬🇧',au:'🇦🇺',ca:'🇨🇦',de:'🇩🇪',fr:'🇫🇷',
  es:'🇪🇸',nl:'🇳🇱',sg:'🇸🇬',br:'🇧🇷',at:'🇦🇹',nz:'🇳🇿',
  pl:'🇵🇱',in:'🇮🇳',za:'🇿🇦',ie:'🇮🇪',
};
const COUNTRY_NAMES: Record<string, string> = {
  us:'USA',gb:'UK',au:'Australia',ca:'Canada',de:'Germany',fr:'France',
  es:'España',nl:'Netherlands',sg:'Singapore',br:'Brasil',at:'Austria',
  nz:'New Zealand',pl:'Poland',in:'India',za:'South Africa',ie:'Irlanda',
};

const COUNTRY_FILTERS = [
  { id: 'all',    flag: '🌍', label: 'Todo EU+LatAm' },
  { id: 'remote', flag: '🌐', label: 'Remoto' },
  { id: 'es',     flag: '🇪🇸', label: 'España' },
  { id: 'gb',     flag: '🇬🇧', label: 'UK' },
  { id: 'de',     flag: '🇩🇪', label: 'Alemania' },
  { id: 'fr',     flag: '🇫🇷', label: 'Francia' },
  { id: 'nl',     flag: '🇳🇱', label: 'P. Bajos' },
  { id: 'pl',     flag: '🇵🇱', label: 'Polonia' },
  { id: 'br',     flag: '🇧🇷', label: 'Brasil' },
  { id: 'ie',     flag: '🇮🇪', label: 'Irlanda' },
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

// ── Circular match gauge ──────────────────────────────────────────────────────
function MatchGauge({ score }: { score: number }) {
  const r     = 38;
  const circ  = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color  = score >= 80 ? '#10b981' : score >= 60 ? '#a78bfa' : '#f59e0b';
  const label  = score >= 80 ? 'STRONG MATCH' : score >= 60 ? 'GOOD MATCH' : 'FAIR MATCH';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#1f2937" strokeWidth="8" />
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
        <text x="45" y="49" textAnchor="middle" fill="white" fontSize="18" fontWeight="800">
          {score}%
        </text>
      </svg>
      <span className="text-[10px] font-bold tracking-wider" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Company logo initial ──────────────────────────────────────────────────────
const LOGO_COLORS = [
  'bg-violet-700','bg-purple-700','bg-fuchsia-700','bg-violet-600',
  'bg-purple-600','bg-fuchsia-600','bg-violet-800','bg-purple-800',
];
function CompanyLogo({ name }: { name: string }) {
  const idx   = name.charCodeAt(0) % LOGO_COLORS.length;
  const color = LOGO_COLORS[idx];
  return (
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0 text-white font-black text-lg shadow-lg`}>
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
          ? 'bg-violet-600 border-violet-500 text-white shadow-sm shadow-violet-500/30'
          : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-violet-600/50'
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
      setJobs(data.results || []);
    } catch {
      setError(es ? 'Error al buscar empleos.' : 'Error searching jobs.');
    } finally {
      setLoading(false);
    }
  }, [query, days, jobType, workMode, expLevel, country, es]);

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
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return es ? 'Hoy' : 'Today';
    if (diff === 1) return es ? 'Ayer' : 'Yesterday';
    if (diff < 7)   return es ? `Hace ${diff} días` : `${diff}d ago`;
    return es ? `Hace ${Math.ceil(diff / 7)} sem.` : `${Math.ceil(diff / 7)}w ago`;
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-4">
            <Search size={12} /> {es ? 'Búsqueda Global de Empleo' : 'Global Job Search'}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {es ? 'Encuentra tu próximo empleo' : 'Find your next job'}
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-sm">
            {es
              ? 'Busca en más de 10 países. Pega tu CV para ver el % de match con cada oferta.'
              : 'Search across 10+ countries. Paste your CV to see match % for each job.'}
          </p>
        </div>

        {/* ── CV paste ── */}
        <div className="card mb-5 border border-violet-500/20 bg-gradient-to-br from-gray-900 to-violet-950/20">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-violet-400" />
            <span className="text-sm font-semibold text-white">
              {es ? 'Tu CV — para calcular el % de match' : 'Your CV — to calculate match %'}
            </span>
          </div>
          <textarea
            value={cvText}
            onChange={e => setCvText(e.target.value)}
            rows={3}
            placeholder={es ? 'Pega tu CV aquí para ver cuánto haces match con cada empleo...' : 'Paste your CV here to see how well you match each job...'}
            className="textarea text-sm"
          />
        </div>

        {/* ── Search + filters ── */}
        <div className="card mb-6 border border-gray-700/50">
          {/* Search bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder={es ? 'Cargo, habilidad o empresa...' : 'Job title, skill or company...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 text-sm transition-all"
              />
            </div>
            <button
              onClick={search}
              disabled={loading || !query.trim()}
              className="btn-primary px-5 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Spinner /> : <Search size={15} />}
              {es ? 'Buscar' : 'Search'}
            </button>
          </div>

          {/* Country chips */}
          <div className="mb-3">
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Globe size={10} /> {es ? 'País' : 'Country'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRY_FILTERS.map(cf => (
                <button key={cf.id} onClick={() => setCountry(cf.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                    country === cf.id
                      ? 'bg-violet-600 border-violet-500 text-white shadow-sm shadow-violet-500/30'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-violet-600/40'
                  }`}>
                  <span>{cf.flag}</span>{cf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Other filters */}
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5">{es ? 'Fecha' : 'Date'}</p>
              <div className="flex gap-1.5 flex-wrap">
                <Chip value="1"  current={days}     set={setDays}     label="24h" />
                <Chip value="7"  current={days}     set={setDays}     label={es ? 'Semana' : 'Week'} />
                <Chip value="30" current={days}     set={setDays}     label={es ? 'Mes' : 'Month'} />
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5">{es ? 'Modalidad' : 'Mode'}</p>
              <div className="flex gap-1.5 flex-wrap">
                <Chip value="remote"  current={workMode} set={setWorkMode} label="Remote" />
                <Chip value="hybrid"  current={workMode} set={setWorkMode} label="Hybrid" />
                <Chip value="on-site" current={workMode} set={setWorkMode} label="On-site" />
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5">{es ? 'Tipo' : 'Type'}</p>
              <div className="flex gap-1.5 flex-wrap">
                <Chip value="full_time" current={jobType} set={setJobType} label={es ? 'Completo' : 'Full-time'} />
                <Chip value="part_time" current={jobType} set={setJobType} label={es ? 'Parcial' : 'Part-time'} />
                <Chip value="contract"  current={jobType} set={setJobType} label={es ? 'Contrato' : 'Contract'} />
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5">{es ? 'Nivel' : 'Level'}</p>
              <div className="flex gap-1.5 flex-wrap">
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
          <p className="text-gray-500 text-sm mb-4">
            {jobs.length === 0
              ? (es ? 'No se encontraron resultados.' : 'No results found.')
              : (es ? `${jobs.length} empleos encontrados` : `${jobs.length} jobs found`)}
          </p>
        )}

        {/* ── Job cards ── */}
        <div className="space-y-3">
          {jobs.map(job => {
            const isOpen  = expanded === job.id;
            const match   = matches[job.id];
            const salary  = fmtSalary(job.salary_min, job.salary_max);
            const isMatch = matching === job.id;
            const isSaved = saved[job.id];
            const isLiked = liked[job.id];

            return (
              <div key={job.id} className="card border border-gray-700/50 hover:border-violet-700/40 transition-all p-0 overflow-hidden">

                {/* Top accent line */}
                <div className="h-0.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-100" />

                {/* Main body */}
                <div className="flex items-start gap-4 p-5">
                  <CompanyLogo name={job.company.display_name} />

                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[11px] text-gray-500">{fmtDate(job.created)}</span>
                      <span className="text-gray-600">·</span>
                      <span className="text-[11px]">{COUNTRY_FLAGS[job._country] || '🌍'} {COUNTRY_NAMES[job._country] || job._country.toUpperCase()}</span>
                      {!match && cvText.trim() && (
                        <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-semibold">
                          ⚡ {es ? 'Analiza tu match' : 'Check your match'}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-white text-[15px] leading-snug mb-1">{job.title}</h3>

                    {/* Company */}
                    <p className="text-sm text-gray-400 mb-2.5 flex items-center gap-1">
                      <Building2 size={12} className="text-gray-500" />
                      {job.company.display_name}
                    </p>

                    {/* Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-[11px]">
                        <MapPin size={10} /> {job.location.display_name}
                      </span>
                      {job.contract_time && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-[11px]">
                          💼 {job.contract_time.replace('_', '-')}
                        </span>
                      )}
                      {salary && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                          💰 {salary}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match gauge panel */}
                  {match && (
                    <div className="flex-shrink-0 bg-gray-950 border border-violet-700/30 rounded-2xl p-3 flex flex-col items-center gap-2 min-w-[110px] shadow-lg shadow-violet-900/20">
                      <MatchGauge score={match.score} />
                      {match.strengths?.slice(0, 2).map((s, i) => (
                        <div key={i} className="flex items-start gap-1 text-[10px] text-gray-400 w-full">
                          <span className="text-violet-400 font-bold flex-shrink-0">✓</span>
                          <span className="leading-tight">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action bar */}
                <div className="flex items-center gap-2 px-5 pb-4 flex-wrap">
                  <button
                    onClick={() => setSaved(prev => ({ ...prev, [job.id]: !prev[job.id] }))}
                    className={`p-2 rounded-lg border transition-all ${isSaved ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-violet-400 hover:border-violet-700/50'}`}
                    title={es ? 'Guardar' : 'Save'}
                  >
                    <Bookmark size={13} className={isSaved ? 'fill-violet-400' : ''} />
                  </button>
                  <button
                    onClick={() => setLiked(prev => ({ ...prev, [job.id]: !prev[job.id] }))}
                    className={`p-2 rounded-lg border transition-all ${isLiked ? 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-fuchsia-400 hover:border-fuchsia-700/50'}`}
                    title={es ? 'Me gusta' : 'Like'}
                  >
                    <Heart size={13} className={isLiked ? 'fill-fuchsia-400' : ''} />
                  </button>

                  <button
                    onClick={() => setExpanded(isOpen ? null : job.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white text-xs transition-all"
                  >
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {es ? 'Descripción' : 'Description'}
                  </button>

                  {cvText.trim() && !match && (
                    <button
                      onClick={() => matchCV(job)}
                      disabled={isMatch}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all disabled:opacity-50 shadow-sm shadow-violet-500/20"
                    >
                      {isMatch ? <Spinner /> : <Target size={12} />}
                      {es ? 'Analizar Match' : 'Match my CV'}
                    </button>
                  )}

                  <a
                    href={job.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold transition-all ml-auto shadow-sm shadow-violet-500/25"
                  >
                    <Zap size={12} />
                    {es ? 'Aplicar →' : 'Apply →'}
                  </a>
                </div>

                {/* Expanded description */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-3 border-t border-gray-700/50">
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-6">{job.description}</p>
                    <button onClick={() => setExpanded(null)} className="mt-2 text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1">
                      <X size={10} /> {es ? 'Cerrar' : 'Close'}
                    </button>
                  </div>
                )}

                {/* Match detail panel */}
                {match && (
                  <div className="px-5 pb-5 border-t border-gray-700/50 pt-4">
                    <p className="text-sm text-gray-300 italic mb-3">{match.summary}</p>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs font-semibold text-violet-400 mb-2 flex items-center gap-1"><CheckCircle size={11} /> {es ? 'Fortalezas' : 'Strengths'}</p>
                        {match.strengths?.map((s, i) => (
                          <p key={i} className="text-xs text-gray-400 mb-1 pl-3 border-l border-violet-500/30">{s}</p>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><XCircle size={11} /> {es ? 'Brechas' : 'Gaps'}</p>
                        {match.gaps?.map((g, i) => (
                          <p key={i} className="text-xs text-gray-400 mb-1 pl-3 border-l border-red-500/30">{g}</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {match.topKeywords?.map((k, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-medium">{k}</span>
                      ))}
                    </div>

                    {/* Cover letter */}
                    {cvText.trim() && !clTexts[job.id] && ready && (
                      isPro ? (
                        <button onClick={() => generateCoverLetter(job)} disabled={clLoading === job.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold hover:bg-violet-500/20 transition-all disabled:opacity-50 mb-2">
                          {clLoading === job.id ? <><Spinner /> {es ? 'Generando...' : 'Generating...'}</> : <><Mail size={12} /> {es ? 'Generar carta de presentación' : 'Generate cover letter'}</>}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 mb-2">
                          <Lock size={12} className="text-gray-500 flex-shrink-0" />
                          <span className="text-gray-500 text-xs">{es ? 'Carta de presentación — ' : 'Cover letter — '}</span>
                          <a href="/pricing" className="text-violet-400 text-xs font-semibold hover:text-violet-300 flex items-center gap-1">
                            <Star size={10} className="fill-violet-400" /> {es ? 'Solo Pro' : 'Pro only'}
                          </a>
                        </div>
                      )
                    )}
                    {clTexts[job.id] && (
                      <div className="p-4 rounded-xl bg-gray-800/50 border border-violet-500/20 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-violet-400 flex items-center gap-1.5"><Mail size={11} /> {es ? 'Carta de Presentación' : 'Cover Letter'}</span>
                          <button onClick={() => { navigator.clipboard.writeText(clTexts[job.id]); setClCopied(job.id); setTimeout(() => setClCopied(null), 2000); }}
                            className="flex items-center gap-1 text-gray-400 hover:text-white text-xs">
                            {clCopied === job.id ? <><CheckCircle size={11} className="text-emerald-400" /> {es ? 'Copiada' : 'Copied'}</> : <><Copy size={11} /> {es ? 'Copiar' : 'Copy'}</>}
                          </button>
                        </div>
                        <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">{clTexts[job.id]}</pre>
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
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
                          <Lock size={12} className="text-gray-500 flex-shrink-0" />
                          <span className="text-gray-500 text-xs">{es ? 'Adaptar CV — ' : 'Tailor CV — '}</span>
                          <a href="/pricing" className="text-violet-400 text-xs font-semibold hover:text-violet-300 flex items-center gap-1">
                            <Star size={10} className="fill-violet-400" /> {es ? 'Solo Pro' : 'Pro only'}
                          </a>
                        </div>
                      )
                    )}
                    {adaptedCVs[job.id] && (
                      <div className="p-4 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/20 mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-fuchsia-400 flex items-center gap-1.5"><Zap size={11} /> {es ? 'CV Adaptado' : 'Tailored CV'}</span>
                          <button onClick={() => { navigator.clipboard.writeText(adaptedCVs[job.id]); setAdaptCopied(job.id); setTimeout(() => setAdaptCopied(null), 2000); }}
                            className="flex items-center gap-1 text-gray-400 hover:text-white text-xs">
                            {adaptCopied === job.id ? <><CheckCircle size={11} className="text-emerald-400" /> {es ? 'Copiado' : 'Copied'}</> : <><Copy size={11} /> {es ? 'Copiar' : 'Copy'}</>}
                          </button>
                        </div>
                        <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">{adaptedCVs[job.id]}</pre>
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
