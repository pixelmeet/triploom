'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Briefcase, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ItinerarySummary {
  _id: string;
  title: string;
  budget: number;
  interests: string[];
  generatedAt: string;
  daysCount: number;
  startDistrict: string;
}

export default function MyTripsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [trips, setTrips] = useState<ItinerarySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/trips');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchTrips() {
      if (status !== 'authenticated') return;
      try {
        const res = await fetch('/api/itinerary');
        if (!res.ok) {
          throw new Error('Couldn\'t load saved itineraries — try again.');
        }
        const data = await res.json();
        setTrips(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load trips.');
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [status]);

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
        <div className="jali-divider-indigo w-24 animate-jaliResolve mb-4" />
        <p className="text-iron-black/50 font-medium">Loading your trips...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 animate-fadeSlideIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-desert-dust">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-iron-black flex items-center gap-3">
            <Briefcase className="h-7 w-7 text-indigo-deep" />
            My Trips
          </h1>
          <p className="text-iron-black/50 mt-2 text-sm">
            Your saved itineraries.
          </p>
        </div>

        <Link href="/itinerary">
          <Button className="bg-indigo-deep text-resist-white font-bold hover:bg-indigo-hover rounded-md flex items-center gap-2 border-none">
            <Calendar className="h-4 w-4" />
            Generate Itinerary
          </Button>
        </Link>
      </div>

      {error && (
        <div className="border border-madder-red/30 bg-madder-red/5 text-madder-red p-5 rounded-lg flex items-start gap-3 mb-8">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold">Couldn&apos;t load trips</h3>
            <p className="text-iron-black/60 mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="border border-dashed border-desert-dust rounded-lg py-20 px-6 text-center bg-white">
          <div className="mx-auto h-12 w-12 rounded-md bg-dust-lighter border border-desert-dust flex items-center justify-center mb-4 text-iron-black/30">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-iron-black/70">No trips saved yet</h3>
          <p className="text-iron-black/40 max-w-md mx-auto mt-2 text-sm">
            Generate an itinerary to save your first trip.
          </p>
          <div className="mt-5">
            <Link href="/itinerary">
              <Button className="bg-indigo-deep text-resist-white font-bold hover:bg-indigo-hover rounded-md px-5">
                Generate Itinerary
              </Button>
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && trips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map((trip) => {
            const formattedDate = new Date(trip.generatedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={trip._id}
                className="group border border-desert-dust hover:border-indigo-deep/40 rounded-lg p-5 transition-colors duration-150 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-sm bg-dust-lighter text-iron-black/50 border border-desert-dust/60 font-data">
                      {formattedDate}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-indigo-deep/10 text-indigo-deep border border-indigo-deep/15 font-data">
                      {trip.daysCount} days
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-iron-black group-hover:text-indigo-deep transition-colors line-clamp-1 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                    {trip.title}
                  </h3>

                  <div className="space-y-1.5 text-sm text-iron-black/50 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        Budget:
                      </span>
                      <strong className="text-indigo-deep font-bold font-data">
                        ₹{trip.budget.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  {trip.interests && trip.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {trip.interests.slice(0, 3).map((interest, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-sm bg-dust-lighter text-iron-black/50 border border-desert-dust/60 capitalize"
                        >
                          {interest}
                        </span>
                      ))}
                      {trip.interests.length > 3 && (
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-sm bg-dust-lighter text-iron-black/40">
                          +{trip.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-desert-dust/40 flex items-center justify-between">
                  <Link href={`/trips/${trip._id}`} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-between group-hover:border-indigo-deep/30 transition-colors rounded-md"
                    >
                      <span>View itinerary</span>
                      <ArrowRight className="h-3.5 w-3.5 text-indigo-deep transform group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
