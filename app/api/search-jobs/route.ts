import { NextRequest, NextResponse } from 'next/server';

const APP_ID  = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

// Adzuna-verified countries for our target markets
const EU_LATAM    = ['es','gb','de','fr','nl','at','pl','br','ie'];
const REMOTE_POOL = ['us','gb','de','ca'];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query    = searchParams.get('q')       || '';
  const days     = searchParams.get('days')    || '';
  const jobType  = searchParams.get('type')    || '';
  const workMode = searchParams.get('mode')    || '';
  const exp      = searchParams.get('exp')     || '';
  const country  = searchParams.get('country') || 'all';  // 'all' | 'remote' | specific code
  const page     = parseInt(searchParams.get('page') || '1');

  if (!query.trim()) return NextResponse.json({ results: [] });

  // Build search term
  let what = query.trim();
  if (workMode === 'remote' || country === 'remote') what += ' remote';
  if (exp && exp !== 'any') what += ` ${exp}`;

  const baseParams: Record<string, string> = {
    app_id:           APP_ID!,
    app_key:          APP_KEY!,
    results_per_page: '8',
    what,
  };
  if (days)                    baseParams.max_days_old = days;
  if (jobType === 'full_time') baseParams.full_time    = '1';
  if (jobType === 'part_time') baseParams.part_time    = '1';
  if (jobType === 'contract')  baseParams.contract     = '1';

  const qs = new URLSearchParams(baseParams).toString();

  // Determine which countries to query
  let targets: string[];
  if (country === 'all')    targets = EU_LATAM;
  else if (country === 'remote') targets = REMOTE_POOL;
  else targets = [country];

  const fetches = targets.map(async (c) => {
    try {
      const res = await fetch(
        `https://api.adzuna.com/v1/api/jobs/${c}/search/${page}?${qs}`,
        { headers: { 'Accept': 'application/json' }, next: { revalidate: 300 } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).map((j: Record<string, unknown>) => ({ ...j, _country: c }));
    } catch { return []; }
  });

  const all = (await Promise.all(fetches)).flat() as Record<string, unknown>[];
  all.sort((a, b) => new Date(b.created as string).getTime() - new Date(a.created as string).getTime());

  // Work mode post-filter
  let results = all;
  if (workMode === 'hybrid') {
    results = all.filter(j => {
      const txt = ((j.title as string || '') + ' ' + (j.description as string || '')).toLowerCase();
      return txt.includes('hybrid');
    });
  } else if (workMode === 'on-site') {
    results = all.filter(j => {
      const txt = ((j.title as string || '') + ' ' + (j.description as string || '')).toLowerCase();
      return !txt.includes('remote') && !txt.includes('hybrid');
    });
  }

  return NextResponse.json({ results: results.slice(0, 60) }