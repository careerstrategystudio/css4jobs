import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT = `Estás analizando una captura de pantalla de un perfil de LinkedIn.
Extrae TODA la información visible y devuélvela en este formato exacto:

NOMBRE COMPLETO
Título profesional
Ciudad, País · email (si visible)

RESUMEN
(texto del resumen/about si existe)

EXPERIENCIA
Cargo — Empresa
Período (ej. ene 2021 – presente)
Descripción de responsabilidades y logros

(repite para cada experiencia)

EDUCACIÓN
Titulación — Centro educativo
Años

HABILIDADES
Habilidad1 | Habilidad2 | Habilidad3 | ...

CERTIFICACIONES
Nombre certificación — Emisor (si existe)

Si alguna sección no es visible en la captura, omítela completamente.
Extrae solo texto real visible, no inventes información.
Responde ÚNICAMENTE con el CV en el formato indicado, sin explicaciones.`;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });

    const buffer  = Buffer.from(await file.arrayBuffer());
    const base64  = buffer.toString('base64');
    const isImage = file.type.startsWith('image/') || file.name.match(/\.(png|jpg|jpeg|webp|heic)$/i);

    if (!isImage) {
      return NextResponse.json({ error: 'Por favor sube una imagen (screenshot)' }, { status: 400 });
    }

    const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          { type: 'text', text: PROMPT },
        ],
      }],
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('\n')
      .trim();

    if (!text || text.length < 30) {
      return NextResponse.json({ error: 'No se pudo extraer información del perfil.' }, { status: 422 });
    }

    return NextResponse.json({ success: true, cvText: text });

  } catch (err) {
    console.error('LinkedIn OCR error:', err);
    return NextResponse.json({ error: 'Error procesando la imagen.' }, { status: 500 });
  }
}
