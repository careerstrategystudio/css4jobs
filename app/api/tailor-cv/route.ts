import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription, language } = await req.json();

    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: 'CV text and job description are required' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const lang = language === 'en' ? 'English' : language === 'pt' ? 'Portuguese' : 'Spanish';

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are an expert CV writer and ATS optimization specialist. Your task is to tailor the candidate's CV to perfectly match the job description provided.

INSTRUCTIONS:
1. Analyze the job description and extract key requirements, skills, and keywords
2. Rewrite the CV to highlight relevant experience and skills that match the job
3. Incorporate important keywords from the job description naturally
4. Optimize for ATS (Applicant Tracking Systems) — use standard section names
5. Keep all real experience and education — never invent information
6. Use strong action verbs and quantified achievements where possible
7. Format the output in clean, readable plain text
8. Write the tailored CV in ${lang}
9. Include a brief "ATS MATCH ANALYSIS" section at the end with:
   - Match score (%)
   - Top 5 keywords matched
   - Top 3 recommendations

CANDIDATE'S CURRENT CV:
${cvText}

JOB DESCRIPTION:
${jobDescription}

OUTPUT: Provide the complete tailored CV followed by the ATS Match Analysis. Use clear section headers in ALL CAPS.`,
        },
      ],
    });

    const tailoredCV = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ tailoredCV });
  } catch (error) {
    console.error('Error tailoring CV:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error processing request' },
      { status: 500 }
    );
  }
}
