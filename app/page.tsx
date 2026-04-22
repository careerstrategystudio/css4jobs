'use client';
import Link from 'next/link';
import { FileText, Linkedin, Search, Zap, ArrowRight, Star } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useLang();

  const features = [
    {
      icon: FileText,
      color: 'bg-indigo-500/10 text-indigo-400',
      title: t('feat1_title'),
      desc: t('feat1_desc'),
      href: '/cv',
      cta: t('feat1_cta'),
    },
    {
      icon: Linkedin,
      color: 'bg-blue-500/10 text-blue-400',
      title: t('feat2_title'),
      desc: t('feat2_desc'),
      href: '/linkedin',
      cta: t('feat2_cta'),
    },
    {
      icon: Search,
      color: 'bg-emerald-500/10 text-emerald-400',
      title: t('feat3_title'),
      desc: t('feat3_desc'),
      href: '#',
      cta: t('feat3_cta'),
      soon: true,
    },
  ];

  const stats = [
    { value: t('stat1_val'), label: t('stat1_lbl') },
    { value: t('stat2_val'), label: t('stat2_lbl') },
    { value: t('stat3_val'), label: t('stat3_lbl') },
    { value: t('stat4_val'), label: t('stat4_lbl') },
  ];

  const testimonials = [
    { name: t('test1_name'), role: t('test1_role'), text: t('test1_text') },
    { name: t('test2_name'), role: t('test2_role'), text: t('test2_text') },
    { name: t('test3_name'), role: t('test3_role'), text: t('test3_text') },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            {t('home_badge')}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
            {t('home_h1a')}<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {t('home_h1b')}
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('home_desc')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/cv" className="btn-primary text-base px-8 py-3.5">
              <FileText size={18} />
              {t('home_cta1')}
            </Link>
            <Link href="/linkedin" className="btn-outline text-base px-8 py-3.5">
              <Linkedin size={18} />
              {t('home_cta2')}
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
          <h2 className="text-3xl font-bold text-white text-center mb-4">{t('features_h2')}</h2>
          <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">{t('features_sub')}</p>

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
                      🚀 {f.cta}
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
          <h2 className="text-3xl font-bold text-white mb-4">{t('how_h2')}</h2>
          <p className="text-gray-400 mb-14">{t('how_sub')}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '01', title: t('step1_title'), desc: t('step1_desc') },
              { n: '02', title: t('step2_title'), desc: t('step2_desc') },
              { n: '03', title: t('step3_title'), desc: t('step3_desc') },
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
              {t('how_cta')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-14">{t('test_h2')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t2 => (
              <div key={t2.name} className="card">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">&ldquo;{t2.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t2.name}</div>
                  <div className="text-gray-500 text-xs">{t2.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('cta_h2')}</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto">{t('cta_sub')}</p>
          <Link href="/cv" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-base hover:bg-gray-100 transition-all">
            <Zap size={18} />
            {t('cta_btn')}
          </Link>
        </div>
      </section>
    </div>
  );
}
