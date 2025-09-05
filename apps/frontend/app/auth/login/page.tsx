'use client';
export const dynamic = 'force-dynamic';

import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PasswordField } from './components';
import { useBackendHealth } from './useBackendHealth';
import { handleLogin, type LoginResult } from './useLogin';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactNode>('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';
  const { backendUp, checkingHealth, retryHealthCheck } = useBackendHealth();

  useEffect(() => {
    if (isVerified) {
      setError('');
    }
  }, [isVerified]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result: LoginResult = await handleLogin({ email, password });

    if (result.success && result.redirectTo) {
      router.push(result.redirectTo);
    } else if (result.needsVerification && result.verificationMessage) {
      setError(
        <>
          {result.verificationMessage}{' '}
          <Link href="/auth/verify-email" className="text-amber-400 hover:text-amber-300 underline">
            Resend verification email
          </Link>
        </>
      );
    } else if (result.error) {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-500/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-gradient-to-r from-amber-400/15 to-orange-500/15 blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-amber-400/10 to-orange-500/10 blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 xl:px-12">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg space-y-6 sm:space-y-8">
          {/* Header section */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 ring-4 ring-white/10">
              <WrenchScrewdriverIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Welcome back
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-xs sm:max-w-sm mx-auto">
                Sign in to your Remodely CRM workspace
              </p>
            </div>

            {/* Backend status indicator */}
            {!backendUp && (
              <div className="rounded-lg bg-red-50/80 dark:bg-red-900/20 p-4 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 max-w-sm mx-auto">
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Backend offline or unreachable
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => retryHealthCheck()}
                  disabled={checkingHealth}
                  className="mt-3 w-full rounded-lg bg-red-100 dark:bg-red-800/50 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/70 disabled:opacity-50 transition-colors duration-200"
                >
                  {checkingHealth ? 'Checking connection...' : 'Retry connection'}
                </button>
              </div>
            )}

            {/* Success message for email verification */}
            {isVerified && (
              <div className="rounded-lg bg-green-50/80 dark:bg-green-900/20 p-4 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50 max-w-sm mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    ✅ Email verified successfully! You can now log in.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Login form */}
          <div className="rounded-2xl bg-slate-800 p-6 sm:p-8 lg:p-10 shadow-2xl shadow-slate-900/50 border border-slate-700/50">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error message */}
              {error && (
                <div className="rounded-lg bg-red-50/80 dark:bg-red-900/20 p-4 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      {error}
                    </div>
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 hover:border-slate-500"
                    placeholder="Enter your email"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-white">
                  Password
                </label>
                <PasswordField
                  id="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-amber-600 focus:ring-amber-500 focus:ring-offset-0 transition-colors duration-200"
                  />
                  <label htmlFor="remember-me" className="text-sm text-white cursor-pointer select-none">
                    Remember me
                  </label>
                </div>

                <div className="flex-shrink-0">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>Sign in</span>
                    <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800 text-slate-300">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth */}
            <div className="mt-6">
              <button
                onClick={() => {
                  window.location.href = '/auth/google';
                }}
                className="w-full flex items-center justify-center px-4 py-3 border border-slate-600 rounded-xl shadow-sm bg-slate-700 text-sm font-medium text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200"
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

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-slate-300">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-amber-400 hover:text-amber-300 transition-colors duration-200"
              >
                Create a new workspace
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
