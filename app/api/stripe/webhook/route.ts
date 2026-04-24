import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { generateKey } from '@/lib/keys';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' });

// Send Pro key email via Resend
async function sendProKeyEmail(email: string, key: string, months: number, planId: string) {
  const planLabel: Record<string, string> = {
    semestral:      '6 meses',
    cuatrimestral:  '4 meses',
    mensual:        '1 mes',
  };
  const duration = planLabel[planId] || `${months} meses`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#0f172a;margin:0;padding:24px">
<div style="max-width:520px;margin:0 auto">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px 16px 0 0;padding:32px;text-align:center">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800">¡Tu Plan Pro está activo!</h1>
    <p style="margin:8px 0 0;color:#c7d2fe;font-size:14px">CSS 4 JOBS · ${duration} de acceso completo</p>
  </div>

  <!-- Body -->
  <div style="background:#1e293b;padding:32px;border-radius:0 0 16px 16px">

    <p style="color:#cbd5e1;font-size:14px;margin:0 0 24px">
      Hola 👋 Tu pago fue confirmado. Aquí está tu clave Pro exclusiva:
    </p>

    <!-- Key box -->
    <div style="background:#0f172a;border:1px solid #4f46e5;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:.08em">Tu Clave Pro</p>
      <p style="margin:0;font-family:'Courier New',monospace;font-size:13px;color:#a5b4fc;word-break:break-all;font-weight:600">${key}</p>
    </div>

    <!-- Steps -->
    <h2 style="color:#f1f5f9;font-size:14px;font-weight:700;margin:0 0 12px">¿Cómo activarlo?</h2>
    <div style="background:#0f172a;border-radius:10px;padding:16px;margin-bottom:24px">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:13px">1. Ve a <a href="https://css4jobs.vercel.app" style="color:#818cf8">css4jobs.vercel.app</a></p>
      <p style="margin:0 0 8px;color:#94a3b8;font-size:13px">2. Haz clic en <strong style="color:#f1f5f9">Iniciar sesión</strong> en la barra de navegación</p>
      <p style="margin:0 0 8px;color:#94a3b8;font-size:13px">3. Ingresa tu email: <strong style="color:#f1f5f9">${email}</strong></p>
      <p style="margin:0;color:#94a3b8;font-size:13px">4. Ingresa la clave Pro de arriba</p>
    </div>

    <!-- Benefits -->
    <h2 style="color:#f1f5f9;font-size:14px;font-weight:700;margin:0 0 12px">Lo que tienes ahora</h2>
    <div style="display:grid;gap:8px;margin-bottom:24px">
      ${['Carta de presentación con IA','Adaptar CV por cargo','Descarga PDF profesional','Análisis ATS 100/100','CVs ilimitados este período'].map(f =>
        `<div style="display:flex;align-items:center;gap:10px;color:#94a3b8;font-size:13px"><span style="color:#10b981;font-size:16px">✓</span>${f}</div>`
      ).join('')}
    </div>

    <a href="https://css4jobs.vercel.app/cv" style="display:block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-align:center;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:700;font-size:14px;margin-bottom:24px">
      Ir a CSS 4 JOBS →
    </a>

    <p style="color:#475569;font-size:11px;text-align:center;margin:0">
      ¿Algún problema? Responde este email o escríbenos a careerstrategystudio@gmail.com
    </p>
  </div>
</div>
</body></html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'CSS4JOBS Pro <onboarding@resend.dev>',
        to:      [email],
        subject: '🔑 Tu clave Pro de CSS 4 JOBS está lista',
        html,
      }),
    });
  } catch (err) {
    console.error('Resend email error:', err);
  }
}

// Notify Javier of the new sale
async function notifyJavier(email: string, planId: string, amount: number) {
  const amountEur = (amount / 100).toFixed(2);
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'CSS4JOBS <onboarding@resend.dev>',
        to:      ['careerstrategystudio@gmail.com'],
        subject: `💰 Nueva venta Pro — €${amountEur} (${planId})`,
        html:    `<p>Nueva venta: <strong>${planId}</strong> — €${amountEur}</p><p>Cliente: ${email}</p>`,
      }),
    });
  } catch { /* non-blocking */ }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email   = session.customer_details?.email || session.customer_email;
    const planId  = session.metadata?.planId   || 'mensual';
    const months  = parseInt(session.metadata?.months || '1');
    const limit   = parseInt(session.metadata?.limit  || '999');
    const amount  = session.amount_total || 0;

    if (!email) {
      console.error('No email in checkout session:', session.id);
      return NextResponse.json({ error: 'No email' }, { status: 400 });
    }

    // Generate Pro key
    const key = generateKey(email, limit, months);

    // Send key to customer + notify Javier
    await Promise.all([
      sendProKeyEmail(email, key, months, planId),
      notifyJavier(email, planId, amount),
    ]);

    console.log(`Pro key sent to ${email} (${planId}, ${months} months)`);
  }

  return NextResponse.json({ received: true });
}
