import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import District from '@/models/District';
import Festival from '@/models/Festival';
import { buildFestivalMatchPrompt } from '@/lib/prompts/festivalMatch';
import { PROMPT_CONFIGS } from '@/lib/prompts/config';
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

    const festivals = await Festival.find({ districtId: id }).lean();

    const festivalList = festivals.map((f: any) => ({
      _id: f._id.toString(),
      name: f.name,
      districtId: f.districtId.toString(),
      startDate: f.startDate,
      endDate: f.endDate,
      description: f.description,
    }));

    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // Only invoke Groq if BOTH startDate and endDate are provided
    if (startDateStr && endDateStr) {
      const tripStart = new Date(`${startDateStr}T00:00:00Z`);
      const tripEnd = new Date(`${endDateStr}T23:59:59Z`);

      if (!isNaN(tripStart.getTime()) && !isNaN(tripEnd.getTime())) {
        // Plain date math filtering first
        const overlappingFestivals = festivalList.filter((f: any) => {
          const festStart = new Date(f.startDate);
          const festEnd = new Date(f.endDate);
          return festStart <= tripEnd && festEnd >= tripStart;
        });

        // Only call Groq if there are overlapping festivals
        if (overlappingFestivals.length > 0) {
          const { systemPrompt, userPrompt } = buildFestivalMatchPrompt(
            { name: district.name },
            overlappingFestivals,
            { start: startDateStr, end: endDateStr }
          );

          const rawResult = await callGroq(systemPrompt, userPrompt, PROMPT_CONFIGS.FESTIVAL_MATCH);

          if (
            !rawResult ||
            typeof rawResult !== 'object' ||
            !Array.isArray((rawResult as any).matches)
          ) {
            throw new GroqError('AI output is not valid JSON or missing matches array', 'parse_error');
          }

          const matches = (rawResult as any).matches;

          // Attach suggestion to overlapping festivals
          festivalList.forEach((f: any) => {
            const match = matches.find(
              (m: any) =>
                m &&
                typeof m === 'object' &&
                String(m.festivalName).trim().toLowerCase() === f.name.trim().toLowerCase()
            );
            if (match && typeof match.suggestion === 'string' && match.suggestion.trim()) {
              f.suggestion = match.suggestion.trim();
            }
          });
        }
      }
    }

    return NextResponse.json(festivalList);
  } catch (error: any) {
    console.error(`Error in GET /api/districts/[id]/festivals:`, error);
    if (error instanceof GroqError) {
      if (error.reason === 'rate_limit') {
        return NextResponse.json(
          { error: 'AI festival advice rate limit reached, please try again later.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: 'AI festival matching service unavailable, please try again.' },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch district festivals.' },
      { status: 502 }
    );
  }
}
