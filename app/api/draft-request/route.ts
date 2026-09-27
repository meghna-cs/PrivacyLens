import { NextRequest, NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/gemini";

export const maxDuration = 30;

const SYSTEM_INSTRUCTION = `You draft short, polite, formal data-rights request letters/emails that a
person can send to a company's privacy team. Keep it under 200 words, professional, and factual.
Do not invent legal citations you are not given. If the user mentions India/DPDP, you may reference
the DPDP Act 2023 generally as the basis for the request. Sign off with a placeholder for the
person's name if none is given. Output plain text only, ready to copy — no markdown formatting.`;

export async function POST(req: NextRequest) {
  try {
    const { rightType, companyName, userName, userEmail, jurisdiction, extraDetails } =
      await req.json();

    if (!rightType || !companyName) {
      return NextResponse.json(
        { error: "Missing the right type or company name." },
        { status: 400 }
      );
    }

    const prompt = `Draft a data-rights request email.
Right being requested: ${rightType}
Company: ${companyName}
Jurisdiction context: ${jurisdiction || "not specified"}
Requester name: ${userName || "[Your Name]"}
Requester email: ${userEmail || "[Your Email]"}
Extra details from requester: ${extraDetails || "none"}`;

    const text = await generateWithGemini(prompt, {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingLevel: "low"
    });

    return NextResponse.json({ draft: text.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
