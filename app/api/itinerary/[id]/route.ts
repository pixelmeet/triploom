import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Itinerary from '@/models/Itinerary';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Itinerary not found.' }, { status: 404 });
    }

    await dbConnect();
    const itinerary = await Itinerary.findById(id).lean();

    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found.' }, { status: 404 });
    }

    if (itinerary.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this itinerary.' }, { status: 403 });
    }

    return NextResponse.json(itinerary);
  } catch (error: any) {
    console.error('Error in GET /api/itinerary/[id]:', error?.message);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Itinerary not found.' }, { status: 404 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { title, days } = body;

    await dbConnect();
    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found.' }, { status: 404 });
    }

    if (itinerary.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this itinerary.' }, { status: 403 });
    }

    if (typeof title === 'string' && title.trim()) {
      itinerary.title = title.trim();
    }

    if (Array.isArray(days)) {
      itinerary.days = days;
    }

    await itinerary.save();

    return NextResponse.json(itinerary);
  } catch (error: any) {
    console.error('Error in PATCH /api/itinerary/[id]:', error?.message);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
