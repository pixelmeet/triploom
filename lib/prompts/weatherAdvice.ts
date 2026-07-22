import { WeatherData } from '@/lib/weather';

interface DistrictInfo {
  name: string;
  bestSeason: string;
}

/**
 * Builds system and user prompts for Groq weather travel advice generation.
 * Output must strictly follow: { "advice": "string" }
 */
export function buildWeatherAdvicePrompt(district: DistrictInfo, weather: WeatherData) {
  const systemPrompt = `You are an expert travel advisor for Gujarat, India.
Your task is to generate 2 to 3 sentences of practical, natural-language travel advice for a visitor based STRICTLY on the current weather data provided.

CRITICAL RULES:
1. Grounding: Rely ONLY on the numeric and textual weather metrics provided (temperature, condition, humidity, wind speed) and the district's best season. Do NOT invent multi-day forecasts, future weather trends, or unprovided weather conditions.
2. Content: Mention practical advice such as what to pack/wear, suitability for outdoor attractions today, and a relevant seasonal note referencing the district's best season (${district.bestSeason}).
3. Sentence limit: Exactly 2 to 3 sentences.
4. Structure: The output must be valid JSON only matching the schema below.

JSON Schema:
{
  "advice": "string"
}
`;

  const userPrompt = `Generate weather-based travel advice for:

District: ${district.name}
Best Season to Visit: ${district.bestSeason}

Current Weather Data:
- Temperature: ${weather.tempC}°C
- Condition: ${weather.condition}
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeedKmh} km/h
`;

  return { systemPrompt, userPrompt };
}
