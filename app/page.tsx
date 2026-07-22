import Link from 'next/link';
import { Sparkles, Compass, MapPin, Briefcase, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-teal-500/10 via-emerald-500/5 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <main className="max-w-4xl w-full text-center space-y-10 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/80 border border-slate-800 backdrop-blur-md shadow-lg">
          <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            Phase 6 Complete: Auth & Saved Itineraries
          </span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-tight">
            Weave Your Perfect <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Gujarat Journey
            </span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            AI-powered travel itineraries grounded in verified local data — stepwells, white desert, wildlife sanctuaries, and authentic street food.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/itinerary" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold hover:from-teal-400 hover:to-emerald-400 py-6 px-8 rounded-2xl flex items-center justify-center gap-2 text-base shadow-xl shadow-teal-500/10 border-none cursor-pointer">
              <Sparkles className="h-5 w-5" />
              Generate Itinerary
            </Button>
          </Link>

          <Link href="/districts" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-slate-800 bg-slate-900/80 text-slate-200 hover:bg-slate-800 py-6 px-8 rounded-2xl flex items-center justify-center gap-2 text-base backdrop-blur-sm cursor-pointer">
              <Compass className="h-5 w-5 text-teal-400" />
              Explore Districts
            </Button>
          </Link>
        </div>

        {/* Features Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Grounded AI</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every itinerary item is grounded in verified MongoDB district data — never hallucinated places.
            </p>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Saved Itineraries</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sign in to save your trips, customize titles, and access your daily plans across sessions.
            </p>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Festivals & Weather</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Live weather metrics, smart travel advice, and festival matching for optimal travel dates.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
