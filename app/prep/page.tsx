'use client';
import { useState } from 'react';
import { Zap, AlertCircle, ChevronDown, ChevronUp, Briefcase, Users, HelpCircle, Target, TrendingUp, Building2, Lock } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { usePro } from '@/lib/pro';

interface Strategy {
  searchStrategy: {
    targetCompanies: string[];
    targetRoles: string[];
    keyMessage: string;
    networking: string;
    timeline: string;
    platforms: string[];
  };
  recruiterInterview: { q: string; strategy: string; answer: string }[];
  hiringManagerInterview: { q: string; focus: string; strategy: string; answer: string }[];
  questionsToAsk: string[];
  unexpectedQuestions: { q: string; why: string; strategy: string }[];
}

function Section({ title, icon, children, color = 'indigo' }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; color?: string;
}) {
  const [open, setOpen] = useState(true);
  const borderColor = { indigo: 'border-indigo-500/30', amber: 'border-amber-500/30', emerald: 'border-emerald-500/30', purple: 'border-purple-500/30', rose: 'border-rose-500/30' }[color] || 'border-indigo-500/30';
  const textColor   = { indigo: 'text-indigo-400',     amber: 'text-amber-400',     emerald: 'text-emerald-400',     purple: 'text-purple-400',     rose: 'text-rose-400'     }[color] || 'text-indigo-400';

  return (
    <div className={`card border ${borderColor} mb-4`}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between">
        <div className={`flex items-center gap-2 font-bold text-white ${textColor}`}>
          {icon}
          <span>{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function QACard({ q, strategy, answer, focus }: { q: string; strategy?: string; answer?: string; focus?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-700/50 rounded-xl overflow-hidden mb-3">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-start gap-3 p-3 text-left hover:bg-gray-800/40 transition-colors">
        <span className="text-gray-300 text-sm font-semibold flex-1 leading-relaxed">{q}</span>
        {open ? <ChevronUp size={14} className="text-gray-500 flex-shrink-0 mt-0.5" /> : <ChevronDown size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {focus && (
            <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-purple-300 text-xs font-semibold mb-0.5">Focus</p>
              <p className="text-gray-300 text-xs">{focus}</p>
            </div>
          )}
          {strategy && (
            <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-amber-300 text-xs font-semibold mb-0.5">Strategy</p>
              <p className="text-gray-300 text-xs leading-relaxed">{strategy}</p>
            </div>
          )}
          {answer && (
            <div className="px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-indigo-300 text-xs font-semibold mb-0.5">Suggested answer</p>
              <p className="text-gray-300 text-xs leading-relaxed">{answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PrepPage() {
  const { lang } = useLang();
  const { isPro, ready } = usePro();

  const [cvText,   setCvText]   = useState('');
  const [jobDesc,  setJobDesc]  = useState('');
  const [language, setLanguage] = useState(lang);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [data,     setData]     = useState<Strategy | null>(null);

  const generate = async () => {
    if (!cvText.trim() || !jobDesc.trim()) {
      setError(lang === 'es' ? 'Ingresa tu CV y la descripcion del puesto.' : 'Enter your CV and the job description.');
      return;
    }
    setError(''); setData(null); setLoading(true);
    try {
      const res  = await fetch('/api/career-strategy', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cvText, jobDescription: jobDesc, language }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const es = lang === 'es';

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-4">
            <Target size={12} /> {es ? 'Preparacion de Entrevista · IA' : 'Interview Prep · AI'}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            {es ? 'Preparacion completa para tu entrevista' : 'Complete interview preparation'}
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            {es
              ? 'Estrategia personalizada, prep con el reclutador, prep con el Hiring Manager y preguntas inesperadas — todo basado en tu CV y el puesto especifico.'
              : 'Personalized strategy, recruiter prep, Hiring Manager prep and unexpected questions — all based on your CV and the specific role.'}
          </p>
          {ready && !isPro && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
              <Lock size={13} />
              {es ? 'La estrategia de busqueda es exclusiva del Plan Pro.' : 'Search strategy is exclusive to the Pro Plan.'}
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          <div className="card">
            <h2 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Briefcase size={14} className="text-indigo-400" />
              {es ? 'Tu CV' : 'Your CV'}
            </h2>
            <textarea value={cvText} onChange={e => setCvText(e.target.value)} rows={12} className="textarea text-sm"
              placeholder={es ? 'Pega el texto de tu CV aqui...' : 'Paste your CV text here...'} />
          </div>
          <div className="card">
            <h2 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Building2 size={14} className="text-emerald-400" />
              {es ? 'Descripcion del puesto' : 'Job description'}
            </h2>
            <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={12} className="textarea text-sm"
              placeholder={es ? 'Pega la descripcion del puesto al que vas a aplicar...' : 'Paste the job description you are applying to...'} />
          </div>
        </div>

        {/* Language */}
        <div className="card py-4 mb-5">
          <label className="text-sm font-semibold text-gray-300 mb-3 block">{es ? 'Idioma de la preparacion' : 'Preparation language'}</label>
          <div className="flex gap-2">
            {[{ v: 'es', label: '🇪🇸 Español' }, { v: 'en', label: '🇬🇧 English' }, { v: 'pt', label: '🇧🇷 Português' }].map(l => (
              <button key={l.v} onClick={() => setLanguage(l.v)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${language === l.v ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
            <AlertCircle size={15} className="text-red-400" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-center mb-8">
          <button onClick={generate} disabled={loading} className="btn-primary text-base px-10 py-4 disabled:opacity-50">
            {loading
              ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{es ? 'Generando...' : 'Generating...'}</>
              : <><Zap size={18} /> {es ? 'Generar mi preparacion completa' : 'Generate my full prep'}</>
            }
          </button>
        </div>

        {/* Results */}
        {data && (
          <div>
            {/* Search Strategy — Pro only */}
            {ready && isPro && data.searchStrategy && (
              <Section title={es ? 'Estrategia de busqueda personalizada' : 'Personalized search strategy'} icon={<TrendingUp size={16} />} color="emerald">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{es ? 'Tu mensaje clave' : 'Your key message'}</p>
                    <p className="text-gray-200 text-sm leading-relaxed italic bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-700">&ldquo;{data.searchStrategy.keyMessage}&rdquo;</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-emerald-400 mb-2">{es ? 'Empresas objetivo' : 'Target companies'}</p>
                      {data.searchStrategy.targetCompanies?.map((c, i) => (
                        <p key={i} className="text-sm text-gray-300 mb-1 flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold flex items-center justify-center">{i+1}</span>{c}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-indigo-400 mb-2">{es ? 'Roles alternativos' : 'Alternative roles'}</p>
                      {data.searchStrategy.targetRoles?.map((r, i) => (
                        <p key={i} className="text-sm text-gray-300 mb-1 flex items-center gap-2"><span className="text-indigo-400">→</span>{r}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">{es ? 'Networking' : 'Networking'}</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{data.searchStrategy.networking}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">{es ? 'Plan 30 dias' : '30-day plan'}</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{data.searchStrategy.timeline}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.searchStrategy.platforms?.map((p, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-xs font-medium">{p}</span>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {/* Recruiter Interview */}
            <Section title={es ? 'Entrevista con el Reclutador' : 'Recruiter Interview'} icon={<Users size={16} />} color="indigo">
              <p className="text-gray-500 text-xs mb-4">
                {es ? 'El reclutador busca: fit cultural, motivacion y comunicacion clara.' : 'The recruiter looks for: cultural fit, motivation and clear communication.'}
              </p>
              {data.recruiterInterview?.map((item, i) => (
                <QACard key={i} q={item.q} strategy={item.strategy} answer={item.answer} />
              ))}
            </Section>

            {/* HM Interview */}
            <Section title={es ? 'Entrevista con el Hiring Manager' : 'Hiring Manager Interview'} icon={<Briefcase size={16} />} color="purple">
              <p className="text-gray-500 text-xs mb-4">
                {es ? 'El manager busca: mentalidad de crecimiento, ownership y capacidad de influenciar.' : 'The manager looks for: growth mindset, ownership and ability to influence.'}
              </p>
              {data.hiringManagerInterview?.map((item, i) => (
                <QACard key={i} q={item.q} strategy={item.strategy} answer={item.answer} focus={item.focus} />
              ))}
            </Section>

            {/* Questions to ask */}
            <Section title={es ? 'Preguntas que tu haces al manager' : 'Your questions to the manager'} icon={<HelpCircle size={16} />} color="amber">
              <div className="space-y-2">
                {data.questionsToAsk?.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                    <p className="text-gray-300 text-sm leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Unexpected questions */}
            <Section title={es ? '7 preguntas inesperadas del Full Loop' : '7 Unexpected Full Loop Questions'} icon={<Target size={16} />} color="rose">
              <p className="text-gray-500 text-xs mb-4">
                {es ? 'Preguntas que suelen aparecer en rondas avanzadas del proceso.' : 'Questions that often appear in advanced interview rounds.'}
              </p>
              {data.unexpectedQuestions?.map((item, i) => (
                <QACard key={i} q={item.q} strategy={item.strategy} answer={item.why} />
              ))}
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
