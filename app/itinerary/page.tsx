'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Utensils, 
  Gem, 
  Loader2, 
  AlertCircle, 
  Coins, 
  Heart,
  TrendingUp
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
  itinerary: ItineraryDay[];
  totalEstimatedCost: number;
}

const INTERESTS_OPTIONS = [
  { id: 'heritage', label: 'Heritage & Palaces' },
  { id: 'nature', label: 'Nature & Scenic Views' },
  { id: 'wildlife', label: 'Wildlife & Safari' },
  { id: 'spiritual', label: 'Spiritual & Temples' },
  { id: 'adventure', label: 'Adventure & Trekking' },
  { id: 'food', label: 'Food & Culinary Experiences' },
  { id: 'architecture', label: 'Architecture & Stepwells' },
  { id: 'history', label: 'History & Gandhi Heritage' }
];

export default function ItineraryPage() {
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
        throw new Error(data.error || 'Failed to generate itinerary. Please try again.');
      }

      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-900 pb-20">
      {/* Header / Hero */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Sparkles className="h-5 w-5 text-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              TripLoom
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Phase 2: AI Generation
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Page Title */}
        <div className="text-center sm:text-left mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-amber-400 bg-clip-text text-transparent">
            AI Itinerary Generator
          </h1>
          <p className="text-slate-400 mt-2 text-lg max-w-2xl">
            Design your perfect curated trip across Gujarat. Powered by verified local data and shaped by AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Planner Form - 5 Columns */}
          <div className="lg:col-span-5 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-200">
              <Calendar className="h-5 w-5 text-teal-400" /> Plan Your Trip
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Destination Dropdown */}
              <div>
                <label htmlFor="start-district-select" className="block text-sm font-semibold text-slate-300 mb-2">
                  Destination District
                </label>
                <select
                  id="start-district-select"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
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
                  <label htmlFor="days-input" className="text-sm font-semibold text-slate-300">
                    Duration (Days)
                  </label>
                  <span className="text-sm font-bold text-teal-400">{days} Days</span>
                </div>
                <input
                  type="range"
                  id="days-input"
                  min="1"
                  max="14"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1 Day</span>
                  <span>14 Days</span>
                </div>
              </div>

              {/* Budget Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="budget-input" className="text-sm font-semibold text-slate-300">
                    Budget Limit (INR)
                  </label>
                  <span className="text-sm font-bold text-amber-400">₹{budget.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  id="budget-input"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>₹2,000</span>
                  <span>₹1,00,000</span>
                </div>
              </div>

              {/* Interests Multi-Select Checkboxes */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Interests (Select all that apply)
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
                        className={`flex items-center text-left px-3.5 py-2.5 rounded-xl border text-sm transition-all select-none ${
                          isChecked
                            ? 'bg-teal-500/10 border-teal-500 text-teal-400 shadow-md shadow-teal-500/5'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <span className="flex-1 font-medium">{interest.label}</span>
                        {isChecked && <div className="h-1.5 w-1.5 rounded-full bg-teal-400 ml-2" />}
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
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold hover:from-teal-400 hover:to-emerald-400 py-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/10 transition-all border-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Weaving Itinerary...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate AI Itinerary
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Results Panel - 7 Columns */}
          <div className="lg:col-span-7 space-y-6">
            {/* Initial State */}
            {!loading && !error && !result && (
              <div className="border border-dashed border-slate-800 rounded-2xl py-24 px-6 text-center bg-slate-950/20">
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-300">No Itinerary Generated Yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
                  Configure your preferences and click the generate button to create a tailored travel plan.
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="border border-slate-800/80 rounded-2xl p-8 bg-slate-950/30 backdrop-blur-sm flex flex-col items-center justify-center py-28 text-center">
                <Loader2 className="h-12 w-12 text-teal-500 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-slate-200">Generating Your Gujarat Experience</h3>
                <p className="text-slate-400 text-sm max-w-xs mt-2 animate-pulse">
                  Analyzing local attractions, secret spots, and popular foods to fit your budget...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="border border-red-950/50 bg-red-950/20 text-red-200 p-6 rounded-2xl flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-red-400">Generation Failed</h3>
                  <p className="text-slate-300 mt-1 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Success Results Display */}
            {result && (
              <div className="space-y-8 animate-fadeIn">
                {/* Cost Summary Banner */}
                <div className="bg-gradient-to-r from-teal-950/40 via-slate-950/80 to-amber-950/20 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400">Estimated Total Cost</h4>
                      <p className="text-2xl font-extrabold text-amber-400">
                        ₹{result.totalEstimatedCost.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:text-right text-xs text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                    <div>Selected District: <strong className="text-slate-200">{selectedDistrict}</strong></div>
                    <div>Target Budget: <strong className="text-slate-200">₹{budget.toLocaleString('en-IN')}</strong></div>
                  </div>
                </div>

                {/* Day by Day Cards */}
                <div className="space-y-6">
                  {result.itinerary.map((dayPlan) => (
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
                          // Icon selector
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
                              {/* Connector line for list */}
                              {idx < dayPlan.items.length - 1 && (
                                <div className="absolute top-8 left-4 bottom-0 w-0.5 bg-slate-800/80 -translate-x-1/2" />
                              )}

                              {/* Item Icon */}
                              <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-400 mt-0.5">
                                <Icon className="h-4 w-4" />
                              </div>

                              {/* Item Details */}
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
