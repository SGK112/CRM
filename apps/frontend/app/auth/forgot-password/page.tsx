'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  DevicePhoneMobileIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'phone' | 'code' | 'password'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
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

  const renderPhoneStep = () => (
    <form className="space-y-6" onSubmit={handleSendCode}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-amber-600/10 ring-1 ring-amber-600/30">
          <DevicePhoneMobileIcon className="h-6 w-6 text-amber-500" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-100">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your phone number and we'll send you a verification code
        </p>
      </div>
      <div>
        <label
          htmlFor="phone"
          className="block text-xs font-medium uppercase tracking-wide text-slate-300"
        >
          Phone Number
        </label>
        <div className="mt-1">
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            className="appearance-none block w-full px-3 py-2 rounded-md bg-slate-900/60 border border-slate-700 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 sm:text-sm transition"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-2 rounded-md text-sm text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-md text-sm text-center">
          {success}
        </div>
      )}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/70 disabled:opacity-50 disabled:cursor-not-allowed shadow shadow-amber-600/30"
        >
          {isLoading ? 'Sending code...' : 'Send verification code'}
        </button>
      </div>
    </form>
  );

  const renderCodeStep = () => (
    <form className="space-y-6" onSubmit={handleVerifyCode}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-amber-600/10 ring-1 ring-amber-600/30">
          <DevicePhoneMobileIcon className="h-6 w-6 text-amber-500" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-100">
          Enter verification code
        </h2>
        <p className="mt-2 text-sm text-slate-400">We sent a 6-digit code to {phoneNumber}</p>
      </div>
      <div>
        <label
          htmlFor="code"
          className="block text-xs font-medium uppercase tracking-wide text-slate-300"
        >
          Verification Code
        </label>
        <div className="mt-1">
          <input
            id="code"
            name="code"
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value)}
            className="appearance-none block w-full px-3 py-2 rounded-md bg-slate-900/60 border border-slate-700 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 sm:text-sm text-center text-2xl tracking-widest"
            placeholder="123456"
          />
        </div>
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-2 rounded-md text-sm text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-md text-sm text-center">
          {success}
        </div>
      )}
      <div className="space-y-3">
        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/70 disabled:opacity-50 disabled:cursor-not-allowed shadow shadow-amber-600/30"
        >
          {isLoading ? 'Verifying...' : 'Verify code'}
        </button>
        <button
          type="button"
          onClick={() => setStep('phone')}
          className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/60 transition"
        >
          Use different phone number
        </button>
      </div>
    </form>
  );

  const renderPasswordStep = () => (
    <form className="space-y-6" onSubmit={handleResetPassword}>
      <div className="text-center">
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-100">
          Set new password
        </h2>
        <p className="mt-2 text-sm text-slate-400">Choose a strong password for your account</p>
      </div>
      <div>
        <label
          htmlFor="newPassword"
          className="block text-xs font-medium uppercase tracking-wide text-slate-300"
        >
          New Password
        </label>
        <div className="mt-1">
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 rounded-md bg-slate-900/60 border border-slate-700 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 sm:text-sm transition"
            placeholder="Enter new password"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-medium uppercase tracking-wide text-slate-300"
        >
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 rounded-md bg-slate-900/60 border border-slate-700 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 sm:text-sm transition"
            placeholder="Confirm new password"
          />
        </div>
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-2 rounded-md text-sm text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-md text-sm text-center">
          {success}
        </div>
      )}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/70 disabled:opacity-50 disabled:cursor-not-allowed shadow shadow-amber-600/30"
        >
          {isLoading ? 'Resetting password...' : 'Reset password'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="pointer-events-none select-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
      <div className="pointer-events-none select-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-amber-500/5 blur-3xl" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-amber-600 flex items-center justify-center shadow-inner ring-1 ring-amber-400/40">
              <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-slate-100">
              Remodely CRM
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center mb-2">
          <Link
            href="/auth/login"
            className="flex items-center text-amber-400 hover:text-amber-300 transition-colors text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to login
          </Link>
        </div>
      </div>
      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md w-full">
        <div className="relative py-8 px-5 sm:px-10 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm shadow-xl shadow-black/40">
          {step === 'phone' && renderPhoneStep()}
          {step === 'code' && renderCodeStep()}
          {step === 'password' && renderPasswordStep()}
        </div>
      </div>
    </div>
  );
}
