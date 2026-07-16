interface HiddenGemItem {
  name: string;
  tags: string[];
  description: string;
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
  hiddenGems: HiddenGemItem[],
  interests: string[]
) {
  const systemPrompt = `You are an expert tour guide specializing in off-the-beaten-path travel in Gujarat, India.
Your task is to rank the provided list of hidden gems in order of relevance to the user's interests, and provide a short, single-sentence reason for each gem's ranking.

CRITICAL RULES:
1. Grounding: You MUST ONLY rank and include hidden gems that are explicitly provided in the input list. Do NOT invent or add any new hidden gems.
2. Accuracy: The "name" in the ranked list must EXACTLY match the "name" of the corresponding input hidden gem.
3. Reason: Provide a compelling, short reason (1 sentence) for the ranking based on how it fits the user's interests and its description/tags.
4. Structure: The output must be valid JSON only. Output must strictly follow the JSON schema below.

JSON Schema:
{
  "ranked": [
    {
      "name": "string",
      "reason": "string"
    }
  ]
}
`;

  const userPrompt = `Rank the following hidden gems for the district of ${district.name} based on the user's interests.

User Interests:
${interests.join(', ')}

Hidden Gems list:
${JSON.stringify(hiddenGems, null, 2)}
`;

  return { systemPrompt, userPrompt };
}
