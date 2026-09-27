import { NextRequest, NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/gemini";

export const maxDuration = 30;

const SYSTEM_INSTRUCTION = `You explain privacy-policy concepts to a non-lawyer in plain, calm language.
In 3-4 short sentences: say what the concept practically means for the user, note anything it does
NOT necessarily mean (avoid alarmism), and stay strictly within what was provided as context —
never guess at facts the policy doesn't state. No legal advice, no verdicts about the company.`;

export async function POST(req: NextRequest) {
  try {
    const { term, context } = await req.json();
    if (!term) {
      return NextResponse.json({ error: "Missing term to explain." }, { status: 400 });
    }

    const prompt = `Term or item: "${term}"
Context from the policy analysis: "${context || "No further context provided."}"

Explain this to an everyday user in plain language.`;

    const text = await generateWithGemini(prompt, {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingLevel: "low"
    });

    return NextResponse.json({ explanation: text.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
