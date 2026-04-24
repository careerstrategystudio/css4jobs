import { NextRequest, NextResponse } from 'next/server';
import { generateKey } from '@/lib/keys';

export async function POST(req: NextRequest) {
  try {
    const { adminPassword, email, limit, months } = await req.json();

    const expectedPw = process.env.ADMIN_PASSWORD || 'admin2025';
    if (adminPassword !== expectedPw)
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });

    if (!email || !limit || !months)
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });

    const key = generateKey(email, Number(limit), Number(months));
    return NextResponse.json({ key, email, limit, months });
  } catch {
    return NextResponse.json({ error: 'Error generando clave' }, { status: 500 });
  }
}
