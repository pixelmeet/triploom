'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Sparkles, MapPin, Calendar, User, LogOut, Compass, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-slate-950" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            TripLoom
          </span>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link
            href="/districts"
            className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
          >
            <Compass className="h-4 w-4 text-teal-400" />
            Districts
          </Link>
          <Link
            href="/itinerary"
            className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            Generator
          </Link>
          {session?.user && (
            <Link
              href="/trips"
              className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="h-4 w-4 text-teal-400" />
              My Trips
            </Link>
          )}
        </nav>

        {/* Right side Auth Controls */}
        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="h-8 w-24 bg-slate-800 animate-pulse rounded-lg" />
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/trips"
                className="md:hidden text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-teal-400 hover:bg-slate-800 transition-all"
              >
                My Trips
              </Link>

              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold text-[10px]">
                  {(session.user.name || session.user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="font-medium max-w-[120px] truncate hidden sm:inline">
                  {session.user.name || session.user.email}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="h-8 px-3 text-xs border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5 mr-1 text-slate-400" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 hover:from-teal-400 hover:to-emerald-400 font-bold transition-all shadow-md shadow-teal-500/10"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
