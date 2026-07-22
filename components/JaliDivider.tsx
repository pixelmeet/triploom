import React from 'react';

interface JaliDividerProps {
  className?: string;
  variant?: 'dust' | 'indigo';
}

/**
 * Jali Lattice Divider — the signature TripLoom visual element.
 *
 * A thin horizontal band of a simplified geometric lattice pattern
 * inspired by Gujarat's carved stone/wood screens found in stepwells,
 * havelis, and mosque architecture. Built as inline SVG for clean scaling.
 *
 * Usage: place between major page sections. Max 1–2 per page (restraint).
 */
export function JaliDivider({ className = '', variant = 'dust' }: JaliDividerProps) {
  return (
    <div
      className={`${variant === 'indigo' ? 'jali-divider-indigo' : 'jali-divider'} my-8 ${className}`}
      role="separator"
      aria-hidden="true"
    />
  );
}
