import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Attraction from '@/models/Attraction';

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

    const attractions = await Attraction.find({ districtId: id }).sort({ name: 1 });
    return NextResponse.json(attractions);
  } catch (error: any) {
    console.error(`Error in GET /api/districts/[id]/attractions:`, error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch attractions.' },
      { status: 500 }
    );
  }
}
