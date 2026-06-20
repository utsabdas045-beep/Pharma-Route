import { logger } from "./logger";

const SARVAM_API_KEY = process.env["SARVAM_API_KEY"];
const SARVAM_BASE = "https://api.sarvam.ai/v1";

export interface ExtractedEntity {
  name: string;
  type: "Compound" | "Protein" | "Gene" | "Disease" | "Pathway";
  aliases?: string[];
}

export interface ExtractedRelationship {
  from: string;
  fromType: string;
  relationship: string;
  to: string;
  toType: string;
  confidence: number;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  relationships: ExtractedRelationship[];
}

async function callSarvam(prompt: string): Promise<string> {
  if (!SARVAM_API_KEY) throw new Error("SARVAM_API_KEY not set");

  const response = await fetch(`${SARVAM_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": SARVAM_API_KEY,
    },
    body: JSON.stringify({
      model: "sarvam-m",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    logger.warn({ status: response.status, text }, "Sarvam API error");
    throw new Error(`Sarvam API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "";
}

export async function extractBiomedicalEntities(
  text: string
): Promise<ExtractionResult> {
  const prompt = `Extract biomedical entities and relationships from this scientific text. 
Return ONLY valid JSON with this exact structure:
{
  "entities": [{"name": string, "type": "Compound"|"Protein"|"Gene"|"Disease"|"Pathway", "aliases": [string]}],
  "relationships": [{"from": string, "fromType": string, "relationship": "INHIBITS"|"ACTIVATES"|"CAUSES"|"TREATS"|"TARGETS"|"ASSOCIATED_WITH"|"INTERACTS_WITH", "to": string, "toType": string, "confidence": number}]
}

Text: ${text.substring(0, 3000)}

Respond with ONLY the JSON, no explanation.`;

  try {
    const raw = await callSarvam(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { entities: [], relationships: [] };
    return JSON.parse(jsonMatch[0]) as ExtractionResult;
  } catch (err) {
    logger.error({ err }, "Entity extraction failed");
    return { entities: [], relationships: [] };
  }
}

export async function generateDiscoveryExplanation(
  compound: string,
  disease: string,
  path: string[]
): Promise<string> {
  const prompt = `As a biomedical AI, explain in 2-3 sentences why ${compound} could be repurposed to treat ${disease} based on this biological pathway: ${path.join(" → ")}.
Be scientifically precise but accessible. Focus on the mechanism of action.`;

  try {
    return await callSarvam(prompt);
  } catch {
    return `${compound} may offer therapeutic potential against ${disease} through the identified molecular pathway involving ${path.slice(1, -1).join(", ")}.`;
  }
}

export async function processNaturalLanguageQuery(query: string): Promise<{
  nodeTypes: string[];
  searchTerms: string[];
  intent: string;
}> {
  const prompt = `Parse this biomedical research query and return JSON:
{"nodeTypes": ["Compound"|"Protein"|"Gene"|"Disease"|"Pathway"], "searchTerms": [string], "intent": string}

Query: "${query}"
Return ONLY valid JSON.`;

  try {
    const raw = await callSarvam(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { nodeTypes: [], searchTerms: [query], intent: query };
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { nodeTypes: [], searchTerms: [query], intent: query };
  }
}
