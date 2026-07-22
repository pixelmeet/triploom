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
import { buildItineraryPrompt } from '@/lib/prompts/itinerary';
import { PROMPT_CONFIGS, getItineraryMaxTokens } from '@/lib/prompts/config';
import { callGroq, GroqError } from '@/lib/groq';


export const dynamic = 'force-dynamic';

function validateItinerary(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.itinerary)) return false;
  if (typeof data.totalEstimatedCost !== 'number') return false;

  for (const day of data.itinerary) {
    if (typeof day.day !== 'number') return false;
    if (typeof day.district !== 'string') return false;
    if (!Array.isArray(day.items)) return false;
    if (typeof day.dailyEstimatedCost !== 'number') return false;

    for (const item of day.items) {
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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    await dbConnect();
    const itineraries = await Itinerary.find({ userId: session.user.id })
      .select('_id title budget interests generatedAt status days')
      .sort({ generatedAt: -1 })
      .lean();

    const summaries = itineraries.map((it: any) => ({
      _id: it._id.toString(),
      title: it.title,
      budget: it.budget,
      interests: it.interests,
      generatedAt: it.generatedAt,
      status: it.status,
      daysCount: Array.isArray(it.days) ? it.days.length : 0,
      startDistrict: Array.isArray(it.days) && it.days.length > 0 ? it.days[0].district : '',
    }));

    return NextResponse.json(summaries);
  } catch (error: any) {
    console.error('Unhandled route error in GET /api/itinerary:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { days, budget, interests, startDistrict } = body;

    // Input Validation
    if (typeof days !== 'number' || !Number.isInteger(days) || days < 1 || days > 14) {
      return NextResponse.json({ error: 'Days must be an integer between 1 and 14' }, { status: 400 });
    }

    if (typeof budget !== 'number' || budget <= 0) {
      return NextResponse.json({ error: 'Budget must be a positive number' }, { status: 400 });
    }

    if (!Array.isArray(interests) || !interests.every(i => typeof i === 'string')) {
      return NextResponse.json({ error: 'Interests must be an array of strings' }, { status: 400 });
    }

    if (typeof startDistrict !== 'string' || !startDistrict.trim()) {
      return NextResponse.json({ error: 'Start district is required' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Resolve starting district
    let district = null;
    if (mongoose.Types.ObjectId.isValid(startDistrict)) {
      district = await District.findById(startDistrict);
    }
    if (!district) {
      district = await District.findOne({ name: new RegExp(`^${startDistrict.trim()}$`, 'i') });
    }

    if (!district) {
      return NextResponse.json({ error: `District '${startDistrict}' not found` }, { status: 400 });
    }

    const districtId = district._id;

    // Fetch collections filtered by resolved districtId
    const [attractions, hiddenGems, foodItems] = await Promise.all([
      Attraction.find({ districtId }).lean(),
      HiddenGem.find({ districtId }).lean(),
      Food.find({ districtId }).lean(),
    ]);

    // Format grounding data strictly as needed
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

    // Prepare prompt
    const { systemPrompt, userPrompt } = buildItineraryPrompt(
      { days, budget, interests, startDistrict: district.name },
      groundingData
    );

    // Call Groq AI
    let rawResult: any;
    try {
      rawResult = await callGroq(systemPrompt, userPrompt, {
        ...PROMPT_CONFIGS.ITINERARY,
        max_tokens: getItineraryMaxTokens(days),
      });
    } catch (error: any) {

      console.error('Groq client wrapper error:', error);
      if (error instanceof GroqError) {
        if (error.reason === 'rate_limit') {
          return NextResponse.json(
            { error: 'Too many requests right now, please try again in a minute.' },
            { status: 429 }
          );
        }
        return NextResponse.json(
          { error: 'AI service was unable to generate your request, please try again.' },
          { status: 502 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to communicate with AI generation service.' },
        { status: 502 }
      );
    }

    // Validate the AI output schema
    if (!validateItinerary(rawResult)) {
      console.error('AI output failed schema validation:', rawResult);
      return NextResponse.json(
        { error: 'AI response was invalid, please try again.' },
        { status: 502 }
      );
    }

    // Persist itinerary if request is authenticated
    const session = await getServerSession(authOptions);
    let savedItineraryId: string | undefined = undefined;

    if (session?.user?.id) {
      try {
        const title = `${district.name} ${days}-Day Trip`;
        const newItinerary = await Itinerary.create({
          userId: session.user.id,
          title,
          days: rawResult.itinerary,
          budget,
          interests: Array.isArray(interests) ? interests : [],
          generatedAt: new Date(),
          status: 'active',
        });
        savedItineraryId = newItinerary._id.toString();
      } catch (saveError: any) {
        console.error('Failed to save itinerary for authenticated user:', saveError?.message);
      }
    }

    return NextResponse.json({
      ...(rawResult as object),
      ...(savedItineraryId ? { _id: savedItineraryId } : {}),
    });
  } catch (error: any) {
    console.error('Unhandled route error in POST /api/itinerary:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
