'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export type Lang = 'es' | 'en';

const translations = {
  es: {
    // Navbar
    nav_cv: 'Adaptación de CV',
    nav_linkedin: 'LinkedIn AI',
    nav_pricing: 'Precios',
    nav_cta: 'Empezar gratis',

    // Home hero
    home_badge: 'CareerStrategy Studio',
    home_h1a: 'Tu próximo trabajo,',
    home_h1b: 'conseguido con IA',
    home_desc: 'Tailorea tu CV para cada puesto, optimiza tu LinkedIn y consigue más entrevistas. Diseñado para profesionales hispanos que quieren trabajar en cualquier parte del mundo.',
    home_cta1: 'Tailorear mi CV gratis',
    home_cta2: 'Optimizar LinkedIn',

    // Stats
    stat1_val: '2 min',
    stat1_lbl: 'para tailorear un CV',
    stat2_val: '95%',
    stat2_lbl: 'tasa de paso en ATS',
    stat3_val: '3x',
    stat3_lbl: 'más entrevistas',
    stat4_val: 'Gratis',
    stat4_lbl: 'para empezar',

    // Features
    features_h2: 'Todo lo que necesitás para conseguir el trabajo',
    features_sub: 'Herramientas de IA que hacen el trabajo pesado por vos.',
    feat1_title: 'CV Tailoring con IA',
    feat1_desc: 'Sube tu CV, pega la descripción del puesto y nuestra IA lo reescribe adaptado exactamente a ese trabajo. Pasa filtros ATS y llega a reclutadores reales.',
    feat1_cta: 'Tailorear mi CV',
    feat2_title: 'LinkedIn Optimizer',
    feat2_desc: 'Pega tu perfil de LinkedIn y recibí un análisis completo con mejoras específicas: headline, about, experiencia y keywords para aparecer en más búsquedas.',
    feat2_cta: 'Optimizar LinkedIn',
    feat3_title: 'Job Search Global',
    feat3_desc: 'Buscador de empleos internacionales integrado. Irlanda, España, UK, LATAM y más. Próximamente disponible.',
    feat3_cta: 'Próximamente',

    // How it works
    how_h2: '¿Cómo funciona?',
    how_sub: 'Tres pasos. Menos de 3 minutos.',
    step1_title: 'Subí tu CV',
    step1_desc: 'Subí tu CV actual en PDF o Word. También podés pegar el texto directamente.',
    step2_title: 'Pegá el trabajo',
    step2_desc: 'Copiá la descripción del puesto al que querés aplicar. Cualquier idioma.',
    step3_title: 'Descargá el resultado',
    step3_desc: 'La IA tailorea tu CV en segundos. Listo para enviar.',
    how_cta: 'Empezar ahora — es gratis',

    // Testimonials
    test_h2: 'Lo que dicen nuestros usuarios',

    // CTA Banner
    cta_h2: '¿Listo para conseguir más entrevistas?',
    cta_sub: 'Tailorea tu primer CV gratis. Sin tarjeta de crédito. Sin registros.',
    cta_btn: 'Empezar gratis ahora',

    // CV page
    cv_badge: 'CV Tailoring · Powered by Claude AI',
    cv_h1: 'Tailoreá tu CV con IA',
    cv_desc: 'Pegá tu CV y la descripción del puesto. La IA lo adapta en segundos para maximizar tu match ATS.',
    cv_label: 'Tu CV actual',
    cv_paste: 'Pegar texto',
    cv_upload: 'Subir archivo',
    cv_placeholder: 'Pegá aquí el texto completo de tu CV actual...\n\nIncluí: nombre, contacto, resumen, experiencia, educación, habilidades...',
    cv_lang_label: 'Idioma del CV tailoreado',
    cv_job_label: 'Descripción del puesto',
    cv_job_placeholder: 'Pegá aquí la descripción completa del trabajo al que querés aplicar...\n\nIncluí todo: responsabilidades, requisitos, empresa, beneficios...',
    cv_error: 'Por favor ingresá tu CV y la descripción del puesto.',
    cv_loading: 'Tailoreando tu CV con IA...',
    cv_submit: 'Tailorear mi CV ahora',
    cv_result_title: 'CV Tailoreado — Listo para enviar',
    cv_copy: 'Copiar',
    cv_copied: '¡Copiado!',
    cv_download: 'Descargar .txt',

    // LinkedIn page
    li_badge: 'LinkedIn Optimizer · Powered by Claude AI',
    li_h1: 'Optimizá tu LinkedIn con IA',
    li_desc: 'Pegá tu perfil y recibí un análisis completo con mejoras específicas para aparecer en más búsquedas de reclutadores.',
    li_label: 'Tu perfil de LinkedIn',
    li_placeholder: 'Pegá aquí la información de tu perfil de LinkedIn...\n\nEjemplo:\nHEADLINE: Sales Manager | B2B | SaaS\n\nABOUT:\nSoy un profesional con 8 años de experiencia...\n\nEXPERIENCIA:\nSales Manager en Empresa XYZ (2020–presente)\n- Lideré equipo de 5 personas...\n\nSKILLS: Salesforce, CRM, negociación, B2B...',
    li_role_label: 'Rol objetivo (opcional)',
    li_role_placeholder: 'Ej: Senior Sales Manager, Product Manager, Data Analyst...',
    li_role_hint: 'Si lo especificás, la IA optimizará tu perfil para ese rol en particular.',
    li_lang_label: 'Idioma del análisis',
    li_tips_title: '¿Qué incluir para mejores resultados?',
    li_tip1: 'Pegá tu headline, about/resumen, y al menos 2–3 roles de experiencia',
    li_tip2: 'Cuanto más completa sea la info, mejor será el análisis',
    li_tip3: 'Incluí tus skills actuales para recibir recomendaciones de keywords',
    li_tip4: 'Podés copiar el texto directo desde tu perfil de LinkedIn',
    li_get_title: 'Qué recibirás en el análisis',
    li_error: 'Por favor pegá tu información de LinkedIn.',
    li_loading: 'Analizando tu LinkedIn con IA...',
    li_submit: 'Optimizar mi LinkedIn ahora',
    li_result_title: 'Análisis LinkedIn — Completado',
    li_how_title: '¿Cómo copiar tu LinkedIn?',
    li_how1: 'Abrí tu perfil de LinkedIn',
    li_how2: 'Seleccioná el texto de cada sección (Headline, About, Experiencia, Skills)',
    li_how3: 'Copialo y pegalo aquí en orden',
    li_how4: 'No necesitás el formato exacto — la IA entiende texto libre',

    // Pricing page
    pr_badge: 'Planes y Precios',
    pr_h1: 'Simple, transparente, sin sorpresas',
    pr_sub: 'Empezá gratis. Upgradea cuando estés listo para escalar tu búsqueda de trabajo.',
    pr_free_desc: 'Para probar y ver resultados reales.',
    pr_pro_desc: 'Para candidatos activos que buscan trabajo.',
    pr_teams_desc: 'Para coaches, consultoras y equipos de RRHH.',
    pr_popular: '⚡ Más popular',
    pr_teams_badge: '🚀 Empresas',
    pr_free_cta: 'Empezar gratis',
    pr_pro_cta: 'Empezar con Pro',
    pr_teams_cta: 'Contactar ventas',
    pr_tools_title: 'Herramientas incluidas en CSS 4 JOBS',
    pr_test_title: 'Usuarios que ya consiguieron entrevistas',
    pr_faq_title: 'Preguntas frecuentes',
    pr_cta_h2: '¿Todavía no convencido?',
    pr_cta_sub: 'Probalo gratis — sin tarjeta de crédito. Tailoreá tu primer CV hoy.',
    pr_cta_btn: 'Empezar gratis ahora',
  },
  en: {
    // Navbar
    nav_cv: 'CV Tailoring',
    nav_linkedin: 'LinkedIn AI',
    nav_pricing: 'Pricing',
    nav_cta: 'Start free',

    // Home hero
    home_badge: 'CareerStrategy Studio',
    home_h1a: 'Your next job,',
    home_h1b: 'landed with AI',
    home_desc: 'Tailor your CV for every job, optimize your LinkedIn and get more interviews. Built for professionals who want to work anywhere in the world.',
    home_cta1: 'Tailor my CV for free',
    home_cta2: 'Optimize LinkedIn',

    // Stats
    stat1_val: '2 min',
    stat1_lbl: 'to tailor a CV',
    stat2_val: '95%',
    stat2_lbl: 'ATS pass rate',
    stat3_val: '3x',
    stat3_lbl: 'more interviews',
    stat4_val: 'Free',
    stat4_lbl: 'to get started',

    // Features
    features_h2: 'Everything you need to land the job',
    features_sub: 'AI tools that do the heavy lifting for you.',
    feat1_title: 'AI CV Tailoring',
    feat1_desc: 'Upload your CV, paste the job description and our AI rewrites it tailored exactly to that job. Pass ATS filters and reach real recruiters.',
    feat1_cta: 'Tailor my CV',
    feat2_title: 'LinkedIn Optimizer',
    feat2_desc: 'Paste your LinkedIn profile and get a complete analysis with specific improvements: headline, about, experience and keywords to appear in more searches.',
    feat2_cta: 'Optimize LinkedIn',
    feat3_title: 'Global Job Search',
    feat3_desc: 'Integrated international job search. Ireland, Spain, UK, LATAM and more. Coming soon.',
    feat3_cta: 'Coming soon',

    // How it works
    how_h2: 'How does it work?',
    how_sub: 'Three steps. Less than 3 minutes.',
    step1_title: 'Upload your CV',
    step1_desc: 'Upload your current CV in PDF or Word. You can also paste the text directly.',
    step2_title: 'Paste the job',
    step2_desc: 'Copy the job description you want to apply to. Any language.',
    step3_title: 'Download the result',
    step3_desc: 'The AI tailors your CV in seconds. Ready to send.',
    how_cta: 'Start now — it\'s free',

    // Testimonials
    test_h2: 'What our users say',

    // CTA Banner
    cta_h2: 'Ready to get more interviews?',
    cta_sub: 'Tailor your first CV for free. No credit card. No sign up.',
    cta_btn: 'Start free now',

    // CV page
    cv_badge: 'CV Tailoring · Powered by Claude AI',
    cv_h1: 'Tailor your CV with AI',
    cv_desc: 'Paste your CV and the job description. The AI adapts it in seconds to maximize your ATS match.',
    cv_label: 'Your current CV',
    cv_paste: 'Paste text',
    cv_upload: 'Upload file',
    cv_placeholder: 'Paste the full text of your current CV here...\n\nInclude: name, contact, summary, experience, education, skills...',
    cv_lang_label: 'Language of the tailored CV',
    cv_job_label: 'Job description',
    cv_job_placeholder: 'Paste the full job description here...\n\nInclude everything: responsibilities, requirements, company, benefits...',
    cv_error: 'Please enter your CV and the job description.',
    cv_loading: 'Tailoring your CV with AI...',
    cv_submit: 'Tailor my CV now',
    cv_result_title: 'Tailored CV — Ready to send',
    cv_copy: 'Copy',
    cv_copied: 'Copied!',
    cv_download: 'Download .txt',

    // LinkedIn page
    li_badge: 'LinkedIn Optimizer · Powered by Claude AI',
    li_h1: 'Optimize your LinkedIn with AI',
    li_desc: 'Paste your profile and get a full analysis with specific improvements to appear in more recruiter searches.',
    li_label: 'Your LinkedIn profile',
    li_placeholder: 'Paste your LinkedIn profile information here...\n\nExample:\nHEADLINE: Sales Manager | B2B | SaaS\n\nABOUT:\nI am a professional with 8 years of experience...\n\nEXPERIENCE:\nSales Manager at Company XYZ (2020–present)\n- Led a team of 5 people...\n\nSKILLS: Salesforce, CRM, negotiation, B2B...',
    li_role_label: 'Target role (optional)',
    li_role_placeholder: 'E.g.: Senior Sales Manager, Product Manager, Data Analyst...',
    li_role_hint: 'If specified, the AI will optimize your profile for that particular role.',
    li_lang_label: 'Analysis language',
    li_tips_title: 'What to include for best results?',
    li_tip1: 'Paste your headline, about/summary, and at least 2–3 experience roles',
    li_tip2: 'The more complete the info, the better the analysis',
    li_tip3: 'Include your current skills to get keyword recommendations',
    li_tip4: 'You can copy the text directly from your LinkedIn profile',
    li_get_title: 'What you\'ll get in the analysis',
    li_error: 'Please paste your LinkedIn information.',
    li_loading: 'Analyzing your LinkedIn with AI...',
    li_submit: 'Optimize my LinkedIn now',
    li_result_title: 'LinkedIn Analysis — Completed',
    li_how_title: 'How to copy from LinkedIn?',
    li_how1: 'Open your LinkedIn profile',
    li_how2: 'Select the text from each section (Headline, About, Experience, Skills)',
    li_how3: 'Copy and paste it here in order',
    li_how4: 'You don\'t need the exact format — the AI understands free text',

    // Pricing page
    pr_badge: 'Plans & Pricing',
    pr_h1: 'Simple, transparent, no surprises',
    pr_sub: 'Start free. Upgrade when you\'re ready to scale your job search.',
    pr_free_desc: 'To try it and see real results.',
    pr_pro_desc: 'For active candidates looking for a job.',
    pr_teams_desc: 'For coaches, agencies and HR teams.',
    pr_popular: '⚡ Most popular',
    pr_teams_badge: '🚀 Enterprise',
    pr_free_cta: 'Start free',
    pr_pro_cta: 'Start with Pro',
    pr_teams_cta: 'Contact sales',
    pr_tools_title: 'Tools included in CSS 4 JOBS',
    pr_test_title: 'Users who already got interviews',
    pr_faq_title: 'Frequently asked questions',
    pr_cta_h2: 'Still not convinced?',
    pr_cta_sub: 'Try it free — no credit card. Tailor your first CV today.',
    pr_cta_btn: 'Start free now',
  },
};

type TranslationKey = keyof typeof translations.es;

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'es',
  setLang: () => {},
  t: (key) => translations.es[key],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es');
  const t = (key: TranslationKey) => translations[lang][key] ?? translations.es[key];
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
