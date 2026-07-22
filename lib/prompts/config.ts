export interface GroqTaskConfig {
  temperature: number;
  max_tokens: number;
}

export const PROMPT_CONFIGS: Record<string, GroqTaskConfig> = {
  ITINERARY: {
    temperature: 0.2,
    max_tokens: 2000,
  },
  DISTRICT_OVERVIEW: {
    temperature: 0.3,
    max_tokens: 300,
  },
  FOOD_RECOMMENDATIONS: {
    temperature: 0.3,
    max_tokens: 600,
  },
  HIDDEN_GEMS_RANKING: {
    temperature: 0.2,
    max_tokens: 600,
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
    max_tokens: 1500,
  },
};
