'use client';
import { CheckCircle, Zap, Star, X } from 'lucide-react';
import { useLang } from '@/lib/i18n';

const PRO_FEATURES = [
  { es: 'Land more Interviews with CSS PRO',     en: 'Land more Interviews with CSS PRO' },
  { es: 'Evita errores críticos en tu CV',        en: 'Avoid critical resume mistakes' },
  { es: 'Escribe más rápido y mejor con IA',      en: 'Write faster & better with AI' },
  { es: 'Sugerencias de contenido en tiempo real',en: 'Real-time content suggestions' },
  { es: 'Puntaje 100/100 con revisión ATS',       en: 'Score 100/100 with ATS resume checks' },
  { es: 'Cuenta tu historia completa — sin límites de extensión', en: 'Tell your full story – no length limits' },
  { es: 'No más .txt, solo PDF profesional',      en: 'No more txt, just PDF' },
];

const FREE_FEATURES = [
  { es: '3 CVs por mes',               en: '3 CVs per month' },
  { es: '5 plantillas de CV',          en: '5 CV templates' },
  { es: 'Búsqueda de empleos básica',  en: 'Basic job search' },
  { es: 'Exportar como texto',         en: 'Export as text' },
];

const FREE_MISSING = [
  { es: 'Carta de presentación IA',    en: 'AI cover letter' },
  { es: 'Adaptar CV por cargo',        en: 'Tailor CV per job' },
];

const testimonials = [
  {
    text: { es: 'Conseguí 3 entrevistas en una semana después de adaptar mi CV con CSS PRO. El análisis ATS fue clave.', en: 'I landed 3 interviews in one week after tailoring my CV with CSS PRO. The ATS analysis was key.' },
    name: 'María G.',
    role: { es: 'Marketing Manager, Madrid', en: 'Marketing Manager, Madrid' },
  },
  {
    text: { es: 'La función de adaptar CV por cada cargo es increíble. Pasé de 0 respuestas a 4 llamadas en 10 días.', en: 'The tailor-per-job feature is incredible. Went from 0 replies to 4 calls in 10 days.' },
    name: 'Carlos M.',
    role: { es: 'Desarrollador Full-Stack, Barcelona', en: 'Full-Stack Developer, Barcelona' },
  },
  {
    text: { es: 'Antes tardaba horas haciendo mi CV. Ahora lo tengo listo en minutos y con mucho mejor resultado.', en: 'I used to spend hours on my resume. Now it is ready in minutes with much better results.' },
    name: 'Ana R.',
    role: { es: 'Diseñadora UX, México', en: 'UX Designer, Mexico' },
  },
];

const faqs = [
  {
    q: { es: '¿Cuándo recibiré mi clave Pro?', en: 'When will I receive my Pro key?' },
    a: { es: 'En menos de 24 horas después de tu pago, recibirás tu clave Pro por email. Normalmente es mucho más rápido.', en: 'Within 24 hours of your payment, you will receive your Pro key by email. Usually much faster.' },
  },
  {
    q: { es: '¿Puedo cancelar en cualquier momento?', en: 'Can I cancel at any time?' },
    a: { es: 'Sí. Tu acceso Pro dura el período que elegiste. No hay renovación automática.', en: 'Yes. Your Pro access lasts the period you chose. There is no automatic renewal.' },
  },
  {
    q: { es: '¿Cómo funciona el análisis ATS?', en: 'How does the ATS analysis work?' },
    a: { es: 'Nuestra IA analiza tu CV comparándolo con la descripción del cargo y te da un porcentaje de match con recomendaciones específicas para mejorar.', en: 'Our AI analyzes your CV against the job description and gives you a match percentage with specific recommendations to improve.' },
  },
  {
    q: { es: '¿Puedo usar CSS PRO en varios dispositivos?', en: 'Can I use CSS PRO on multiple devices?' },
    a: { es: 'Sí, tu clave Pro funciona en cualquier navegador y dispositivo.', en: 'Yes, your Pro key works on any browser and device.' },
  },
];

export default function PricingPage() {
  const { lang } = useLang();
  const es = lang === 'es';

  const plans = [
    {
      id: 'semestral',
      name:     es ? 'Plan Semestral' : 'Semiannual Plan',
      monthly:  '13.55',
      total:    '81.30',
      period:   es ? 'facturado cada 6 meses' : 'billed every 6 months',
      badge:    es ? 'MEJOR INVERSIÓN' : 'BEST INVESTMENT',
      badgeColor: 'bg-indigo-600 text-white',
      desc:     es ? 'El plan más rentable para tu búsqueda de empleo.' : 'The most cost-effective plan for your job search.',
      color:    'border-indigo-500/40',
      cta:      es ? 'Elegir Semestral' : 'Choose Semiannual',
      href:     'https://revolut.me/javier47j',
      highlight: false,
    },
    {
      id: 'cuatrimestral',
      name:     es ? 'Plan Cuatrimestral' : '4-Month Plan',
      monthly:  '15.58',
      total:    '62.32',
      period:   es ? 'facturado cada 4 meses' : 'billed every 4 months',
      badge:    es ? 'MÁS POPULAR' : 'MOST POPULAR',
      badgeColor: 'bg-emerald-500 text-white',
      desc:     es ? 'El plan preferido. Perfecto para una búsqueda intensiva.' : 'The preferred plan. Perfect for an intensive job search.',
      color:    'border-emerald-500',
      cta:      es ? 'Elegir Cuatrimestral' : 'Choose 4-Month',
      href:     'https://revolut.me/javier47j',
      highlight: true,
    },
    {
      id: 'mensual',
      name:     es ? 'Plan Mensual' : 'Monthly Plan',
      monthly:  '18.00',
      total:    null,
      period:   es ? 'facturado mensualmente' : 'billed monthly',
      badge:    null,
      badgeColor: '',
      desc:     es ? 'Sin compromisos. Cancela cuando quieras.' : 'No commitment. Cancel anytime.',
      color:    'border-gray-700',
      cta:      es ? 'Elegir Mensual' : 'Choose Monthly',
      href:     'https://revolut.me/javier47j',
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Zap size={12} /> {es ? 'Precios simples y transparentes' : 'Simple, transparent pricing'}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            {es ? 'Invierte en tu carrera' : 'Invest in your career'}
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            {es
              ? 'Accede a todas las herramientas Pro y consigue más entrevistas. Todos los planes incluyen las mismas funcionalidades.'
              : 'Access all Pro tools and land more interviews. All plans include the same features.'}
          </p>
        </div>

        {/* Pro Features Banner */}
        <div className="card border border-indigo-500/20 bg-indigo-500/5 mb-10 max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-4 text-center">
            {es ? 'Todo incluido en el Plan Pro' : 'Everything included in Pro'}
          </p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {PRO_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-gray-200">
                <CheckCircle size={14} className="text-indigo-400 flex-shrink-0" />
                {es ? f.es : f.en}
              </div>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-16 max-w-4xl mx-auto">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`card 