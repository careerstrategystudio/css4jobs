import { NextRequest, NextResponse } from 'next/server';
import { verifyKey } from '@/lib/keys';

export async function POST(req: NextRequest) {
  try {
    const { key, email } = await req.json();
    if (!key || !email)
      return NextResponse.json({ valid: false, error: 'Falta email o clave' }, { status: 400 });

    const result = verifyKey(key, email);
    if (!result.valid)
      return NextResponse.json({ valid: false, error: result.error }, { status: 200 });

    return NextResponse.json({
      valid: true,
      limit: result.payload.limit,
      exp:   result.payload.exp,
    });
  } catch {
    return NextResponse.json({ valid: false, error: 'Error del servidor' }, { status: 500 });
  }
}
