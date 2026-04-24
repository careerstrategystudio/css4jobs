// Shared CV parser — used by PDF renderer and live HTML preview

export interface CVSection { header: string; lines: string[]; }
export interface ParsedCV  { name: string; title: string; contact: string; sections: CVSection[]; }
export interface ExpEntry  { dates: string; location: string; jobTitle: string; company: string; bullets: string[]; }
export interface EduEntry  { dates: string; location: string; degree: string; institution: string; }

export function parseCV(text: string): ParsedCV {
  const rawLines = text.split('\n');
  let li = 0;
  const nextNE = () => {
    while (li < rawLines.length && !rawLines[li].trim()) li++;
    return li < rawLines.length ? rawLines[li++].trim() : '';
  };
  const name = nextNE(), title = nextNE(), contact = nextNE();
  const sections: CVSection[] = [];
  let cur: CVSection | null = null;
  for (; li < rawLines.length; li++) {
    const raw = rawLines[li];
    const t = raw.trim();
    const isHdr =
      t.length > 0 && t.length < 65 &&
      t === t.toUpperCase() && /[A-Z]/.test(t) &&
      !/^\d/.test(t) && !t.startsWith('\u2022');
    if (isHdr) { if (cur) sections.push(cur); cur = { header: t, lines: [] }; }
    else if (cur) cur.lines.push(raw);
  }
  if (cur) sections.push(cur);
  return { name, title, contact, sections };
}

export function parseExperience(lines: string[]): ExpEntry[] {
  const entries: ExpEntry[] = [];
  let exp: ExpEntry | null = null;
  let phase = 0;
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) continue;
    const isDate = /\d{2}\/\d{4}|\d{4}\s*[-–]\s*(\d{4}|present|presente|actual|hoy)/i.test(l);
    const isBull = /^[\u2022\-\*]/.test(l);
    if (isDate) {
      if (exp) entries.push(exp);
      exp = { dates: l, location: '', jobTitle: '', company: '', bullets: [] };
      phase = 1;
    } else if (exp) {
      if (isBull) { exp.bullets.push(l.replace(/^[\u2022\-\*]\s*/, '')); phase = 4; }
      else {
        switch (phase) {
          case 1: exp.location = l; phase = 2; break;
          case 2: exp.jobTitle = l; phase = 3; break;
          case 3: exp.company  = l; phase = 4; break;
          case 4: if (exp.bullets.length) exp.bullets[exp.bullets.length - 1] += ' ' + l; break;
        }
      }
    }
  }
  if (exp) entries.push(exp);
  return entries;
}

export function parseEducation(lines: string[]): EduEntry[] {
  const list: EduEntry[] = [];
  let edu: EduEntry | null = null;
  let ep = 0;
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) continue;
    const isDate = /\d{2}\/\d{4}|\d{4}\s*[-–]\s*(\d{4}|present|presente)/i.test(l);
    if (isDate) {
      if (edu) list.push(edu);
      edu = { dates: l, location: '', degree: '', institution: '' };
      ep = 1;
    } else if (edu) {
      switch (ep) {
        case 1: edu.location    = l; ep = 2; break;
        case 2: edu.degree      = l; ep = 3; break;
        case 3: edu.institution = l; ep = 4; break;
      }
    }
  }
  if (edu) list.push(edu);
  return list;
}

// build
