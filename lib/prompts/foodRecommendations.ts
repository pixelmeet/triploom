interface FoodItem {
  name: string;
  type: string;
  description: string;
  priceRange: string;
}

interface DistrictInput {
  name: string;
}

/**
 * Builds system and user prompts for Groq food recommendations generation.
 * Output must strictly follow: { "recommendations": [{ "name": "string", "blurb": "string" }] }
 */
export function buildFoodRecommendationPrompt(
  district: DistrictInput,
  foodItems: FoodItem[],
  preferences?: string[]
) {
  const systemPrompt = `You are an expert culinary travel guide writer specializing in the cuisine of Gujarat, India.
Your task is to generate a short curated write-up (1-2 sentences) for each food item explaining why it is worth trying.

CRITICAL RULES:
1. Grounding: You MUST ground each write-up strictly in the food item's provided name, type, description, and priceRange. Do NOT invent new dish names, restaurants, or facts not present in the input.
2. Accuracy: The "name" in each recommendation in the output JSON array must EXACTLY match the "name" of the corresponding input food item.
3. Structure: The output must be valid JSON only. Output must strictly follow the JSON schema below.

JSON Schema:
{
  "recommendations": [
    {
      "name": "string",
      "blurb": "string"
    }
  ]
}
`;

  const userPrompt = `Generate curated food recommendation write-ups for the following items in the district of ${district.name}:

Food Items:
${JSON.stringify(foodItems, null, 2)}
${preferences ? `\nUser Preferences to keep in mind: ${preferences.join(', ')}` : ''}
`;

  return { systemPrompt, userPrompt };
}
