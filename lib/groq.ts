export class GroqError extends Error {
  reason: 'rate_limit' | 'network' | 'parse_error' | 'unknown';
  status?: number;

  constructor(message: string, reason: 'rate_limit' | 'network' | 'parse_error' | 'unknown', status?: number) {
    super(message);
    this.name = 'GroqError';
    this.reason = reason;
    this.status = status;
  }
}

export interface GroqOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

/**
 * Call the Groq API with system and user prompts.
 * Requests JSON output and enforces llama-3.3-70b-versatile by default.
 */
export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  optionsOrModel?: string | GroqOptions
): Promise<unknown> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Please define the GROQ_API_KEY environment variable inside .env');
  }

  const options: GroqOptions =
    typeof optionsOrModel === 'string'
      ? { model: optionsOrModel }
      : optionsOrModel || {};

  const model = options.model || 'llama-3.3-70b-versatile';
  const temperature = options.temperature ?? 0.2;

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    console.log('[DEBUG] Calling Groq API with model:', model, 'temp:', temperature, 'max_tokens:', options.max_tokens);
  }

  const requestBody: Record<string, any> = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: options.response_format || { type: 'json_object' },
    temperature,
  };

  if (options.max_tokens) {
    requestBody.max_tokens = options.max_tokens;
  }

  let response: Response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });
  } catch (error: any) {
    if (isDev) {
      console.error('[DEBUG] Groq API network error:', error);
    }
    throw new GroqError(`Network error calling Groq API: ${error?.message || error}`, 'network');
  }

  if (response.status === 429) {
    throw new GroqError('Groq API rate limit reached', 'rate_limit', 429);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error text');
    if (isDev) {
      console.error(`[DEBUG] Groq API failed with status ${response.status}: ${errorText}`);
    }
    throw new GroqError(`Groq API returned error status ${response.status}`, 'unknown', response.status);
  }

  let data: any;
  try {
    data = await response.json();
  } catch (error: any) {
    if (isDev) {
      console.error('[DEBUG] Failed to parse Groq response JSON:', error);
    }
    throw new GroqError('Failed to parse Groq API response JSON', 'parse_error');
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    if (isDev) {
      console.error('[DEBUG] Groq response structure is invalid:', data);
    }
    throw new GroqError('Invalid or empty choices content from Groq response', 'parse_error');
  }

  try {
    // Strip markdown code fences defensively
    let cleaned = content.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }
    return JSON.parse(cleaned);
  } catch (error: any) {
    if (isDev) {
      console.error('[DEBUG] Failed to parse content as JSON:', content, error);
    }
    throw new GroqError('AI output is not valid JSON', 'parse_error');
  }
}
