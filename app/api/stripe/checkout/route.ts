import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' });

const PLANS: Record<string, { name: string; desc: string; amount: number; months: number; label: string }> = {
  semestral: {
    name:   'CSS PRO — Plan Semestral',
    desc:   '6 meses de acceso completo a CSS 4 JOBS Pro',
    amount: 8130,   // €81.30
    months: 6,
    label:  '€81.30 · 6 meses',
  },
  cuatrimestral: {
    name:   'CSS PRO — Plan Cuatrimestral',
    desc:   '4 meses de acceso completo a CSS 4 JOBS Pro',
    amount: 6232,   // €62.32
    months: 4,
    label:  '€62.32 · 4 meses',
  },
  mensual: {
    name:   'CSS PRO — Plan Mensual',
    desc:   '1 mes de acceso completo a CSS 4 JOBS Pro',
    amount: 1800,   // €18.00
    months: 1,
    label:  '€18.00 · 1 mes',
  },
};

export async function POST(req: NextRequest) {
  try {
    const { planId, email } = await req.json();
    const plan = PLANS[planId];
    if (!plan) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });

    const origin = req.headers.get('origin') || 'https://css4jobs.vercel.app';

    const session = await stripe.checkout.sessions.create({
      automatic_payment_methods: { enabled: true },
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name:        plan.name,
            description: plan.desc,
            images:      ['https://css4jobs.vercel.app/images/logo.png'],
          },
          unit_amount: plan.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email || undefined,
      success_url: `${origin}/pricing?success=1&plan=${planId}`,
      cancel_url:  `${origin}/pricing?canceled=1`,
      metadata: {
        planId,
        months: String(plan.months),
        limit:  '999',
      },
      locale: 'es',
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Error creando sesión de pago' }, { status: 500 });
  }
}
