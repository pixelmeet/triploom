import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import District from '@/models/District';
import Food from '@/models/Food';
import { buildFoodRecommendationPrompt } from '@/lib/prompts/foodRecommendations';
import { PROMPT_CONFIGS, getFoodMaxTokens } from '@/lib/prompts/config';
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

    const foods = await getCachedOrGenerate<any[]>(
      // cacheCheck
      async () => {
        const foodItems = await Food.find({ districtId: id }).lean();
        if (foodItems.length === 0) {
          return { data: [], generatedAt: new Date() };
        }

        const allCached = foodItems.every(
          (f: any) => f.aiBlurb && f.aiBlurb.trim().length > 0 && f.aiBlurbGeneratedAt
        );

        if (allCached) {
          const oldestGen = foodItems.reduce((min, f: any) => {
            const t = new Date(f.aiBlurbGeneratedAt).getTime();
            return t < min ? t : min;
          }, Date.now());
          return {
            data: foodItems,
            generatedAt: new Date(oldestGen),
          };
        }
        return null;
      },
      // generate
      async () => {
        const foodItems = await Food.find({ districtId: id }).lean();
        if (foodItems.length === 0) return [];

        const groundingFood = foodItems.map((f: any) => ({
          name: f.name,
          type: f.type,
          description: f.description,
          priceRange: f.priceRange,
        }));

        const { systemPrompt, userPrompt } = buildFoodRecommendationPrompt(
          { name: district.name },
          groundingFood
        );

        const rawResult = await callGroq(systemPrompt, userPrompt, {
          ...PROMPT_CONFIGS.FOOD_RECOMMENDATIONS,
          max_tokens: getFoodMaxTokens(foodItems.length),
        });


        if (
          !rawResult ||
          typeof rawResult !== 'object' ||
          !Array.isArray((rawResult as any).recommendations)
        ) {
          throw new GroqError('AI output is not valid JSON or missing recommendations array', 'parse_error');
        }

        const recommendations = (rawResult as any).recommendations;

        // Map AI blurbs back by matching name
        const updatedFoodItems = foodItems.map((f: any) => {
          const rec = recommendations.find(
            (r: any) =>
              r &&
              typeof r === 'object' &&
              String(r.name).trim().toLowerCase() === f.name.trim().toLowerCase()
          );
          return {
            ...f,
            aiBlurb: rec && typeof rec.blurb === 'string' ? rec.blurb : f.description,
            aiBlurbGeneratedAt: new Date(),
          };
        });

        return updatedFoodItems;
      },
      // save
      async (generatedFoodItems) => {
        await Promise.all(
          generatedFoodItems.map((f: any) =>
            Food.findByIdAndUpdate(f._id, {
              aiBlurb: f.aiBlurb,
              aiBlurbGeneratedAt: f.aiBlurbGeneratedAt,
            })
          )
        );
      },
      // maxAgeMs (30 days)
      30 * 24 * 60 * 60 * 1000,
      // force
      force
    );

    return NextResponse.json(foods);
  } catch (error: any) {
    console.error(`Error in GET /api/districts/[id]/food:`, error);
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
      { error: error?.message || 'Failed to generate food recommendations.' },
      { status: 502 }
    );
  }
}
