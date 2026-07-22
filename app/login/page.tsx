'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/itinerary';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError('Invalid credentials — check your email and password.');
      } else if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl });
    } catch {
      setError('Failed to initiate Google sign-in.');
      setGoogleLoading(false);
    }
  };

  return (
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
          Sign in
        </h2>
        <p className="mt-2 text-sm text-iron-black/50">
          Sign in to view your saved trips.
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
            <label htmlFor="login-email" className="block text-sm font-semibold text-iron-black/70 mb-1">
              Email address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-white border border-desert-dust rounded-md px-4 py-2.5 text-iron-black placeholder-iron-black/30 focus:outline-none focus:border-indigo-deep transition-colors text-sm"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-semibold text-iron-black/70 mb-1">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-desert-dust rounded-md px-4 py-2.5 text-iron-black placeholder-iron-black/30 focus:outline-none focus:border-indigo-deep transition-colors text-sm"
            />
          </div>
        </div>

        <Button
          id="login-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-deep text-resist-white font-bold hover:bg-indigo-hover py-5 rounded-md flex items-center justify-center gap-2 cursor-pointer border-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign In
            </>
          )}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-desert-dust" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-iron-black/40 font-medium">Or continue with</span>
        </div>
      </div>

      <Button
        id="google-login-btn"
        type="button"
        variant="outline"
        disabled={googleLoading}
        onClick={handleGoogleSignIn}
        className="w-full py-5 rounded-md flex items-center justify-center gap-3"
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-indigo-deep" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span className="text-sm">Sign in with Google</span>
      </Button>

      <p className="text-center text-sm text-iron-black/50 mt-4">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-indigo-deep hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fadeSlideIn">
      <Suspense
        fallback={
          <div className="max-w-md w-full p-8 flex flex-col items-center justify-center border border-desert-dust bg-white rounded-lg">
            <Loader2 className="h-6 w-6 text-indigo-deep animate-spin mb-2" />
            <span className="text-iron-black/50 text-sm">Loading...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
