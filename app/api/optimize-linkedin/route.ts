import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const { linkedinData, targetRole, language } = await req.json();

    if (!linkedinData) {
      return NextResponse.json({ error: 'LinkedIn data is required' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const lang = language === 'en' ? 'English' : language === 'pt' ? 'Portuguese' : 'Spanish';

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a LinkedIn optimization expert who helps professionals get found by recruiters and land better jobs. Analyze the LinkedIn profile provided and give specific, actionable improvements.

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}

LINKEDIN PROFILE DATA:
${linkedinData}

Provide a comprehensive analysis in ${lang} with the following sections:

## 📊 PROFILE SCORE: [X/100]

## 🎯 HEADLINE
Current: [current headline]
✅ Optimized: [improved headline with keywords]
Why: [brief explanation]

## 📝 ABOUT / SUMMARY
[Rewrite the About section completely — 3 paragraphs, keyword-rich, compelling, written in first person]

## 💼 EXPERIENCE OPTIMIZATION
For each role, suggest:
- Better title if needed
- 3 improved bullet points with metrics and keywords

## 🔑 TOP KEYWORDS TO ADD
List 10 specific keywords/skills to add to increase recruiter visibility

## 📈 QUICK WINS (do these today)
List 5 specific actions to improve the profile this week

## 🌟 PROFILE COMPLETENESS
List any missing sections that would boost visibility

Be specific, direct, and actionable. Avoid generic advice.`,
        },
      ],
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error optimizing LinkedIn:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error processing request' },
      { status: 500 }
    );
  }
}
