'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Sparkles, 
  MapPin, 
  Utensils, 
  Gem, 
  Loader2, 
  AlertCircle, 
  Coins, 
  Edit3, 
  Check, 
  X, 
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ItineraryItem {
  time: string;
  name: string;
  type: 'attraction' | 'food' | 'hidden_gem';
  estimatedCost: number;
  notes: string;
}

interface ItineraryDay {
  day: number;
  district: string;
  items: ItineraryItem[];
  dailyEstimatedCost: number;
}

interface ItineraryDetail {
  _id: string;
  userId: string;
  title: string;
  days: ItineraryDay[];
  budget: number;
  interests: string[];
  generatedAt: string;
  status: string;
}

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const tripId = resolvedParams.id;

  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [trip, setTrip] = useState<ItineraryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Editable Title State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push(`/login?callbackUrl=/trips/${tripId}`);
    }
  }, [sessionStatus, router, tripId]);

  useEffect(() => {
    async function loadTrip() {
      if (sessionStatus !== 'authenticated') return;
      try {
        const res = await fetch(`/api/itinerary/${tripId}`);
        setStatusCode(res.status);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to load itinerary.');
        }

        const data = await res.json();
        setTrip(data);
        setTitleInput(data.title);
      } catch (err: any) {
        setError(err?.message || 'Failed to load itinerary.');
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [sessionStatus, tripId]);

  const handleSaveTitle = async () => {
    if (!titleInput.trim() || !trip) return;
    setSavingTitle(true);
    try {
      const res = await fetch(`/api/itinerary/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleInput.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update title.');
      }

      const updated = await res.json();
      setTrip(updated);
      setIsEditingTitle(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to update trip title.');
    } finally {
      setSavingTitle(false);
    }
  };

  if (sessionStatus === 'loading' || (sessionStatus === 'authenticated' && loading)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
        <Loader2 className="h-12 w-12 text-teal-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading itinerary details...</p>
      </div>
    );
  }

  if (error || statusCode === 403 || statusCode === 404) {
    return (
      <div className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="border border-red-950/50 bg-red-950/20 text-red-300 p-8 rounded-2xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            {statusCode === 403 ? 'Access Forbidden' : statusCode === 404 ? 'Trip Not Found' : 'Error'}
          </h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <Link href="/trips">
            <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-200">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Trips
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const totalCost = trip.days.reduce((acc, day) => acc + (day.dailyEstimatedCost || 0), 0);

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Navigation breadcrumb */}
      <div className="mb-6">
        <Link href="/trips" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to My Trips
        </Link>
      </div>

      {/* Trip Header / Title Edit */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 max-w-lg">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="bg-slate-900 border border-teal-500 rounded-xl px-4 py-2 text-xl font-bold text-slate-100 focus:outline-none w-full"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleSaveTitle}
                  disabled={savingTitle}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl"
                >
                  {savingTitle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditingTitle(false);
                    setTitleInput(trip.title);
                  }}
                  className="border-slate-800 bg-slate-900 text-slate-400 hover:text-white rounded-xl"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-slate-100 to-amber-400 bg-clip-text text-transparent">
                  {trip.title}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-teal-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
                  title="Edit title"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3">
              <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                <Calendar className="h-3.5 w-3.5 text-teal-400" />
                Created {new Date(trip.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                {trip.days.length} Days Duration
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Total Estimated Cost</span>
                <span className="text-2xl font-extrabold text-amber-400">
                  ₹{totalCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4 text-xs text-slate-400">
              <div>Budget Limit: <strong className="text-slate-200">₹{trip.budget.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Day by Day Cards Display */}
      <div className="space-y-6">
        {trip.days.map((dayPlan) => (
          <div key={dayPlan.day} className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {/* Day Header */}
            <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center text-sm font-bold border border-teal-500/20">
                  {dayPlan.day}
                </span>
                <h3 className="text-lg font-bold text-slate-100">
                  Day {dayPlan.day} — {dayPlan.district}
                </h3>
              </div>
              <span className="text-sm font-semibold text-slate-400">
                Day Cost: <strong className="text-amber-400">₹{dayPlan.dailyEstimatedCost}</strong>
              </span>
            </div>

            {/* Items List */}
            <div className="p-6 space-y-6">
              {dayPlan.items.map((item, idx) => {
                let Icon = MapPin;
                let typeBadgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                if (item.type === 'food') {
                  Icon = Utensils;
                  typeBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                } else if (item.type === 'hidden_gem') {
                  Icon = Gem;
                  typeBadgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                }

                return (
                  <div 
                    key={idx} 
                    className="relative flex gap-4 pb-6 last:pb-0 last:border-none border-b border-slate-800/50"
                  >
                    {idx < dayPlan.items.length - 1 && (
                      <div className="absolute top-8 left-4 bottom-0 w-0.5 bg-slate-800/80 -translate-x-1/2" />
                    )}

                    <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-400 mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800/80">
                            {item.time}
                          </span>
                          <h4 className="font-bold text-slate-200 text-base">
                            {item.name}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${typeBadgeColor}`}>
                            {item.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                          ₹{item.estimatedCost}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {item.notes}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
