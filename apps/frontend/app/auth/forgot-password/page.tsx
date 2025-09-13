'use client';
export const dynamic = 'force-dynamic';

import {
    ArrowLeftIcon,
    CheckCircleIcon,
    DevicePhoneMobileIcon,
    EnvelopeIcon,
    KeyIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [method, setMethod] = useState<'sms' | 'email' | null>(null);
  const [step, setStep] = useState<'method' | 'phone' | 'email' | 'code' | 'password'>('method');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(data.message);
        setStep('code');
      } else {
        setError(data.message || 'Failed to send reset code');
      }
    } catch (error) {
      setError('Failed to send reset code. Please try again.');
    }
    setIsLoading(false);
  };

  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(data.message);
        // For email, we don't need to proceed to code step - user will receive link
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    }
    setIsLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setResetToken(data.token);
        setSuccess(data.message);
        setStep('password');
      } else {
        setError(data.message || 'Failed to verify code');
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.');
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 1800);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    }
    setIsLoading(false);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
        step === 'phone'
          ? 'border-amber-500 bg-amber-500 text-white'
          : step === 'code' || step === 'password'
          ? 'border-green-500 bg-green-500 text-white'
          : 'border-slate-600 text-slate-400'
      }`}>
        <DevicePhoneMobileIcon className="w-5 h-5" />
      </div>
      <div className={`flex-1 h-0.5 transition-all duration-300 ${
        step === 'code' || step === 'password' ? 'bg-amber-500' : 'bg-slate-600'
      }`} />
      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
        step === 'code'
          ? 'border-amber-500 bg-amber-500 text-white'
          : step === 'password'
          ? 'border-green-500 bg-green-500 text-white'
          : 'border-slate-600 text-slate-400'
      }`}>
        <KeyIcon className="w-5 h-5" />
      </div>
      <div className={`flex-1 h-0.5 transition-all duration-300 ${
        step === 'password' ? 'bg-amber-500' : 'bg-slate-600'
      }`} />
      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
        step === 'password'
          ? 'border-amber-500 bg-amber-500 text-white'
          : 'border-slate-600 text-slate-400'
      }`}>
        <CheckCircleIcon className="w-5 h-5" />
      </div>
    </div>
  );

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 shadow-lg shadow-amber-500/25">
          <KeyIcon className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Reset your password
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          Choose how you'd like to reset your password
        </p>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            setMethod('sms');
            setStep('phone');
          }}
          className="w-full flex items-center justify-center px-4 py-3 border border-amber-500 rounded-lg text-white bg-amber-600/20 hover:bg-amber-600/30 transition-all duration-200"
        >
          <DevicePhoneMobileIcon className="h-5 w-5 mr-3" />
          <span>Reset via SMS</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMethod('email');
            setStep('email');
          }}
          className="w-full flex items-center justify-center px-4 py-3 border border-amber-500 rounded-lg text-white bg-amber-600/20 hover:bg-amber-600/30 transition-all duration-200"
        >
          <EnvelopeIcon className="h-5 w-5 mr-3" />
          <span>Reset via Email</span>
        </button>
      </div>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to login
        </Link>
      </div>
    </div>
  );

  const renderEmailStep = () => (
    <form className="space-y-6" onSubmit={handleSendEmailLink}>
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 shadow-lg shadow-amber-500/25">
          <EnvelopeIcon className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Reset via Email
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          Enter your email address and we'll send you a reset link
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Enter your email address"
        />
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-green-400 text-sm">{success}</p>
          <p className="text-slate-300 text-sm mt-2">
            Check your email inbox and spam folder for the reset link.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-6 rounded-lg font-medium hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <WrenchScrewdriverIcon className="animate-spin h-5 w-5 mr-2" />
            Sending Reset Link...
          </span>
        ) : (
          'Send Reset Link'
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setStep('method')}
          className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to method selection
        </button>
      </div>
    </form>
  );

  const renderPhoneStep = () => (
    <form className="space-y-6" onSubmit={handleSendCode}>
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 shadow-lg shadow-amber-500/25">
          <DevicePhoneMobileIcon className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Reset your password
        </h1>
        <p className="mt-3 text-lg text-slate-300">
          Enter your phone number and we'll send you a verification code
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-white">
          Phone Number
        </label>
        <div className="relative">
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            className="block w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 hover:border-slate-500"
            placeholder="+1 (555) 123-4567"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/20 p-4 backdrop-blur-sm border border-red-800/50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-red-300">
              {error}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-900/20 p-4 backdrop-blur-sm border border-green-800/50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-green-300">
              {success}
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Sending code...</span>
          </div>
        ) : (
          <span className="flex items-center space-x-2">
            <span>Send verification code</span>
            <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </span>
        )}
      </button>
    </form>
  );

  const renderCodeStep = () => (
    <form className="space-y-6" onSubmit={handleVerifyCode}>
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 shadow-lg shadow-amber-500/25">
          <KeyIcon className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Enter verification code
        </h1>
        <p className="mt-3 text-lg text-slate-300">
          We sent a 6-digit code to <span className="font-medium text-amber-400">{phoneNumber}</span>
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="code" className="block text-sm font-medium text-white">
          Verification Code
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value)}
          className="block w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-4 text-white placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 hover:border-slate-500 text-center text-2xl font-mono tracking-widest"
          placeholder="123456"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/20 p-4 backdrop-blur-sm border border-red-800/50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-red-300">
              {error}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-900/20 p-4 backdrop-blur-sm border border-green-800/50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-green-300">
              {success}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Verifying...</span>
            </div>
          ) : (
            <span className="flex items-center space-x-2">
              <span>Verify code</span>
              <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setStep('phone')}
          className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-xl shadow-sm bg-slate-700 text-sm font-medium text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200"
        >
          Use different phone number
        </button>
      </div>
    </form>
  );

  const renderPasswordStep = () => (
    <form className="space-y-6" onSubmit={handleResetPassword}>
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 shadow-lg shadow-amber-500/25">
          <CheckCircleIcon className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Set new password
        </h1>
        <p className="mt-3 text-lg text-slate-300">
          Choose a strong password for your account
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="newPassword" className="block text-sm font-medium text-white">
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="block w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 hover:border-slate-500"
          placeholder="Enter new password"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="block w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 hover:border-slate-500"
          placeholder="Confirm new password"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/20 p-4 backdrop-blur-sm border border-red-800/50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-red-300">
              {error}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-900/20 p-4 backdrop-blur-sm border border-green-800/50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-green-300">
              {success}
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Resetting password...</span>
          </div>
        ) : (
          <span className="flex items-center space-x-2">
            <span>Reset password</span>
            <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-gradient-to-r from-amber-400/15 to-orange-500/15 blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-pink-400/10 to-rose-500/10 blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header section */}
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 shadow-lg shadow-amber-500/25">
              <WrenchScrewdriverIcon className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Remodely CRM
            </h1>
            <p className="mt-3 text-lg text-slate-300">
              Password Recovery
            </p>

            {/* Back to login link */}
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to login
              </Link>
            </div>
          </div>

          {/* Step indicator - only show for SMS method */}
          {method === 'sms' && renderStepIndicator()}

          {/* Form container */}
          <div className="rounded-2xl bg-slate-800 p-6 sm:p-8 shadow-2xl shadow-slate-900/50 border border-slate-700/50">
            {step === 'method' && renderMethodSelection()}
            {step === 'phone' && renderPhoneStep()}
            {step === 'email' && renderEmailStep()}
            {step === 'code' && renderCodeStep()}
            {step === 'password' && renderPasswordStep()}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-slate-300">
              Need help?{' '}
              <Link
                href="/contact"
                className="font-medium text-amber-400 hover:text-amber-300 transition-colors duration-200"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
