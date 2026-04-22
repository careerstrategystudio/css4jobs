'use client';
import { CheckCircle, Zap, Linkedin, FileText, Search, Star } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0',
    period: '',
    desc: 'Para probar y ver resultados reales.',
    color: 'border-gray-700',
    badge: null,
    cta: 'Empezar gratis',
    ctaStyle: 'btn-outline',
    href: '/cv',
    features: [
      '3 CV tailorings por mes',
      '1 análisis de LinkedIn por mes',
      'Exportar en .txt',
      'Soporte por email',
    ],
    missing: [
      'Sin exportar en PDF/Word',
      'Sin acceso a Job Search',
    ],
  },
  {
    name: 'Pro',
    price: '19',
    period: '/mes',
    desc: 'Para candidatos activos que buscan trabajo.',
    color: 'border-indigo-500',
    badge: '⚡ Más popular',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    cta: 'Empezar con Pro',
    ctaStyle: 'btn-primary',
    href: 'https://revolut.me/javier47j',
    features: [
      'CV tailorings ilimitados',
      'Análisis de LinkedIn ilimitados',
      'Exportar en PDF y Word',
      'Job Search Global (próximamente)',
      'Análisis ATS detallado',
      'Soporte prioritario',
    ],
    missing: [],
  },
  {
    name: 'Teams',
    price: '49',
    period: '/mes',
    desc: 'Para coaches, consultoras y equipos de RRHH.',
    color: 'border-purple-500/50',
    badge: '🚀 Empresas',
    badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    cta: 'Contactar ventas',
    ctaStyle: 'btn-outline',
    href: 'mailto:careerstrategystudio@gmail.com',
    features: [
      'Todo lo de Pro',
      'Hasta 10 usuarios',
      'Dashboard de equipo',
      'Reportes y analytics',
      'Integración con ATS',
      'Soporte dedicado 24/7',
    ],
    missing: [],
  },
];

const faqs = [
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí. No hay contratos ni permanencia. Cancelás cuando quieras desde tu cuenta.',
  },
  {
    q: '¿Cómo se procesa el pago?',
    a: 'Usamos Revolut para procesar los pagos de forma segura. Aceptamos tarjetas de crédito y débito.',
  },
  {
    q: '¿Qué idiomas soporta la IA?',
    a: 'Español, inglés y portugués. Podés tailorear tu CV en cualquiera de estos idiomas independientemente del idioma del trabajo.',
  },
  {
    q: '¿La IA inventa información?',
    a: 'No. La IA reorganiza y optimiza tu información real. Nunca agrega experiencia o habilidades que no tenés.',
  },
  {
    q: '¿Funciona para cualquier industria?',
    a: 'Sí. La IA está entrenada para optimizar CVs y perfiles de LinkedIn en cualquier sector: tech, ventas, marketing, finanzas, salud, y más.',
  },
];

const featureList = [
  { icon: FileText, label: 'CV Tailoring con IA', color: 'text-indigo-400' },
  { icon: Linkedin, label: 'LinkedIn Optimizer', color: 'text-blue-400' },
  { icon: Search, label: 'Job Search Global', color: 'text-emerald-400', soon: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Zap size={12} /> Planes y Precios
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Simple, transparente, sin sorpresas</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Empezá gratis. Upgradea cuando estés listo para escalar tu búsqueda de trabajo.</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`card relative flex flex-col border-2 ${plan.color} ${plan.name === 'Pro' ? 'scale-[1.02]' : ''}`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${plan.badgeColor}`}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                <p className="text-gray-400 text-sm mb-4">{plan.desc}</p>
                <div className="flex items-end gap-1">
                  <span className="text-gray-400 text-lg">$</span>
                  <span className="text-5xl font-black text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 mb-1">{plan.period}</span>}
                </div>
              </div>

              <div className="space-y-2 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    {f}
                  </div>
                ))}
                {plan.missing.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-3.5 h-3.5 rounded-full border border-gray-700 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <a
                href={plan.href}
                target={plan.href.startsWith('http') ? '_blank' : undefined}
                rel={plan.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`${plan.ctaStyle} w-full justify-center text-sm py-3`}
              >
                <Zap size={14} />
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Feature Comparison Highlight */}
        <div className="card mb-20">
          <h2 className="text-xl font-bold text-white text-center mb-8">Herramientas incluidas en CSS 4 JOBS</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featureList.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.label} className={`text-center p-6 rounded-xl bg-gray-800/50 ${f.soon ? 'opacity-50' : ''}`}>
                  <Icon size={32} className={`${f.color} mx-auto mb-3`} />
                  <p className="text-white font-semibold">{f.label}</p>
                  {f.soon && <span className="text-xs text-gray-500 mt-1 block">Próximamente</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Usuarios que ya consiguieron entrevistas</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Laura Sánchez', role: 'UX Designer · Berlín', text: 'Conseguí entrevista en Zalando a la semana de usar CSS 4 JOBS. El CV tailoring es increíble.' },
              { name: 'Martín López', role: 'Backend Engineer · Dublin', text: 'Mi LinkedIn pasó de 3 a 60+ visitas semanales de reclutadores. Brutal.' },
              { name: 'Sofía Torres', role: 'Marketing Manager · Madrid', text: 'La IA entiende perfectamente qué keywords necesita cada trabajo. Vale cada euro.' },
            ].map(t => (
              <div key={t.name} className="card">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="card py-4">
                <h3 className="font-semibold text-white mb-2 text-sm">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">¿Todavía no convencido?</h2>
          <p className="text-indigo-200 mb-6">Probalo gratis — sin tarjeta de crédito. Tailoreá tu primer CV hoy.</p>
          <a
            href="/cv"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-base hover:bg-gray-100 transition-all"
          >
            <Zap size={18} />
            Empezar gratis ahora
          </a>
        </div>
      </div>
    </div>
  );
}
