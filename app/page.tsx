import Link from 'next/link';
import { Compass, MapPin, Utensils, Gem, ArrowRight, CloudSun, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JaliDivider } from '@/components/JaliDivider';

/* A seeded 2-day Kutch itinerary shown inline as the hero visual.
   This is static data — it shows the product, not a description. */
const HERO_ITINERARY = [
  {
    day: 1,
    district: 'Kutch',
    items: [
      { time: '08:00', name: 'White Desert (Rann of Kutch)', type: 'attraction' as const, cost: 200 },
      { time: '11:30', name: 'Kalo Dungar (Black Hill)', type: 'attraction' as const, cost: 0 },
      { time: '13:00', name: 'Dabeli & Chai at Bhuj Market', type: 'food' as const, cost: 80 },
      { time: '15:30', name: 'Aina Mahal (Mirror Palace)', type: 'attraction' as const, cost: 50 },
    ],
  },
  {
    day: 2,
    district: 'Kutch',
    items: [
      { time: '07:00', name: 'Mandvi Beach Sunrise', type: 'hidden_gem' as const, cost: 0 },
      { time: '10:00', name: 'Vijay Vilas Palace', type: 'attraction' as const, cost: 100 },
      { time: '12:30', name: 'Kutchi Thali at Local Dhaba', type: 'food' as const, cost: 150 },
      { time: '15:00', name: 'Banni Grasslands Drive', type: 'hidden_gem' as const, cost: 0 },
    ],
  },
];

function TypeIcon({ type }: { type: string }) {
  if (type === 'food') return <Utensils className="h-3.5 w-3.5" />;
  if (type === 'hidden_gem') return <Gem className="h-3.5 w-3.5" />;
  return <MapPin className="h-3.5 w-3.5" />;
}

function TypeColor(type: string): string {
  if (type === 'food') return 'text-madder-red border-madder-red/20 bg-madder-red/5';
  if (type === 'hidden_gem') return 'text-indigo-deep border-indigo-deep/20 bg-indigo-deep/5';
  return 'text-indigo-deep border-indigo-deep/20 bg-indigo-deep/5';
}

export default function Home() {
  return (
    <div className="flex-1 flex flex-col animate-fadeSlideIn">
      {/* Hero — show the product, not a description */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: headline as commentary on the itinerary */}
          <div className="lg:col-span-5 space-y-6 lg:pt-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-iron-black leading-tight">
              Plan a trip to Gujarat
            </h1>
            <p className="text-iron-black/70 text-base sm:text-lg leading-relaxed max-w-md">
              Itineraries built from verified places, costs, and travel times across Gujarat&apos;s districts.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 pt-2">
              <Link href="/itinerary">
                <Button className="bg-indigo-deep text-resist-white hover:bg-indigo-hover py-5 px-6 rounded-md flex items-center gap-2 text-sm font-bold cursor-pointer">
                  <Calendar className="h-4 w-4" />
                  Generate Itinerary
                </Button>
              </Link>

              <Link href="/districts">
                <Button variant="outline" className="py-5 px-6 rounded-md flex items-center gap-2 text-sm cursor-pointer">
                  <Compass className="h-4 w-4 text-indigo-deep" />
                  Browse Districts
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: live itinerary preview — the hero visual */}
          <div className="lg:col-span-7">
            <div className="border border-desert-dust rounded-lg bg-white overflow-hidden">
              <div className="px-5 py-3 border-b border-desert-dust/60 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-deep uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                  Sample Itinerary — 2 Days in Kutch
                </span>
                <span className="text-xs text-iron-black/40 font-data">₹580 est.</span>
              </div>

              {HERO_ITINERARY.map((day) => (
                <div key={day.day} className="border-b border-desert-dust/40 last:border-b-0">
                  <div className="px-5 py-2.5 bg-dust-lighter flex items-center gap-2">
                    <span className="h-5 w-5 rounded-sm bg-indigo-deep text-resist-white flex items-center justify-center text-[10px] font-bold">
                      {day.day}
                    </span>
                    <span className="text-sm font-bold text-iron-black">Day {day.day}</span>
                    <span className="text-xs text-iron-black/50">— {day.district}</span>
                  </div>

                  <div className="px-5 py-3 space-y-2.5">
                    {day.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <span className="text-xs text-iron-black/40 font-data w-11 shrink-0">{item.time}</span>
                        <div className={`h-6 w-6 rounded-sm flex items-center justify-center shrink-0 ${TypeColor(item.type)}`}>
                          <TypeIcon type={item.type} />
                        </div>
                        <span className="text-iron-black/80 flex-1 truncate">{item.name}</span>
                        {item.cost > 0 && (
                          <span className="text-xs text-iron-black/40 font-data">₹{item.cost}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <JaliDivider variant="dust" />

      {/* Features — flat cards, factual copy */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="border border-desert-dust rounded-lg p-5 bg-white space-y-3">
            <div className="h-9 w-9 rounded-md bg-indigo-deep/10 flex items-center justify-center text-indigo-deep border border-indigo-deep/15">
              <MapPin className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-iron-black" style={{ fontFamily: 'var(--font-display)' }}>Verified local data</h3>
            <p className="text-iron-black/60 text-sm leading-relaxed">
              Every place, cost, and travel time comes from seeded district data — not generated from scratch.
            </p>
          </div>

          <div className="border border-desert-dust rounded-lg p-5 bg-white space-y-3">
            <div className="h-9 w-9 rounded-md bg-indigo-deep/10 flex items-center justify-center text-indigo-deep border border-indigo-deep/15">
              <CloudSun className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-iron-black" style={{ fontFamily: 'var(--font-display)' }}>Weather and festivals</h3>
            <p className="text-iron-black/60 text-sm leading-relaxed">
              Live weather for each district and festival calendar matching for your travel dates.
            </p>
          </div>

          <div className="border border-desert-dust rounded-lg p-5 bg-white space-y-3">
            <div className="h-9 w-9 rounded-md bg-indigo-deep/10 flex items-center justify-center text-indigo-deep border border-indigo-deep/15">
              <Compass className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-iron-black" style={{ fontFamily: 'var(--font-display)' }}>Saved trips</h3>
            <p className="text-iron-black/60 text-sm leading-relaxed">
              Sign in to save itineraries, rename them, and refine with the trip assistant.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
