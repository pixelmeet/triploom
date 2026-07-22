import {
  formatAttractions,
  formatHiddenGems,
  formatFood,
  formatItineraryDaysForChat,
  serializeGrounding,
} from './helpers';

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
  rawItinerary: any[],
  rawGrounding: ChatGroundingData,
  conversationHistory: ChatMessage[],
  userMessage: string
) {
  const itineraryDays = formatItineraryDaysForChat(rawItinerary);
  const groundingData = {
    attractions: formatAttractions(rawGrounding.attractions),
    hiddenGems: formatHiddenGems(rawGrounding.hiddenGems),
    food: formatFood(rawGrounding.food),
  };

  const systemPrompt = `You are an AI travel assistant for TripLoom helping users refine saved itineraries for Gujarat, India.
Respond with valid JSON matching EXACTLY one of these two schemas:

Schema 1 (Conversational reply with NO itinerary edits):
{"type":"reply","message":"Text reply here"}

Schema 2 (Edit itinerary per user request):
{"type":"edit","message":"Explanation of changes","updatedDays":[{"day":1,"district":"string","items":[{"time":"09:00 AM","name":"string","type":"attraction | food | hidden_gem","estimatedCost":0,"notes":"string"}],"dailyEstimatedCost":0}]}

CRITICAL RULES:
1. Grounding & Anti-Hallucination: ONLY use place names provided in grounding data or present in current itinerary. NEVER invent new places, cafes, or attractions.
2. Response Type:
   - Use "type":"edit" ONLY when user explicitly asks to alter itinerary structure/items (e.g. "swap day 2", "make day 1 cheaper", "remove museum").
   - Use "type":"reply" for questions, advice, or general conversation.
3. Daily Cost: "dailyEstimatedCost" must equal the sum of item "estimatedCost" values for that day.`;

  const formattedHistory =
    conversationHistory && conversationHistory.length > 0
      ? conversationHistory.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
      : 'None';

  const userPrompt = `Current Itinerary:
${serializeGrounding(itineraryDays)}

Grounding Data (Allowed places to add/swap):
${serializeGrounding(groundingData)}

History:
${formattedHistory}

User Message:
${userMessage}`;

  return { systemPrompt, userPrompt };
}
