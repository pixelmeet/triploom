'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed — try again.');
      }

      // Auto sign-in on success
      const signInRes = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl: '/itinerary',
      });

      if (signInRes?.ok) {
        router.push('/itinerary');
        router.refresh();
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fadeSlideIn">
      <div className="max-w-md w-full space-y-6 border border-desert-dust bg-white p-8 rounded-lg relative z-10">
        <div className="text-center">
          {/* Loom mark */}
          <div className="mx-auto h-11 w-11 rounded-md bg-indigo-deep flex items-center justify-center mb-4">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-resist-white">
              <path d="M1 9L5 5L9 9L5 13Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M9 9L13 5L17 9L13 13Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <circle cx="9" cy="9" r="1.5" fill="currentColor" opacity="0.6"/>
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-iron-black">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-iron-black/50">
            Create an account to save your trips.
          </p>
        </div>

        {error && (
          <div className="border border-madder-red/30 bg-madder-red/5 text-madder-red p-3 rounded-md flex items-start gap-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-semibold text-iron-black/70 mb-1">
                Full name
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full bg-white border border-desert-dust rounded-md px-4 py-2.5 text-iron-black placeholder-iron-black/30 focus:outline-none focus:border-indigo-deep transition-colors text-sm"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-iron-black/70 mb-1">
                Email address
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full bg-white border border-desert-dust rounded-md px-4 py-2.5 text-iron-black placeholder-iron-black/30 focus:outline-none focus:border-indigo-deep transition-colors text-sm"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-iron-black/70 mb-1">
                Password (min. 8 characters)
              </label>
              <input
                id="reg-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-desert-dust rounded-md px-4 py-2.5 text-iron-black placeholder-iron-black/30 focus:outline-none focus:border-indigo-deep transition-colors text-sm"
              />
            </div>
          </div>

          <Button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-deep text-resist-white font-bold hover:bg-indigo-hover py-5 rounded-md flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Register
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-iron-black/50 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-deep hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
