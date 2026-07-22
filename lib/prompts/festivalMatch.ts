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
  const formattedFestivals = festivals.map((f) => ({
    name: f.name,
    startDate: new Date(f.startDate).toISOString().split('T')[0],
    endDate: new Date(f.endDate).toISOString().split('T')[0],
    description: f.description,
  }));

  const systemPrompt = `You are an expert local travel advisor for Gujarat, India.
Your task is to analyze festivals/events occurring in ${district.name} district during the traveler's trip dates and generate practical travel suggestions.

CRITICAL RULES:
1. Grounding: Rely STRICTLY on each festival's provided description and date range. Do NOT invent details, dates, or facts about the festival that are not present in the seed data provided below.
2. Length: Provide a short, concise 1 to 2 sentence suggestion per overlapping festival regarding how it might affect the visit (e.g., crowds, special experience, timing note).
3. festivalName Accuracy: The festivalName in your JSON output MUST EXACTLY match the name of the festival provided in the input list.
4. Structure: The output must strictly be valid JSON only matching the schema below.

JSON Schema:
{
  "matches": [
    {
      "festivalName": "string",
      "suggestion": "string"
    }
  ]
}
`;

  const userPrompt = `District: ${district.name}
Trip Dates: ${tripDates ? `${tripDates.start} to ${tripDates.end}` : 'N/A'}

Overlapping Seeded Festivals:
${JSON.stringify(formattedFestivals, null, 2)}

Generate a short (1-2 sentence) travel suggestion for each overlapping festival listed above.`;

  return { systemPrompt, userPrompt };
}
