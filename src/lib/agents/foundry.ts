/**
 * Azure AI Foundry — Chat Completions via inference endpoint
 * Same pattern as GratitudeChain agents
 */

function getInferenceEndpoint() {
  const base = process.env.AZURE_FOUNDRY_ENDPOINT!;
  const resource = base.split("/api/projects")[0];
  return `${resource}/models`;
}

const MODEL = () => process.env.AZURE_OPENAI_DEPLOYMENT_NAME!;
const KEY = () => process.env.AZURE_FOUNDRY_API_KEY!;

export async function callAI(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
  maxTokens = 2000,
): Promise<string> {
  const endpoint = getInferenceEndpoint();
  const url = `${endpoint}/chat/completions`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  console.log(`Calling: POST ${url} (model: ${MODEL()})`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": KEY(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL(),
      messages,
      temperature: 0.8,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Foundry AI error:", res.status, err);
    throw new Error(`Foundry ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0].message.content;
}

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, ten: 10, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
  "one hundred": 100,
};

export function extractJSON<T>(text: string): T {
  // Prefer a complete object; otherwise take everything from the first "{"
  // (the response may have been truncated before its closing brace).
  const full = text.match(/\{[\s\S]*\}/);
  const open = text.indexOf("{");
  let raw = full ? full[0] : open >= 0 ? text.slice(open) : "";
  if (!raw) throw new Error(`No JSON in response: ${text.slice(0, 200)}`);

  try {
    return JSON.parse(raw) as T;
  } catch {
    // Repair common model mistakes (e.g. `"ambition": ninety` instead of 90)
    let fixed = raw
      // remove trailing commas before } or ]
      .replace(/,\s*([}\]])/g, "$1")
      // spelled-out number words used as values → digits
      .replace(/:\s*([A-Za-z][A-Za-z ]*?)\s*([,}])/g, (m, word: string, end: string) => {
        const key = word.trim().toLowerCase();
        if (key === "true" || key === "false" || key === "null") return `: ${key}${end}`;
        if (key in NUMBER_WORDS) return `: ${NUMBER_WORDS[key]}${end}`;
        // unquoted bare word value that isn't a keyword → wrap in quotes
        return `: "${word.trim()}"${end}`;
      });

    try {
      return JSON.parse(fixed) as T;
    } catch {
      // Last resort: the JSON was truncated mid-value. Close any open string,
      // strip the dangling tail, and balance braces/brackets.
      let repaired = fixed;
      const quotes = (repaired.match(/"/g) || []).length;
      if (quotes % 2 !== 0) repaired += '"';                 // close an open string
      repaired = repaired.replace(/,\s*$/, "");              // drop trailing comma
      // strip an incomplete trailing "key": fragment
      repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*$/, "");
      const opens = (repaired.match(/\{/g) || []).length;
      const closes = (repaired.match(/\}/g) || []).length;
      const obrk = (repaired.match(/\[/g) || []).length;
      const cbrk = (repaired.match(/\]/g) || []).length;
      repaired += "]".repeat(Math.max(0, obrk - cbrk));
      repaired += "}".repeat(Math.max(0, opens - closes));
      return JSON.parse(repaired) as T;
    }
  }
}
