import { serializeGrounding } from './helpers';

interface SafetyInfoInput {
  guidelines: string[];
}

/**
 * Builds system and user prompts for tone-only rephrasing of safety guidelines.
 * Explicit safety rules prevent hallucination, addition, or removal of guidelines and facts.
 */
export function buildSafetyTonePrompt(district: string, safetyInfo: SafetyInfoInput) {
  const systemPrompt = `You are a travel editor for TripLoom.
Lightly rephrase the provided safety guidelines for "${district}" into a warm, clear, readable tone.

STRICT SAFETY & FACTUAL RULES:
1. DO NOT add new safety guidelines, advice, or suggestions.
2. DO NOT remove or omit any provided safety guideline.
3. DO NOT introduce phone numbers, emergency contacts, addresses, links, or new facts.
4. DO NOT change numbers, laws, website names, or facts in the input text.
5. Output valid JSON matching {"rephrasedGuidelines":["string"]}.
6. The length of "rephrasedGuidelines" array MUST match input array EXACTLY (${safetyInfo.guidelines.length} items). Each index corresponds to the input index.
7. If compliance while maintaining exact factual fidelity is impossible, return original guidelines unchanged.`;

  const userPrompt = `District: ${district}
Original Guidelines (${safetyInfo.guidelines.length} items):
${serializeGrounding(safetyInfo.guidelines)}`;

  return { systemPrompt, userPrompt };
}
