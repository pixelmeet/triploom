import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import District from '@/models/District';
import Attraction from '@/models/Attraction';
import HiddenGem from '@/models/HiddenGem';
import { buildDistrictOverviewPrompt } from '@/lib/prompts/districtOverview';
import { callGroq, GroqError } from '@/lib/groq';
import { getCachedOrGenerate } from '@/lib/cache';

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
    const force = searchParams.get('force') === 'true' || searchParams.get('regenerate') === 'true';

    // Caching/generation helper
    const overview = await getCachedOrGenerate<string>(
      // cacheCheck
      async () => {
        const dist = await District.findById(id).lean();
        if (dist && dist.overviewCached && dist.overviewCached.trim().length > 0) {
          return {
            data: dist.overviewCached,
            generatedAt: dist.lastGeneratedAt,
          };
        }
        return null;
      },
      // generate
      async () => {
        const [attractions, hiddenGems] = await Promise.all([
          Attraction.find({ districtId: id }).lean(),
          HiddenGem.find({ districtId: id }).lean(),
        ]);

        const groundingData = {
          attractions: attractions.map((a: any) => ({
            name: a.name,
            description: a.description,
          })),
          hiddenGems: hiddenGems.map((g: any) => ({
            name: g.name,
            description: g.description,
          })),
        };

        const { systemPrompt, userPrompt } = buildDistrictOverviewPrompt(
          {
            name: district.name,
            region: district.region,
            bestSeason: district.bestSeason,
          },
          groundingData
        );

        const rawResult = await callGroq(systemPrompt, userPrompt);

        if (
          !rawResult ||
          typeof rawResult !== 'object' ||
          typeof (rawResult as any).overview !== 'string' ||
          !(rawResult as any).overview.trim()
        ) {
          throw new GroqError('AI output is not valid JSON or missing overview field', 'parse_error');
        }

        return (rawResult as any).overview;
      },
      // save
      async (generatedOverview) => {
        await District.findByIdAndUpdate(id, {
          overviewCached: generatedOverview,
          lastGeneratedAt: new Date(),
        });
      },
      // maxAgeMs (30 days default)
      30 * 24 * 60 * 60 * 1000,
      // force regeneration
      force
    );

    return NextResponse.json({ overview });
  } catch (error: any) {
    console.error(`Error in GET /api/districts/[id]/overview:`, error);
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
      { error: error?.message || 'Failed to generate district overview.' },
      { status: 502 }
    );
  }
}
