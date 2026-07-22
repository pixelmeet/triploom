import { formatFood, serializeGrounding } from './helpers';

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
  rawFoodItems: FoodItem[],
  preferences?: string[]
) {
  const foodItems = formatFood(rawFoodItems);

  const systemPrompt = `You are a culinary travel guide for Gujarat, India.
Generate a short write-up (1-2 sentences) for each food item explaining why it is worth trying.

CRITICAL RULES:
1. Grounding: Ground each write-up strictly in the food item's name, type, description, and priceRange. Do NOT invent dishes or facts.
2. Accuracy: Each output "name" MUST EXACTLY match the input food item "name".
3. Structure: Output valid JSON matching {"recommendations":[{"name":"string","blurb":"string"}]}.`;

  const userPrompt = `District: ${district.name}
Food Items:
${serializeGrounding(foodItems)}${preferences && preferences.length > 0 ? `\nUser Preferences: ${preferences.join(', ')}` : ''}`;

  return { systemPrompt, userPrompt };
}
