import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription, language } = await req.json();

    if (!cvText?.trim() || !jobDescription?.trim()) {
      return NextResponse.json({ error: 'CV and job description are required' }, { status: 400 });
    }

    const langMap: Record<string, string> = {
      es: 'Spanish',
      en: 'English',
      pt: 'Portuguese',
    };
    const targetLang = langMap[language] || 'Spanish';

    const systemPrompt = `You are an expert career coach who writes compelling, personalized cover letters.
Write professional cover letters that:
- Are tailored specifically to the job description
- Highlight relevant experience from the CV
- Use a confident, professional tone
- Are concise (3–4 paragraphs, max 350 words)
- Start with a strong opening hook (NOT "I am writing to apply for...")
- Show genuine enthusiasm for the specific role and company
- End with a clear call to action
- Match the language: ${targetLang}

Output ONLY the cover letter text, no extra commentary or labels.`;

    const userPrompt = `Write a cover letter in ${targetLang} for the following:

=== CANDIDATE CV ===
${cvText.slice(0, 3000)}

=== JOB DESCRIPTION ===
${jobDescription.slice(0, 2000)}

Write a professional, compelling cover letter tailored to this specific job.`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    });

    const block = message.content[0];
    const coverLetter = block.type === 'text' ? block.text : '';

    return NextResponse.json({ coverLetter });
  } catch (err) {
    console.error('Cover letter error:', err);
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}
