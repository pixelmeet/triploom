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
 * Builds the system and user prompts for Groq itinerary generation.
 * Grounded strictly in the provided database items for the district.
 */
export function buildItineraryPrompt(input: ItineraryInput, groundingData: GroundingData) {
  const systemPrompt = `You are an expert travel assistant specializing in creating structured, personalized travel itineraries for Gujarat, India.
Your task is to generate a day-by-day travel itinerary based on the user's inputs and the curated, real-world database of places provided.

CRITICAL RULES:
1. Grounding: You MUST ONLY use place names (attractions, hidden gems, restaurants, food places) that are explicitly provided in the user's grounding data. You must NEVER hallucinate or invent new places, restaurants, cafes, attractions, or hidden gems. If a place is not in the grounding data, it cannot be in the itinerary.
2. Interests & Budget: Try to tailor the itinerary to the user's list of interests and align the total cost with the user's budget.
3. Structure: The output must be valid JSON only. Output must strictly follow the JSON schema provided below.

JSON Schema:
{
  "itinerary": [
    {
      "day": number,
      "district": "string",
      "items": [
        {
          "time": "string",
          "name": "string",
          "type": "attraction | food | hidden_gem",
          "estimatedCost": number,
          "notes": "string"
        }
      ],
      "dailyEstimatedCost": number
    }
  ],
  "totalEstimatedCost": number
}

Example Output:
{
  "itinerary": [
    {
      "day": 1,
      "district": "Ahmedabad",
      "items": [
        {
          "time": "09:00 AM",
          "name": "Sabarmati Ashram",
          "type": "attraction",
          "estimatedCost": 50,
          "notes": "Start your trip at the peaceful home of Mahatma Gandhi. It aligns with your interest in history."
        },
        {
          "time": "01:00 PM",
          "name": "Gujarati Thali at Agashiye",
          "type": "food",
          "estimatedCost": 1200,
          "notes": "Enjoy an authentic Gujarati thali for lunch, fitting your food interest."
        },
        {
          "time": "04:30 PM",
          "name": "Sarkhej Roza",
          "type": "hidden_gem",
          "estimatedCost": 0,
          "notes": "Discover this beautiful water palace, a peaceful hidden gem with stunning architecture."
        }
      ],
      "dailyEstimatedCost": 1250
    }
  ],
  "totalEstimatedCost": 1250
}
`;

  const userPrompt = `Generate a travel itinerary with the following details:

User Input:
- Days: ${input.days}
- Budget (INR): ${input.budget}
- Interests: ${input.interests.join(', ')}
- Starting District: ${input.startDistrict}

Grounding Data (You MUST ONLY select items from this list):
${JSON.stringify(groundingData, null, 2)}
`;

  return { systemPrompt, userPrompt };
}
