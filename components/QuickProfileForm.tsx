'use client';
import { useState } from 'react';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

interface ExpEntry  { company: string; jobTitle: string; period: string; description: string; }
interface EduEntry  { degree: string; institution: string; years: string; }

interface Props {
  onSubmit: (cvText: string) => void;
  onCancel: () => void;
  lang?: string;
}

export default function QuickProfileForm({ onSubmit, onCancel, lang = 'es' }: Props) {
  const es = lang === 'es';

  const [name,     setName]     = useState('');
  const [title,    setTitle]    = useState('');
  const [location, setLocation] = useState('');
  const [email,    setEmail]    = useState('');
  const [skills,   setSkills]   = useState('');

  const [exps, setExps] = useState<ExpEntry[]>([
    { company: '', jobTitle: '', period: '', description: '' },
  ]);
  const [edus, setEdus] = useState<EduEntry[]>([
    { degree: '', institution: '', years: '' },
  ]);

  const addExp    = () => setExps(p => [...p, { company: '', jobTitle: '', period: '', description: '' }]);
  const removeExp = (i: number) => setExps(p => p.filter((_, j) => j !== i));
  const updExp    = (i: number, f: keyof ExpEntry, v: string) =>
    setExps(p => p.map((e, j) => j === i ? { ...e, [f]: v } : e));

  const addEdu    = () => setEdus(p => [...p, { degree: '', institution: '', years: '' }]);
  const removeEdu = (i: number) => setEdus(p => p.filter((_, j) => j !== i));
  const updEdu    = (i: number, f: keyof EduEntry, v: string) =>
    setEdus(p => p.map((e, j) => j === i ? { ...e, [f]: v } : e));

  const buildCv = (): string => {
    const L: string[] = [];

    if (name)               L.push(name.toUpperCase());
    if (title)              L.push(title);
    const contact = [location, email].filter(Boolean).join(' · ');
    if (contact)            L.push(contact);
    L.push('');

    const validExps = exps.filter(e => e.company || e.jobTitle);
    if (validExps.length) {
      L.push('EXPERIENCIA');
      for (const e of validExps) {
        const header = [e.jobTitle, e.company].filter(Boolean).join(' — ');
        if (header)       L.push(header);
        if (e.period)     L.push(e.period);
        if (e.description) L.push(e.description);
        L.push('');
      }
    }

    const validEdus = edus.filter(e => e.degree || e.institution);
    if (validEdus.length) {
      L.push('EDUCACIÓN');
      for (const e of validEdus) {
        const header = [e.degree, e.institution].filter(Boolean).join(' — ');
        if (header)   L.push(header);
        if (e.years)  L.push(e.years);
        L.push('');
      }
    }

    if (skills.trim()) {
      L.push('HABILIDADES');
      L.push(skills.trim());
    }

    return L.join('\n').trim();
  };

  const canSubmit = name.trim() || exps.some(e => e.company || e.jobTitle);

  const inputCls  = 'w-full px-2.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs';
  const inputCls2 = 'w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm';

  return (
    <div className="space-y-4">

      {/* ── Personal info ── */}
      <div className="space-y-2">
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder={es ? 'Nombre completo *' : 'Full name *'}
          className={inputCls2} />
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder={es ? 'Título profesional (ej. Diseñador UX)' : 'Professional title (e.g. UX Designer)'}
          className={inputCls2} />
        <div className="grid grid-cols-2 gap-2">
          <input value={location} onChange={e => setLocation(e.target.value)}
            placeholder={es ? 'Ciudad, País' : 'City, Country'}
            className={inputCls2} />
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            className={inputCls2} />
        </div>
      </div>

      {/* ── Experience ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {es ? 'Experiencia laboral' : 'Work experience'}
          </p>
          <button onClick={addExp}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
            <Plus size={11} /> {es ? 'Añadir' : 'Add'}
          </button>
        </div>

        {exps.map((e, i) => (
          <div key={i} className="bg-slate-100/60 border border-slate-300/50 rounded-xl p-3 mb-2 space-y-2">
            <div className="flex gap-2">
              <input value={e.jobTitle} onChange={ev => updExp(i, 'jobTitle', ev.target.value)}
                placeholder={es ? 'Cargo (ej. Diseñador Gráfico)' : 'Job title (e.g. Graphic Designer)'}
                className={`${inputCls} flex-1`} />
              {exps.length > 1 && (
                <button onClick={() => removeExp(i)} className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <input value={e.company} onChange={ev => updExp(i, 'company', ev.target.value)}
              placeholder={es ? 'Empresa' : 'Company'}
              className={inputCls} />
            <input value={e.period} onChange={ev => updExp(i, 'period', ev.target.value)}
              placeholder={es ? 'Período (ej. 2021 – 2024)' : 'Period (e.g. 2021 – 2024)'}
              className={inputCls} />
            <textarea value={e.description} onChange={ev => updExp(i, 'description', ev.target.value)}
              placeholder={es ? 'Descripción breve de tus responsabilidades y logros' : 'Brief description of responsibilities and achievements'}
              rows={2}
              className={`${inputCls} resize-none`} />
          </div>
        ))}
      </div>

      {/* ── Education ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {es ? 'Educación' : 'Education'}
          </p>
          <button onClick={addEdu}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
            <Plus size={11} /> {es ? 'Añadir' : 'Add'}
          </button>
        </div>

        {edus.map((e, i) => (
          <div key={i} className="bg-slate-100/60 border border-slate-300/50 rounded-xl p-3 mb-2 space-y-2">
            <div className="flex gap-2">
              <input value={e.degree} onChange={ev => updEdu(i, 'degree', ev.target.value)}
                placeholder={es ? 'Título / Grado' : 'Degree'}
                className={`${inputCls} flex-1`} />
              {edus.length > 1 && (
                <button onClick={() => removeEdu(i)} className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <input value={e.institution} onChange={ev => updEdu(i, 'institution', ev.target.value)}
              placeholder={es ? 'Universidad / Centro educativo' : 'University / Institution'}
              className={inputCls} />
            <input value={e.years} onChange={ev => updEdu(i, 'years', ev.target.value)}
              placeholder={es ? 'Años (ej. 2018 – 2022)' : 'Years (e.g. 2018 – 2022)'}
              className={inputCls} />
          </div>
        ))}
      </div>

      {/* ── Skills ── */}
      <div>
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {es ? 'Habilidades / Herramientas' : 'Skills / Tools'}
        </p>
        <input value={skills} onChange={e => setSkills(e.target.value)}
          placeholder={es
            ? 'ej. Figma, Photoshop, Illustrator, CSS, branding, tipografía...'
            : 'e.g. Figma, Photoshop, Illustrator, CSS, branding, typography...'}
          className={inputCls2} />
        <p className="text-[10px] text-slate-500 mt-1">{es ? 'Separa con comas' : 'Separate with commas'}</p>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-500 hover:text-brand-700 text-sm font-semibold transition-all">
          {es ? 'Cancelar' : 'Cancel'}
        </button>
        <button onClick={() => onSubmit(buildCv())}
          disabled={!canSubmit}
          className="flex-[2] py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2">
          <CheckCircle size={14} />
          {es ? 'Usar como CV' : 'Use as CV'}
        </button>
      </div>

    </div>
  );
}
