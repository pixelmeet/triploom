'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Calendar, Compass, ArrowRight, Loader2 } from 'lucide-react';

interface District {
  _id: string;
  name: string;
  region: string;
  bestSeason: string;
}

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const res = await fetch('/api/districts');
        if (!res.ok) {
          throw new Error('Failed to fetch districts');
        }
        const data = await res.json();
        setDistricts(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load districts.');
      } finally {
        setLoading(false);
      }
    }
    fetchDistricts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-900 pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              TripLoom
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/itinerary"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all"
            >
              Itinerary Planner
            </Link>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Phase 3: Cached AI
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Page Title */}
        <div className="text-center sm:text-left mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-amber-400 bg-clip-text text-transparent flex items-center justify-center sm:justify-start gap-3">
            <Compass className="h-9 w-9 text-teal-400 animate-pulse" />
            Explore Districts
          </h1>
          <p className="text-slate-400 mt-2 text-lg max-w-2xl">
            Discover the vibrant cultures, historical stepwells, natural sanctuaries, and localized delicacies across Gujarat.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Loader2 className="h-12 w-12 text-teal-500 animate-spin mb-4" />
            <p className="text-slate-400">Loading districts details...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="border border-red-950/50 bg-red-950/20 text-red-200 p-6 rounded-2xl max-w-lg mx-auto mt-10">
            <h3 className="text-lg font-bold text-red-400">Loading Failed</h3>
            <p className="text-slate-300 mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* Districts Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {districts.map((district) => (
              <Link
                key={district._id}
                href={`/districts/${district._id}`}
                className="group relative bg-slate-950/50 hover:bg-slate-950 border border-slate-800/80 hover:border-teal-500/50 rounded-2xl p-6 transition-all duration-350 shadow-xl overflow-hidden flex flex-col justify-between"
              >
                {/* Visual Glow on Hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-500/10 to-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-all duration-500" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900 text-teal-400 border border-slate-800">
                      {district.region}
                    </span>
                    <MapPin className="h-5 w-5 text-slate-600 group-hover:text-teal-400 transition-colors" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-100 group-hover:text-teal-300 transition-colors mb-2">
                    {district.name}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-400 text-sm mt-4">
                    <Calendar className="h-4 w-4 text-amber-500/70" />
                    <span>Best time: <strong className="text-slate-200 font-medium">{district.bestSeason}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 group-hover:text-teal-300 transition-colors mt-6 pt-4 border-t border-slate-900">
                  <span>Explore District</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
