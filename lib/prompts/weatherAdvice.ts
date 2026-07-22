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
Generate 2 to 3 sentences of practical travel advice based STRICTLY on current weather data and best season.

CRITICAL RULES:
1. Grounding: Rely ONLY on provided weather metrics (temperature, condition, humidity, wind) and best season (${district.bestSeason}). Do NOT invent unprovided metrics or forecasts.
2. Content: Include practical advice (what to wear, outdoor suitability) and reference best season (${district.bestSeason}).
3. Length: Exactly 2 to 3 sentences.
4. Structure: Output valid JSON matching {"advice":"string"}.`;

  const userPrompt = `District: ${district.name}
Best Season: ${district.bestSeason}
Weather: ${weather.tempC}°C, ${weather.condition}, Humidity ${weather.humidity}%, Wind ${weather.windSpeedKmh} km/h`;

  return { systemPrompt, userPrompt };
}
