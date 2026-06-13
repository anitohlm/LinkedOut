/**
 * Azure AI Foundry — Chat Completions + Named Agents
 *
 * Foundry agents are called via the OpenAI Responses API with an
 * agent_reference (name + version), NOT via threads/runs/assistant_id.
 *
 * Correct pattern (from Foundry "Call agent" tab):
 *   openai_client = project_client.get_openai_client()
 *   openai_client.responses.create(
 *     input=[...],
 *     extra_body={ "agent_reference": { "name": "the-historian", "version": "4", "type": "agent_reference" } }
 *   )
 *
 * The client endpoint is the PROJECT endpoint (includes /api/projects/{name}).
 */
import { AzureOpenAI } from "openai";

function getProjectEndpoint() {
  return process.env.AZURE_FOUNDRY_ENDPOINT!;
}

function getInferenceEndpoint() {
  const base = process.env.AZURE_FOUNDRY_ENDPOINT!;
  const resource = base.split("/api/projects")[0];
  return `${resource}/models`;
}

function getOpenAIClient() {
  return new AzureOpenAI({
    endpoint: getProjectEndpoint(),
    apiKey: process.env.AZURE_FOUNDRY_API_KEY!,
    apiVersion: "2025-04-01-preview",
  });
}

const MODEL = () => process.env.AZURE_OPENAI_DEPLOYMENT_NAME!;
const KEY = () => process.env.AZURE_FOUNDRY_API_KEY!;

/**
 * Call a named Azure AI Foundry Agent via the Responses API.
 * agentName: the agent's name in Foundry (e.g. "the-historian")
 * agentVersion: the published version number as a string (e.g. "4")
 */
export async function callAgent(agentName: string, userMessage: string, agentVersion = "4"): Promise<string> {
  const client = getOpenAIClient();

  const response = await (client.responses as any).create({
    input: [{ role: "user", content: userMessage }],
    agent_reference: { name: agentName, version: agentVersion, type: "agent_reference" },
  });

  const text: string = response.output_text ?? response.output?.[0]?.content?.[0]?.text ?? "";
  if (!text) throw new Error("Agent returned no text content");
  return text;
}

/**
 * Generate an image via the Azure-deployed image model (gpt-image-2).
 * Uses the dedicated images/generations endpoint (NOT the Responses API —
 * image models are not supported there). Returns a base64 PNG data URI.
 */
export async function generateImage(prompt: string, size = "1024x1024"): Promise<string> {
  const base = process.env.AZURE_FOUNDRY_ENDPOINT!.split("/api/projects")[0];
  const deployment = process.env.AZURE_IMAGE_DEPLOYMENT_NAME!;
  const url = `${base}/openai/deployments/${deployment}/images/generations?api-version=2025-04-01-preview`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "api-key": KEY(), "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, n: 1, size }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Image generation error:", res.status, err);
    throw new Error(`Image gen ${res.status}: ${err}`);
  }

  const data = await res.json() as { data: Array<{ b64_json?: string; url?: string }> };
  const item = data.data?.[0];
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (item?.url) return item.url;
  throw new Error("Image generation returned no image");
}

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

  // Escaped single quotes are not valid JSON — strip them upfront
  raw = raw.replace(/\\'/g, "'");

  try {
    return JSON.parse(raw) as T;
  } catch {
    // Repair common model mistakes (e.g. `"ambition": ninety` instead of 90)
    let fixed = raw
      // remove trailing commas before } or ]
      .replace(/,\s*([}\]])/g, "$1")
      // spelled-out number words used as values → digits
      .replace(/:\s*([A-Za-z][A-Za-z ]*?)\s*([,}])/g, (_m, word: string, end: string) => {
        const key = word.trim().toLowerCase();
        if (key === "true" || key === "false" || key === "null") return `: ${key}${end}`;
        if (key in NUMBER_WORDS) return `: ${NUMBER_WORDS[key]}${end}`;
        // unquoted bare word value that isn't a keyword → wrap in quotes
        return `: "${word.trim()}"${end}`;
      });

    try {
      return JSON.parse(fixed) as T;
    } catch {
      // Model sometimes wraps values with \" as delimiters — try unescaping them
      try {
        return JSON.parse(fixed.replace(/\\"/g, '"')) as T;
      } catch {}

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
