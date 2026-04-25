import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData  = await req.formData();
    const file      = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
    }

    const bytes     = await file.arrayBuffer();
    const buffer    = Buffer.from(bytes);
    const mimeType  = file.type || 'application/pdf';
    const base64    = buffer.toString('base64');

    // For image files (PNG, JPG, WEBP) — send as image block
    // For PDFs — send as document block (Claude reads both text and image PDFs)
    const isImage = mimeType.startsWith('image/');

    const contentBlock = isImage
      ? {
          type: 'image' as const,
          source: { type: 'base64' as const, media_type: mimeType as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif', data: base64 },
        }
      : {
          type: 'document' as const,
          source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 },
        };

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: [
          contentBlock,
          {
            type: 'text',
            text: `Extrae todo el texto de este CV/currículum.
Devuelve únicamente el texto extraído, preservando la estructura original (nombre, contacto, experiencia, educación, habilidades, etc.).
No añadas comentarios, explicaciones ni formato extra.
Si hay secciones, sepáralas con una línea en blanco.
Responde solo con el contenido del CV.`,
          },
        ],
      }],
    });

    const extracted = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('\n')
      .trim();

    if (!extracted) {
      return NextResponse.json({ error: 'No se pudo extraer texto del archivo' }, { status: 422 });
    }

    return NextResponse.json({ text: extracted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('OCR CV error:', msg);
    return NextResponse.json({ error: 'Error procesando el archivo' }, { status: 500 });
  }
}
