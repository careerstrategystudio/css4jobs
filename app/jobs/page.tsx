'use client';
import { useState, useCallback } from 'react';
import { Search, MapPin, Building2, Calendar, Zap, AlertCircle, ChevronDown, ChevronUp, X, Target, CheckCircle, XCircle, Mail, Copy, Globe, Lock, Star } from 'lucide-react';
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

// Country filter options (EU + LatAm target markets)
const COUNTRY_FILTERS = [
  { id: 'all',    flag: '🌍', label: 'Todo EU+LatAm' },
  { id: 'remote', flag: '🌐', label: 'Remoto Global' },
  { id: 'es',     flag: '🇪🇸', label: 'España' },
  { id: 'gb',     flag: '🇬🇧', label: 'UK' },
  { id: 'de',     flag: '🇩🇪', label: 'Alemania' },
  { id: 'fr',     flag: '🇫🇷', label: 'Francia' },
  { id: 'nl',     flag: '🇳🇱', label: 'Países Bajos' },
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

export default function JobsPage() {
  const { lang } = useLang();
  const { isPro, ready } = usePro();

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

  // Cover letter state
  const [clLoading, setClLoading] = useState<string | null>(null);
  const [clTexts,   setClTexts]   = useState<Record<string, string>>({});
  const [clCopied,  setClCopied]  = useState<string | null>(null);

  // Adaptar CV state
  const [adaptedCVs,  setAdaptedCVs]  = useState<Record<string, string>>({});
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
      setError(lang === 'es' ? 'Error al buscar empleos.' : 'Error searching jobs.');
    } finally {
      setLoading(false);
    }
  }, [query, days, jobType, workMode, expLevel, country, lang]);

  const generateCoverLetter = async (job: Job) => {
    if (!cvText.trim()) return;
    setClLoading(job.id);
    try {
      const jobDesc = `${job.title}\n${job.company.display_name}\n${job.location.display_name}\n\n${job.description}`;
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription: jobDesc, language: lang }),
      });
      const data = await res.json();
      setClTexts(prev => ({ ...prev, [job.id]: data.coverLetter || '' }));
    } catch { /* ignore */ }
    finally { setClLoading(null); }
  };

  const adaptCV = async (job: Job) => {
    if (!cvText.trim()) return;
    setAdaptLoading(job.id);
    try {
      const jobDesc = `${job.title}\n${job.company.display_name}\n${job.location.display_name}\n\n${job.description}`;
      const res = await fetch('/api/tailor-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription: jobDesc, language: lang }),
      });
      const data = await res.json();
      setAdaptedCVs(prev => ({ ...prev, [job.id]: data.tailoredCV || data.cv || '' }));
    } catch { /* ignore */ }
    finally { setAdaptLoading(null); }
  };

  const matchCV = async (job: Job) => {
    if (!cvText.trim()) return;
    setMatching(job.id);
    try {
      const res  = await fetch('/api/job-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription: job.title + '\n' + job.company.display_name + '\n' + job.description, language: lang }),
      });
      const data = await res.json();
      setMatches(prev => ({ ...prev, [job.id]: data }));
    } catch {
      /* ignore */
    } finally {
      setMatching(null);
    }
  };

  const fmtDate = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return lang === 'es' ? 'Hoy' : 'Today';
    if (diff === 1) return lang === 'es' ? 'Ayer' : 'Yesterday';
    return lang === 'es' ? `Hace ${diff} dias` : `${diff}d ago`;
  };

  const fmtSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000 ? `${Math.round(n/1000)}k` : `${n}`;
    if (min && max) return `${fmt(min)}–${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return null;
  };

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400';
  const scoreBg    = (s: number) => s >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' : s >= 60 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30';

  const FilterBtn = ({ value, current, set, label }: { value: string; current: string; set: (v: string) => void; label: string }) => (
    <button
      onClick={() => set(current === value ? '' : value)}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${current === value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Search size={12} /> {lang === 'es' ? 'Busqueda Global de Empleo' : 'Global Job Search'}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            {lang === 'es' ? 'Encuentra tu proximo trabajo' : 'Find your next job'}
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            {lang === 'es'
              ? 'Busca en mas de 15 paises simultaneamente. Pega tu CV para ver el % de match con cada oferta.'
              : 'Search across 15+ countries simultaneously. Paste your CV to see match % for each job.'}
          </p>
        </div>

        {/* CV paste area */}
        <div className="card mb-6 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Target size={15} className="text-indigo-400" />
            <h2 className="font-semibold text-white text-sm">
              {lang === 'es' ? 'Tu CV (opcional) — para calcular el % de match' : 'Your CV (optional) — to calculate match %'}
            </h2>
          </div>
          <textarea
            value={cvText}
            onChange={e => setCvText(e.target.value)}
            rows={4}
            placeholder={lang === 'es' ? 'Pega tu CV aqui para ver cuanto haces match con cada empleo...' : 'Paste your CV here to see how well you match each job...'}
            className="textarea text-sm"
          />
        </div>

        {/* Search bar */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder={lang === 'es' ? 'Cargo, habilidad o empresa...' : 'Job title, skill or company...'}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
          <button onClick={search} disabled={loading || !query.trim()} className="btn-primary px-6 disabled:opacity-50">
            {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></> : <Search size={16} />}
            {lang === 'es' ? 'Buscar' : 'Search'}
          </button>
        </div>

        {/* Country filter */}
        <div className="card py-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={13} className="text-indigo-400" />
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              {lang === 'es' ? 'País / Región' : 'Country / Region'}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COUNTRY_FILTERS.map(cf => (
              <button key={cf.id} onClick={() => setCountry(cf.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  country === cf.id
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                }`}>
                <span>{cf.flag}</span> {cf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Other Filters */}
        <div className="card py-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-[11px] text-gray-500 mb-2 font-semibold uppercase tracking-wider">{lang === 'es' ? 'Fecha' : 'Date posted'}</p>
              <div className="flex gap-1.5 flex-wrap">
                <FilterBtn value="1"  current={days}     set={setDays}     label={lang === 'es' ? '24h'    : '24h'} />
                <FilterBtn value="2"  current={days}     set={setDays}     label={lang === 'es' ? '2 dias' : '2 days'} />
                <FilterBtn value="7"  current={days}     set={setDays}     label={lang === 'es' ? 'Semana' : 'Week'} />
                <FilterBtn value="30" current={days}     set={setDays}     label={lang === 'es' ? 'Mes'    : 'Month'} />
              </div>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 mb-2 font-semibold uppercase tracking-wider">{lang === 'es' ? 'Modalidad' : 'Work mode'}</p>
              <div className="flex gap-1.5 flex-wrap">
                <FilterBtn value="remote"  current={workMode} set={setWorkMode} label="Remote" />
                <FilterBtn value="hybrid"  current={workMode} set={setWorkMode} label="Hybrid" />
                <FilterBtn value="on-site" current={workMode} set={setWorkMode} label="On-site" />
              </div>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 mb-2 font-semibold uppercase tracking-wider">{lang === 'es' ? 'Tipo' : 'Job type'}</p>
              <div className="flex gap-1.5 flex-wrap">
                <FilterBtn value="full_time"  current={jobType} set={setJobType} label={lang === 'es' ? 'Tiempo completo' : 'Full-time'} />
                <FilterBtn value="part_time"  current={jobType} set={setJobType} label={lang === 'es' ? 'Medio tiempo'    : 'Part-time'} />
                <FilterBtn value="contract"   current={jobType} set={setJobType} label={lang === 'es' ? 'Contrato'        : 'Contract'} />
              </div>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 mb-2 font-semibold uppercase tracking-wider">{lang === 'es' ? 'Nivel' : 'Experience'}</p>
              <div className="flex gap-1.5 flex-wrap">
                <FilterBtn value="entry level"  current={expLevel} set={setExpLevel} label={lang === 'es' ? 'Junior'  : 'Entry'} />
                <FilterBtn value="mid senior"   current={expLevel} set={setExpLevel} label={lang === 'es' ? 'Senior'  : 'Mid-Senior'} />
                <FilterBtn value="director"     current={expLevel} set={setExpLevel} label="Director" />
                <FilterBtn value="executive"    current={expLevel} set={setExpLevel} label="Executive" />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 mb-4">
            <AlertCircle size={15} className="text-red-400" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          <p className="text-gray-500 text-sm mb-4">
            {jobs.length === 0
              ? (lang === 'es' ? 'No se encontraron resultados.' : 'No results found.')
              : (lang === 'es' ? `${jobs.length} empleos encontrados a nivel mundial` : `${jobs.length} jobs found worldwide`)}
          </p>
        )}

        <div className="space-y-3">
          {jobs.map(job => {
            const isOpen  = expanded === job.id;
            const match   = matches[job.id];
            const salary  = fmtSalary(job.salary_min, job.salary_max);
            const isMatch = matching === job.id;

            return (
              <div key={job.id} className="card border border-gray-700/50 hover:border-gray-600 transition-all">
                {/* Card header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-lg">{COUNTRY_FLAGS[job._country] || '🌍'}</span>
                      <span className="text-xs text-gray-500">{COUNTRY_NAMES[job._country] || job._country.toUpperCase()}</span>
                      {job.contract_time && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold uppercase">
                          {job.contract_time.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-base leading-tight mb-1">{job.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1"><Building2 size={12} /> {job.company.display_name}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {job.location.display_name}</span>
                      {salary && <span className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">💰 {salary}</span>}
                      <span className="flex items-center gap-1 text-gray-500 text-xs"><Calendar size={11} /> {fmtDate(job.created)}</span>
                    </div>
                  </div>

                  {/* Match badge */}
                  {match && (
                    <div className={`flex-shrink-0 px-3 py-2 rounded-xl border text-center ${scoreBg(match.score)}`}>
                      <p className="text-[10px] text-gray-400">Match</p>
                      <p className={`text-xl font-black ${scoreColor(match.score)}`}>{match.score}%</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => setExpanded(isOpen ? null : job.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {lang === 'es' ? 'Ver descripcion' : 'View description'}
                  </button>
                  {cvText.trim() && !match && (
                    <button
                      onClick={() => matchCV(job)}
                      disabled={isMatch}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {isMatch
                        ? <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></>
                        : <Target size={12} />}
                      {lang === 'es' ? 'Calcular Match' : 'Match my CV'}
                    </button>
                  )}
                  <a href={job.redirect_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold transition-all">
                    <Zap size={12} />
                    {lang === 'es' ? 'Aplicar' : 'Apply'}
                  </a>
                </div>

                {/* Match result */}
                {match && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <p className="text-sm text-gray-300 mb-3 italic">{match.summary}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1"><CheckCircle size={11} /> {lang === 'es' ? 'Puntos fuertes' : 'Strengths'}</p>
                        {match.strengths?.map((s, i) => (
                          <p key={i} className="text-xs text-gray-400 mb-1 pl-3 border-l border-emerald-500/30">{s}</p>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><XCircle size={11} /> {lang === 'es' ? 'Brechas' : 'Gaps'}</p>
                        {match.gaps?.map((g, i) => (
                          <p key={i} className="text-xs text-gray-400 mb-1 pl-3 border-l border-red-500/30">{g}</p>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {match.topKeywords?.map((k, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 text-[10px] font-medium">{k}</span>
                      ))}
                    </div>

                    {/* Cover Letter for this job — Pro only */}
                    {cvText.trim() && !clTexts[job.id] && ready && (
                      isPro ? (
                        <button onClick={() => generateCoverLetter(job)} disabled={clLoading === job.id}
                          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-all disabled:opacity-50">
                          {clLoading === job.id
                            ? <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> {lang === 'es' ? 'Generando...' : 'Generating...'}</>
                            : <><Mail size={12} /> {lang === 'es' ? 'Generar carta de presentación para este puesto' : 'Generate cover letter for this job'}</>
                          }
                        </button>
                      ) : (
                        <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
                          <Lock size={12} className="text-gray-500 flex-shrink-0" />
                          <span className="text-gray-500 text-xs">{lang === 'es' ? 'Carta de presentación — ' : 'Cover letter — '}</span>
                          <a href="/pricing" className="text-indigo-400 text-xs font-semibold hover:text-indigo-300 flex items-center gap-1 transition-colors">
                            <Star size={10} className="fill-indigo-400" /> {lang === 'es' ? 'Solo Plan Pro' : 'Pro plan only'}
                          </a>
                        </div>
                      )
                    )}

                    {clTexts[job.id] && (
                      <div className="mt-4 p-4 rounded-xl bg-gray-800/50 border border-indigo-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5"><Mail size={11} /> {lang === 'es' ? 'Carta de Presentación' : 'Cover Letter'}</span>
                          <button onClick={() => {
                            navigator.clipboard.writeText(clTexts[job.id]);
                            setClCopied(job.id);
                            setTimeout(() => setClCopied(null), 2000);
                          }} className="flex items-center gap-1 text-gray-400 hover:text-white text-xs transition-colors">
                            {clCopied === job.id ? <><CheckCircle size={11} className="text-emerald-400" /> {lang === 'es' ? 'Copiada' : 'Copied'}</> : <><Copy size={11} /> {lang === 'es' ?