'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { MapPin, Calendar, LogOut, Compass, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-night-indigo/20 bg-night-band sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* Geometric loom mark — not a sparkle icon */}
          <div className="h-8 w-8 rounded-md bg-indigo-deep flex items-center justify-center group-hover:bg-indigo-light transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-resist-white">
              <path d="M1 9L5 5L9 9L5 13Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M9 9L13 5L17 9L13 13Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <circle cx="9" cy="9" r="1.5" fill="currentColor" opacity="0.6"/>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-resist-white" style={{ fontFamily: 'var(--font-display)' }}>
            TripLoom
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-resist-white/70">
          <Link
            href="/districts"
            className="hover:text-resist-white transition-colors flex items-center gap-1.5"
          >
            <Compass className="h-4 w-4 text-desert-dust" />
            Districts
          </Link>
          <Link
            href="/itinerary"
            className="hover:text-resist-white transition-colors flex items-center gap-1.5"
          >
            <Calendar className="h-4 w-4 text-desert-dust" />
            Trip Planner
          </Link>
          {session?.user && (
            <Link
              href="/trips"
              className="hover:text-resist-white transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="h-4 w-4 text-desert-dust" />
              My Trips
            </Link>
          )}
        </nav>

        {/* Auth Controls */}
        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="h-8 w-24 bg-night-indigo/60 animate-pulse rounded-md" />
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/trips"
                className="md:hidden text-xs font-semibold px-3 py-1.5 rounded-md bg-night-indigo border border-indigo-deep/50 text-resist-white/80 hover:text-resist-white transition-all"
              >
                My Trips
              </Link>

              <div className="flex items-center gap-2 bg-night-indigo/60 border border-indigo-deep/30 rounded-md px-3 py-1.5 text-xs text-resist-white/80">
                <div className="h-6 w-6 rounded-md bg-indigo-deep flex items-center justify-center text-resist-white font-bold text-[10px]">
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
                className="h-8 px-3 text-xs border-indigo-deep/40 bg-transparent text-resist-white/70 hover:bg-night-indigo hover:text-resist-white"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold px-3.5 py-1.5 rounded-md border border-indigo-deep/40 bg-transparent text-resist-white/80 hover:text-resist-white hover:border-indigo-deep transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold px-3.5 py-1.5 rounded-md bg-indigo-deep text-resist-white hover:bg-indigo-light transition-all"
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
