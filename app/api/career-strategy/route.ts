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

    // Trim inputs to avoid hitting token limits
    const cvTrimmed  = cvText.slice(0, 3500);
    const jdTrimmed  = jobDescription.slice(0, 2500);

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are an elite executive coach and career strategist. Based on the CV and job description below, create a comprehensive interview preparation and career strategy package. Return ONLY valid JSON, no markdown, no code blocks. Keep each answer field under 120 words to ensure the full JSON fits.

JSON structure:
{
  "searchStrategy": {
    "targetCompanies": ["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"],
    "targetRoles": ["Role 1", "Role 2", "Role 3"],
    "keyMessage": "Personal brand pitch in 2 sentences based on this CV",
    "networking": "Specific actionable networking strategy for this profile",
    "timeline": "30-day action plan",
    "platforms": ["Platform 1", "Platform 2", "Platform 3"]
  },
  "recruiterInterview": [
    {
      "q": "Tell me about yourself.",
      "strategy": "How to structure the answer",
      "answer": "Personalized suggested answer based on their CV"
    },
    {
      "q": "What do you know about us?",
      "strategy": "How to research and structure the answer",
      "answer": "Framework and example"
    },
    {
      "q": "Why this company?",
      "strategy": "Connect personal values to company mission",
      "answer": "Personalized based on job description"
    },
    {
      "q": "Walk me through your work process.",
      "strategy": "Use a specific project from their CV",
      "answer": "Personalized answer from their experience"
    },
    {
      "q": "Tell me a success story.",
      "strategy": "STAR method — Situation, Task, Action, Result",
      "answer": "Best story from their CV with metrics"
    }
  ],
  "hiringManagerInterview": [
    {
      "q": "Why this company?",
      "focus": "Growth mindset + ownership",
      "strategy": "Show deep research and long-term vision",
      "answer": "Personalized based on their background"
    },
    {
      "q": "Tell me about yourself.",
      "focus": "Leadership narrative and impact",
      "strategy": "Lead with business impact, not job titles",
      "answer": "Executive-level narrative from their CV"
    },
    {
      "q": "Tell me about a difficult client.",
      "focus": "Emotional intelligence + problem solving",
      "strategy": "STAR with emphasis on emotional intelligence and resolution",
      "answer": "Scenario based on their industry experience"
    },
    {
      "q": "How do you stay current on industry trends?",
      "focus": "Continuous learning and AI awareness",
      "strategy": "Mention AI tools, data analytics, industry publications",
      "answer": "Specific tools and habits relevant to their role"
    }
  ],
  "questionsToAsk": [
    "What differentiates the top performers on this team from the rest?",
    "What are the biggest growth opportunities in your target market right now?",
    "How does the company integrate AI into its strategy for this role?",
    "What does success look like in the first 90 days for this position?",
    "What are the biggest challenges the team is facing right now?"
  ],
  "unexpectedQuestions": [
    {
      "q": "If you could redesign your last company from scratch, what would you change?",
      "why": "Tests strategic thinking and ownership mindset",
      "strategy": "Be constructive — show systems thinking and initiative"
    },
    {
      "q": "What is your biggest professional failure and what did you learn?",
      "why": "Tests self-awareness and resilience",
      "strategy": "Choose a real failure, focus 80% on what you learned"
    },
    {
      "q": "If we hire you and in 6 months you are underperforming, what happened?",
      "why": "Tests self-awareness and role-fit honesty",
      "strategy": "Show you know your gaps and have a plan for them"
    },
    {
      "q": "How do you handle disagreement with your manager?",
      "why": "Tests communication and conflict resolution style",
      "strategy": "Show data-driven assertiveness, not passivity or aggression"
    },
    {
      "q": "What would your best colleague say is your biggest weakness?",
      "why": "Tests honest self-perception",
      "strategy": "Choose a real weakness you are actively improving"
    },
    {
      "q": "Where do you see AI replacing your role in 5 years?",
      "why": "Tests adaptability and AI literacy",
      "strategy": "Show you embrace AI as a tool, not a threat — cite specific tools you use"
    },
    {
      "q": "Sell me this pen. / Sell me this role.",
      "why": "Tests improvisational sales thinking and self-promotion",
      "strategy": "Ask questions first — uncover needs before pitching value"
    }
  ]
}

All text responses must be in ${lang}.
Personalize every answer based on the actual CV content provided.

CV:
${cvTrimmed}

JOB DESCRIPTION:
${jdTrimmed}`
      }]
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'No JSON in response' }, { status: 500 });

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // Try to recover truncated JSON by finding the last complete section
      const text = jsonMatch[0];
      // Attempt to close any open arrays/objects
      let fixed = text;
      const openBraces   = (text.match(/\{/g) || []).length - (text.match(/\}/g) || []).length;
      const openBrackets = (text.match(/\[/g) || []).length - (text.match(/\]/g) || []).length;
      // Close last incomplete string if needed
      if ((text.match(/"/g) || []).length % 2 !== 0) fixed += '"';
      for (let i = 0; i < openBrackets; i++) fixed += ']';
      for (let i = 0; i < openBraces; i++) fixed += '}';
      try {
        parsed = JSON.parse(fixed);
      } catch {
        return NextResponse.json({ error: 'Response too long — try a shorter CV or job description' }, { status: 500 });
      }
    }

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}
