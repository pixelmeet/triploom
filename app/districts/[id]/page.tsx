'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { JaliDivider } from '@/components/JaliDivider';
import {
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
  { id: 'food', label: 'Food & Culinary' },
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
      setError(err?.message || 'Regeneration failed — try again in a moment.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loadingDistrict) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="jali-divider-indigo w-32 animate-jaliResolve" />
      </div>
    );
  }

  if (error && !district) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <AlertCircle className="h-10 w-10 text-madder-red mb-4" />
        <h2 className="text-xl font-bold text-madder-red">Couldn&apos;t load district</h2>
        <p className="text-iron-black/60 mt-2 text-sm max-w-md text-center">{error}</p>
        <Link href="/districts" className="mt-6 text-sm text-indigo-deep hover:underline">
          Back to districts
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-20 animate-fadeSlideIn">
      <div className="mb-6">
        <Link href="/districts" className="inline-flex items-center gap-2 text-sm font-medium text-iron-black/50 hover:text-indigo-deep transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Districts
        </Link>
      </div>

      <main>
        {/* District Hero Card — flat treatment */}
        <div className="border border-desert-dust rounded-lg p-6 sm:p-8 mb-8 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-sm bg-dust-lighter text-iron-black/60 border border-desert-dust/60 uppercase tracking-wider">
                {district?.region} Region
              </span>
              <div className="flex items-center gap-1.5 text-iron-black/50 text-xs font-medium">
                <Calendar className="h-3.5 w-3.5 text-indigo-deep/60" />
                <span>Best: {district?.bestSeason}</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-iron-black">
              {district?.name}
            </h1>
          </div>

          <button
            id="regen-ai-btn"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="shrink-0 border border-desert-dust hover:border-indigo-deep/40 bg-white text-iron-black/70 font-medium px-4 py-2.5 rounded-md flex items-center gap-2 cursor-pointer transition-colors text-sm disabled:opacity-50"
          >
            {regenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-indigo-deep" />
                Refreshing...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 text-indigo-deep" />
                Refresh content
              </>
            )}
          </button>
        </div>

        {/* Action Alerts */}
        {regenSuccess && (
          <div className="bg-indigo-deep/5 border border-indigo-deep/20 text-indigo-deep px-5 py-3 rounded-md mb-6 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Content refreshed and cached.</span>
          </div>
        )}

        {error && (
          <div className="bg-madder-red/5 border border-madder-red/20 text-madder-red px-5 py-3 rounded-md mb-6 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Refresh failed</h4>
              <p className="text-iron-black/60 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (7 cols) */}
          <div className="lg:col-span-7 space-y-0">
            {/* Live Weather Section */}
            <section className="border border-desert-dust rounded-lg p-5 sm:p-6 bg-white">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-bold flex items-center gap-2 text-iron-black">
                  <CloudSun className="h-5 w-5 text-indigo-deep" /> Current weather
                </h2>
                {!loadingWeather && !weatherError && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-indigo-deep/10 text-indigo-deep border border-indigo-deep/15 uppercase tracking-wider">
                    Live
                  </span>
                )}
              </div>

              {loadingWeather ? (
                <div className="space-y-3 py-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-dust-lighter border border-desert-dust/40 rounded-md animate-pulse" />
                    ))}
                  </div>
                  <div className="h-16 bg-dust-lighter border border-desert-dust/40 rounded-md animate-pulse" />
                </div>
              ) : weatherError ? (
                <div className="bg-dust-lighter border border-desert-dust/60 rounded-md p-4 text-iron-black/50 text-sm flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Weather info unavailable right now</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Weather Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="border border-desert-dust/60 rounded-md p-3 bg-dust-lighter/50">
                      <div className="flex items-center gap-1.5 text-iron-black/50 text-xs font-medium">
                        <Thermometer className="h-3.5 w-3.5 text-indigo-deep" /> Temp
                      </div>
                      <div className="text-xl font-extrabold text-iron-black mt-1 font-data">
                        {weatherData?.tempC}°C
                      </div>
                    </div>

                    <div className="border border-desert-dust/60 rounded-md p-3 bg-dust-lighter/50">
                      <div className="flex items-center gap-1.5 text-iron-black/50 text-xs font-medium">
                        <CloudSun className="h-3.5 w-3.5 text-indigo-deep" /> Condition
                      </div>
                      <div className="text-sm font-bold text-iron-black/80 mt-1 capitalize truncate">
                        {weatherData?.condition}
                      </div>
                    </div>

                    <div className="border border-desert-dust/60 rounded-md p-3 bg-dust-lighter/50">
                      <div className="flex items-center gap-1.5 text-iron-black/50 text-xs font-medium">
                        <Droplets className="h-3.5 w-3.5 text-indigo-deep" /> Humidity
                      </div>
                      <div className="text-xl font-extrabold text-iron-black mt-1 font-data">
                        {weatherData?.humidity}%
                      </div>
                    </div>

                    <div className="border border-desert-dust/60 rounded-md p-3 bg-dust-lighter/50">
                      <div className="flex items-center gap-1.5 text-iron-black/50 text-xs font-medium">
                        <Wind className="h-3.5 w-3.5 text-indigo-deep" /> Wind
                      </div>
                      <div className="text-xl font-extrabold text-iron-black mt-1 font-data">
                        {weatherData?.windSpeedKmh} <span className="text-xs font-normal text-iron-black/40">km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* Weather Advice */}
                  {weatherAdvice && (
                    <div className="border border-desert-dust/60 rounded-md p-4 bg-dust-lighter/30">
                      <div className="text-xs font-bold text-indigo-deep uppercase tracking-wider mb-1.5">
                        Travel advice for today
                      </div>
                      <p className="text-iron-black/70 text-sm leading-relaxed">
                        {weatherAdvice}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            <JaliDivider variant="dust" className="my-6" />

            {/* Safety Section */}
            <section className="border border-desert-dust rounded-lg p-5 sm:p-6 bg-white">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-bold flex items-center gap-2 text-iron-black">
                  <ShieldAlert className="h-5 w-5 text-madder-red" /> Safety and emergency contacts
                </h2>
              </div>

              {loadingSafety ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-indigo-deep animate-spin" />
                  <p className="text-xs text-iron-black/40 mt-2">Loading safety info...</p>
                </div>
              ) : safetyError ? (
                <div className="bg-madder-red/5 border border-madder-red/20 text-madder-red p-4 rounded-md text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{safetyError}</span>
                </div>
              ) : !safetyData || (safetyData.emergencyContacts.length === 0 && safetyData.guidelines.length === 0) ? (
                <div className="bg-dust-lighter border border-desert-dust/60 rounded-md p-5 text-center text-iron-black/50 text-sm">
                  No safety data available yet — check back as we add more.
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Emergency Contacts */}
                  {safetyData.emergencyContacts.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-iron-black/50 uppercase tracking-wider">
                        Emergency contacts
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {safetyData.emergencyContacts.map((contact, idx) => (
                          <div
                            key={idx}
                            className="border border-madder-red/20 hover:border-madder-red/40 rounded-md p-3 flex flex-col justify-between space-y-1.5 transition-colors bg-madder-red/3"
                          >
                            <div className="flex items-center gap-2 text-madder-red text-xs font-bold">
                              <PhoneCall className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{contact.label}</span>
                            </div>
                            <div className="text-base font-extrabold text-iron-black font-data tracking-wide">
                              {contact.number}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safety Guidelines */}
                  {safetyData.guidelines.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold text-iron-black/50 uppercase tracking-wider">
                        Travel guidelines
                      </h3>
                      <div className="space-y-2">
                        {safetyData.guidelines.map((guideline, idx) => (
                          <div
                            key={idx}
                            className="border border-desert-dust/60 rounded-md p-3 flex items-start gap-3 text-xs text-iron-black/70 leading-relaxed bg-dust-lighter/30"
                          >
                            <ShieldCheck className="h-4 w-4 text-indigo-deep shrink-0 mt-0.5" />
                            <span>{guideline}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <JaliDivider variant="dust" className="my-6" />

            {/* Festivals Section */}
            <section className="border border-desert-dust rounded-lg p-5 sm:p-6 bg-white">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-bold flex items-center gap-2 text-iron-black">
                  <CalendarDays className="h-5 w-5 text-indigo-deep" /> Festivals and events
                </h2>
              </div>

              {/* Date Filter */}
              <div className="border border-desert-dust/60 rounded-md p-4 mb-5 bg-dust-lighter/30">
                <div className="text-xs font-medium text-iron-black/60 mb-3 flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-indigo-deep" />
                  <span>Check your travel dates for festival matches:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div>
                    <label htmlFor="festival-start-date" className="block text-[11px] font-medium text-iron-black/50 mb-1">
                      Start date
                    </label>
                    <Input
                      id="festival-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="festival-end-date" className="block text-[11px] font-medium text-iron-black/50 mb-1">
                      End date
                    </label>
                    <Input
                      id="festival-end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-xs"
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
                      className="text-xs text-iron-black/50 hover:text-indigo-deep flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" /> Clear dates
                    </button>
                  </div>
                )}
              </div>

              {/* Festivals List */}
              {loadingFestivals ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-indigo-deep animate-spin" />
                  <p className="text-xs text-iron-black/40 mt-2">Checking festival calendar...</p>
                </div>
              ) : festivalError ? (
                <div className="bg-madder-red/5 border border-madder-red/20 text-madder-red p-4 rounded-md text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{festivalError}</span>
                </div>
              ) : festivals.length === 0 ? (
                <div className="bg-dust-lighter border border-desert-dust/60 rounded-md p-5 text-center text-iron-black/50 text-sm">
                  No festival data for this district yet — check back as we add more.
                </div>
              ) : (
                <div className="space-y-3">
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
                        className="border border-desert-dust/60 hover:border-indigo-deep/30 rounded-md p-4 space-y-2 transition-colors bg-white"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-iron-black">{fest.name}</h3>
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-sm bg-indigo-deep/10 text-indigo-deep border border-indigo-deep/15 shrink-0 self-start sm:self-auto font-data">
                            <Calendar className="h-3 w-3" />
                            <span>{startFmt} – {endFmt}</span>
                          </div>
                        </div>

                        <p className="text-xs text-iron-black/60 leading-relaxed">
                          {fest.description}
                        </p>

                        {fest.suggestion && (
                          <div className="mt-2 pt-2 border-t border-desert-dust/40 bg-indigo-deep/5 border border-indigo-deep/15 rounded-md p-3 text-xs text-indigo-deep leading-relaxed">
                            <div className="text-[11px] font-bold uppercase tracking-wider mb-1">
                              How this affects your trip:
                            </div>
                            {fest.suggestion}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <JaliDivider variant="dust" className="my-6" />

            {/* Overview Section */}
            <section className="border border-desert-dust rounded-lg p-5 sm:p-6 bg-white">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-iron-black">
                <Compass className="h-5 w-5 text-indigo-deep" /> Overview
              </h2>
              {loadingOverview ? (
                <div className="space-y-3 py-3">
                  <div className="h-4 bg-dust-lighter rounded w-full animate-pulse" />
                  <div className="h-4 bg-dust-lighter rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-dust-lighter rounded w-4/5 animate-pulse" />
                </div>
              ) : (
                <p className="text-iron-black/70 text-base leading-relaxed">
                  {overview || 'No overview generated yet. Click "Refresh content" to build one.'}
                </p>
              )}
            </section>

            <JaliDivider variant="dust" className="my-6" />

            {/* Local Food Section */}
            <section className="border border-desert-dust rounded-lg p-5 sm:p-6 bg-white">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-iron-black">
                <Utensils className="h-5 w-5 text-madder-red" /> Local food
              </h2>

              {loadingFood ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-indigo-deep animate-spin" />
                  <p className="text-xs text-iron-black/40 mt-2">Loading food data...</p>
                </div>
              ) : foods.length === 0 ? (
                <p className="text-iron-black/50 text-sm">No food specialties listed for this district yet.</p>
              ) : (
                <div className="space-y-4">
                  {foods.map((food) => (
                    <div
                      key={food._id}
                      className="border border-desert-dust/60 hover:border-indigo-deep/30 rounded-md p-4 flex flex-col md:flex-row justify-between items-start gap-3 transition-colors bg-white"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-iron-black">{food.name}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm border border-desert-dust bg-dust-lighter text-iron-black/50 uppercase tracking-wider">
                            {food.type}
                          </span>
                        </div>
                        <p className="text-xs text-iron-black/50 leading-relaxed">
                          {food.description}
                        </p>
                        {food.aiBlurb && (
                          <div className="mt-2 pt-2 border-t border-desert-dust/40 text-sm text-iron-black/70 leading-relaxed">
                            {food.aiBlurb}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-xs font-bold text-indigo-deep bg-indigo-deep/5 border border-indigo-deep/15 px-2.5 py-1 rounded-sm font-data">
                        {food.priceRange}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Attractions */}
            <section className="border border-desert-dust rounded-lg p-5 bg-white">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-iron-black">
                <Camera className="h-5 w-5 text-indigo-deep" /> Attractions
              </h2>

              {loadingAttractions ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-indigo-deep animate-spin" />
                  <p className="text-xs text-iron-black/40 mt-2">Loading attractions...</p>
                </div>
              ) : attractions.length === 0 ? (
                <p className="text-iron-black/50 text-sm">No attractions listed yet.</p>
              ) : (
                <div className="space-y-3">
                  {attractions.map((attr) => (
                    <div
                      key={attr._id}
                      className="border border-desert-dust/60 hover:border-indigo-deep/30 p-3.5 rounded-md space-y-1.5 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-iron-black text-sm">{attr.name}</h4>
                        <span className="text-[9px] font-bold bg-indigo-deep/10 text-indigo-deep px-2 py-0.5 rounded-sm border border-indigo-deep/15 uppercase tracking-wider shrink-0">
                          {attr.type}
                        </span>
                      </div>
                      <p className="text-xs text-iron-black/60 leading-relaxed">{attr.description}</p>
                      {attr.tags && attr.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {attr.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] text-iron-black/40 bg-dust-lighter border border-desert-dust/60 px-1.5 py-0.5 rounded-sm"
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
            </section>

            {/* Lesser-Known Spots */}
            <section className="border border-desert-dust rounded-lg p-5 bg-white">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-iron-black">
                <Gem className="h-5 w-5 text-indigo-deep" /> Lesser-known spots
              </h2>

              <p className="text-xs text-iron-black/50 mb-4 leading-relaxed">
                Select interest tags to rank spots by relevance to your preferences.
              </p>

              {/* Interests Tags Filter */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {INTERESTS_OPTIONS.map((tag) => {
                  const active = selectedInterests.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleInterestToggle(tag.id)}
                      className={`text-[10px] font-medium px-2.5 py-1.5 rounded-sm border transition-colors cursor-pointer select-none ${
                        active
                          ? 'bg-indigo-deep/10 border-indigo-deep text-indigo-deep'
                          : 'bg-dust-lighter border-desert-dust/60 text-iron-black/50 hover:border-desert-dust hover:text-iron-black/70'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>

              {loadingGems ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-indigo-deep animate-spin" />
                  <p className="text-xs text-iron-black/40 mt-2">Ranking spots...</p>
                </div>
              ) : hiddenGems.length === 0 ? (
                <p className="text-iron-black/50 text-sm">No lesser-known spots found for this district.</p>
              ) : (
                <div className="space-y-3">
                  {hiddenGems.map((gem, index) => (
                    <div
                      key={gem._id}
                      className="border border-desert-dust/60 hover:border-indigo-deep/30 p-3.5 rounded-md space-y-1.5 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold h-5 w-5 bg-indigo-deep/10 text-indigo-deep border border-indigo-deep/15 flex items-center justify-center rounded-sm">
                            {index + 1}
                          </span>
                          <h4 className="font-bold text-iron-black text-sm">{gem.name}</h4>
                        </div>
                      </div>
                      <p className="text-xs text-iron-black/60 leading-relaxed">{gem.description}</p>

                      {gem.reason && selectedInterests.length > 0 && (
                        <div className="mt-1.5 pt-1.5 border-t border-desert-dust/40 text-[11px] text-indigo-deep bg-indigo-deep/5 p-2 rounded-sm leading-relaxed">
                          <strong className="text-[9px] uppercase font-bold block mb-0.5">Relevance:</strong>
                          {gem.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
