import { formatAttractions, formatHiddenGems, formatFood, serializeGrounding } from './helpers';

interface ItineraryInput {
  days: number;
  budget: number;
  interests: string[];
  startDistrict: string;
}

interface GroundingItem {
  name: string;
  type?: string;
  tags?: string[];
  description?: string;
  priceRange?: string;
}

interface GroundingData {
  attractions: GroundingItem[];
  hiddenGems: GroundingItem[];
  food: GroundingItem[];
}

/**
 * Builds system and user prompts for Groq itinerary generation.
 * Grounded strictly in the provided database items for the district.
 */
export function buildItineraryPrompt(input: ItineraryInput, rawGrounding: GroundingData) {
  const groundingData = {
    attractions: formatAttractions(rawGrounding.attractions),
    hiddenGems: formatHiddenGems(rawGrounding.hiddenGems),
    food: formatFood(rawGrounding.food),
  };

  const systemPrompt = `You are an expert travel assistant for Gujarat, India.
Generate a day-by-day travel itinerary grounded strictly in the provided database of places.

CRITICAL RULES:
1. Grounding: Use ONLY place names from the provided grounding data. NEVER invent or hallucinate places, cafes, or attractions.
2. Personalization & Budget: Tailor items to user interests and keep total cost near budget.
3. Structure: Output valid JSON matching the schema below.

JSON Schema:
{
  "itinerary": [
    {
      "day": 1,
      "district": "string",
      "items": [
        {
          "time": "09:00 AM",
          "name": "string",
          "type": "attraction | food | hidden_gem",
          "estimatedCost": 0,
          "notes": "string"
        }
      ],
      "dailyEstimatedCost": 0
    }
  ],
  "totalEstimatedCost": 0
}

Example:
{"itinerary":[{"day":1,"district":"Ahmedabad","items":[{"time":"09:00 AM","name":"Sabarmati Ashram","type":"attraction","estimatedCost":50,"notes":"Visit Gandhi's ashram."},{"time":"01:00 PM","name":"Agashiye","type":"food","estimatedCost":1200,"notes":"Enjoy traditional thali."}],"dailyEstimatedCost":1250}],"totalEstimatedCost":1250}`;

  const userPrompt = `Input:
- Days: ${input.days}
- Budget (INR): ${input.budget}
- Interests: ${input.interests.join(', ')}
- Start District: ${input.startDistrict}

Grounding Data (ONLY select items from this list):
${serializeGrounding(groundingData)}`;

  return { systemPrompt, userPrompt };
}
