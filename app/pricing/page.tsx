'use client';
import { CheckCircle, Zap, Linkedin, FileText, Search, Star } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export default function PricingPage() {
  const { t } = useLang();

  const plans = [
    {
      name: 'Free',
      price: '0',
      period: '',
      desc: t('pr_free_desc'),
      color: 'border-gray-700',
      badge: null,
      cta: t('pr_free_cta'),
      ctaStyle: 'btn-outline',
      href: '/cv',
      features: [t('pr_free_f1'), t('pr_free_f2'), t('pr_free_f3'), t('pr_free_f4')],
      missing: [t('pr_free_m1'), t('pr_free_m2')],
    },
    {
      name: 'Pro',
      price: '20',
      period: t('pr_period'),
      desc: t('pr_pro_desc'),
      color: 'border-indigo-500',
      badge: t('pr_popular'),
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      cta: t('pr_pro_cta'),
      ctaStyle: 'btn-primary',
      href: 'https://revolut.me/javier47j',
      features: [t('pr_pro_f1'), t('pr_pro_f2'), t('pr_pro_f3'), t('pr_pro_f4'), t('pr_pro_f5'), t('pr_pro_f6')],
      missing: [],
    },
    {
      name: 'Teams',
      price: '45',
      period: t('pr_period'),
      desc: t('pr_teams_desc'),
      color: 'border-purple-500/50',
      badge: t('pr_teams_badge'),
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      cta: t('pr_teams_cta'),
      ctaStyle: 'btn-outline',
      href: 'mailto:careerstrategystudio@gmail.com',
      features: [t('pr_teams_f1'), t('pr_teams_f2'), t('pr_teams_f3'), t('pr_teams_f4'), t('pr_teams_f5'), t('pr_teams_f6')],
      missing: [],
    },
  ];

  const featureList = [
    { icon: FileText, label: t('pr_tool1'), color: 'text-indigo-400' },
    { icon: Linkedin, label: t('pr_tool2'), color: 'text-blue-400' },
    { icon: Search, label: t('pr_tool3'), color: 'text-emerald-400', soon: true },
  ];

  const faqs = [
    { q: t('pr_faq_q1'), a: t('pr_faq_a1') },
    { q: t('pr_faq_q2'), a: t('pr_faq_a2') },
    { q: t('pr_faq_q3'), a: t('pr_faq_a3') },
    { q: t('pr_faq_q4'), a: t('pr_faq_a4') },
    { q: t('pr_faq_q5'), a: t('pr_faq_a5') },
  ];

  const testimonials = [
    { text: t('pr_t1'), name: t('pr_t1_name'), role: t('pr_t1_role') },
    { text: t('pr_t2'), name: t('pr_t2_name'), role: t('pr_t2_role') },
    { text: t('pr_t3'), name: t('pr_t3_name'), role: t('pr_t3_role') },
  ];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Zap size={12} /> {t('pr_badge')}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{t('pr_h1')}</h1>
          <p className="text-gray-400 max-w-xl mx-auto">{t('pr_sub')}</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {plans.map(plan => (
            <div key={plan.name} className={`card relative flex flex-col border-2 ${plan.color} ${plan.name === 'Pro' ? 'scale-[1.02]' : ''}`}>
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${plan.badgeColor}`}>
                  {plan.badge}
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                <p className="text-gray-400 text-sm mb-4">{plan.desc}</p>
                <div className="flex items-end gap-1">
                  <span className="text-gray-400 text-lg">€</span>
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

        {/* Feature Comparison */}
        <div className="card mb-20">
          <h2 className="text-xl font-bold text-white text-center mb-8">{t('pr_tools_title')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featureList.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.label} className={`text-center p-6 rounded-xl bg-gray-800/50 ${f.soon ? 'opacity-50' : ''}`}>
                  <Icon size={32} className={`${f.color} mx-auto mb-3`} />
                  <p className="text-white font-semibold">{f.label}</p>
                  {f.soon && <span className="text-xs text-gray-500 mt-1 block">{t('pr_soon')}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">{t('pr_test_title')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((tm, i) => (
              <div key={i} className="card">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} size={13} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">&ldquo;{tm.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white text-sm">{tm.name}</div>
                  <div className="text-gray-500 text-xs">{tm.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">{t('pr_faq_title')}</h2>
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
          <h2 className="text-2xl font-bold text-white mb-3">{t('pr_cta_h2')}</h2>
          <p className="text-indigo-200 mb-6">{t('pr_cta_sub')}</p>
          <a href="/cv" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-base hover:bg-gray-100 transition-all">
            <Zap size={18} />
            {t('pr_cta_btn')}
          </a>
        </div>
      </div>
    </div>
  );
}
