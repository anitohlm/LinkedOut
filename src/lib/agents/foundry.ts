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
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
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
      max_tokens: 2000,
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

export function extractJSON<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON in response: ${text.slice(0, 200)}`);
  return JSON.parse(match[0]) as T;
}
