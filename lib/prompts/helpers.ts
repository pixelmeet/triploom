/**
 * Helper utilities for serializing grounding data compactly for LLM prompts.
 * Eliminates unused Mongoose/MongoDB fields (_id, districtId, __v, timestamps)
 * and multi-line JSON formatting to minimize token consumption.
 */

export function serializeGrounding(data: unknown): string {
  return JSON.stringify(data);
}

export function formatAttractions(items: any[]) {
  if (!Array.isArray(items)) return [];
  return items.map((a) => ({
    name: String(a.name || '').trim(),
    ...(a.type ? { type: String(a.type).trim() } : {}),
    ...(Array.isArray(a.tags) && a.tags.length > 0 ? { tags: a.tags } : {}),
    ...(a.description ? { description: String(a.description).trim() } : {}),
  }));
}

export function formatHiddenGems(items: any[]) {
  if (!Array.isArray(items)) return [];
  return items.map((g) => ({
    name: String(g.name || '').trim(),
    ...(Array.isArray(g.tags) && g.tags.length > 0 ? { tags: g.tags } : {}),
    ...(g.description ? { description: String(g.description).trim() } : {}),
  }));
}

export function formatFood(items: any[]) {
  if (!Array.isArray(items)) return [];
  return items.map((f) => ({
    name: String(f.name || '').trim(),
    ...(f.type ? { type: String(f.type).trim() } : {}),
    ...(f.priceRange ? { priceRange: String(f.priceRange).trim() } : {}),
    ...(f.description ? { description: String(f.description).trim() } : {}),
  }));
}

export function formatFestivals(items: any[]) {
  if (!Array.isArray(items)) return [];
  return items.map((f) => ({
    name: String(f.name || '').trim(),
    startDate: f.startDate ? new Date(f.startDate).toISOString().split('T')[0] : '',
    endDate: f.endDate ? new Date(f.endDate).toISOString().split('T')[0] : '',
    ...(f.description ? { description: String(f.description).trim() } : {}),
  }));
}

export function formatItineraryDaysForChat(days: any[]) {
  if (!Array.isArray(days)) return [];
  return days.map((d) => ({
    day: d.day,
    district: d.district,
    items: Array.isArray(d.items)
      ? d.items.map((i: any) => ({
          time: i.time,
          name: i.name,
          type: i.type,
          estimatedCost: i.estimatedCost,
          notes: i.notes,
        }))
      : [],
    dailyEstimatedCost: d.dailyEstimatedCost,
  }));
}
