'use client';
export const dynamic = 'force-dynamic';

import { EyeIcon, EyeSlashIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactNode>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';

  const [backendUp, setBackendUp] = useState(true);
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ping = async (attempt = 1) => {
      setCheckingHealth(true);
      // try rewrite first
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (!cancelled && res.ok) {
          setBackendUp(true);
          setCheckingHealth(false);
          return;
        }
      } catch {
        // ignore and try direct backend fallback
      }
      // then direct backend as fallback
      try {
        // Normalize base: remove trailing slash and a trailing /api to avoid double prefixing
        const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
          .replace(/\/$/, '')
          .replace(/(?:\/api)+$/, '');
        const res2 = await fetch(`${base}/api/health`, { cache: 'no-store' });
        if (!cancelled) setBackendUp(res2.ok);
      } catch {
        if (!cancelled) setBackendUp(false);
      } finally {
        if (!cancelled) setCheckingHealth(false);
      }
      // light retry with backoff if still down
      if (!cancelled && !backendUp && attempt < 3) {
        setTimeout(() => ping(attempt + 1), attempt * 800);
      }
    };
    ping();
    return () => {
      cancelled = true;
    };
  }, [backendUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data: { accessToken?: string; user?: unknown; message?: string; validation?: string[] } | null = null;
      try {
        data = await response.json();
      } catch {
        /* ignore */
      }

      if (response.ok) {
        if (!data) {
          setError('Invalid response from server');
          return;
        }
        // Store token in localStorage and cookie (cookie for middleware protection)
        try {
          // Set cookie with proper expiration and security settings
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
          document.cookie = `accessToken=${data.accessToken}; Path=/; SameSite=Lax; Expires=${expiryDate.toUTCString()}`;
          // Cookie set successfully
        } catch (error) {
          // Cookie set failed - silently handle
        }
        localStorage.setItem('accessToken', data.accessToken!);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Login successful, redirecting to dashboard
        // Redirect to dashboard
        router.push('/dashboard');
      } else if (response.status === 400) {
        setError(data?.validation?.[0] || data?.message || 'Validation error');
      } else if (response.status === 401) {
        const errorMessage = data?.message || 'Invalid credentials';
        setError(errorMessage);

        // If it's an email verification error, show a link to resend verification
        if (errorMessage.includes('verify your email')) {
          setError(
            <>
              {errorMessage}{' '}
              <Link href="/auth/verify-email" className="text-amber-400 hover:text-amber-300 underline">
                Resend verification email
              </Link>
            </>
          );
        }
      } else {
        setError(data?.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      // Network error occurred
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
      {/* Background decorative elements */}
      <div className="pointer-events-none select-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
      <div className="pointer-events-none select-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-amber-500/5 blur-3xl" />

      {/* Header Section */}
      <div className="w-full max-w-md mx-auto mb-6 sm:mb-8">
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg ring-2 ring-amber-400/20">
              <WrenchScrewdriverIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">Remodely Ai</span>
              <span className="text-xs text-[var(--text-muted)] font-medium">Construction CRM</span>
            </div>
          </div>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)] mb-2">
          Welcome back
        </h2>
        <p className="text-center text-sm sm:text-base text-[var(--text-muted)] mb-4">
          Sign in to your workspace
        </p>

        {!backendUp && (
          <div className="mb-4 text-center">
            <p className="text-xs text-red-400 mb-2">Backend offline or unreachable. Authentication may fail.</p>
            <button
              type="button"
              onClick={() => {
                // manual retry
                const run = async () => {
                  setCheckingHealth(true);
                  try {
                    const res = await fetch('/api/health', { cache: 'no-store' });
                    if (res.ok) {
                      setBackendUp(true);
                      return;
                    }
                  } catch {
                    // ignore, try direct backend
                  }
                  try {
                    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
                      .replace(/\/$/, '')
                      .replace(/(?:\/api)+$/, '');
                    const res2 = await fetch(`${base}/api/health`, { cache: 'no-store' });
                    setBackendUp(res2.ok);
                  } catch {
                    setBackendUp(false);
                  } finally {
                    setCheckingHealth(false);
                  }
                };
                run();
              }}
              disabled={checkingHealth}
              className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs text-[var(--text)] hover:bg-[var(--surface-3)] disabled:opacity-50"
            >
              {checkingHealth ? 'Checking…' : 'Retry health check'}
            </button>
          </div>
        )}

        <p className="text-center text-sm text-[var(--text-dim)]">
          Or{' '}
          <Link href="/auth/register" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
            create a new workspace
          </Link>
        </p>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md mx-auto">
        <div className="relative py-6 sm:py-8 px-4 sm:px-6 lg:px-10 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/70 backdrop-blur-sm shadow-xl">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            {isVerified && (
              <div className="bg-green-500/10 border border-green-500/40 text-green-300 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm">
                ✅ Email verified successfully! You can now log in to your account.
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent border-none focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200 cursor-pointer" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200 cursor-pointer" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500/60 border-[var(--border)] rounded bg-[var(--input-bg)]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--text-dim)]">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full h-11 sm:h-12 text-base font-medium"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[var(--surface-2)]/70 text-[var(--text-dim)]">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  // Google OAuth endpoints are exposed without the /api prefix: /auth/google
                  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/, '');
                  const target = `${base}/auth/google`;
                  window.location.href = target;
                }}
                className="btn btn-secondary w-full h-11 sm:h-12 text-base font-medium"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
