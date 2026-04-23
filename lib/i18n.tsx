'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export type Lang = 'es' | 'en';

const translations = {
  es: {
    // Navbar
    nav_cv: 'Optimizacion de CV',
    nav_linkedin: 'LinkedIn AI',
    nav_pricing: 'Precios',
    nav_cta: 'Empezar gratis',

    // Home hero
    home_badge: 'CareerStrategy Studio',
    home_h1a: 'Tu proximo trabajo,',
    home_h1b: 'conseguido con IA',
    home_desc: 'Adapta tu CV para cada puesto, optimiza tu LinkedIn y consigue mas entrevistas. Diseñado para profesionales hispanos que quieren trabajar en cualquier parte del mundo.',
    home_cta1: 'Optimizar mi CV gratis',
    home_cta2: 'Optimizar LinkedIn',

    // Stats
    stat1_val: '2 min',
    stat1_lbl: 'para adaptar un CV',
    stat2_val: '95%',
    stat2_lbl: 'tasa de paso en ATS',
    stat3_val: '3x',
    stat3_lbl: 'mas entrevistas',
    stat4_val: 'Gratis',
    stat4_lbl: 'para empezar',

    // Features
    features_h2: 'Todo lo que necesitas para conseguir el trabajo',
    features_sub: 'Herramientas de IA que hacen el trabajo pesado por ti.',
    feat1_title: 'Adaptacion de CV con IA',
    feat1_desc: 'Sube tu CV, pega la descripcion del puesto y nuestra IA lo reescribe adaptado exactamente a ese trabajo. Pasa filtros ATS y llega a reclutadores reales.',
    feat1_cta: 'Optimizar mi CV',
    feat2_title: 'LinkedIn Optimizer',
    feat2_desc: 'Pega tu perfil de LinkedIn y recibe un analisis completo con mejoras especificas: headline, about, experiencia y keywords para aparecer en mas busquedas.',
    feat2_cta: 'Optimizar LinkedIn',
    feat3_title: 'Busqueda Global de Trabajo',
    feat3_desc: 'Buscador de empleos internacionales integrado. Irlanda, España, UK, LATAM y mas. Proximamente disponible.',
    feat3_cta: 'Proximamente',

    // How it works
    how_h2: '¿Como funciona?',
    how_sub: 'Tres pasos. Menos de 3 minutos.',
    step1_title: 'Sube tu CV',
    step1_desc: 'Sube tu CV actual en PDF o Word. Tambien puedes pegar el texto directamente.',
    step2_title: 'Pega el trabajo',
    step2_desc: 'Copia la descripcion del puesto al que quieres aplicar. Cualquier idioma.',
    step3_title: 'Descarga el resultado',
    step3_desc: 'La IA adapta tu CV en segundos. Listo para enviar.',
    how_cta: 'Empezar ahora — es gratis',

    // Testimonials
    test_h2: 'Lo que dicen nuestros usuarios',
    test1_text: 'En 2 minutos tenia un CV adaptado para Google. Consegui la entrevista en menos de una semana.',
    test1_name: 'Maria Garcia',
    test1_role: 'Software Engineer · Dublin',
    test2_text: 'Mi LinkedIn paso de 5 a 50 visitas semanales de reclutadores. Increible herramienta.',
    test2_name: 'Carlos Ruiz',
    test2_role: 'Sales Manager · Londres',
    test3_text: 'La adaptacion de CV es brutalmente buena. Diferente a todo lo que habia probado antes.',
    test3_name: 'Ana Martinez',
    test3_role: 'Data Analyst · Amsterdam',

    // CTA Banner
    cta_h2: '¿Listo para conseguir mas entrevistas?',
    cta_sub: 'Adapta tu primer CV gratis. Sin tarjeta de credito. Sin registros.',
    cta_btn: 'Empezar gratis ahora',

    // CV page
    cv_badge: 'Adaptacion de CV · con Claude AI',
    cv_h1: 'Adapta tu CV con IA',
    cv_desc: 'Pega tu CV y la descripcion del puesto. La IA lo adapta en segundos para maximizar tu match ATS.',
    cv_label: 'Tu CV actual',
    cv_paste: 'Pegar texto',
    cv_upload: 'Subir archivo',
    cv_placeholder: 'Pega aqui el texto completo de tu CV actual...\n\nIncluye: nombre, contacto, resumen, experiencia, educacion, habilidades...',
    cv_lang_label: 'Idioma del CV adaptado',
    cv_job_label: 'Descripcion del puesto',
    cv_job_placeholder: 'Pega aqui la descripcion completa del trabajo al que quieres aplicar...\n\nIncluye todo: responsabilidades, requisitos, empresa, beneficios...',
    cv_error: 'Por favor ingresa tu CV y la descripcion del puesto.',
    cv_loading: 'Adaptando tu CV con IA...',
    cv_submit: 'Adaptar mi CV ahora',
    cv_result_title: 'CV Adaptado — Listo para enviar',
    cv_copy: 'Copiar',
    cv_copied: '¡Copiado!',
    cv_download: 'Descargar .txt',
    cv_download_pdf: 'Descargar PDF',

    // Pro unlock
    pro_locked_label: 'Solo Plan Pro',
    pro_unlock_title: 'Activar Plan Pro',
    pro_unlock_desc: 'Ingresa tu codigo de acceso Pro para habilitar la descarga en PDF.',
    pro_unlock_placeholder: 'Codigo Pro...',
    pro_unlock_btn: 'Activar',
    pro_unlock_error: 'Codigo incorrecto. Contacta a Javier para obtenerlo.',
    pro_unlocked_msg: '¡Plan Pro activado!',

    // Cover letter
    cl_title: 'Carta de Presentacion',
    cl_desc: 'Genera una carta de presentacion personalizada para este puesto en segundos.',
    cl_generate: 'Generar Carta de Presentacion',
    cl_loading: 'Generando carta con IA...',
    cl_result_title: 'Carta de Presentacion — Lista para enviar',
    cl_copy: 'Copiar',
    cl_copied: '¡Copiada!',
    cl_download_pdf: 'Descargar PDF',

    // LinkedIn page
    li_badge: 'LinkedIn Optimizer · con Claude AI',
    li_h1: 'Optimiza tu LinkedIn con IA',
    li_desc: 'Pega tu perfil y recibe un analisis completo con mejoras especificas para aparecer en mas busquedas de reclutadores.',
    li_label: 'Tu perfil de LinkedIn',
    li_placeholder: 'Pega aqui la informacion de tu perfil de LinkedIn...\n\nEjemplo:\nHEADLINE: Sales Manager | B2B | SaaS\n\nABOUT:\nSoy un profesional con 8 años de experiencia...\n\nEXPERIENCIA:\nSales Manager en Empresa XYZ (2020–presente)\n- Lidere equipo de 5 personas...\n\nSKILLS: Salesforce, CRM, negociacion, B2B...',
    li_role_label: 'Rol objetivo (opcional)',
    li_role_placeholder: 'Ej: Senior Sales Manager, Product Manager, Data Analyst...',
    li_role_hint: 'Si lo especificas, la IA optimizara tu perfil para ese rol en particular.',
    li_lang_label: 'Idioma del analisis',
    li_tips_title: '¿Que incluir para mejores resultados?',
    li_tip1: 'Pega tu headline, about/resumen, y al menos 2–3 roles de experiencia',
    li_tip2: 'Cuanto mas completa sea la info, mejor sera el analisis',
    li_tip3: 'Incluye tus skills actuales para recibir recomendaciones de keywords',
    li_tip4: 'Puedes copiar el texto directo desde tu perfil de LinkedIn',
    li_get_title: 'Que recibiras en el analisis',
    li_error: 'Por favor pega tu informacion de LinkedIn.',
    li_loading: 'Analizando tu LinkedIn con IA...',
    li_submit: 'Optimizar mi LinkedIn ahora',
    li_result_title: 'Analisis LinkedIn — Completado',
    li_how_title: '¿Como copiar tu LinkedIn?',
    li_how1: 'Abre tu perfil de LinkedIn',
    li_how2: 'Selecciona el texto de cada seccion (Headline, About, Experiencia, Skills)',
    li_how3: 'Copialo y pegalo aqui en orden',
    li_how4: 'No necesitas el formato exacto — la IA entiende texto libre',

    // Pricing page
    pr_badge: 'Planes y Precios',
    pr_h1: 'Simple, transparente, sin sorpresas',
    pr_sub: 'Empieza gratis. Pasa a Pro cuando estes listo para escalar tu busqueda.',
    pr_period: '/mes',
    pr_free_desc: 'Para probar y ver resultados reales.',
    pr_pro_desc: 'Para candidatos activos que buscan trabajo.',
    pr_teams_desc: 'Para coaches, consultoras y equipos de RRHH.',
    pr_popular: '⚡ Mas popular',
    pr_teams_badge: '🚀 Empresas',
    pr_free_cta: 'Empezar gratis',
    pr_pro_cta: 'Empezar con Pro',
    pr_teams_cta: 'Contactar ventas',
    // Free plan features
    pr_free_f1: '3 adaptaciones de CV por mes',
    pr_free_f2: '1 analisis de LinkedIn por mes',
    pr_free_f3: 'Exportar en .txt',
    pr_free_f4: 'Soporte por email',
    pr_free_m1: 'Sin descarga en PDF',
    pr_free_m2: 'Sin acceso a Job Search',
    // Pro plan features
    pr_pro_f1: 'Adaptaciones de CV ilimitadas',
    pr_pro_f2: 'Analisis de LinkedIn ilimitados',
    pr_pro_f3: 'Exportar en PDF y Word',
    pr_pro_f4: 'Job Search Global (proximamente)',
    pr_pro_f5: 'Analisis ATS detallado',
    pr_pro_f6: 'Soporte prioritario',
    // Teams plan features
    pr_teams_f1: 'Todo lo de Pro',
    pr_teams_f2: 'Hasta 10 usuarios',
    pr_teams_f3: 'Dashboard de equipo',
    pr_teams_f4: 'Reportes y analytics',
    pr_teams_f5: 'Integracion con ATS',
    pr_teams_f6: 'Soporte dedicado 24/7',
    // Tools section
    pr_tools_title: 'Herramientas incluidas en CSS 4 JOBS',
    pr_tool1: 'Adaptacion de CV con IA',
    pr_tool2: 'LinkedIn Optimizer',
    pr_tool3: 'Busqueda Global de Trabajo',
    pr_soon: 'Proximamente',
    // Testimonials section
    pr_test_title: 'Usuarios que ya consiguieron entrevistas',
    pr_t1: 'Consegui entrevista en Zalando a la semana de usar CSS 4 JOBS. La adaptacion de CV es increible.',
    pr_t1_name: 'Laura Sanchez',
    pr_t1_role: 'UX Designer · Berlin',
    pr_t2: 'Mi LinkedIn paso de 3 a 60+ visitas semanales de reclutadores. Brutal.',
    pr_t2_name: 'Martin Lopez',
    pr_t2_role: 'Backend Engineer · Dublin',
    pr_t3: 'La IA entiende perfectamente que keywords necesita cada trabajo. Vale cada euro.',
    pr_t3_name: 'Sofia Torres',
    pr_t3_role: 'Marketing Manager · Madrid',
    // FAQ
    pr_faq_title: 'Preguntas frecuentes',
    pr_faq_q1: '¿Puedo cancelar en cualquier momento?',
    pr_faq_a1: 'Si. No hay contratos ni permanencia. Cancelas cuando quieras desde tu cuenta.',
    pr_faq_q2: '¿Como se procesa el pago?',
    pr_faq_a2: 'Usamos Revolut para procesar los pagos de forma segura. Aceptamos tarjetas de credito y debito.',
    pr_faq_q3: '¿Que idiomas soporta la IA?',
    pr_faq_a3: 'Español, ingles y portugues. Puedes adaptar tu CV en cualquiera de estos idiomas.',
    pr_faq_q4: '¿La IA inventa informacion?',
    pr_faq_a4: 'No. La IA reorganiza y optimiza tu informacion real. Nunca agrega experiencia o habilidades que no tienes.',
    pr_faq_q5: '¿Funciona para cualquier industria?',
    pr_faq_a5: 'Si. La IA esta entrenada para optimizar CVs y perfiles de LinkedIn en cualquier sector: tech, ventas, marketing, finanzas, salud, y mas.',
    // CTA
    pr_cta_h2: '¿Todavia no convencido?',
    pr_cta_sub: 'Pruebalo gratis — sin tarjeta de credito. Adapta tu primer CV hoy.',
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
    how_cta: "Start now — it's free",

    // Testimonials
    test_h2: 'What our users say',
    test1_text: 'In 2 minutes I had a CV tailored for Google. I got the interview in less than a week.',
    test1_name: 'María García',
    test1_role: 'Software Engineer · Dublin',
    test2_text: 'My LinkedIn went from 5 to 50 weekly recruiter visits. Incredible tool.',
    test2_name: 'Carlos Ruiz',
    test2_role: 'Sales Manager · London',
    test3_text: 'The CV tailoring is brutally good. Different from everything I had tried before.',
    test3_name: 'Ana Martínez',
    test3_role: 'Data Analyst · Amsterdam',

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
    cv_download_pdf: 'Download PDF',

    // Pro unlock
    pro_locked_label: 'Pro Plan only',
    pro_unlock_title: 'Activate Pro Plan',
    pro_unlock_desc: 'Enter your Pro access code to enable PDF download.',
    pro_unlock_placeholder: 'Pro code...',
    pro_unlock_btn: 'Activate',
    pro_unlock_error: 'Incorrect code. Contact Javier to get yours.',
    pro_unlocked_msg: 'Pro Plan activated!',

    // Cover letter
    cl_title: 'Cover Letter',
    cl_desc: 'Generate a personalized cover letter for this position in seconds.',
    cl_generate: 'Generate Cover Letter',
    cl_loading: 'Generating cover letter with AI...',
    cl_result_title: 'Cover Letter — Ready to send',
    cl_copy: 'Copy',
    cl_copied: 'Copied!',
    cl_download_pdf: 'Download PDF',

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
    li_get_title: "What you'll get in the analysis",
    li_error: 'Please paste your LinkedIn information.',
    li_loading: 'Analyzing your LinkedIn with AI...',
    li_submit: 'Optimize my LinkedIn now',
    li_result_title: 'LinkedIn Analysis — Completed',
    li_how_title: 'How to copy from LinkedIn?',
    li_how1: 'Open your LinkedIn profile',
    li_how2: 'Select the text from each section (Headline, About, Experience, Skills)',
    li_how3: 'Copy and paste it here in order',
    li_how4: "You don't need the exact format — the AI understands free text",

    // Pricing page
    pr_badge: 'Plans & Pricing',
    pr_h1: 'Simple, transparent, no surprises',
    pr_sub: "Start free. Upgrade when you're ready to scale your job search.",
    pr_period: '/month',
    pr_free_desc: 'To try it and see real results.',
    pr_pro_desc: 'For active candidates looking for a job.',
    pr_teams_desc: 'For coaches, agencies and HR teams.',
    pr_popular: '⚡ Most popular',
    pr_teams_badge: '🚀 Enterprise',
    pr_free_cta: 'Start free',
    pr_pro_cta: 'Start with Pro',
    pr_teams_cta: 'Contact sales',
    // Free plan features
    pr_free_f1: '3 CV tailorings per month',
    pr_free_f2: '1 LinkedIn analysis per month',
    pr_free_f3: 'Export as .txt',
    pr_free_f4: 'Email support',
    pr_free_m1: 'No PDF download',
    pr_free_m2: 'No Job Search access',
    // Pro plan features
    pr_pro_f1: 'Unlimited CV tailorings',
    pr_pro_f2: 'Unlimited LinkedIn analyses',
    pr_pro_f3: 'Export as PDF and Word',
    pr_pro_f4: 'Global Job Search (coming soon)',
    pr_pro_f5: 'Detailed ATS analysis',
    pr_pro_f6: 'Priority support',
    // Teams plan features
    pr_teams_f1: 'Everything in Pro',
    pr_teams_f2: 'Up to 10 users',
    pr_teams_f3: 'Team dashboard',
    pr_teams_f4: 'Reports and analytics',
    pr_teams_f5: 'ATS integration',
    pr_teams_f6: '24/7 dedicated support',
    // Tools section
    pr_tools_title: 'Tools included in CSS 4 JOBS',
    pr_tool1: 'AI CV Tailoring',
    pr_tool2: 'LinkedIn Optimizer',
    pr_tool3: 'Global Job Search',
    pr_soon: 'Coming soon',
    // Testimonials section
    pr_test_title: 'Users who already got interviews',
    pr_t1: 'I got an interview at Zalando within a week of using CSS 4 JOBS. The CV tailoring is incredible.',
    pr_t1_name: 'Laura Sánchez',
    pr_t1_role: 'UX Designer · Berlin',
    pr_t2: 'My LinkedIn went from 3 to 60+ weekly recruiter visits. Brutal.',
    pr_t2_name: 'Martín López',
    pr_t2_role: 'Backend Engineer · Dublin',
    pr_t3: 'The AI perfectly understands what keywords each job needs. Worth every cent.',
    pr_t3_name: 'Sofía Torres',
    pr_t3_role: 'Marketing Manager · Madrid',
    // FAQ
    pr_faq_title: 'Frequently asked questions',
    pr_faq_q1: 'Can I cancel at any time?',
    pr_faq_a1: 'Yes. No contracts or commitments. Cancel whenever you want from your account.',
    pr_faq_q2: 'How is payment processed?',
    pr_faq_a2: 'We use Revolut to process payments securely. We accept credit and debit cards.',
    pr_faq_q3: 'What languages does the AI support?',
    pr_faq_a3: 'Spanish, English and Portuguese. You can tailor your CV in any of these languages regardless of the job language.',
    pr_faq_q4: 'Does the AI make up information?',
    pr_faq_a4: "No. The AI reorganizes and optimizes your real information. It never adds experience or skills you don't have.",
    pr_faq_q5: 'Does it work for any industry?',
    pr_faq_a5: 'Yes. The AI is trained to optimize CVs and LinkedIn profiles in any sector: tech, sales, marketing, finance, healthcare, and more.',
    // CTA
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
