import Link from 'next/link';
import { FileText, Linkedin, Search, Zap, ArrowRight, Star } from 'lucide-react';

const features = [
  {
    icon: FileText,
    color: 'bg-indigo-500/10 text-indigo-400',
    title: 'CV Tailoring con IA',
    desc: 'Sube tu CV, pega la descripción del puesto y nuestra IA lo reescribe adaptado exactamente a ese trabajo. Pasa filtros ATS y llega a reclutadores reales.',
    href: '/cv',
    cta: 'Tailorear mi CV',
  },
  {
    icon: Linkedin,
    color: 'bg-blue-500/10 text-blue-400',
    title: 'LinkedIn Optimizer',
    desc: 'Pega tu perfil de LinkedIn y recibí un análisis completo con mejoras específicas: headline, about, experiencia y keywords para aparecer en más búsquedas.',
    href: '/linkedin',
    cta: 'Optimizar LinkedIn',
  },
  {
    icon: Search,
    color: 'bg-emerald-500/10 text-emerald-400',
    title: 'Job Search Global',
    desc: 'Buscador de empleos internacionales integrado. Irlanda, España, UK, LATAM y más. Próximamente disponible.',
    href: '#',
    cta: 'Próximamente',
    soon: true,
  },
];

const stats = [
  { value: '2 min', label: 'para tailorear un CV' },
  { value: '95%', label: 'tasa de paso en ATS' },
  { value: '3x', label: 'más entrevistas' },
  { value: 'Gratis', label: 'para empezar' },
];

const testimonials = [
  { name: 'María García', role: 'Software Engineer · Dublin', text: 'En 2 minutos tenía un CV adaptado para Google. Conseguí la entrevista en menos de una semana.' },
  { name: 'Carlos Ruiz', role: 'Sales Manager · Londres', text: 'Mi LinkedIn pasó de 5 a 50 visitas semanales de reclutadores. Increíble herramienta.' },
  { name: 'Ana Martínez', role: 'Data Analyst · Amsterdam', text: 'El CV tailoring es brutalmente bueno. Diferente a todo lo que había probado antes.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            <Zap size={12} />
            Powered by Claude AI · CareerStrategy Studio
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
            Tu próximo trabajo,<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              conseguido con IA
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tailorea tu CV para cada puesto, optimiza tu LinkedIn y consigue más entrevistas.
            Diseñado para profesionales hispanos que quieren trabajar en cualquier parte del mundo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/cv" className="btn-primary text-base px-8 py-3.5">
              <FileText size={18} />
              Tailorear mi CV gratis
            </Link>
            <Link href="/linkedin" className="btn-outline text-base px-8 py-3.5">
              <Linkedin size={18} />
              Optimizar LinkedIn
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Todo lo que necesitás para conseguir el trabajo</h2>
          <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">Herramientas de IA que hacen el trabajo pesado por vos.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={`card hover:border-gray-700 transition-all group ${f.soon ? 'opacity-60' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{f.desc}</p>
                  {f.soon ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-500 text-xs font-semibold">
                      🚀 Próximamente
                    </span>
                  ) : (
                    <Link href={f.href} className="btn-primary text-xs">
                      {f.cta} <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Cómo funciona?</h2>
          <p className="text-gray-400 mb-14">Tres pasos. Menos de 3 minutos.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Subí tu CV', desc: 'Subí tu CV actual en PDF o Word. También podés pegar el texto directamente.' },
              { n: '02', title: 'Pegá el trabajo', desc: 'Copiá la descripción del puesto al que querés aplicar. Cualquier idioma.' },
              { n: '03', title: 'Descargá el resultado', desc: 'La IA tailorea tu CV en segundos. Listo para enviar.' },
            ].map(step => (
              <div key={step.n} className="relative">
                <div className="text-6xl font-black text-gray-800 mb-3">{step.n}</div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/cv" className="btn-primary text-base px-8 py-3.5">
              Empezar ahora — es gratis <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-14">Lo que dicen nuestros usuarios</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="card">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para conseguir más entrevistas?</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto">Tailorea tu primer CV gratis. Sin tarjeta de crédito. Sin registros.</p>
          <Link href="/cv" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-base hover:bg-gray-100 transition-all">
            <Zap size={18} />
            Empezar gratis ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
