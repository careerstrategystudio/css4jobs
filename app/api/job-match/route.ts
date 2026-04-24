import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription, language } = await req.json();
    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: 'CV and job description required' }, { status: 400 });
    }

    const lang = language === 'en' ? 'English' : language === 'pt' ? 'Portuguese' : 'Spanish';

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze how well this CV matches the job description. Return ONLY valid JSON, no markdown.

{
  "score": 72,
  "summary": "One sentence summary of the match in ${lang}",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2", "gap 3"],
  "topKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Rules:
- score: realistic 0-100 based on actual match
- strengths: 3 things the CV has that match the job
- gaps: 3 missing skills or experience
- topKeywords: 5 keywords from the job description
- Respond in ${lang}

CV:
${cvText}

JOB DESCRIPTION:
${jobDescription}`
      }]
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Parse error' }, { status: 500 });

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}
