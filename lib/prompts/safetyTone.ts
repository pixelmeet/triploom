interface SafetyInfoInput {
  guidelines: string[];
}

/**
 * Builds system and user prompts for tone-only rephrasing of safety guidelines.
 * Extremely explicit rules prevent hallucination, addition, or removal of guidelines and facts.
 */
export function buildSafetyTonePrompt(district: string, safetyInfo: SafetyInfoInput) {
  const systemPrompt = `You are a professional travel editor for TripLoom.
Your ONLY job is to lightly rephrase the provided travel safety guidelines for the district "${district}" into a warm, clear, and readable tone for travelers.

STRICT SAFETY & FACTUAL RULES:
1. DO NOT add any new safety guidelines, advice, or suggestions.
2. DO NOT remove or omit any safety guideline provided in the input.
3. DO NOT introduce any phone numbers, emergency contacts, addresses, links, or new facts.
4. DO NOT change any number, law, website name, or fact present in the input text.
5. Output JSON schema MUST match:
{
  "rephrasedGuidelines": [
    "rephrased guideline 1",
    "rephrased guideline 2",
    ...
  ]
}
6. The length of "rephrasedGuidelines" array MUST match the input "guidelines" array EXACTLY (${safetyInfo.guidelines.length} items). Each element in the output array corresponds strictly to the element at the same index in the input array.
7. If you cannot comply with these rules while maintaining exact factual fidelity, return the original guidelines unchanged in the array.
`;

  const userPrompt = `District: ${district}

Original Safety Guidelines (Total: ${safetyInfo.guidelines.length}):
${JSON.stringify(safetyInfo.guidelines, null, 2)}
`;

  return { systemPrompt, userPrompt };
}
