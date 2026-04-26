import { NextRequest, NextResponse } from 'next/server';

const APP_ID   = process.env.ADZUNA_APP_ID;
const APP_KEY  = process.env.ADZUNA_APP_KEY;
const REED_KEY = process.env.REED_API_KEY;

// Adzuna country pools.
const SPAIN_PLUS_EU = ['es', 'gb', 'de', 'fr', 'nl', 'it', 'ie', 'pl', 'at'];
const LATAM_POOL    = ['mx', 'br'];
const EU_LATAM      = [...SPAIN_PLUS_EU, ...LATAM_POOL];
const REMOTE_POOL   = ['us', 'gb', 'de', 'ca', 'nl', 'es'];

// Reed API (Ireland and UK)
interface ReedJob {
  jobId: number;
  jobTitle: string;
  employerName: string;
  locationName: string;
  jobDescription: string;
  minimumSalary: number | null;
  maximumSalary: number | null;
  date: string;
  jobUrl: string;
  contractType?: string;
}

async function searchReed(keywords: string, page: number, locationName = 'Ireland', countryCode = 'ie') {
  if (!REED_KEY) return [];
  const skip = (page - 1) * 8;
  const params = new URLSearchParams({
    keywords,
    locationName,
    resultsToSkip: String(skip),
    resultsToTake: '8',
  });
  try {
    const auth = Buffer.from(`${REED_KEY}:`).toString('base64');
    const res = await fetch(`https://www.reed.co.uk/api/1.0/search?${params}`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.results || []) as ReedJob[]).map((j) => ({
      id: `reed-${j.jobId}`,
      title: j.jobTitle,
      company: { display_name: j.employerName || 'Empresa' },
      location: { display_name: j.locationName || locationName },
      description: j.jobDescription || '',
      salary_min: j.minimumSalary ?? undefined,
      salary_max: j.maximumSalary ?? undefined,
      contract_time: j.contractType || undefined,
      created: j.date,
      redirect_url: j.jobUrl,
      _country: countryCode,
      _source: 'reed',
    }));
  } catch { return []; }
}

// Adzuna search
async function searchAdzuna(country: string, what: string, page: number, baseParams: Record<string, string>) {
  const qs = new URLSearchParams({ ...baseParams, what }).toString();
  try {
    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${qs}`,
      { headers: { Accept: 'application/json' }, next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((j: Record<string, unknown>) => ({
      ...j,
      _country: country,
      _source: 'adzuna',
    }));
  } catch { return []; }
}

// RemoteOK feed (worldwide remote jobs)
interface RemoteOkJob {
  id: number | string;
  position?: string;
  company?: string;
  location?: string;
  description?: string;
  date?: string;
  url?: string;
  apply_url?: string;
  tags?: string[];
  salary_min?: number | string;
  salary_max?: number | string;
}

async function searchRemoteOK(keywords: string) {
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'CSS4JOBS/1.0', Accept: 'application/json' },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const raw = (await res.json()) as RemoteOkJob[];
    const entries = raw.slice(1);
    const lc = keywords.toLowerCase();
    const tokens = lc.split(/\s+/).filter(Boolean);
    const filtered = entries.filter((j) => {
      const hay = ((j.position || '') + ' ' + (j.company || '') + ' ' + (j.description || '') + ' ' + ((j.tags || []).join(' '))).toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
    return filtered.slice(0, 12).map((j) => ({
      id: `rok-${j.id}`,
      title: j.position || 'Remote role',
      company: { display_name: j.company || 'Remote company' },
      location: { display_name: j.location || 'Worldwide (Remote)' },
      description: (j.description || '').replace(/<[^>]+>/g, '').slice(0, 600),
      salary_min: typeof j.salary_min === 'number' ? j.salary_min : undefined,
      salary_max: typeof j.salary_max === 'number' ? j.salary_max : undefined,
      contract_time: undefined,
      created: j.date || new Date().toISOString(),
      redirect_url: j.apply_url || j.url || `https://remoteok.com/remote-jobs/${j.id}`,
      _country: 'remote',
      _source: 'remoteok',
    }));
  } catch { return []; }
}

// We Work Remotely RSS
async function searchWWR(keywords: string) {
  try {
    const res = await fetch('https://weworkremotely.com/remote-jobs.rss', {
      headers: { 'User-Agent': 'CSS4JOBS/1.0' },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.split('<item>').slice(1).map((chunk) => chunk.split('</item>')[0]);
    const lc = keywords.toLowerCase();
    const tokens = lc.split(/\s+/).filter(Boolean);
    const out = items.map((it) => {
      const get = (tag: string) => {
        const m = it.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
        if (!m) return '';
        return m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      };
      const title = get('title');
      const [companyPart, ...rest] = title.split(':');
      const jobTitle = rest.length ? rest.join(':').trim() : title;
      const company = rest.length ? companyPart.trim() : 'Remote company';
      const link = get('link');
      const desc = get('description').replace(/<[^>]+>/g, '').slice(0, 600);
      const pubDate = get('pubDate');
      const region = get('region') || 'Worldwide (Remote)';
      const hay = (title + ' ' + desc).toLowerCase();
      const matches = tokens.every((t) => hay.includes(t));
      if (!matches) return null;
      return {
        id: `wwr-${link.split('/').pop() || Math.random()}`,
        title: jobTitle,
        company: { display_name: company },
        location: { display_name: region },
        description: desc,
        salary_min: undefined,
        salary_max: undefined,
        contract_time: undefined,
        created: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        redirect_url: link,
        _country: 'remote',
        _source: 'wwr',
      };
    }).filter(Boolean);
    return (out as Array<Record<string, unknown>>).slice(0, 12);
  } catch { return []; }
}

// Native portals (deep search links per country)
const NATIVE_PORTALS: Record<string, Array<{ name: string; url: (q: string) => string }>> = {
  es: [
    { name: 'InfoJobs',    url: (q) => `https://www.infojobs.net/jobsearch/search-results/list.xhtml?keyword=${encodeURIComponent(q)}` },
    { name: 'LinkedIn',    url: (q) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&location=Spain` },
    { name: 'Tecnoempleo', url: (q) => `https://www.tecnoempleo.com/busqueda-empleos.php?te=${encodeURIComponent(q)}` },
  ],
  mx: [
    { name: 'OCC Mundial', url: (q) => `https://www.occ.com.mx/empleos/de-${encodeURIComponent(q)}/` },
    { name: 'Computrabajo',url: (q) => `https://mx.computrabajo.com/trabajo-de-${encodeURIComponent(q)}` },
    { name: 'Bumeran',     url: (q) => `https://www.bumeran.com.mx/empleos-busqueda-${encodeURIComponent(q)}.html` },
    { name: 'LinkedIn',    url: (q) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&location=Mexico` },
  ],
  ar: [
    { name: 'Bumeran',     url: (q) => `https://www.bumeran.com.ar/empleos-busqueda-${encodeURIComponent(q)}.html` },
    { name: 'Computrabajo',url: (q) => `https://ar.computrabajo.com/trabajo-de-${encodeURIComponent(q)}` },
    { name: 'LinkedIn',    url: (q) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&location=Argentina` },
  ],
  co: [
    { name: 'Computrabajo',url: (q) => `https://co.computrabajo.com/trabajo-de-${encodeURIComponent(q)}` },
    { name: 'elempleo',    url: (q) => `https://www.elempleo.com/co/ofertas-empleo/?Search=${encodeURIComponent(q)}` },
    { name: 'LinkedIn',    url: (q) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&location=Colombia` },
  ],
  cl: [
    { name: 'Trabajando',  url: (q) => `https://www.trabajando.cl/empleos/buscar-trabajo/${encodeURIComponent(q)}` },
    { name: 'Computrabajo',url: (q) => `https://cl.computrabajo.com/trabajo-de-${encodeURIComponent(q)}` },
    { name: 'LinkedIn',    url: (q) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&location=Chile` },
  ],
  pe: [
    { name: 'Computrabajo',url: (q) => `https://pe.computrabajo.com/trabajo-de-${encodeURIComponent(q)}` },
    { name: 'Bumeran',     url: (q) => `https://www.bumeran.com.pe/empleos-busqueda-${encodeURIComponent(q)}.html` },
    { name: 'LinkedIn',    url: (q) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&location=Peru` },
  ],
  br: [
    { name: 'Catho',       url: (q) => `https://www.catho.com.br/vagas/${encodeURIComponent(q)}/` },
    { name: 'Vagas.com',   url: (q) => `https://www.vagas.com.br/vagas-de-${encodeURIComponent(q)}` },
    { name: 'LinkedIn',    url: (q) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&location=Brazil` },
  ],
  remote: [
    { name: 'WeWorkRemotely', url: (q) => `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(q)}` },
    { name: 'RemoteOK',       url: (q) => `https://remoteok.com/remote-${encodeURIComponent(q.replace(/\s+/g, '-'))}-jobs` },
    { name: 'Remote.co',      url: (q) => `https://remote.co/remote-jobs/search/?search_keywords=${encodeURIComponent(q)}` },
    { name: 'LinkedIn',       url: (q) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&f_WT=2` },
  ],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query    = searchParams.get('q')       || '';
  const days     = searchParams.get('days')    || '';
  const jobType  = searchParams.get('type')    || '';
  const workMode = searchParams.get('mode')    || '';
  const exp      = searchParams.get('exp')     || '';
  const country  = searchParams.get('country') || 'all';
  const page     = parseInt(searchParams.get('page') || '1');

  if (!query.trim()) return NextResponse.json({ results: [], portals: [] });

  let what = query.trim();
  if (workMode === 'remote' || country === 'remote') what += ' remote';
  if (exp && exp !== 'any') what += ` ${exp}`;

  const baseParams: Record<string, string> = {
    app_id:           APP_ID  || '',
    app_key:          APP_KEY || '',
    results_per_page: '8',
  };
  if (days)                    baseParams.max_days_old = days;
  if (jobType === 'full_time') baseParams.full_time    = '1';
  if (jobType === 'part_time') baseParams.part_time    = '1';
  if (jobType === 'contract')  baseParams.contract     = '1';

  let adzunaTargets: string[];
  if (country === 'all')         adzunaTargets = EU_LATAM;
  else if (country === 'remote') adzunaTargets = REMOTE_POOL;
  else if (country === 'latam')  adzunaTargets = LATAM_POOL;
  else                           adzunaTargets = [country];

  const tasks: Array<Promise<Array<Record<string, unknown>>>> = [];

  if (APP_ID && APP_KEY) {
    for (const c of adzunaTargets) {
      tasks.push(searchAdzuna(c, what, page, baseParams) as Promise<Array<Record<string, unknown>>>);
    }
  }

  const includesIreland = country === 'ie' || country === 'all';
  if (includesIreland) tasks.push(searchReed(what, page, 'Ireland', 'ie') as Promise<Array<Record<string, unknown>>>);
  if (country === 'gb') tasks.push(searchReed(what, page, 'United Kingdom', 'gb') as Promise<Array<Record<string, unknown>>>);

  const wantRemote = country === 'remote' || country === 'all' || workMode === 'remote';
  if (wantRemote) {
    tasks.push(searchRemoteOK(query.trim()) as Promise<Array<Record<string, unknown>>>);
    tasks.push(searchWWR(query.trim())      as Promise<Array<Record<string, unknown>>>);
  }

  const all = (await Promise.all(tasks)).flat();

  const seen = new Set<string>();
  let results = all.filter((j) => {
    const key = (j.redirect_url as string) || (j.id as string);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  results.sort((a, b) =>
    new Date((b.created as string) || 0).getTime() -
    new Date((a.created as string) || 0).getTime()
  );

  if (workMode === 'hybrid') {
    results = results.filter((j) => {
      const txt = ((j.title as string || '') + ' ' + (j.description as string || '')).toLowerCase();
      return txt.includes('hybrid') || txt.includes('hibrido') || txt.includes('hibrida');
    });
  } else if (workMode === 'on-site') {
    results = results.filter((j) => {
      const txt = ((j.title as string || '') + ' ' + (j.description as string || '')).toLowerCase();
      return !txt.includes('remote') && !txt.includes('hybrid') && !txt.includes('remoto');
    });
  }

  const portalsKey = country === 'all' ? 'es' : country;
  const portals = (NATIVE_PORTALS[portalsKey] || []).map((p) => ({
    name: p.name,
    url:  p.url(query.trim()),
  }));

  return NextResponse.json({
    results: results.slice(0, 80),
    portals,
  });
}
