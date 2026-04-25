import { NextRequest, NextResponse } from 'next/server';

function extractMeta(html: string, prop: string): string {
  const patterns = [
    new RegExp(`<meta property="${prop}" content="([^"]+)"`, 'i'),
    new RegExp(`<meta name="${prop}" content="([^"]+)"`, 'i'),
    new RegExp(`content="([^"]+)"[^>]*property="${prop}"`, 'i'),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
  }
  return '';
}

function extractJsonLd(html: string): Record<string, unknown> | null {
  const matches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const m of matches) {
    try {
      const data = JSON.parse(m[1]);
      if (data['@type'] === 'Person' || data.name) return data;
    } catch { /* skip */ }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    // Validate LinkedIn URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
    }
    const cleaned = url.split('?')[0].replace(/\/$/, '').trim();
    if (!cleaned.match(/linkedin\.com\/(in|pub)\//i)) {
      return NextResponse.json({ error: 'Por favor ingresa una URL de perfil de LinkedIn válida (linkedin.com/in/tu-nombre)' }, { status: 400 });
    }

    // Fetch public profile with browser-like headers
    const res = await fetch(cleaned, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      },
      redirect: 'follow',
    });

    const html = await res.text();

    // Check if LinkedIn redirected to login
    const isLoginWall = html.includes('authwall') || html.includes('login') && html.includes('session_redirect') || res.url.includes('login') || res.url.includes('authwall');

    // Try to extract structured data
    const jsonLd = extractJsonLd(html);
    let name     = (jsonLd?.name as string) || '';
    let headline = (jsonLd?.description as string) || (jsonLd?.jobTitle as string) || '';

    // Fallback to OG / meta tags
    if (!name) {
      const ogTitle = extractMeta(html, 'og:title');
      name = ogTitle.replace(/\s*\|?\s*LinkedIn\s*$/i, '').trim();
    }
    if (!headline) {
      headline = extractMeta(html, 'og:description');
      // OG description often contains "name - headline | N connections..."
      const dashIdx = headline.indexOf(' - ');
      if (dashIdx > 0) headline = headline.substring(dashIdx + 3).replace(/\s*\|.*$/, '').trim();
    }

    // If we have at least a name, build a starter CV
    if (name && !isLoginWall) {
      const lines: string[] = [
        name.toUpperCase(),
        headline || 'Professional',
        '',
        '━━━ IMPORTADO DESDE LINKEDIN ━━━',
        '⚠️  Completa tu experiencia, educación y habilidades a continuación.',
        '',
        'EXPERIENCIA',
        '(pega aquí tu experiencia de LinkedIn)',
        '',
        'EDUCACIÓN',
        '(pega aquí tu educación)',
        '',
        'HABILIDADES',
        '(pega aquí tus habilidades)',
      ];
      return NextResponse.json({ success: true, partial: true, cvText: lines.join('\n'), name, headline });
    }

    // LinkedIn blocked us — return instructions
    return NextResponse.json({
      success: false,
      blocked: true,
      message: 'LinkedIn no permite la extracción automática de perfiles. Exporta tu perfil como PDF y súbelo aquí — contiene toda tu información y funciona perfectamente.',
    });

  } catch (err) {
    console.error('LinkedIn route error:', err);
    return NextResponse.json({
      success: false,
      blocked: true,
      message: 'No se pudo conectar con LinkedIn. Exporta tu perfil como PDF y súbelo.',
    });
  }
}
