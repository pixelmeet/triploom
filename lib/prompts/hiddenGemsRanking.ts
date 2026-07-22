import { formatHiddenGems, serializeGrounding } from './helpers';

interface HiddenGemItem {
  name: string;
  tags?: string[];
  description?: string;
}

interface DistrictInput {
  name: string;
}

/**
 * Builds system and user prompts for Groq hidden gems ranking based on user interests.
 * Output must strictly follow: { "ranked": [{ "name": "string", "reason": "string" }] }
 */
export function buildHiddenGemsRankingPrompt(
  district: DistrictInput,
  rawHiddenGems: HiddenGemItem[],
  interests: string[]
) {
  const hiddenGems = formatHiddenGems(rawHiddenGems);

  const systemPrompt = `You are a tour guide specializing in off-the-beaten-path travel in Gujarat, India.
Rank the provided hidden gems in order of relevance to the user's interests, providing a 1-sentence reason for each.

CRITICAL RULES:
1. Grounding: ONLY rank hidden gems present in the input list. Do NOT invent or add hidden gems.
2. Accuracy: Each output "name" MUST EXACTLY match the input hidden gem "name".
3. Reason: Provide a 1-sentence reason matching user interests and item details.
4. Structure: Output valid JSON matching {"ranked":[{"name":"string","reason":"string"}]}.`;

  const userPrompt = `District: ${district.name}
User Interests: ${interests.join(', ')}
Hidden Gems:
${serializeGrounding(hiddenGems)}`;

  return { systemPrompt, userPrompt };
}
