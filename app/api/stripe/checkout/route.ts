import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const PLANS: Record<string, { name: string; desc: string; amount: number; months: number }> = {
  semestral: {
    name:   'CSS PRO — Plan Semestral',
    desc:   '6 meses de acceso completo a CSS 4 JOBS Pro',
    amount: 8130,
    months: 6,
  },
  cuatrimestral: {
    name:   'CSS PRO — Plan Cuatrimestral',
    desc:   '4 meses de acceso completo a CSS 4 JOBS Pro',
    amount: 6232,
    months: 4,
  },
  mensual: {
    name:   'CSS PRO — Plan Mensual',
    desc:   '1 mes de acceso completo a CSS 4 JOBS Pro',
    amount: 1800,
    months: 1,
  },
};

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('STRIPE_SECRET_KEY is not set');
    return NextResponse.json({ error: 'Stripe key not configured' }, { status: 500 });
  }

  try {
    const stripe = new Stripe(key);

    const { planId, email } = await req.json();
    const plan = PLANS[planId];
    if (!plan) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });

    const origin = req.headers.get('origin') || 'https://css4jobs.vercel.app';

    const session = await stripe.checkout.sessions.create({
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
      mode:           'payment',
      customer_email: email || undefined,
      success_url:    `${origin}/pricing?success=1&plan=${planId}`,
      cancel_url:     `${origin}/pricing?canceled=1`,
      metadata: {
        planId,
        months: String(plan.months),
        limit:  '999',
      },
      locale:                'es',
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Stripe checkout error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
