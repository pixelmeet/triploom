import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import District from '@/models/District';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const districts = await District.find({}).sort({ name: 1 });
    return NextResponse.json(districts);
  } catch (error: any) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}
