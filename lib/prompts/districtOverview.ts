interface DistrictInput {
  name: string;
  region: string;
  bestSeason: string;
}

interface GroundingItem {
  name: string;
  description: string;
}

interface GroundingData {
  attractions: GroundingItem[];
  hiddenGems: GroundingItem[];
}

/**
 * Builds system and user prompts for Groq district overview generation.
 * Output must strictly follow: { "overview": "string" }
 */
export function buildDistrictOverviewPrompt(district: DistrictInput, groundingData: GroundingData) {
  const systemPrompt = `You are an expert travel copywriter specializing in travel guides for Gujarat, India.
Your task is to generate a natural, engaging 3-4 sentence overview of the district for a travel audience.

CRITICAL RULES:
1. Grounding: You MUST ground your overview ONLY in the facts present in the district record and the grounding data provided. Do NOT invent historical facts, population figures, or claims not supported by the input.
2. Structure: The output must be valid JSON only. Output must strictly follow the JSON schema below.
3. Sentence limit: Exactly 3 to 4 sentences.

JSON Schema:
{
  "overview": "string"
}
`;

  const userPrompt = `Generate a district overview based on the following input:

District Details:
- Name: ${district.name}
- Region: ${district.region}
- Best Season to Visit: ${district.bestSeason}

Grounding Data (Attractions & Hidden Gems):
${JSON.stringify(groundingData, null, 2)}
`;

  return { systemPrompt, userPrompt };
}
