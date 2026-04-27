import { NextRequest, NextResponse } from 'next/server';
import { generateKey } from '@/lib/keys';
import { createClient } from '@supabase/supabase-js';

interface GenerateKeyRequest {
  email: string;
  plan: 'monthly' | 'quadrimestral' | 'semestral';
}

const PLAN_CONFIG: Record<string, { months: number; limit: number }> = {
  monthly: { months: 1, limit: 5 },
  quadrimestral: { months: 4, limit: 20 },
  semestral: { months: 6, limit: 30 },
};

export async function POST(req: NextRequest) {
  try {
    console.log('[API] Generate Pro Key - Starting request');
    
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('[API] Supabase URL:', supabaseUrl ? 'configured' : 'MISSING');
    console.log('[API] Supabase Key:', supabaseKey ? 'configured' : 'MISSING');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[API] Supabase configuration missing');
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Crear cliente Supabase
    console.log('[API] Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar que sea una solicitud autorizada (desde admin panel)
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.ADMIN_SECRET}`;
    
    console.log('[API] Auth header:', authHeader ? 'present' : 'MISSING');
    console.log('[API] Expected auth:', expectedAuth);
    
    if (authHeader !== expectedAuth) {
      console.error('[API] Authorization failed');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[API] Parsing request body...');
    const { email, plan }: GenerateKeyRequest = await req.json();

    console.log('[API] Validating email and plan...');
    if (!email || !plan) {
      console.error('[API] Missing email or plan');
      return NextResponse.json(
        { error: 'Email y plan son requeridos' },
        { status: 400 }
      );
    }

    if (!PLAN_CONFIG[plan]) {
      console.error('[API] Invalid plan:', plan);
      return NextResponse.json(
        { error: 'Plan inválido' },
        { status: 400 }
      );
    }

    console.log('[API] Generating key for:', email, 'plan:', plan);
    const { months, limit } = PLAN_CONFIG[plan];
    const proKey = generateKey(email, limit, months);
    console.log('[API] Key generated:', proKey?.substring(0, 20) + '...');

    // Guardar en Supabase
    console.log('[API] Saving to Supabase...');
    const expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { error: dbError, data: dbData } = await supabase
      .from('pro_keys')
      .insert({
        email: email.toLowerCase().trim(),
        pro_key: proKey,
        plan,
        expires_at: expiresAt,
        status: 'active',
      });

    if (dbError) {
      console.error('[API] Supabase insert error:', dbError);
      return NextResponse.json(
        { error: `Error al guardar en base de datos: ${dbError.message}` },
        { status: 500 }
      );
    }
    
    console.log('[API] Successfully saved to Supabase');

    // Enviar email con la clave
    console.log('[API] Sending email...');
    try {
      await sendProKeyEmail(email, proKey, plan);
      console.log('[API] Email sent successfully');
    } catch (emailError) {
      console.error('[API] Email error:', emailError);
      // No fallar si el email no se envía, la clave ya está generada
    }

    console.log('[API] Request completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Clave generada y email enviado',
      proKey,
      email,
      plan,
      expiresIn: `${months} mes${months > 1 ? 'es' : ''}`,
    });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: `Error al generar clave: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}

async function sendProKeyEmail(email: string, proKey: string, plan: string) {
  const planName = {
    monthly: 'Mensual (30 días)',
    quadrimestral: 'Cuatrimestral (120 días)',
    semestral: 'Semestral (180 días)',
  }[plan];

  const planLimits = {
    monthly: 5,
    quadrimestral: 20,
    semestral: 30,
  };

  const expiresDate = new Date();
  const months = plan === 'monthly' ? 1 : plan === 'quadrimestral' ? 4 : 6;
  expiresDate.setDate(expiresDate.getDate() + months * 30);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a CSS4Jobs Pro! 🚀</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 20px;">
            <p style="color: #333; font-size: 16px; margin-top: 0;">Hola <strong>${email}</strong>,</p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Tu acceso a <strong>CSS4Jobs Pro</strong> ha sido activado exitosamente. Aquí está tu clave de acceso:
            </p>
            
            <!-- Pro Key Box -->
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase;">TU CLAVE PRO</p>
              <code style="font-family: 'Monaco', 'Courier New', monospace; font-size: 18px; color: #667eea; font-weight: bold; word-break: break-all; display: block; padding: 8px 0;">
                ${proKey}
              </code>
            </div>

            <!-- Plan Details -->
            <div style="background: #f0f4ff; border-left: 4px solid #667eea; padding: 16px; border-radius: 4px; margin: 24px 0;">
              <p style="color: #667eea; font-weight: bold; margin: 0 0 8px 0;">📋 Tu Plan: <strong>${planName}</strong></p>
              <p style="color: #666; font-size: 14px; margin: 0;">
                ✅ Válido hasta: <strong>${expiresDate.toLocaleDateString('es-ES')}</strong><br>
                ✅ CVs adaptables por mes: <strong>${planLimits[plan as keyof typeof planLimits]}</strong>
              </p>
            </div>

            <!-- Instructions -->
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 4px; margin: 24px 0;">
              <p style="color: #856404; font-weight: bold; margin: 0 0 8px 0;">💡 Próximos pasos:</p>
              <ol style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Entra a <a href="https://css4jobs.vercel.app" style="color: #667eea; text-decoration: none; font-weight: 500;">css4jobs.vercel.app</a></li>
                <li>Ingresa tu clave Pro en la sección de acceso</li>
                <li>¡Empieza a adaptar CVs ilimitadamente!</li>
              </ol>
            </div>

            <p style="color: #999; font-size: 12px; margin-top: 32px; text-align: center; line-height: 1.6;">
              Si tienes problemas o preguntas, no dudes en responder este email o escribir a <a href="mailto:careerstrategystudio@gmail.com" style="color: #667eea; text-decoration: none;">careerstrategystudio@gmail.com</a>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              © 2025 CareerStrategyStudio. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Usar Resend para enviar email
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'CareerStrategyStudio <noreply@careerstrategystudio.com>',
      to: email,
      subject: '🎯 Tu Clave Pro CSS4Jobs está lista',
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email service error: ${response.statusText}`);
  }

  return response.json();
}
