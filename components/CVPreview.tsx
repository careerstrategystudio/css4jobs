'use client';
import { useMemo } from 'react';
import { parseCV, parseExperience, parseEducation, ParsedCV, CVSection } from '@/lib/cv-parser';

interface Props { text: string; template?: string; }

// ── Shared helpers ───────────────────────────────────────────────────────────
const F = {
  // fonts / text
  name:     { fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 },
  nameHrv:  { fontSize: 21, fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 },
  contact:  { fontSize: 8.5, color: '#6b7280', margin: '3px 0 0', lineHeight: 1.4 },
  secHdr:   { fontSize: 10, fontWeight: 700, color: '#111', textTransform: 'uppercase' as const, letterSpacing: 1, margin: '14px 0 4px' },
  body:     { fontSize: 9.5, color: '#374151', lineHeight: 1.5 },
  bullet:   { margin: '2px 0', paddingLeft: 12, position: 'relative' as const, fontSize: 9.5, color: '#374151', lineHeight: 1.5 },
};

// ── Skills chips ─────────────────────────────────────────────────────────────
function Skills({ lines, chipStyle }: { lines: string[]; chipStyle: React.CSSProperties }) {
  const skills = lines.join(' ').split(/[|,]/).map(s => s.trim()).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {skills.map((s, i) => <span key={i} style={chipStyle}>{s}</span>)}
    </div>
  );
}

// ── Experience block ─────────────────────────────────────────────────────────
function ExpBlock({
  sec, dateStyle, titleStyle, compStyle, locStyle, bulletColor,
}: {
  sec: CVSection;
  dateStyle: React.CSSProperties;
  titleStyle: React.CSSProperties;
  compStyle: React.CSSProperties;
  locStyle: React.CSSProperties;
  bulletColor: string;
}) {
  const entries = parseExperience(sec.lines);
  return (
    <>
      {entries.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          {/* Left: dates + location */}
          <div style={{ width: 72, flexShrink: 0 }}>
            <div style={dateStyle}>{e.dates}</div>
            <div style={locStyle}>{e.location}</div>
          </div>
          {/* Right: content */}
          <div style={{ flex: 1 }}>
            <div style={titleStyle}>{e.jobTitle}</div>
            <div style={compStyle}>{e.company}</div>
            {e.bullets.map((b, j) => (
              <div key={j} style={{ ...F.bullet }}>
                <span style={{ position: 'absolute', left: 0, color: bulletColor, fontWeight: 700 }}>·</span>
                {b}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

// ── Education block ───────────────────────────────────────────────────────────
function EduBlock({
  sec, dateStyle, degStyle, instStyle, locStyle,
}: {
  sec: CVSection;
  dateStyle: React.CSSProperties;
  degStyle: React.CSSProperties;
  instStyle: React.CSSProperties;
  locStyle: React.CSSProperties;
}) {
  const entries = parseEducation(sec.lines);
  return (
    <>
      {entries.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 72, flexShrink: 0 }}>
            <div style={dateStyle}>{e.dates}</div>
            <div style={locStyle}>{e.location}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={degStyle}>{e.degree}</div>
            <div style={instStyle}>{e.institution}</div>
          </div>
        </div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — MODERN SIDEBAR (indigo accents, left column)
// ─────────────────────────────────────────────────────────────────────────────
function ModernSidebar({ cv }: { cv: ParsedCV }) {
  const accent = '#4f46e5';
  const chip: React.CSSProperties = {
    fontSize: 8, padding: '2px 8px', border: '0.5px solid #d1d5db',
    borderRadius: 4, color: '#374151', display: 'inline-block',
  };
  const rule: React.CSSProperties = {
    border: 'none', borderTop: '0.4px solid #e5e7eb', margin: '4px 0 10px',
  };
  const dateS: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, color: '#6b7280' };
  const locS:  React.CSSProperties = { fontSize: 7.5, color: '#9ca3af', marginTop: 1 };
  const secHdrS: React.CSSProperties = {
    fontSize: 10.5, fontWeight: 700, color: '#111', textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 4, borderBottom: `1.5px solid ${accent}`,
    paddingBottom: 2,
  };

  return (
    <div style={{ padding: '18mm 18mm', fontFamily: 'Arial, Helvetica, sans-serif', background: '#fff', color: '#111', minHeight: '100%' }}>
      {/* Name */}
      <h1 style={F.name}>{cv.name}</h1>
      {/* Title */}
      <p style={{ fontSize: 11, color: accent, fontWeight: 600, margin: '5px 0 4px' }}>{cv.title}</p>
      <hr style={rule} />
      {/* Contact */}
      <p style={F.contact}>{cv.contact}</p>
      <div style={{ height: 12 }} />

      {/* Sections */}
      {cv.sections.map((sec, i) => {
        if (sec.header === 'SKILLS') return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={secHdrS}>{sec.header}</div>
            <Skills lines={sec.lines} chipStyle={chip} />
          </div>
        );
        if (sec.header === 'EXPERIENCE') return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={secHdrS}>{sec.header}</div>
            <ExpBlock sec={sec}
              dateStyle={dateS} locStyle={locS}
              titleStyle={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a' }}
              compStyle={{ fontSize: 9.5, fontWeight: 700, color: accent, marginBottom: 2 }}
              bulletColor={accent}
            />
          </div>
        );
        if (sec.header === 'EDUCATION') return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={secHdrS}>{sec.header}</div>
            <EduBlock sec={sec} dateStyle={dateS} locStyle={locS}
              degStyle={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a' }}
              instStyle={{ fontSize: 9.5, fontWeight: 700, color: accent }}
            />
          </div>
        );
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={secHdrS}>{sec.header}</div>
            <p style={F.body}>{sec.lines.filter(l => l.trim()).join(' ')}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2 — HARVARD CLASSIC (no color, max ATS)
// ─────────────────────────────────────────────────────────────────────────────
function HarvardClassic({ cv }: { cv: ParsedCV }) {
  const rule: React.CSSProperties = { border: 'none', borderTop: '0.6px solid #9ca3af', margin: '5px 0 10px' };
  const secHdrS: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: '#111', textTransform: 'uppercase',
    letterSpacing: 1, borderBottom: '0.4px solid #9ca3af', paddingBottom: 2, marginBottom: 6,
  };
  const dateS: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, color: '#6b7280' };
  const locS:  React.CSSProperties = { fontSize: 7.5, color: '#9ca3af', marginTop: 1 };

  return (
    <div style={{ padding: '18mm 20mm', fontFamily: 'Times New Roman, Georgia, serif', background: '#fff', color: '#111', minHeight: '100%' }}>
      <h1 style={{ ...F.nameHrv, fontFamily: 'Times New Roman, serif', textAlign: 'center' }}>{cv.name}</h1>
      <p style={{ textAlign: 'center', fontSize: 9.5, color: '#374151', margin: '3px 0 3px', fontStyle: 'italic' }}>{cv.title}</p>
      <p style={{ textAlign: 'center', fontSize: 8.5, color: '#6b7280', margin: '2px 0 6px' }}>{cv.contact}</p>
      <hr style={rule} />

      {cv.sections.map((sec, i) => {
        if (sec.header === 'SKILLS') return (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={secHdrS}>{sec.header}</div>
            <p style={{ ...F.body, fontFamily: 'Times New Roman, serif' }}>
              {sec.lines.join(' ').split(/[|,]/).map(s => s.trim()).filter(Boolean).join(' · ')}
            </p>
          </div>
        );
        if (sec.header === 'EXPERIENCE') return (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={secHdrS}>{sec.header}</div>
            {parseExperience(sec.lines).map((e, j) => (
              <div key={j} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#111', fontFamily: 'Times New Roman, serif' }}>{e.jobTitle}</span>
                  <span style={dateS}>{e.dates}</span>
                </div>
                <div style={{ fontSize: 9, color: '#374151', fontStyle: 'italic', fontFamily: 'Times New Roman, serif' }}>
                  {e.company}{e.location ? ` · ${e.location}` : ''}
                </div>
                {e.bullets.map((b, k) => (
                  <div key={k} style={{ ...F.bullet, fontFamily: 'Times New Roman, serif' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#111' }}>·</span>{b}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
        if (sec.header === 'EDUCATION') return (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={secHdrS}>{sec.header}</div>
            {parseEducation(sec.lines).map((e, j) => (
              <div key={j} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'Times New Roman, serif' }}>{e.degree}</span>
                  <span style={dateS}>{e.dates}</span>
                </div>
                <div style={{ fontSize: 9, color: '#374151', fontStyle: 'italic', fontFamily: 'Times New Roman, serif' }}>
                  {e.institution}{e.location ? ` · ${e.location}` : ''}
                </div>
              </div>
            ))}
          </div>
        );
        return (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={secHdrS}>{sec.header}</div>
            <p style={{ ...F.body, fontFamily: 'Times New Roman, serif' }}>{sec.lines.filter(l => l.trim()).join(' ')}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3 — EXECUTIVE PREMIUM (dark header, gold)
// ─────────────────────────────────────────────────────────────────────────────
function ExecutivePremium({ cv }: { cv: ParsedCV }) {
  const navy = '#0f172a', gold = '#d97706', blue = '#1e40af';
  const secHdrS: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: navy, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 6,
    borderBottom: `2px solid ${gold}`, paddingBottom: 2, display: 'inline-block',
  };
  const dateS: React.CSSProperties = { fontSize: 8, color: '#94a3b8' };
  const locS:  React.CSSProperties = { fontSize: 7.5, color: '#94a3b8' };
  const chip: React.CSSProperties = {
    fontSize: 8, padding: '2px 8px', border: '0.5px solid #cbd5e1',
    borderRadius: 4, color: '#374151', display: 'inline-block',
  };

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', background: '#fff', color: '#111', minHeight: '100%' }}>
      {/* Dark header band */}
      <div style={{ background: navy, padding: '14mm 18mm 12mm' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#f8fafc', margin: 0 }}>{cv.name}</h1>
        <p style={{ fontSize: 10.5, color: '#94a3b8', margin: '5px 0 4px' }}>{cv.title}</p>
        <p style={{ fontSize: 8.5, color: '#64748b', margin: 0 }}>{cv.contact}</p>
      </div>
      {/* Gold accent bar */}
      <div style={{ height: 3, background: gold }} />

      {/* Body */}
      <div style={{ padding: '14mm 18mm' }}>
        {cv.sections.map((sec, i) => {
          if (sec.header === 'SKILLS') return (
            <div key={i} style={{ marginBottom: 14 }}>
              <div><span style={secHdrS}>{sec.header}</span></div>
              <div style={{ marginTop: 6 }}><Skills lines={sec.lines} chipStyle={chip} /></div>
            </div>
          );
          if (sec.header === 'EXPERIENCE') return (
            <div key={i} style={{ marginBottom: 14 }}>
              <div><span style={secHdrS}>{sec.header}</span></div>
              <div style={{ marginTop: 6 }}>
                <ExpBlock sec={sec} dateStyle={dateS} locStyle={locS}
                  titleStyle={{ fontSize: 11, fontWeight: 700, color: navy }}
                  compStyle={{ fontSize: 9.5, fontWeight: 700, color: blue, marginBottom: 2 }}
                  bulletColor={gold}
                />
              </div>
            </div>
          );
          if (sec.header === 'EDUCATION') return (
            <div key={i} style={{ marginBottom: 14 }}>
              <div><span style={secHdrS}>{sec.header}</span></div>
              <div style={{ marginTop: 6 }}>
                <EduBlock sec={sec} dateStyle={dateS} locStyle={locS}
                  degStyle={{ fontSize: 11, fontWeight: 700, color: navy }}
                  instStyle={{ fontSize: 9.5, fontWeight: 700, color: blue }}
                />
              </div>
            </div>
          );
          return (
            <div key={i} style={{ marginBottom: 14 }}>
              <div><span style={secHdrS}>{sec.header}</span></div>
              <p style={{ ...F.body, marginTop: 6 }}>{sec.lines.filter(l => l.trim()).join(' ')}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 4 — TECH MINIMAL (left indigo bar)
// ─────────────────────────────────────────────────────────────────────────────
function TechMinimal({ cv }: { cv: ParsedCV }) {
  const indigo = '#4f46e5';
  const secHdrS: React.CSSProperties = {
    fontSize: 8.5, fontWeight: 700, color: indigo, textTransform: 'uppercase',
    letterSpacing: 1.2, marginBottom: 5,
  };
  const dateS: React.CSSProperties = { fontSize: 8, color: indigo };
  const locS:  React.CSSProperties = { fontSize: 7.5, color: '#9ca3af', marginTop: 1 };
  const chip: React.CSSProperties = {
    fontSize: 7.5, padding: '2px 7px', background: '#ede9fe',
    border: '0.5px solid #c4b5fd', borderRadius: 999, color: '#4338ca', display: 'inline-block',
  };

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', background: '#fff', color: '#111', minHeight: '100%', display: 'flex' }}>
      {/* Left accent bar */}
      <div style={{ width: 4, background: indigo, flexShrink: 0 }} />
      {/* Content */}
      <div style={{ flex: 1, padding: '18mm 16mm 18mm 14mm' }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>{cv.name}</h1>
        <p style={{ fontSize: 10, color: indigo, margin: '4px 0 3px' }}>{cv.title}</p>
        <p style={{ fontSize: 8.5, color: '#6b7280', margin: '0 0 14px' }}>{cv.contact}</p>

        {cv.sections.map((sec, i) => {
          if (sec.header === 'SKILLS') return (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={secHdrS}>{sec.header}</div>
              <div style={{ height: 1, background: '#e0e7ff', marginBottom: 5 }} />
              <Skills lines={sec.lines} chipStyle={chip} />
            </div>
          );
          if (sec.header === 'EXPERIENCE') return (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={secHdrS}>{sec.header}</div>
              <div style={{ height: 1, background: '#e0e7ff', marginBottom: 5 }} />
              <ExpBlock sec={sec} dateStyle={dateS} locStyle={locS}
                titleStyle={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a' }}
                compStyle={{ fontSize: 9, color: indigo, marginBottom: 2 }}
                bulletColor={indigo}
              />
            </div>
          );
          if (sec.header === 'EDUCATION') return (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={secHdrS}>{sec.header}</div>
              <div style={{ height: 1, background: '#e0e7ff', marginBottom: 5 }} />
              <EduBlock sec={sec} dateStyle={dateS} locStyle={locS}
                degStyle={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a' }}
                instStyle={{ fontSize: 9, color: indigo }}
              />
            </div>
          );
          return (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={secHdrS}>{sec.header}</div>
              <div style={{ height: 1, background: '#e0e7ff', marginBottom: 5 }} />
              <p style={F.body}>{sec.lines.filter(l => l.trim()).join(' ')}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 5 — CLEAN CORPORATE (centered header, gray bands)
// ─────────────────────────────────────────────────────────────────────────────
function CleanCorporate({ cv }: { cv: ParsedCV }) {
  const blue = '#1e40af';
  const secHdrS: React.CSSProperties = {
    fontSize: 9.5, fontWeight: 700, color: blue, textTransform: 'uppercase',
    letterSpacing: 0.8, background: '#f3f4f6', padding: '4px 8px', marginBottom: 8,
  };
  const dateS: React.CSSProperties = { fontSize: 8, color: '#9ca3af' };
  const locS:  React.CSSProperties = { fontSize: 7.5, color: '#9ca3af', marginTop: 1 };
  const chip: React.CSSProperties = {
    fontSize: 8, padding: '2px 8px', border: '0.5px solid #d1d5db',
    borderRadius: 4, color: '#374151', display: 'inline-block',
  };

  return (
    <div style={{ padding: '14mm 18mm', fontFamily: 'Arial, Helvetica, sans-serif', background: '#fff', color: '#111', minHeight: '100%' }}>
      {/* Centered header */}
      <h1 style={{ ...F.name, textAlign: 'center' }}>{cv.name}</h1>
      <p style={{ textAlign: 'center', fontSize: 11, color: '#374151', margin: '4px 0 3px' }}>{cv.title}</p>
      <p style={{ textAlign: 'center', fontSize: 8.5, color: '#6b7280', margin: '0 0 4px' }}>{cv.contact}</p>
      <div style={{ borderTop: `2px solid ${blue}`, marginBottom: '1px' }} />
      <div style={{ borderTop: '0.5px solid #d1d5db', marginBottom: 12 }} />

      {cv.sections.map((sec, i) => {
        if (sec.header === 'SKILLS') return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={secHdrS}>{sec.header}</div>
            <Skills lines={sec.lines} chipStyle={chip} />
          </div>
        );
        if (sec.header === 'EXPERIENCE') return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={secHdrS}>{sec.header}</div>
            <ExpBlock sec={sec} dateStyle={dateS} locStyle={locS}
              titleStyle={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}
              compStyle={{ fontSize: 9.5, fontWeight: 700, color: blue, marginBottom: 2 }}
              bulletColor={blue}
            />
          </div>
        );
        if (sec.header === 'EDUCATION') return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={secHdrS}>{sec.header}</div>
            <EduBlock sec={sec} dateStyle={dateS} locStyle={locS}
              degStyle={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}
              instStyle={{ fontSize: 9.5, fontWeight: 700, color: blue }}
            />
          </div>
        );
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={secHdrS}>{sec.header}</div>
            <p style={F.body}>{sec.lines.filter(l => l.trim()).join(' ')}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function CVPreview({ text, template = 'modern-sidebar' }: Props) {
  const cv = useMemo(() => parseCV(text), [text]);

  return (
    <div style={{
      background: '#fff',
      boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
      borderRadius: 8,
      overflow: 'auto',
      minHeight: 600,
      fontFamily: 'Arial, Helvetica, sans-serif',
    }}>
      {template === 'harvard'    && <HarvardClassic   cv={cv} />}
      {template === 'executive'  && <ExecutivePremium cv={cv} />}
      {template === 'tech'       && <TechMinimal       cv={cv} />}
      {template === 'corporate'  && <CleanCorporate   cv={cv} />}
      {(template === 'modern-sidebar' || !['harvard','executive','tech','corporate'].includes(template)) && <ModernSidebar cv={cv} />}
    </div>
  );
}

// build
