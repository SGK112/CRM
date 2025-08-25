"use client"
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PhoneInput from '../../../components/forms/PhoneInput'
import { EyeIcon, EyeSlashIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    workspaceName: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const [backendUp, setBackendUp] = useState(true)
  const [checkingHealth, setCheckingHealth] = useState(false)

  useEffect(() => {
    let cancelled = false
    const ping = async (attempt = 1) => {
      setCheckingHealth(true)
      let ok = false
      try {
        const res = await fetch('/api/health', { cache: 'no-store' })
        ok = res.ok
        if (!cancelled && ok) { setBackendUp(true); setCheckingHealth(false); return }
      } catch {
        // ignore and try direct backend fallback
      }
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
          .replace(/\/$/, '')
          .replace(/(?:\/api)+$/, '')
        const res2 = await fetch(`${base}/api/health`, { cache: 'no-store' })
        ok = res2.ok
        if (!cancelled) setBackendUp(ok)
      } catch {
        if (!cancelled) setBackendUp(false)
      } finally {
        if (!cancelled) setCheckingHealth(false)
      }
      if (!cancelled && !ok && attempt < 3) {
        setTimeout(() => ping(attempt + 1), attempt * 800)
      }
    }
    ping()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      let data: any = null
      try { data = await response.json() } catch {
        // ignore json parse error
      }

      if (response.ok) {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/dashboard')
      } else if (response.status === 400) {
        setError(data?.validation?.[0] || data?.message || 'Validation error')
      } else if (response.status === 401) {
        setError(data?.message || 'Unauthorized')
      } else if (response.status >= 500) {
        setError('Server error. Please try again shortly.')
      } else {
        setError(data?.message || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="pointer-events-none select-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
      <div className="pointer-events-none select-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-amber-500/5 blur-3xl" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-amber-600 flex items-center justify-center shadow-inner ring-1 ring-amber-400/40">
              <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-[var(--text)]">Remodely Ai</span>
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-semibold tracking-tight text-[var(--text)]">Create your workspace</h2>
        {!backendUp && (
          <div className="mt-2 text-center">
            <p className="text-xs text-red-400">Backend offline or unreachable. Registration may fail.</p>
            <button
              type="button"
              onClick={() => {
                const run = async () => {
                  setCheckingHealth(true)
                  let ok = false
                  try {
                    const res = await fetch('/api/health', { cache: 'no-store' })
                    ok = res.ok
                    if (ok) { setBackendUp(true); return }
                  } catch {
                    // ignore and try direct backend
                  }
                  try {
                    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
                      .replace(/\/$/, '')
                      .replace(/(?:\/api)+$/, '')
                    const res2 = await fetch(`${base}/api/health`, { cache: 'no-store' })
                    ok = res2.ok
                    setBackendUp(ok)
                  } catch {
                    setBackendUp(false)
                  } finally { setCheckingHealth(false) }
                }
                run()
              }}
              disabled={checkingHealth}
              className="mt-1 inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs text-[var(--text)] hover:bg-[var(--surface-3)] disabled:opacity-50"
            >
              {checkingHealth ? 'Checking…' : 'Retry health check'}
            </button>
          </div>
        )}
        <p className="mt-2 text-center text-sm text-[var(--text-dim)]">
          Or{' '}
          <Link href="/auth/login" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
            sign in to existing workspace
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="relative py-8 px-5 sm:px-10 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/70 backdrop-blur-sm shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="workspaceName" className="block text-sm font-medium text-[var(--text)]">
                Company Name
              </label>
              <div className="mt-1">
                <input
                  id="workspaceName"
                  name="workspaceName"
                  type="text"
                  required
                  value={formData.workspaceName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Your Construction Company"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text)]">
                  First Name
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text)]">
                  Last Name
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text)]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--text)]">
                Phone Number <span className="text-[var(--text-faint)]">(Optional)</span>
              </label>
              <div className="mt-1">
                <PhoneInput
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  placeholder="Phone number"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text)]">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-[var(--text-faint)]" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-[var(--text-faint)]" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-[var(--text-faint)]">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/70 disabled:opacity-50 disabled:cursor-not-allowed shadow-amber-600/30"
              >
                {isLoading ? 'Creating workspace...' : 'Create workspace'}
              </button>
            </div>

            <div className="text-xs text-[var(--text-faint)] text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-amber-400 hover:text-amber-300 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-amber-400 hover:text-amber-300 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
