import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import District from '@/models/District';
import { getWeatherForDistrict, WeatherError, WeatherData } from '@/lib/weather';
import { buildWeatherAdvicePrompt } from '@/lib/prompts/weatherAdvice';
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

    // Always fetch raw weather numbers fresh on every request
    const weather: WeatherData = await getWeatherForDistrict({ name: district.name });

    let adviceCachedAt: string | null = null;

    // Cache Groq-generated advice narrative for 3 hours (3 * 60 * 60 * 1000 ms)
    const advice = await getCachedOrGenerate<string>(
      // cacheCheck
      async () => {
        const dist = await District.findById(id).lean();
        if (
          dist &&
          dist.weatherAdviceCached &&
          dist.weatherAdviceCached.trim().length > 0 &&
          dist.weatherAdviceGeneratedAt
        ) {
          adviceCachedAt = new Date(dist.weatherAdviceGeneratedAt).toISOString();
          return {
            data: dist.weatherAdviceCached,
            generatedAt: dist.weatherAdviceGeneratedAt,
          };
        }
        return null;
      },
      // generate
      async () => {
        const { systemPrompt, userPrompt } = buildWeatherAdvicePrompt(
          { name: district.name, bestSeason: district.bestSeason },
          weather
        );

        const rawResult = await callGroq(systemPrompt, userPrompt);

        if (
          !rawResult ||
          typeof rawResult !== 'object' ||
          typeof (rawResult as any).advice !== 'string' ||
          !(rawResult as any).advice.trim()
        ) {
          throw new GroqError('AI output is not valid JSON or missing advice field', 'parse_error');
        }

        return (rawResult as any).advice;
      },
      // save
      async (generatedAdvice) => {
        const now = new Date();
        await District.findByIdAndUpdate(id, {
          weatherAdviceCached: generatedAdvice,
          weatherAdviceGeneratedAt: now,
        });
        adviceCachedAt = now.toISOString();
      },
      // maxAgeMs (3 hours)
      3 * 60 * 60 * 1000
    );

    return NextResponse.json({
      weather,
      advice,
      adviceCachedAt,
    });
  } catch (error: any) {
    console.error(`Error in GET /api/districts/[id]/weather:`, error);
    if (error instanceof WeatherError) {
      return NextResponse.json(
        { error: `Weather service error: ${error.message}` },
        { status: 502 }
      );
    }
    if (error instanceof GroqError) {
      if (error.reason === 'rate_limit') {
        return NextResponse.json(
          { error: 'AI weather advice rate limit reached, please try again later.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: 'AI weather advice service unavailable, please try again.' },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch district weather and advice.' },
      { status: 502 }
    );
  }
}
