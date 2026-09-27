const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

interface GenerateOptions {
  systemInstruction?: string;
  responseSchema?: object;
  /**
   * Gemini 3 family models ignore temperature/top_p/top_k and instead expose
   * a thinking level. "low" = fastest/cheapest, "high" = most careful.
   * Flash models also support "minimal". Defaults to "low" here since our
   * tasks are narrow extraction/drafting, not open-ended reasoning.
   */
  thinkingLevel?: "minimal" | "low" | "medium" | "high";
}

/**
 * Calls the Gemini API generateContent endpoint.
 * Requires GEMINI_API_KEY to be set as a server-side environment variable
 * (never expose this key to the client).
 */
export async function generateWithGemini(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your environment variables (see .env.example)."
    );
  }

  const model = DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      thinkingConfig: {
        thinkingLevel: options.thinkingLevel ?? "low"
      }
    }
  };

  if (options.systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: options.systemInstruction }]
    };
  }

  if (options.responseSchema) {
    (body.generationConfig as Record<string, unknown>).responseMimeType =
      "application/json";
    (body.generationConfig as Record<string, unknown>).responseSchema =
      options.responseSchema;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text || "")
    .join("");

  if (!text) {
    throw new Error("Gemini API returned an empty response.");
  }

  return text;
}

/** Fetches a URL server-side and strips HTML down to readable text. */
export async function fetchPageText(url: string): Promise<string> {
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const res = await fetch(normalized, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; PrivacyLensBot/0.1; +https://privacylens.app)"
    }
  });
  if (!res.ok) {
    throw new Error(
      `Could not fetch that page (status ${res.status}). Try pasting the policy text instead.`
    );
  }
  const html = await res.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length < 200) {
    throw new Error(
      "That page didn't have enough readable text. It may require JavaScript to load — try pasting the policy text directly."
    );
  }

  // Cap length to keep prompt size sane.
  return text.slice(0, 60000);
}
