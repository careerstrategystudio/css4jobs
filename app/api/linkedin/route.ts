import { NextRequest, NextResponse } from 'next/server';

// ── ProxyCurl (paid, reliable) ────────────────────────────────────────────────
async function fetchViaProxyCurl(url: string): Promise<Record<string, unknown> | null> {
  const key = process.env.PROXYCURL_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://nubela.co/proxycurl/api/v2/linkedin?url=${encodeURIComponent(url)}&use_cache=if-present`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ── Format ProxyCurl profile into CV text ─────────────────────────────────────
function formatProxyCurl(p: Record<string, unknown>): string {
  const lines: string[] = [];

  // Header
  const name = [p.first_name, p.last_name].filter(Boolean).join(' ');
  if (name) lines.push(name.toUpperCase());
  if (p.headline) lines.push(p.headline as string);
  if (p.city || p.country_full_name) lines.push([p.city, p.country_full_name].filter(Boolean).join(', '));
  lines.push('');

  // Summary
  if (p.summary) { lines.push('RESUMEN', p.summary as string, ''); }

  // Experience
  const exp = p.experiences as Record<string, unknown>[] | undefined;
  if (exp?.length) {
    lines.push('EXPERIENCIA');
    for (const e of exp) {
      const from = e.starts_at ? `${(e.starts_at as Record<string,number>).month || ''}/${(e.starts_at as Record<string,number>).year || ''}` : '';
      const to   = e.ends_at   ? `${(e.ends_at   as Record<string,number>).month || ''}/${(e.ends_at   as Record<string,number>).year || ''}` : 'Presente';
      lines.push(`${e.title || ''} — ${e.company || ''}`);
      if (from || to) lines.push(`${from} – ${to}`);
      if (e.description) lines.push(e.description as string);
      lines.push('');
    }
  }

  // Education
  const edu = p.education as Record<string, unknown>[] | undefined;
  if (edu?.length) {
    lines.push('EDUCACIÓN');
    for (const e of edu) {
      lines.push(`${e.degree_name || e.field_of_study || ''} — ${e.school || ''}`);
      if (e.starts_at || e.ends_at) {
        const from = (e.starts_at as Record<string,number>)?.year || '';
        const to   = (e.ends_at   as Record<string,number>)?.year || 'Presente';
        lines.push(`${from} – ${to}`);
      }
      lines.push('');
    }
  }

  // Skills
  const skills = p.skills as string[] | undefined;
  if (skills?.length) {
    lines.push('HABILIDADES');
    lines.push(skills.join(' | '));
  }

  return lines.join('\n').trim();
}

// ── Direct HTML scrape (free, sometimes works) ────────────────────────────────
function extractMeta(html: string, prop: string): string {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]+content="([^"]+)"`, 'i'))
         || html.match(new RegExp(`content="([^"]+)"[^>]*(?:property|name)="${prop}"`, 'i'));
  return m ? m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim() : '';
}

async function fetchDirect(url: string): Promise<{ name: string; headline: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    const html    = await res.text();
    const blocked = res.url.includes('login') || res.url.includes('authwall') || html.includes('authwall');
    if (blocked) return null;

    let name = extractMeta(html, 'og:title').replace(/\s*\|?\s*LinkedIn\s*$/i, '').trim();
    let headline = extractMeta(html, 'og:description');
    const dash = headline.indexOf(' - ');
    if (dash > 0) headline = headline.substring(dash + 3).replace(/\s*\|.*$/, '').trim();

    return name ? { name, headline } : null;
  } catch { return null; }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
    }
    const cleaned = url.split('?')[0].replace(/\/$/, '').trim();
    if (!cleaned.match(/linkedin\.com\/(in|pub)\//i)) {
      return NextResponse.json({ error: 'Ingresa una URL de perfil de LinkedIn: linkedin.com/in/tu-nombre' }, { status: 400 });
    }

    // 1. Try ProxyCurl first (reliable, paid)
    const proxyCurlData = await fetchViaProxyCurl(cleaned);
    if (proxyCurlData && (proxyCurlData.first_name || proxyCurlData.last_name)) {
      const cvText = formatProxyCurl(proxyCurlData);
      return NextResponse.json({ success: true, full: true, cvText });
    }

    // 2. Try direct HTML scrape (free, works for some public profiles)
    const direct = await fetchDirect(cleaned);
    if (direct?.name) {
      const cvText = [
        direct.name.toUpperCase(),
        direct.headline || '',
        '',
        'EXPERIENCIA',
        '(completa tu experiencia aquí)',
        '',
        'EDUCACIÓN',
        '(completa tu educación aquí)',
        '',
        'HABILIDADES',
        '(completa tus habilidades aquí)',
      ].join('\n');
      return NextResponse.json({ success: true, full: false, cvText, name: direct.name });
    }

    // 3. LinkedIn blocked — return blocked flag (UI handles gracefully)
    return NextResponse.json({ success: false, blocked: true });

  } catch (err) {
    console.error('LinkedIn route error:', err);
    return NextResponse.json({ success: false, blocked: true });
  }
}
