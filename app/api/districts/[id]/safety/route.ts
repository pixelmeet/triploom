import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import District from '@/models/District';
import SafetyInfo from '@/models/SafetyInfo';
import { buildSafetyTonePrompt } from '@/lib/prompts/safetyTone';
import { PROMPT_CONFIGS } from '@/lib/prompts/config';
import { callGroq, GroqError } from '@/lib/groq';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ emergencyContacts: [], guidelines: [] }, { status: 200 });
    }

    await dbConnect();
    const district = await District.findById(id).lean();
    if (!district) {
      return NextResponse.json({ emergencyContacts: [], guidelines: [] }, { status: 200 });
    }

    const safetyDoc = await SafetyInfo.findOne({ districtId: id });
    if (!safetyDoc) {
      return NextResponse.json({ emergencyContacts: [], guidelines: [] }, { status: 200 });
    }

    // Emergency contacts are ALWAYS served raw directly from database with ZERO AI involvement
    const emergencyContacts = (safetyDoc.emergencyContacts || []).map((contact: any) => ({
      label: contact.label,
      number: contact.number,
    }));

    const rawGuidelines: string[] = safetyDoc.guidelines || [];

    if (rawGuidelines.length === 0) {
      return NextResponse.json({ emergencyContacts, guidelines: [] }, { status: 200 });
    }

    // Check cached tone-rephrased guidelines
    const isCacheValid =
      Array.isArray(safetyDoc.guidelinesToneCached) &&
      safetyDoc.guidelinesToneCached.length === rawGuidelines.length &&
      safetyDoc.guidelinesToneGeneratedAt;

    if (isCacheValid) {
      return NextResponse.json({
        emergencyContacts,
        guidelines: safetyDoc.guidelinesToneCached,
      });
    }

    // Uncached: Call Groq to rephrase guidelines tone
    let finalGuidelines = rawGuidelines;

    try {
      const { systemPrompt, userPrompt } = buildSafetyTonePrompt(district.name, {
        guidelines: rawGuidelines,
      });

      const rawResult: any = await callGroq(systemPrompt, userPrompt, PROMPT_CONFIGS.SAFETY_TONE);

      // Validate AI response shape and length match
      if (
        rawResult &&
        Array.isArray(rawResult.rephrasedGuidelines) &&
        rawResult.rephrasedGuidelines.length === rawGuidelines.length &&
        rawResult.rephrasedGuidelines.every((g: any) => typeof g === 'string' && g.trim())
      ) {
        finalGuidelines = rawResult.rephrasedGuidelines;

        // Persist to MongoDB cache
        safetyDoc.guidelinesToneCached = finalGuidelines;
        safetyDoc.guidelinesToneGeneratedAt = new Date();
        await safetyDoc.save();
      } else {
        console.warn(
          `AI safety tone output length mismatch or malformed structure for district ${district.name}. Falling back to raw guidelines.`,
          rawResult
        );
      }
    } catch (error: any) {
      console.error(
        `Failed to generate AI safety guidelines tone for district ${district.name}. Falling back to raw guidelines.`,
        error?.message || error
      );
      // Fallback: finalGuidelines remains rawGuidelines
    }

    return NextResponse.json({
      emergencyContacts,
      guidelines: finalGuidelines,
    });
  } catch (error: any) {
    console.error('Unhandled error in GET /api/districts/[id]/safety:', error);
    // Even on server failure, attempt to return empty structure gracefully
    return NextResponse.json({ emergencyContacts: [], guidelines: [] }, { status: 200 });
  }
}
