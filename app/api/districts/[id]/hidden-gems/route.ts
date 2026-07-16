import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import District from '@/models/District';
import HiddenGem from '@/models/HiddenGem';
import { buildHiddenGemsRankingPrompt } from '@/lib/prompts/hiddenGemsRanking';
import { callGroq, GroqError } from '@/lib/groq';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid district ID' }, { status: 400 });
    }

    await dbConnect();

    const district = await District.findById(id);
    if (!district) {
      return NextResponse.json({ error: 'District not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const interestsParam = searchParams.get('interests');

    const hiddenGems = await HiddenGem.find({ districtId: id }).lean();

    // If no interests parameter is passed, return gems in seeded order immediately (no AI call)
    if (!interestsParam || !interestsParam.trim()) {
      return NextResponse.json(hiddenGems);
    }

    const interests = interestsParam
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (interests.length === 0 || hiddenGems.length === 0) {
      return NextResponse.json(hiddenGems);
    }

    const groundingGems = hiddenGems.map((g: any) => ({
      name: g.name,
      tags: g.tags,
      description: g.description,
    }));

    const { systemPrompt, userPrompt } = buildHiddenGemsRankingPrompt(
      { name: district.name },
      groundingGems,
      interests
    );

    let rawResult;
    try {
      rawResult = await callGroq(systemPrompt, userPrompt);
    } catch (error: any) {
      console.error('Groq call failed in hidden-gems ranking:', error);
      if (error instanceof GroqError) {
        if (error.reason === 'rate_limit') {
          return NextResponse.json(
            { error: 'Too many requests right now, please try again in a minute.' },
            { status: 429 }
          );
        }
        return NextResponse.json(
          { error: 'AI service was unable to rank hidden gems, please try again.' },
          { status: 502 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to communicate with AI generation service.' },
        { status: 502 }
      );
    }

    if (
      !rawResult ||
      typeof rawResult !== 'object' ||
      !Array.isArray((rawResult as any).ranked)
    ) {
      console.error('AI output failed schema validation for hidden-gems ranking:', rawResult);
      return NextResponse.json(
        { error: 'AI response was invalid, please try again.' },
        { status: 502 }
      );
    }

    const ranked = (rawResult as any).ranked;

    // Map the ranked results back to full gem documents
    const rankedGems = ranked
      .map((r: any) => {
        if (!r || typeof r !== 'object' || !r.name) return null;
        const match = hiddenGems.find(
          (g: any) => g.name.trim().toLowerCase() === String(r.name).trim().toLowerCase()
        );
        if (match) {
          return {
            ...match,
            reason: typeof r.reason === 'string' ? r.reason : 'Matches your interests.',
          };
        }
        return null;
      })
      .filter((g: any) => g !== null);

    // Append any gems that AI missed during ranking
    for (const gem of hiddenGems) {
      const alreadyRanked = rankedGems.some(
        (rg: any) => rg._id.toString() === gem._id.toString()
      );
      if (!alreadyRanked) {
        rankedGems.push({
          ...gem,
          reason: 'Available hidden gem in this district.',
        });
      }
    }

    return NextResponse.json(rankedGems);
  } catch (error: any) {
    console.error(`Error in GET /api/districts/[id]/hidden-gems:`, error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
