'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, MapPin, Calendar, ArrowRight, Loader2 } from 'lucide-react';

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
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 pb-20 animate-fadeSlideIn">
      {/* Page Title */}
      <div className="text-center sm:text-left mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-iron-black flex items-center justify-center sm:justify-start gap-3">
          <Compass className="h-8 w-8 text-indigo-deep" />
          Districts
        </h1>
        <p className="text-iron-black/60 mt-2 text-base max-w-2xl">
          Stepwells, temple towns, wildlife sanctuaries, and street food across Gujarat&apos;s districts.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="jali-divider-indigo w-24 animate-jaliResolve mb-4" />
          <p className="text-iron-black/50">Loading districts...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="border border-madder-red/30 bg-madder-red/5 text-madder-red p-6 rounded-lg max-w-lg mx-auto mt-10">
          <h3 className="text-base font-bold">Couldn&apos;t load districts</h3>
          <p className="text-iron-black/60 mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Districts Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {districts.map((district) => (
            <Link
              key={district._id}
              href={`/districts/${district._id}`}
              className="group border border-desert-dust hover:border-indigo-deep/40 rounded-lg p-5 transition-colors duration-150 bg-white flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-sm bg-dust-lighter text-iron-black/60 border border-desert-dust/60">
                    {district.region}
                  </span>
                  <MapPin className="h-4 w-4 text-desert-dust group-hover:text-indigo-deep transition-colors" />
                </div>

                <h3 className="text-xl font-bold text-iron-black group-hover:text-indigo-deep transition-colors mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  {district.name}
                </h3>

                <div className="flex items-center gap-2 text-iron-black/50 text-sm mt-3">
                  <Calendar className="h-3.5 w-3.5 text-indigo-deep/60" />
                  <span>Best time: <strong className="text-iron-black/70 font-medium">{district.bestSeason}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-deep group-hover:text-indigo-light transition-colors mt-5 pt-4 border-t border-desert-dust/40">
                <span>View district</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
