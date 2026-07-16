/**
 * Utility to retrieve cached content or generate it on demand.
 * 
 * @param cacheCheck Function that returns the cached data and its generation date (or null)
 * @param generate Function that generates the data (e.g. calls Groq)
 * @param save Function that persists the newly generated data
 * @param maxAgeMs Maximum cache age in milliseconds (defaults to 30 days)
 * @param bypassCache Force regeneration, ignoring the cache
 */
export async function getCachedOrGenerate<T>(
  cacheCheck: () => Promise<{ data: T; generatedAt: Date | null } | null>,
  generate: () => Promise<T>,
  save: (data: T) => Promise<void>,
  maxAgeMs: number = 30 * 24 * 60 * 60 * 1000, // 30 days
  bypassCache: boolean = false
): Promise<T> {
  const isDev = process.env.NODE_ENV === 'development';

  if (!bypassCache) {
    try {
      const cached = await cacheCheck();
      if (cached && cached.data !== null && cached.data !== undefined) {
        const { data, generatedAt } = cached;
        if (generatedAt) {
          const age = Date.now() - new Date(generatedAt).getTime();
          if (age < maxAgeMs) {
            if (isDev) {
              console.log('[DEBUG] Cache Hit: Serving from cache.');
            }
            return data;
          }
        }
      }
    } catch (cacheError) {
      if (isDev) {
        console.warn('[DEBUG] Cache check failed, falling back to generate:', cacheError);
      }
    }
  }

  if (isDev) {
    console.log(bypassCache ? '[DEBUG] Cache Bypassed.' : '[DEBUG] Cache Miss.');
  }

  const generated = await generate();
  
  try {
    await save(generated);
  } catch (saveError) {
    if (isDev) {
      console.error('[DEBUG] Failed to save generated data to cache:', saveError);
    }
    // We still return the generated data even if saving it fails
  }

  return generated;
}
