import { formatAttractions, formatHiddenGems, serializeGrounding } from './helpers';

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
export function buildDistrictOverviewPrompt(district: DistrictInput, rawGrounding: GroundingData) {
  const groundingData = {
    attractions: formatAttractions(rawGrounding.attractions),
    hiddenGems: formatHiddenGems(rawGrounding.hiddenGems),
  };

  const systemPrompt = `You are a travel copywriter for Gujarat, India.
Generate an engaging overview of the district for travelers.

CRITICAL RULES:
1. Grounding: Ground your overview ONLY in facts present in the district details and grounding data. Do NOT invent ungrounded claims.
2. Structure: Output valid JSON matching {"overview": "string"}.
3. Length: Exactly 3 to 4 sentences.`;

  const userPrompt = `District: ${district.name} (${district.region}, Best Season: ${district.bestSeason})

Grounding Data:
${serializeGrounding(groundingData)}`;

  return { systemPrompt, userPrompt };
}
