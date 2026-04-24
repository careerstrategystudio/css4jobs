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
              className={`card relative flex flex-col border-2 ${plan.color} ${plan.highlight ? 'ring-2 ring-emerald-500/30 scale-[1.02]' : ''}`}
            >
              {plan.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${plan.badgeColor}`}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-5 mt-2">
                <h2 className="text-base font-bold text-white mb-1">{plan.name}</h2>
                <p className="text-gray-500 text-xs mb-4">{plan.desc}</p>

                {/* Price */}
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-gray-400 text-base font-semibold mb-0.5">€</span>
                  <span className="text-4xl font-black text-white">{plan.monthly}</span>
                  <span className="text-gray-400 text-sm mb-1">/mo</span>
                </div>
                {plan.total ? (
                  <p className="text-xs text-gray-500">
                    <span className="text-gray-400 font-semibold">€{plan.total}</span> {plan.period}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">{plan.period}</p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2 flex-1 mb-6">
                {PRO_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                    {es ? f.es : f.en}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href={plan.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                  plan.highlight
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : plan.id === 'semestral'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <Zap size={13} /> {plan.cta}
              </a>

              {plan.highlight && (
                <p className="text-center text-[10px] text-gray-600 mt-2">
                  {es ? 'Más elegido por profesionales' : 'Most chosen by professionals'}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Free Plan Note */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="card border border-gray-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-white font-bold mb-1 text-sm">Free</h3>
              <p className="text-gray-500 text-xs mb-3">{es ? 'Empieza sin costo. Sin tarjeta de crédito.' : 'Start free. No credit card required.'}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {FREE_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CheckCircle size={11} className="text-gray-500" /> {es ? f.es : f.en}
                  </div>
                ))}
                {FREE_MISSING.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <X size={11} className="text-gray-700" /> {es ? f.es : f.en}
                  </div>
                ))}
              </div>
            </div>
            <a href="/cv" className="flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 text-sm font-semibold transition-all">
              {es ? 'Probar gratis' : 'Try for free'}
            </a>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            {es ? 'Lo que dicen nuestros usuarios' : 'What our users say'}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((tm, i) => (
              <div key={i} className="card">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} size={12} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">&ldquo;{es ? tm.text.es : tm.text.en}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white text-sm">{tm.name}</div>
                  <div className="text-gray-500 text-xs">{es ? tm.role.es : tm.role.en}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            {es ? 'Preguntas frecuentes' : 'Frequently asked questions'}
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card py-4">
                <h3 className="font-semibold text-white mb-1.5 text-sm">{es ? faq.q.es : faq.q.en}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{es ? faq.a.es : faq.a.en}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            {es ? '¿Listo para conseguir más entrevistas?' : 'Ready to land more interviews?'}
          </h2>
          <p className="text-indigo-200 mb-6">
            {es ? 'Únete a miles de profesionales que ya usan CSS PRO.' : 'Join thousands of professionals already using CSS PRO.'}
          </p>
          <a href="/cv" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-base hover:bg-gray-100 transition-all">
            <Zap size={18} />
            {es ? 'Crear mi CV ahora' : 'Build my CV now'}
          </a>
        </div>

      </div>
    </div>
  );
}

// build
