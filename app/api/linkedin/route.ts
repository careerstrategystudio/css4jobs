import { NextRequest, NextResponse } from 'next/server';

// ── ProxyCurl (paid, ~$0.01/call — add PROXYCURL_API_KEY to Vercel) ───────────
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

// ── Format ProxyCurl profile → CV text ───────────────────────────────────────
function formatProxyCurl(p: Record<string, unknown>): string {
  const L: string[] = [];
  const name = [p.first_name, p.last_name].filter(Boolean).join(' ');
  if (name)       L.push(name.toUpperCase());
  if (p.headline) L.push(p.headline as string);
  if (p.city || p.country_full_name)
    L.push([p.city, p.country_full_name].filter(Boolean).join(', '));
  L.push('');

  if (p.summary) { L.push('RESUMEN', p.summary as string, ''); }

  const exp = p.experiences as Record<string, unknown>[] | undefined;
  if (exp?.length) {
    L.push('EXPERIENCIA');
    for (const e of exp) {
      const from = e.starts_at ? `${(e.starts_at as Record<string,number>).month||''}/${(e.starts_at as Record<string,number>).year||''}` : '';
      const to   = e.ends_at   ? `${(e.ends_at   as Record<string,number>).month||''}/${(e.ends_at   as Record<string,number>).year||''}` : 'Presente';
      L.push(`${e.title || ''} — ${e.company || ''}`);
      if (from || to) L.push(`${from} – ${to}`);
      if (e.description) L.push(e.description as string);
      L.push('');
    }
  }

  const edu = p.education as Record<string, unknown>[] | undefined;
  if (edu?.length) {
    L.push('EDUCACIÓN');
    for (const e of edu) {
      L.push(`${e.degree_name || e.field_of_study || ''} — ${e.school || ''}`);
      const from = (e.starts_at as Record<string,number>)?.year || '';
      const to   = (e.ends_at   as Record<string,number>)?.year || '';
      if (from || to) L.push(`${from}${to ? ` – ${to}` : ''}`);
      L.push('');
    }
  }

  const skills = p.skills as string[] | undefined;
  if (skills?.length) { L.push('HABILIDADES', skills.join(' | ')); }

  return L.join('\n').trim();
}

// ── JSON-LD extractor (LinkedIn embeds structured data in public pages) ────────
interface LdProfile {
  name?: string; jobTitle?: string; description?: string;
  worksFor?: { name?: string }[];
  alumniOf?: { name?: string }[];
  knowsAbout?: string[];
  address?: { addressLocality?: string; addressCountry?: string };
}

function extractJsonLd(html: string): LdProfile | null {
  const re = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'Person' && item.name) return item as LdProfile;
      }
    } catch { /* continue */ }
  }
  return null;
}

function formatJsonLd(p: LdProfile): string {
  const L: string[] = [];
  if (p.name) L.push(p.name.toUpperCase());
  if (p.jobTitle) L.push(p.jobTitle);
  const loc = [p.address?.addressLocality, p.address?.addressCountry].filter(Boolean).join(', ');
  if (loc) L.push(loc);
  L.push('');

  if (p.description) { L.push('RESUMEN', p.description, ''); }

  if (p.worksFor?.length) {
    L.push('EXPERIENCIA');
    for (const w of p.worksFor) { if (w.name) { L.push(w.name); L.push(''); } }
  }

  if (p.alumniOf?.length) {
    L.push('EDUCACIÓN');
    for (const a of p.alumniOf) { if (a.name) { L.push(a.name); L.push(''); } }
  }

  if (p.knowsAbout?.length) { L.push('HABILIDADES', p.knowsAbout.join(' | ')); }

  return L.join('\n').trim();
}

// ── Meta tag extractor ────────────────────────────────────────────────────────
function extractMeta(html: string, prop: string): string {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]+content="([^"]+)"`, 'i'))
         || html.match(new RegExp(`content="([^"]+)"[^>]*(?:property|name)="${prop}"`, 'i'));
  return m ? m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim() : '';
}

// ── Scraping strategy: try multiple UA/URL combos ─────────────────────────────
async function tryScrape(url: string) {
  const attempts = [
    // Mobile LinkedIn — sometimes bypasses authwall for public profiles
    {
      fetchUrl: url.replace('www.linkedin.com', 'm.linkedin.com'),
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    },
    // Desktop Chrome
    {
      fetchUrl: url,
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
    // Googlebot — some sites serve content to crawlers
    {
      fetchUrl: url,
      ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    },
  ];

  for (const { fetchUrl, ua } of attempts) {
    try {
      const res = await fetch(fetchUrl, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'follow',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        signal: AbortSignal.timeout(8000) as any,
      });

      const html = await res.text();
      const isBlocked =
        res.url.includes('login') ||
        res.url.includes('authwall') ||
        res.url.includes('uas/') ||
        html.includes('authwall') ||
        html.includes('join/') ||
        html.length < 5000; // suspiciously short = redirect/block page

      if (isBlocked) continue;

      // 1. Try JSON-LD (richest data)
      const ld = extractJsonLd(html);
      if (ld?.name) return { source: 'jsonld', ld };

      // 2. Try og: meta tags (basic data)
      let name = extractMeta(html, 'og:title').replace(/\s*\|?\s*LinkedIn\s*$/i, '').trim();
      let headline = extractMeta(html, 'og:description');
      const dash = headline.indexOf(' - ');
      if (dash > 0) headline = headline.substring(dash + 3).replace(/\s*\|.*$/, '').trim();

      if (name) return { source: 'meta', name, headline };

    } catch { /* try next */ }
  }
  return null;
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
      return NextResponse.json({
        error: 'Ingresa una URL de perfil de LinkedIn: linkedin.com/in/tu-nombre',
      }, { status: 400 });
    }

    // ── 1. ProxyCurl (paid, 100% reliable) ──────────────────────────────────
    const pcData = await fetchViaProxyCurl(cleaned);
    if (pcData && (pcData.first_name || pcData.last_name)) {
      return NextResponse.json({ success: true, full: true, cvText: formatProxyCurl(pcData) });
    }

    // ── 2. Direct scrape (free, works for some public profiles) ─────────────
    const scraped = await tryScrape(cleaned);
    if (scraped) {
      if (scraped.source === 'jsonld' && scraped.ld) {
        return NextResponse.json({
          success: true, full: true,
          cvText: formatJsonLd(scraped.ld as LdProfile),
        });
      }
      if (scraped.source === 'meta' && scraped.name) {
        const cvText = [
          (scraped.name as string).toUpperCase(),
          scraped.headline as string || '',
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
        return NextResponse.json({ success: true, full: false, cvText, name: scraped.name });
      }
    }

    // ── 3. Blocked — UI handles with options (form / screenshot / PDF) ───────
    return NextResponse.json({ success: false, blocked: true });

  } catch (err) {
    console.error('LinkedIn route error:', err);
    return NextResponse.json({ success: false, blocked: true });
  }
}
