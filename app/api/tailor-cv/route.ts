import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function sendAtsEmail(
  jobDescription: string,
  atsScore: number,
  atsKeywords: { kw: string; exp: string }[],
  atsRecommendations: { title: string; text: string }[],
) {
  const jobPreview = jobDescription.slice(0, 120).replace(/\n/g, ' ');
  const scoreColor = atsScore >= 80 ? '#10b981' : atsScore >= 60 ? '#f59e0b' : '#ef4444';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#1e293b;border-radius:12px;overflow:hidden">
<div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px 32px">
<h1 style="margin:0;color:#fff;font-size:20px">ATS Match Analysis</h1>
<p style="margin:6px 0 0;color:#c7d2fe;font-size:13px">CSS 4 JOBS &middot; ${new Date().toLocaleString('es-ES')}</p>
</div>
<div style="padding:32px">
<p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.05em">Cargo analizado</p>
<p style="margin:0 0 24px;color:#f1f5f9;font-size:14px;line-height:1.5">${jobPreview}...</p>
<div style="background:#0f172a;border-radius:10px;padding:20px;text-align:center;margin-bottom:28px">
<p style="margin:0 0 4px;color:#94a3b8;font-size:12px">MATCH SCORE</p>
<p style="margin:0;font-size:52px;font-weight:900;color:${scoreColor}">${atsScore}<span style="font-size:28px">%</span></p>
</div>
<h2 style="color:#a5b4fc;font-size:13px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 14px">Top 5 Keywords Matched</h2>
${atsKeywords.map((k, i) => `<div style="background:#0f172a;border-radius:8px;padding:12px 16px;margin-bottom:8px"><p style="margin:0 0 3px;color:#fff;font-size:13px;font-weight:600">${i + 1}. ${k.kw}</p><p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.4">${k.exp}</p></div>`).join('')}
<h2 style="color:#fbbf24;font-size:13px;text-transform:uppercase;letter-spacing:.08em;margin:24px 0 14px">Top 3 Recommendations</h2>
${atsRecommendations.map((r, i) => `<div style="background:#0f172a;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:8px"><p style="margin:0 0 3px;color:#fff;font-size:13px;font-weight:600">${i + 1}. ${r.title}</p><p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.4">${r.text}</p></div>`).join('')}
</div>
<div style="padding:16px 32px;border-top:1px solid #334155;text-align:center">
<p style="margin:0;color:#475569;font-size:11px">CSS 4 JOBS &middot; careerstrategystudio@gmail.com</p>
</div></div></body></html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CSS4JOBS <onboarding@resend.dev>',
        to: ['careerstrategystudio@gmail.com'],
        subject: `ATS Analysis - ${atsScore}% Match`,
        html,
      }),
    });
  } catch {
    // non-blocking
  }
}

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription, language } = await req.json();

    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: 'CV and job description required' }, { status: 400 });
    }

    const lang = language === 'en' ? 'English' : language === 'pt' ? 'Portuguese' : 'Spanish';

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `You are an expert CV writer and ATS specialist. Return ONLY a valid JSON object. No markdown, no code blocks, just raw JSON.

Required JSON structure:
{
  "cv": "complete tailored CV text here",
  "score": 87,
  "keywords": [
    {"kw": "Keyword Phrase", "exp": "Why it matches and where it appears"},
    {"kw": "Keyword Phrase 2", "exp": "..."},
    {"kw": "Keyword Phrase 3", "exp": "..."},
    {"kw": "Keyword Phrase 4", "exp": "..."},
    {"kw": "Keyword Phrase 5", "exp": "..."}
  ],
  "recommendations": [
    {"title": "Action Title", "text": "Detailed specific recommendation"},
    {"title": "Action Title 2", "text": "..."},
    {"title": "Action Title 3", "text": "..."}
  ]
}

CV TEXT FORMAT for the "cv" field:
Line 1: FULL NAME IN CAPS
Line 2: Role Title | Another Title | Third Title
Line 3: Phone | Email | LinkedIn | Location
(blank line)
SUMMARY
(summary paragraph)

SKILLS
Skill 1 | Skill 2 | Skill 3 | ...

EXPERIENCE
MM/YYYY - MM/YYYY
City, Country
Job Title
Company Name
• Achievement bullet 1
• Achievement bullet 2

EDUCATION
MM/YYYY - MM/YYYY
City, Country
Degree Name
Institution Name

KEY ACHIEVEMENTS
Achievement Title
Achievement description.

Rules:
- Write the entire "cv" field in ${lang}
- NEVER invent information
- Naturally incorporate keywords from the job description
- Keep CV concise (max 650 words)
- score: realistic 0-100
- keywords: 5 specific phrases from the job description
- recommendations: 3 specific, actionable improvements

CANDIDATE CV:
${cvText}

JOB DESCRIPTION:
${jobDescription}`
      }]
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    let tailoredCV = '';
    let atsScore = 0;
    let atsKeywords: { kw: string; exp: string }[] = [];
    let atsRecommendations: { title: string; text: string }[] = [];

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        tailoredCV = (parsed.cv || '').trim();
        atsScore = Number(parsed.score) || 0;
        atsKeywords = Array.isArray(parsed.keywords) ? parsed.keywords : [];
        atsRecommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
      } else {
        tailoredCV = raw;
      }
    } catch {
      tailoredCV = raw;
    }

    // Fire-and-forget email to Javier
    sendAtsEmail(jobDescription, atsScore, atsKeywords, atsRecommendations);

    return NextResponse.json({ tailoredCV, atsScore, atsKeywords, atsRecommendations });
  } catch (error) {
    console.error('Error tailoring CV:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error processing request' },
      { status: 500 }
    );
  }
}
