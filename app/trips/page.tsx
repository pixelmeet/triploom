'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Briefcase, Calendar, Coins, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
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
          throw new Error('Failed to fetch saved itineraries.');
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
        <Loader2 className="h-12 w-12 text-teal-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading your saved trips...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-slate-100 to-amber-400 bg-clip-text text-transparent flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-teal-400" />
            My Saved Trips
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Access and manage all your saved Gujarat travel itineraries.
          </p>
        </div>

        <Link href="/itinerary">
          <Button className="bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold hover:from-teal-400 hover:to-emerald-400 rounded-xl flex items-center gap-2 shadow-lg shadow-teal-500/10 border-none">
            <Sparkles className="h-4 w-4" />
            Create New Trip
          </Button>
        </Link>
      </div>

      {error && (
        <div className="border border-red-950/50 bg-red-950/20 text-red-300 p-6 rounded-2xl flex items-start gap-4 mb-8">
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-red-400">Error Loading Trips</h3>
            <p className="text-slate-300 mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="border border-dashed border-slate-800 rounded-2xl py-24 px-6 text-center bg-slate-950/30 backdrop-blur-sm">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500">
            <Briefcase className="h-7 w-7 text-teal-500/50" />
          </div>
          <h3 className="text-xl font-bold text-slate-200">No Saved Trips Found</h3>
          <p className="text-slate-400 max-w-md mx-auto mt-2 text-sm">
            You haven&apos;t saved any travel itineraries yet. Use our AI generator to craft your first custom trip.
          </p>
          <div className="mt-6">
            <Link href="/itinerary">
              <Button className="bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 rounded-xl px-6">
                Generate Itinerary
              </Button>
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && trips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const formattedDate = new Date(trip.generatedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={trip._id}
                className="group relative bg-slate-950/60 border border-slate-800/90 hover:border-teal-500/50 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                      {formattedDate}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {trip.daysCount} Days
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-teal-300 transition-colors line-clamp-1 mb-3">
                    {trip.title}
                  </h3>

                  <div className="space-y-2 text-sm text-slate-400 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Coins className="h-4 w-4 text-amber-400" /> Budget Limit:
                      </span>
                      <strong className="text-amber-400 font-bold">
                        ₹{trip.budget.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  {trip.interests && trip.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {trip.interests.slice(0, 3).map((interest, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800 capitalize"
                        >
                          {interest}
                        </span>
                      ))}
                      {trip.interests.length > 3 && (
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-500">
                          +{trip.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                  <Link href={`/trips/${trip._id}`} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between group-hover:border-teal-500/30 transition-all rounded-xl"
                    >
                      <span>View Full Itinerary</span>
                      <ArrowRight className="h-4 w-4 text-teal-400 transform group-hover:translate-x-1 transition-transform" />
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
