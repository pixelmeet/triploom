'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  MapPin,
  Calendar,
  Compass,
  ArrowLeft,
  Loader2,
  Utensils,
  Gem,
  Camera,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  PartyPopper,
  CalendarDays,
  X,
  ShieldAlert,
  PhoneCall,
  ShieldCheck
} from 'lucide-react';

interface District {
  _id: string;
  name: string;
  region: string;
  bestSeason: string;
}

interface Attraction {
  _id: string;
  name: string;
  type: string;
  tags: string[];
  description: string;
}

interface FoodItem {
  _id: string;
  name: string;
  type: 'veg' | 'non-veg' | 'street' | 'restaurant';
  description: string;
  priceRange: string;
  aiBlurb?: string;
}

interface HiddenGem {
  _id: string;
  name: string;
  tags: string[];
  description: string;
  reason?: string;
}

interface WeatherData {
  tempC: number;
  condition: string;
  humidity: number;
  windSpeedKmh: number;
}

interface FestivalItem {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  suggestion?: string;
}

interface EmergencyContact {
  label: string;
  number: string;
}

interface SafetyData {
  emergencyContacts: EmergencyContact[];
  guidelines: string[];
}

const INTERESTS_OPTIONS = [
  { id: 'heritage', label: 'Heritage & Palaces' },
  { id: 'nature', label: 'Nature & Scenic Views' },
  { id: 'wildlife', label: 'Wildlife & Safari' },
  { id: 'spiritual', label: 'Spiritual & Temples' },
  { id: 'adventure', label: 'Adventure & Trekking' },
  { id: 'food', label: 'Food & Culinary Experiences' },
  { id: 'architecture', label: 'Architecture & Stepwells' },
  { id: 'history', label: 'History & Gandhi Heritage' },
];

export default function DistrictDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [district, setDistrict] = useState<District | null>(null);
  const [overview, setOverview] = useState<string | null>(null);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [hiddenGems, setHiddenGems] = useState<HiddenGem[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherAdvice, setWeatherAdvice] = useState<string | null>(null);

  const [festivals, setFestivals] = useState<FestivalItem[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [safetyData, setSafetyData] = useState<SafetyData | null>(null);

  // Loaders
  const [loadingDistrict, setLoadingDistrict] = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingAttractions, setLoadingAttractions] = useState(true);
  const [loadingFood, setLoadingFood] = useState(true);
  const [loadingGems, setLoadingGems] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingFestivals, setLoadingFestivals] = useState(true);
  const [loadingSafety, setLoadingSafety] = useState(true);

  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [festivalError, setFestivalError] = useState<string | null>(null);
  const [safetyError, setSafetyError] = useState<string | null>(null);

  // Actions
  const [regenerating, setRegenerating] = useState(false);
  const [regenSuccess, setRegenSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch basic district detail by loading all districts and filtering
  useEffect(() => {
    if (!id) return;
    async function loadDistrict() {
      try {
        setLoadingDistrict(true);
        const res = await fetch('/api/districts');
        if (!res.ok) throw new Error('Failed to load districts list');
        const data: District[] = await res.json();
        const found = data.find((d) => d._id === id);
        if (!found) {
          setError('District not found.');
        } else {
          setDistrict(found);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to connect to database.');
      } finally {
        setLoadingDistrict(false);
      }
    }
    loadDistrict();
  }, [id]);

  // Fetch AI Overview (Cached on load)
  useEffect(() => {
    if (!id) return;
    async function loadOverview() {
      try {
        setLoadingOverview(true);
        const res = await fetch(`/api/districts/${id}/overview`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch overview');
        setOverview(data.overview);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingOverview(false);
      }
    }
    loadOverview();
  }, [id]);

  // Fetch Attractions
  useEffect(() => {
    if (!id) return;
    async function loadAttractions() {
      try {
        setLoadingAttractions(true);
        const res = await fetch(`/api/districts/${id}/attractions`);
        if (!res.ok) throw new Error('Failed to fetch attractions');
        const data = await res.json();
        setAttractions(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingAttractions(false);
      }
    }
    loadAttractions();
  }, [id]);

  // Fetch Food Recommendations
  useEffect(() => {
    if (!id) return;
    async function loadFood() {
      try {
        setLoadingFood(true);
        const res = await fetch(`/api/districts/${id}/food`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch food recommendations');
        setFoods(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingFood(false);
      }
    }
    loadFood();
  }, [id]);

  // Fetch Hidden Gems - Dynamic based on active interests
  useEffect(() => {
    if (!id) return;
    async function loadGems() {
      try {
        setLoadingGems(true);
        const queryStr =
          selectedInterests.length > 0 ? `?interests=${selectedInterests.join(',')}` : '';
        const res = await fetch(`/api/districts/${id}/hidden-gems${queryStr}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch hidden gems');
        setHiddenGems(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingGems(false);
      }
    }
    loadGems();
  }, [id, selectedInterests]);

  // Fetch Weather & AI Advice
  useEffect(() => {
    if (!id) return;
    async function loadWeather() {
      try {
        setLoadingWeather(true);
        setWeatherError(null);
        const res = await fetch(`/api/districts/${id}/weather`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Weather info unavailable right now');
        }
        setWeatherData(data.weather);
        setWeatherAdvice(data.advice);
      } catch (err: any) {
        console.error('Weather load error:', err);
        setWeatherError('Weather info unavailable right now');
      } finally {
        setLoadingWeather(false);
      }
    }
    loadWeather();
  }, [id]);

  // Fetch Festivals (Default list + optional date range match)
  useEffect(() => {
    if (!id) return;
    async function loadFestivals() {
      try {
        setLoadingFestivals(true);
        setFestivalError(null);
        let url = `/api/districts/${id}/festivals`;
        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch festival data');
        }
        setFestivals(data);
      } catch (err: any) {
        console.error('Festival load error:', err);
        setFestivalError(err?.message || 'Failed to fetch festival data');
      } finally {
        setLoadingFestivals(false);
      }
    }
    loadFestivals();
  }, [id, startDate, endDate]);

  // Fetch Safety Info
  useEffect(() => {
    if (!id) return;
    async function loadSafety() {
      try {
        setLoadingSafety(true);
        setSafetyError(null);
        const res = await fetch(`/api/districts/${id}/safety`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch safety info');
        }
        setSafetyData(data);
      } catch (err: any) {
        console.error('Safety load error:', err);
        setSafetyError(err?.message || 'Failed to fetch safety info');
      } finally {
        setLoadingSafety(false);
      }
    }
    loadSafety();
  }, [id]);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId) ? prev.filter((i) => i !== interestId) : [...prev, interestId]
    );
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setRegenSuccess(false);
    setError(null);
    try {
      // Parallel force regeneration for overview and food
      const [overviewRes, foodRes] = await Promise.all([
        fetch(`/api/districts/${id}/overview?force=true`),
        fetch(`/api/districts/${id}/food?force=true`),
      ]);

      const overviewData = await overviewRes.json();
      const foodData = await foodRes.json();

      if (!overviewRes.ok) {
        throw new Error(overviewData.error || 'Failed to regenerate overview');
      }
      if (!foodRes.ok) {
        throw new Error(foodData.error || 'Failed to regenerate food recommendations');
      }

      setOverview(overviewData.overview);
      setFoods(foodData);
      setRegenSuccess(true);
      setTimeout(() => setRegenSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message || 'Regeneration failed. Rate limit or server error occurred.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loadingDistrict) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error && !district) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-400">Error Loading District</h2>
        <p className="text-slate-400 mt-2 text-sm max-w-md text-center">{error}</p>
        <Link href="/districts" className="mt-6 text-sm text-teal-400 hover:underline">
          Back to districts directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-20">
      <div className="mb-6">
        <Link href="/districts" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Districts
        </Link>
      </div>

      {/* Main Container */}
      <main>
        {/* District Detail Hero Card */}
        <div className="relative bg-slate-950/40 border border-slate-800 rounded-3xl p-8 mb-10 overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-teal-400 border border-slate-800 uppercase tracking-wider">
                {district?.region} Region
              </span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5 text-amber-500/80" />
                <span>Best: {district?.bestSeason}</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              {district?.name}
            </h1>
          </div>

          <button
            id="regen-ai-btn"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="shrink-0 bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-950 text-slate-300 font-bold px-5 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md transition-all text-sm disabled:opacity-50"
          >
            {regenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
                Regenerating Cache...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 text-teal-400" />
                Regenerate AI Content
              </>
            )}
          </button>
        </div>

        {/* Action Alerts */}
        {regenSuccess && (
          <div className="bg-emerald-950/20 border border-emerald-900/50 text-emerald-200 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold">Successfully regenerated and cached district AI content in MongoDB.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-950/20 border border-red-900/50 text-red-200 px-6 py-4 rounded-2xl mb-8 flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-400">Regeneration Failed</h4>
              <p className="text-slate-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Weather, Safety, Festivals, Overview & Foods (7 columns) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Live Weather & AI Advice Section */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                  <CloudSun className="h-5 w-5 text-sky-400" /> Current Weather & Advice
                </h2>
                {!loadingWeather && !weatherError && (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-sky-950/60 text-sky-400 border border-sky-800/60">
                    Live Data
                  </span>
                )}
              </div>

              {loadingWeather ? (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-slate-900/60 border border-slate-800/60 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                  <div className="h-16 bg-slate-900/60 border border-slate-800/60 rounded-2xl animate-pulse" />
                </div>
              ) : weatherError ? (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 text-slate-400 text-sm flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-slate-500 shrink-0" />
                  <span>Weather info unavailable right now</span>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Weather Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <Thermometer className="h-3.5 w-3.5 text-amber-400" /> Temp
                      </div>
                      <div className="text-xl font-extrabold text-white mt-1">
                        {weatherData?.tempC}°C
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <CloudSun className="h-3.5 w-3.5 text-sky-400" /> Condition
                      </div>
                      <div className="text-sm font-bold text-slate-200 mt-1 capitalize truncate">
                        {weatherData?.condition}
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <Droplets className="h-3.5 w-3.5 text-blue-400" /> Humidity
                      </div>
                      <div className="text-xl font-extrabold text-white mt-1">
                        {weatherData?.humidity}%
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <Wind className="h-3.5 w-3.5 text-teal-400" /> Wind
                      </div>
                      <div className="text-xl font-extrabold text-white mt-1">
                        {weatherData?.windSpeedKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Weather Advice Narrative */}
                  {weatherAdvice && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-sky-400" /> Smart Travel Advice
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed font-light">
                        {weatherAdvice}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Safety Info & Emergency Contacts Section */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                  <ShieldAlert className="h-5 w-5 text-rose-400" /> Safety Info & Emergency Contacts
                </h2>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/60">
                  Verified Guidelines
                </span>
              </div>

              {loadingSafety ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-rose-400 animate-spin" />
                  <p className="text-xs text-slate-500 mt-2">Loading safety contacts & guidelines...</p>
                </div>
              ) : safetyError ? (
                <div className="bg-red-950/20 border border-red-900/50 text-red-300 p-4 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{safetyError}</span>
                </div>
              ) : !safetyData || (safetyData.emergencyContacts.length === 0 && safetyData.guidelines.length === 0) ? (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-400 text-sm italic">
                  No safety data available yet
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Emergency Contacts Cards */}
                  {safetyData.emergencyContacts.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Emergency Contacts (Direct Seeded)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {safetyData.emergencyContacts.map((contact, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-900/80 border border-rose-950/50 hover:border-rose-900/80 rounded-2xl p-4 flex flex-col justify-between space-y-2 transition-colors"
                          >
                            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                              <PhoneCall className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{contact.label}</span>
                            </div>
                            <div className="text-base font-extrabold text-white tracking-wide">
                              {contact.number}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safety Guidelines List */}
                  {safetyData.guidelines.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Travel & Safety Guidelines
                      </h3>
                      <div className="space-y-2.5">
                        {safetyData.guidelines.map((guideline, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-300 leading-relaxed"
                          >
                            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{guideline}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Festivals & Events Section */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                  <PartyPopper className="h-5 w-5 text-purple-400" /> Festivals & Event Matching
                </h2>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-purple-950/60 text-purple-400 border border-purple-800/60">
                  Seeded Data & AI Match
                </span>
              </div>

              {/* Date Filter Bar */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6">
                <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-purple-400" />
                  <span>Check Trip Dates for Festival Matches & Insights:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div>
                    <label htmlFor="festival-start-date" className="block text-[11px] font-medium text-slate-400 mb-1">
                      Start Date
                    </label>
                    <Input
                      id="festival-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-slate-200 text-xs focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="festival-end-date" className="block text-[11px] font-medium text-slate-400 mb-1">
                      End Date
                    </label>
                    <Input
                      id="festival-end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-slate-200 text-xs focus:ring-purple-500"
                    />
                  </div>
                </div>
                {(startDate || endDate) && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" /> Clear Date Filter
                    </button>
                  </div>
                )}
              </div>

              {/* Festivals List */}
              {loadingFestivals ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                  <p className="text-xs text-slate-500 mt-2">Checking festival calendar...</p>
                </div>
              ) : festivalError ? (
                <div className="bg-red-950/20 border border-red-900/50 text-red-300 p-4 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{festivalError}</span>
                </div>
              ) : festivals.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-400 text-sm italic">
                  No festival data available yet
                </div>
              ) : (
                <div className="space-y-4">
                  {festivals.map((fest) => {
                    const startFmt = new Date(fest.startDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC',
                    });
                    const endFmt = new Date(fest.endDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC',
                    });

                    return (
                      <div
                        key={fest._id}
                        className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-slate-100">{fest.name}</h3>
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0 self-start sm:self-auto">
                            <Calendar className="h-3.5 w-3.5 text-purple-400" />
                            <span>{startFmt} – {endFmt}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-light">
                          {fest.description}
                        </p>

                        {fest.suggestion && (
                          <div className="mt-3 pt-3 border-t border-purple-900/40 bg-purple-950/30 border border-purple-800/50 rounded-xl p-3 text-xs text-purple-200 leading-relaxed">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1">
                              <Sparkles className="h-3.5 w-3.5 text-purple-400" /> AI Itinerary & Visit Impact:
                            </div>
                            {fest.suggestion}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Overview Section */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-100">
                <Sparkles className="h-5 w-5 text-teal-400" /> AI Insights Overview
              </h2>
              {loadingOverview ? (
                <div className="space-y-3 py-4">
                  <div className="h-4 bg-slate-800 rounded w-full animate-pulse" />
                  <div className="h-4 bg-slate-800 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-slate-800 rounded w-4/5 animate-pulse" />
                </div>
              ) : (
                <p className="text-slate-300 text-base leading-relaxed font-light">
                  {overview || 'No AI overview generated yet. Click Regenerate to build one.'}
                </p>
              )}
            </div>

            {/* Food Recommendations Section */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">
                <Utensils className="h-5 w-5 text-amber-500" /> Culinary Recommendations
              </h2>

              {loadingFood ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                  <p className="text-xs text-slate-500 mt-2">Curating delicacies...</p>
                </div>
              ) : foods.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No food specialties listed for this district.</p>
              ) : (
                <div className="space-y-6">
                  {foods.map((food) => (
                    <div
                      key={food._id}
                      className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start gap-4 transition-colors"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-200">{food.name}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-800 bg-slate-950 text-slate-400 uppercase tracking-wider">
                            {food.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                          Base: {food.description}
                        </p>
                        {food.aiBlurb && (
                          <div className="mt-2.5 pt-2.5 border-t border-slate-800/50 text-sm text-amber-400/90 leading-relaxed">
                            <strong className="text-xs uppercase text-amber-500/80 tracking-wider block mb-1">AI Curated Insight:</strong>
                            {food.aiBlurb}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-xs font-extrabold text-amber-400 bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-lg">
                        {food.priceRange}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Attractions & Hidden Gems (5 columns) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Major Attractions Section */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-slate-100">
                <Camera className="h-5 w-5 text-blue-400" /> Major Attractions
              </h2>

              {loadingAttractions ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                  <p className="text-xs text-slate-500 mt-2">Loading landmarks...</p>
                </div>
              ) : attractions.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No major attractions listed.</p>
              ) : (
                <div className="space-y-4">
                  {attractions.map((attr) => (
                    <div
                      key={attr._id}
                      className="border border-slate-900 bg-slate-900/40 hover:bg-slate-900/60 p-4 rounded-xl space-y-2 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-200 text-sm">{attr.name}</h4>
                        <span className="text-[9px] font-extrabold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-wider shrink-0">
                          {attr.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{attr.description}</p>
                      {attr.tags && attr.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {attr.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] text-slate-500 bg-slate-950/60 border border-slate-800/80 px-1.5 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hidden Gems Section */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-100">
                <Gem className="h-5 w-5 text-purple-400 animate-pulse" /> Hidden Gems
              </h2>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Rank these secret local gems by selecting interest tags to align the priorities to your preferences.
              </p>

              {/* Interests Tags Filter */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {INTERESTS_OPTIONS.map((tag) => {
                  const active = selectedInterests.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleInterestToggle(tag.id)}
                      className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${
                        active
                          ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-md shadow-purple-500/5'
                          : 'bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-350'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>

              {loadingGems ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                  <p className="text-xs text-slate-500 mt-2">Ranking gems...</p>
                </div>
              ) : hiddenGems.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No secret gems found.</p>
              ) : (
                <div className="space-y-4">
                  {hiddenGems.map((gem, index) => (
                    <div
                      key={gem._id}
                      className="border border-slate-900 bg-slate-900/40 hover:bg-slate-900/60 p-4 rounded-xl space-y-2 transition-colors relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold h-5 w-5 bg-slate-950 text-purple-400 border border-slate-800 flex items-center justify-center rounded">
                            {index + 1}
                          </span>
                          <h4 className="font-bold text-slate-200 text-sm">{gem.name}</h4>
                        </div>
                      </div>
                      <p className="text-xs text-slate-450 leading-relaxed">{gem.description}</p>
                      
                      {gem.reason && selectedInterests.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-800/50 text-[11px] text-purple-400 italic bg-purple-500/5 p-2 rounded-lg leading-relaxed">
                          <strong className="text-[9px] uppercase font-bold text-purple-500 block mb-0.5">Relevance match:</strong>
                          {gem.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
