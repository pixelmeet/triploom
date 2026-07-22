export interface GroqTaskConfig {
  temperature: number;
  max_tokens?: number;
}

export function getItineraryMaxTokens(days: number): number {
  // base overhead + per-day allowance, with a sane floor and ceiling
  return Math.min(Math.max(600 + days * 200, 800), 4000);
}

export function getChatMaxTokens(dayCount: number): number {
  return Math.min(Math.max(500 + dayCount * 200, 800), 3500);
}

export function getHiddenGemsMaxTokens(itemCount: number): number {
  return Math.min(Math.max(300 + itemCount * 60, 400), 2000);
}

export function getFoodMaxTokens(itemCount: number): number {
  return Math.min(Math.max(300 + itemCount * 60, 400), 2000);
}

export const PROMPT_CONFIGS: Record<string, GroqTaskConfig> = {
  ITINERARY: {
    temperature: 0.2,
  },
  DISTRICT_OVERVIEW: {
    temperature: 0.3,
    max_tokens: 300,
  },
  FOOD_RECOMMENDATIONS: {
    temperature: 0.3,
  },
  HIDDEN_GEMS_RANKING: {
    temperature: 0.2,
  },
  WEATHER_ADVICE: {
    temperature: 0.3,
    max_tokens: 250,
  },
  FESTIVAL_MATCH: {
    temperature: 0.3,
    max_tokens: 500,
  },
  SAFETY_TONE: {
    temperature: 0.2,
    max_tokens: 500,
  },
  CHAT_ASSISTANT: {
    temperature: 0.6,
  },
};
