export interface ChatGroundingItem {
  name: string;
  type?: string;
  tags?: string[];
  description?: string;
  priceRange?: string;
}

export interface ChatGroundingData {
  attractions: ChatGroundingItem[];
  hiddenGems: ChatGroundingItem[];
  food: ChatGroundingItem[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Builds system and user prompts for the AI Travel Assistant Chat.
 * Supports dual JSON output response types: "reply" vs "edit".
 * Strictly grounded in provided database items or current itinerary places.
 */
export function buildChatAssistantPrompt(
  itinerary: any[],
  groundingData: ChatGroundingData,
  conversationHistory: ChatMessage[],
  userMessage: string
) {
  const systemPrompt = `You are an AI travel assistant for TripLoom, specialized in helping users adjust and refine their saved travel itineraries for Gujarat, India.

Your task is to analyze the user's message alongside the current itinerary and grounding database, and respond with either a conversational reply OR a modified itinerary if the user asked for changes.

RESPONSE FORMAT:
You MUST respond with valid JSON matching EXACTLY one of the following two schemas:

Schema 1 (Conversational reply with NO itinerary changes):
{
  "type": "reply",
  "message": "Your text response here"
}

Schema 2 (Edit itinerary based on user request):
{
  "type": "edit",
  "message": "Brief text explanation of changes made",
  "updatedDays": [
    {
      "day": 1,
      "district": "string",
      "items": [
        {
          "time": "09:00 AM",
          "name": "string",
          "type": "attraction",
          "estimatedCost": 100,
          "notes": "string"
        }
      ],
      "dailyEstimatedCost": 100
    }
  ]
}

CRITICAL RULES:
1. Grounding & Anti-Hallucination: You MUST ONLY use place names (attractions, hidden gems, restaurants, food places) that are explicitly provided in the user's grounding data OR already present in the current itinerary's days. You must NEVER hallucinate or invent new place names, cafes, or attractions.
2. Choose "edit" vs "reply":
   - Use "type": "edit" ONLY when the user explicitly requests an itinerary change (e.g. "swap day 2", "make day 1 cheaper", "add food stops", "remove museum").
   - Use "type": "reply" when the user is asking a general question, asking for advice, or making general conversation without asking to edit the itinerary structure.
3. Daily Estimated Cost: When modifying items in a day, ensure "dailyEstimatedCost" matches the sum of all "estimatedCost" values for that day's items.
4. Structure: Maintain valid structure, times, types ("attraction", "food", or "hidden_gem"), and notes for all items in "updatedDays".
`;

  const formattedHistory =
    conversationHistory && conversationHistory.length > 0
      ? conversationHistory.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
      : 'None';

  const userPrompt = `Current Itinerary Days:
${JSON.stringify(itinerary, null, 2)}

Grounding Data (Allowed place names to add/swap):
${JSON.stringify(groundingData, null, 2)}

Conversation History:
${formattedHistory}

New User Message:
${userMessage}
`;

  return { systemPrompt, userPrompt };
}
