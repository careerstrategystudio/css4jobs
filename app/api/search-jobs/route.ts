import { NextRequest, NextResponse } from 'next/server';

const APP_ID  = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;
const REED_KEY = process.env.REED_API_KEY; // Basic-auth username, password = ""

// Adzuna-verified countries for our target markets
const EU_LATAM    = ['es','gb','de','fr','nl','at','pl','br','ie'];
const REMOTE_POOL = ['us','gb','de','ca'];

// ─── Reed API (Ireland) ──────────────────────────────────────────────────────

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

async function searchReed(keywords: string, page: number) {
  if (!REED_KEY) return [];
  const skip = (page - 1) * 8;
  const params = new URLSearchParams({
    keywords,
    locationName: 'Ireland',
    resultsToSkip: String(skip),
    resultsToTake: '8',
  });
  try {
    const auth = Buffer.from(`${REED_KEY}:`).toString('base64');
    const res  = await fetch(
      `https://www.reed.co.uk/api/1.0/search?${params}`,
      {
        headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.results || []) as ReedJob[]).map((j) => ({
      id:            `reed-${j.jobId}`,
      title:         j.jobTitle,
      company:       { display_name: j.employerName || 'Empresa' },
      location:      { display_name: j.locationName || 'Ireland' },
      description:   j.jobDescription || '',
      salary_min:    j.minimumSalary  ?? undefined,
      salary_max:    j.maximumSalary  ?? undefined,
      contract_time: j.contractType   || undefined,
      created:       j.date,
      redirect_url:  j.jobUrl,
      _country:      'ie',
    }));
  } catch { return []; }
}

// ─── Adzuna helper ───────────────────────────────────────────────────────────

async function searchAdzuna(
  country: string,
  what: string,
  page: number,
  baseParams: Record<string, string>
) {
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
    }));
  } catch { return []; }
}

// ─── Main handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query    = searchParams.get('q')       || '';
  const days     = searchParams.get('days')    || '';
  const jobType  = searchParams.get('type')    || '';
  const workMode = searchParams.get('mode')    || '';
  const exp      = searchParams.get('exp')     || '';
  const country  = searchParams.get('country') || 'all';
  const page     = parseInt(searchParams.get('page') || '1');

  if (!query.trim()) return NextResponse.json({ results: [] });

  let what = query.trim();
  if (workMode === 'remote' || country === 'remote') what += ' remote';
  if (exp && exp !== 'any') what += ` ${exp}`;

  const baseParams: Record<string, string> = {
    app_id:           APP_ID!,
    app_key:          APP_KEY!,
    results_per_page: '8',
  };
  if (days)                    baseParams.max_days_old = days;
  if (jobType === 'full_time') baseParams.full_time    = '1';
  if (jobType === 'part_time') baseParams.part_time    = '1';
  if (jobType === 'contract')  baseParams.contract     = '1';

  // Determine which countries to query via Adzuna
  let adzunaTargets: string[];
  if (country === 'all')    adzunaTargets = EU_LATAM;
  else if (country === 'remote') adzunaTargets = REMOTE_POOL;
  else adzunaTargets = [country];

  // Fire Adzuna searches in parallel
  const adzunaFetches = adzunaTargets.map((c) =>
    searchAdzuna(c, what, page, baseParams)
  );

  // Also fire Reed for Ireland when relevant
  const includesIreland =
    country === 'ie' || country === 'all';
  const reedFetch = includesIreland ? searchReed(what, page) : Promise.resolve([]);

  const [adzunaResults, reedResults] = await Promise.all([
    Promise.all(adzunaFetches).then((r) => r.flat()),
    reedFetch,
  ]);

  // Merge: Reed first for Ireland-specific searches, appended otherwise
  let all = [...adzunaResults, ...(reedResults as Record<string, unknown>[])];

  // De-duplicate by redirect_url (Reed sometimes overlaps with Adzuna)
  const seen = new Set<string>();
  all = all.filter((j) => {
    const key = (j.redirect_url as string) || (j.id as string);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  all.sort((a, b) =>
    new Date(b.created as string).getTime() -
    new Date(a.created as string).getTime()
  );

  // Work mode post-filter
  let results = all;
  if (workMode === 'hybrid') {
    results = all.filter((j) => {
      const txt = ((j.title as string || '') + ' ' + (j.description as string || '')).toLowerCase();
      return txt.includes('hybrid');
    });
  } else if (workMode === 'on-site') {
    results = all.filter((j) => {
      const txt = ((j.title as string || '') + ' ' + (j.description as string || '')).toLowerCase();
      return !txt.includes('remote') && !txt.includes('hybrid');
    });
  }

  return NextResponse.json({ results: results.slice(0, 60) });
}
