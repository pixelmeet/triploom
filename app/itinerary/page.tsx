'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Utensils, 
  Gem, 
  Loader2, 
  AlertCircle, 
  BookmarkCheck,
  ArrowRight
} from 'lucide-react';

interface District {
  _id: string;
  name: string;
  region: string;
}

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

interface ItineraryData {
  _id?: string;
  itinerary: ItineraryDay[];
  totalEstimatedCost: number;
}

const INTERESTS_OPTIONS = [
  { id: 'heritage', label: 'Heritage & Palaces' },
  { id: 'nature', label: 'Nature & Scenic Views' },
  { id: 'wildlife', label: 'Wildlife & Safari' },
  { id: 'spiritual', label: 'Spiritual & Temples' },
  { id: 'adventure', label: 'Adventure & Trekking' },
  { id: 'food', label: 'Food & Culinary' },
  { id: 'architecture', label: 'Architecture & Stepwells' },
  { id: 'history', label: 'History & Gandhi Heritage' }
];

function TypeIcon({ type }: { type: string }) {
  if (type === 'food') return <Utensils className="h-4 w-4" />;
  if (type === 'hidden_gem') return <Gem className="h-4 w-4" />;
  return <MapPin className="h-4 w-4" />;
}

function typeBadgeColor(type: string): string {
  if (type === 'food') return 'text-madder-red border-madder-red/20 bg-madder-red/5';
  if (type === 'hidden_gem') return 'text-indigo-deep border-indigo-deep/20 bg-indigo-deep/5';
  return 'text-indigo-deep border-indigo-deep/20 bg-indigo-deep/5';
}

export default function ItineraryPage() {
  const { data: session } = useSession();
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(15000);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ItineraryData | null>(null);

  // Fetch districts on mount
  useEffect(() => {
    async function loadDistricts() {
      try {
        const response = await fetch('/api/districts');
        if (response.ok) {
          const data = await response.json();
          setDistricts(data);
          if (data.length > 0) {
            setSelectedDistrict(data[0].name);
          }
        } else {
          console.error('Failed to load districts');
        }
      } catch (err) {
        console.error('Error loading districts:', err);
      }
    }
    loadDistricts();
  }, []);

  const handleInterestToggle = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days,
          budget,
          interests: selectedInterests.length > 0 ? selectedInterests : ['General'],
          startDistrict: selectedDistrict,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Couldn\'t generate itinerary — try again in a moment.');
      }

      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 pb-20 animate-fadeSlideIn">
      {/* Page Title */}
      <div className="text-center sm:text-left mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-iron-black">
          Trip Planner
        </h1>
        <p className="text-iron-black/60 mt-2 text-base max-w-2xl">
          Set your destination, duration, budget, and interests. The itinerary is built from verified district data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Planner Form */}
        <div className="lg:col-span-5 border border-desert-dust rounded-lg p-5 sm:p-6 bg-white">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-iron-black">
            <Calendar className="h-5 w-5 text-indigo-deep" /> Plan your trip
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Destination Dropdown */}
            <div>
              <label htmlFor="start-district-select" className="block text-sm font-semibold text-iron-black/70 mb-2">
                Destination district
              </label>
              <select
                id="start-district-select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-white border border-desert-dust rounded-md px-4 py-2.5 text-iron-black focus:outline-none focus:border-indigo-deep transition-colors text-sm"
                required
              >
                {districts.map((d) => (
                  <option key={d._id} value={d.name}>
                    {d.name} ({d.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Days */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="days-input" className="text-sm font-semibold text-iron-black/70">
                  Duration
                </label>
                <span className="text-sm font-bold text-indigo-deep font-data">{days} days</span>
              </div>
              <input
                type="range"
                id="days-input"
                min="1"
                max="14"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full h-2 bg-dust-lighter rounded-sm appearance-none cursor-pointer focus:outline-none"
              />
              <div className="flex justify-between text-xs text-iron-black/40 mt-1 font-data">
                <span>1</span>
                <span>14</span>
              </div>
            </div>

            {/* Budget Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="budget-input" className="text-sm font-semibold text-iron-black/70">
                  Budget limit (INR)
                </label>
                <span className="text-sm font-bold text-indigo-deep font-data">₹{budget.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                id="budget-input"
                min="2000"
                max="100000"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full h-2 bg-dust-lighter rounded-sm appearance-none cursor-pointer focus:outline-none"
              />
              <div className="flex justify-between text-xs text-iron-black/40 mt-1 font-data">
                <span>₹2,000</span>
                <span>₹1,00,000</span>
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-semibold text-iron-black/70 mb-3">
                Interests
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INTERESTS_OPTIONS.map((interest) => {
                  const isChecked = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      id={`interest-${interest.id}`}
                      onClick={() => handleInterestToggle(interest.id)}
                      className={`flex items-center text-left px-3 py-2 rounded-md border text-sm transition-colors select-none cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-deep/10 border-indigo-deep text-indigo-deep'
                          : 'bg-white border-desert-dust text-iron-black/60 hover:border-desert-dust hover:text-iron-black/70'
                      }`}
                    >
                      <span className="flex-1 font-medium text-xs">{interest.label}</span>
                      {isChecked && <div className="h-1.5 w-1.5 rounded-full bg-indigo-deep ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              id="submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-deep text-resist-white font-bold hover:bg-indigo-hover py-5 rounded-md flex items-center justify-center gap-2 cursor-pointer transition-colors border-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating itinerary...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Generate Itinerary
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-5">
          {/* Initial State */}
          {!loading && !error && !result && (
            <div className="border border-dashed border-desert-dust rounded-lg py-20 px-6 text-center bg-white">
              <div className="mx-auto h-10 w-10 rounded-md bg-dust-lighter flex items-center justify-center mb-4">
                <Calendar className="h-5 w-5 text-iron-black/30" />
              </div>
              <h3 className="text-base font-bold text-iron-black/70">Your itinerary will appear here</h3>
              <p className="text-iron-black/40 max-w-sm mx-auto mt-2 text-sm">
                Set your destination, dates, and interests, then generate.
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="border border-desert-dust rounded-lg p-8 bg-white flex flex-col items-center justify-center py-24 text-center">
              <div className="jali-divider-indigo w-32 animate-jaliResolve mb-6" />
              <h3 className="text-lg font-bold text-iron-black">Building your itinerary</h3>
              <p className="text-iron-black/50 text-sm max-w-xs mt-2">
                This takes a few seconds.
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="border border-madder-red/30 bg-madder-red/5 text-madder-red p-5 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold">Couldn&apos;t generate itinerary</h3>
                <p className="text-iron-black/60 mt-1 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-5">
              {/* Saved Banner */}
              {result._id && (
                <div className="bg-indigo-deep/5 border border-indigo-deep/20 rounded-lg p-4 flex items-center justify-between gap-4 text-indigo-deep">
                  <div className="flex items-center gap-3">
                    <BookmarkCheck className="h-5 w-5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">Itinerary saved</h4>
                      <p className="text-xs text-iron-black/50">You can view and rename this trip anytime.</p>
                    </div>
                  </div>
                  <Link href={`/trips/${result._id}`}>
                    <Button size="sm" className="bg-indigo-deep hover:bg-indigo-hover text-resist-white font-bold rounded-md text-xs flex items-center gap-1 shrink-0">
                      View in My Trips <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              )}

              {!session?.user && (
                <div className="bg-dust-lighter border border-desert-dust rounded-lg p-4 flex items-center justify-between gap-4 text-iron-black/60 text-xs">
                  <span>Sign in to save this itinerary.</span>
                  <Link href="/login?callbackUrl=/itinerary">
                    <Button size="sm" variant="outline" className="rounded-md text-xs">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}

              {/* Cost Summary */}
              <div className="border border-desert-dust rounded-lg p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-indigo-deep/10 flex items-center justify-center border border-indigo-deep/15 text-indigo-deep">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-iron-black/50">Estimated total cost</h4>
                    <p className="text-2xl font-extrabold text-indigo-deep font-data">
                      ₹{result.totalEstimatedCost.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-iron-black/50 border-t sm:border-t-0 sm:border-l border-desert-dust pt-3 sm:pt-0 sm:pl-5 w-full sm:w-auto font-data">
                  <div>District: <strong className="text-iron-black/70">{selectedDistrict}</strong></div>
                  <div>Budget: <strong className="text-iron-black/70">₹{budget.toLocaleString('en-IN')}</strong></div>
                </div>
              </div>

              {/* Day Cards */}
              <div className="space-y-5">
                {result.itinerary.map((dayPlan) => (
                  <div key={dayPlan.day} className="border border-desert-dust rounded-lg overflow-hidden bg-white">
                    {/* Day Header */}
                    <div className="bg-dust-lighter px-5 py-3 border-b border-desert-dust/60 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-sm bg-indigo-deep text-resist-white flex items-center justify-center text-xs font-bold">
                          {dayPlan.day}
                        </span>
                        <h3 className="text-sm font-bold text-iron-black">
                          Day {dayPlan.day} — {dayPlan.district}
                        </h3>
                      </div>
                      <span className="text-xs font-medium text-iron-black/50 font-data">
                        ₹{dayPlan.dailyEstimatedCost}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="p-5 space-y-4">
                      {dayPlan.items.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="relative flex gap-3 pb-4 last:pb-0 last:border-none border-b border-desert-dust/30"
                        >
                          {idx < dayPlan.items.length - 1 && (
                            <div className="absolute top-7 left-3.5 bottom-0 w-px bg-desert-dust/40 -translate-x-1/2" />
                          )}

                          <div className={`h-7 w-7 rounded-sm flex items-center justify-center shrink-0 mt-0.5 ${typeBadgeColor(item.type)}`}>
                            <TypeIcon type={item.type} />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-iron-black/40 font-data">
                                  {item.time}
                                </span>
                                <h4 className="font-bold text-iron-black text-sm">
                                  {item.name}
                                </h4>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm border uppercase tracking-wider ${typeBadgeColor(item.type)}`}>
                                  {item.type.replace('_', ' ')}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-indigo-deep font-data">
                                ₹{item.estimatedCost}
                              </span>
                            </div>
                            <p className="text-sm text-iron-black/60 leading-relaxed">
                              {item.notes}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
