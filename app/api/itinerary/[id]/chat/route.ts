// NOTE: Chat history persistence is deliberately omitted in Phase 7. History is kept in client state per session.

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import District from '@/models/District';
import Attraction from '@/models/Attraction';
import HiddenGem from '@/models/HiddenGem';
import Food from '@/models/Food';
import Itinerary from '@/models/Itinerary';
import { buildChatAssistantPrompt, ChatMessage } from '@/lib/prompts/chatAssistant';
import { PROMPT_CONFIGS, getChatMaxTokens } from '@/lib/prompts/config';
import { callGroq, GroqError } from '@/lib/groq';


export const dynamic = 'force-dynamic';

/**
 * Validates whether the AI-provided updatedDays array conforms to the expected day/item schema.
 */
function validateDays(days: any): boolean {
  if (!Array.isArray(days) || days.length === 0) return false;

  for (const day of days) {
    if (!day || typeof day !== 'object') return false;
    if (typeof day.day !== 'number') return false;
    if (typeof day.district !== 'string') return false;
    if (!Array.isArray(day.items)) return false;
    if (typeof day.dailyEstimatedCost !== 'number') return false;

    for (const item of day.items) {
      if (!item || typeof item !== 'object') return false;
      if (typeof item.time !== 'string') return false;
      if (typeof item.name !== 'string') return false;

      const typeStr = String(item.type).toLowerCase().trim();
      if (typeStr !== 'attraction' && typeStr !== 'food' && typeStr !== 'hidden_gem') {
        return false;
      }
      if (typeof item.estimatedCost !== 'number') return false;
      if (typeof item.notes !== 'string') return false;
    }
  }

  return true;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Itinerary not found.' }, { status: 404 });
    }

    // 2. Request body parsing and validation
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { message, conversationHistory } = body;

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
    }

    const history: ChatMessage[] = Array.isArray(conversationHistory)
      ? conversationHistory.filter((item: any) => 
          item && typeof item.role === 'string' && typeof item.content === 'string'
        )
      : [];

    // 3. Database connection & Ownership check
    await dbConnect();
    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found.' }, { status: 404 });
    }

    if (itinerary.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this itinerary.' }, { status: 403 });
    }

    // 4. Derive grounding data server-side based on itinerary's districts
    const districtNames: string[] = Array.from(
      new Set((itinerary.days || []).map((d: any) => String(d.district)).filter(Boolean))
    );

    const districtDocs = await District.find({
      name: { $in: districtNames.map((name: string) => new RegExp(`^${name.trim()}$`, 'i')) },
    }).lean();

    const districtIds = districtDocs.map((d: any) => d._id);

    const [attractions, hiddenGems, foodItems] = await Promise.all([
      Attraction.find({ districtId: { $in: districtIds } }).lean(),
      HiddenGem.find({ districtId: { $in: districtIds } }).lean(),
      Food.find({ districtId: { $in: districtIds } }).lean(),
    ]);

    const groundingData = {
      attractions: attractions.map((a: any) => ({
        name: a.name,
        type: a.type,
        tags: a.tags,
        description: a.description,
      })),
      hiddenGems: hiddenGems.map((g: any) => ({
        name: g.name,
        tags: g.tags,
        description: g.description,
      })),
      food: foodItems.map((f: any) => ({
        name: f.name,
        type: f.type,
        description: f.description,
        priceRange: f.priceRange,
      })),
    };

    // 5. Build prompt & call Groq API
    const { systemPrompt, userPrompt } = buildChatAssistantPrompt(
      itinerary.days,
      groundingData,
      history,
      message.trim()
    );

    let rawResult: any;
    try {
      const dayCount = Array.isArray(itinerary.days) ? itinerary.days.length : 1;
      rawResult = await callGroq(systemPrompt, userPrompt, {
        ...PROMPT_CONFIGS.CHAT_ASSISTANT,
        max_tokens: getChatMaxTokens(dayCount),
      });
    } catch (error: any) {

      console.error('Groq API error in chat route:', error);
      if (error instanceof GroqError) {
        if (error.reason === 'rate_limit') {
          return NextResponse.json(
            { error: 'Too many requests right now, please try again in a minute.' },
            { status: 429 }
          );
        }
        return NextResponse.json(
          { error: 'AI assistant service was unable to process your request.' },
          { status: 502 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to communicate with AI chat service.' },
        { status: 502 }
      );
    }

    // 6. Validate and handle AI output shape
    const responseType = rawResult?.type === 'edit' ? 'edit' : 'reply';
    const responseMessage = typeof rawResult?.message === 'string' ? rawResult.message : 'Response received.';

    if (responseType === 'edit') {
      const isValidEdit = validateDays(rawResult?.updatedDays);

      if (isValidEdit) {
        // Apply edits to MongoDB directly
        itinerary.days = rawResult.updatedDays;
        await itinerary.save();

        return NextResponse.json({
          type: 'edit',
          message: responseMessage,
          updatedDays: rawResult.updatedDays,
        });
      } else {
        // Edit validation failed - return reply with note without saving
        console.warn('AI chat edit response failed schema validation:', rawResult?.updatedDays);
        return NextResponse.json({
          type: 'reply',
          message: `${responseMessage} (Note: The proposed itinerary edits could not be applied due to schema validation failure.)`,
        });
      }
    }

    // Reply only
    return NextResponse.json({
      type: 'reply',
      message: responseMessage,
    });
  } catch (error: any) {
    console.error('Unhandled route error in POST /api/itinerary/[id]/chat:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
