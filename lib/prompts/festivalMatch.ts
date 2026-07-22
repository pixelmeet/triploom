import { formatFestivals, serializeGrounding } from './helpers';

export interface SeededFestivalInfo {
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  description: string;
}

/**
 * Builds system and user prompts for Groq festival travel suggestions.
 * Output strictly follows: { "matches": [{ "festivalName": "string", "suggestion": "string" }] }
 */
export function buildFestivalMatchPrompt(
  district: { name: string },
  festivals: SeededFestivalInfo[],
  tripDates?: { start: string; end: string }
) {
  const formattedFestivals = formatFestivals(festivals);

  const systemPrompt = `You are a local travel advisor for Gujarat, India.
Generate practical 1-2 sentence travel suggestions for festivals occurring in ${district.name} during trip dates.

CRITICAL RULES:
1. Grounding: Rely STRICTLY on provided festival dates and descriptions. Do NOT invent festival details.
2. Accuracy: Each output "festivalName" MUST EXACTLY match the input festival "name".
3. Length: Concise 1 to 2 sentence suggestion per festival.
4. Structure: Output valid JSON matching {"matches":[{"festivalName":"string","suggestion":"string"}]}.`;

  const userPrompt = `District: ${district.name}
Trip Dates: ${tripDates ? `${tripDates.start} to ${tripDates.end}` : 'N/A'}
Festivals:
${serializeGrounding(formattedFestivals)}`;

  return { systemPrompt, userPrompt };
}
