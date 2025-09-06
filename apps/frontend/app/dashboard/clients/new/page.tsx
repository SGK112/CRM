'use client';

import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ClientCreate {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  accountType?: string;
  status: string;
  source?: string;
  notes?: string;
}

export default function NewClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard/clients';
  const contactType = (searchParams.get('type') as string) || 'client';

  // Mobile-first contact type state (client | subcontractor | vendor | contributor | team)
  const [contactRole, setContactRole] = useState<'client' | 'subcontractor' | 'vendor' | 'contributor' | 'team'>(
    (contactType === 'subcontractor' ? 'subcontractor' : contactType === 'vendor' ? 'vendor' : contactType === 'contributor' ? 'contributor' : contactType === 'team' ? 'team' : 'client')
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClientCreate>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    status: 'lead',
    source: '',
    notes: '',
  });

  // Reset status when contact role changes to ensure valid options
  useEffect(() => {
    const defaultStatus = {
      client: 'lead',
      subcontractor: 'available',
      vendor: 'approved',
      contributor: 'active',
      team: 'active'
    };
    setFormData(prev => ({ ...prev, status: defaultStatus[contactRole] }));
  }, [contactRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Create the contact/client
      const authToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Only add auth header if we have a valid token
      if (authToken && authToken !== 'null' && authToken !== 'undefined' && authToken.length > 10) {
        headers.Authorization = `Bearer ${authToken}`;
        // In development, show where request is going
        if (process.env.NODE_ENV !== 'production') {
          alert('Creating contact with authentication - will use backend database');
        }
      } else {
        // In development, show where request is going  
        if (process.env.NODE_ENV !== 'production') {
          alert('Creating contact without authentication - will use local storage');
        }
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          ...formData, 
          type: contactRole,
          contactRole: contactRole // Add explicit role for backend processing
        }),
      });

      if (response.ok) {
        const created = await response.json();
        const contactId = created?._id || created?.id;
        
        if (contactId) {
          // Navigate immediately to the contact page for instant feedback
          router.push(`/dashboard/clients/${contactId}?created=true&type=${contactRole}`);
          
          // Start background integrations (non-blocking and optional)
          setTimeout(async () => {
            try {
              // All integrations are now optional and won't block the main flow
            } catch (error) {
              // Background integrations skipped - this is expected in development
            }
          }, 100);
        } else {
          // Fallback to main contacts page with success indicator
          router.push(`/dashboard/clients?created=true&type=${contactRole}`);
        }
      } else {
        const msg = await response.text();
        setError(`Create failed (${response.status}): ${msg}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error creating contact';
      setError(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/10 p-3">
      <div className="max-w-md mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href={returnTo}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent border border-white/20 hover:bg-white/10 transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5 text-white" />
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">New Contact</h1>
          </div>
          <div className="w-10" /> {/* Spacer for center alignment */}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="text-red-700 dark:text-red-300 text-sm">{error}</div>
          </div>
        )}

        {/* Compact Tool Card */}
        <div className="bg-transparent backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl shadow-black/10">
          <div className="p-5">
            {/* Contact Type Pills */}
            <div className="mb-6">
              <div className="flex justify-center">
                <div className="inline-flex bg-white/10 rounded-full p-1.5 gap-1">
                  <button
                    type="button"
                    onClick={() => setContactRole('client')}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      contactRole === 'client'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactRole('subcontractor')}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      contactRole === 'subcontractor'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    Sub
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactRole('vendor')}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      contactRole === 'vendor'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactRole('contributor')}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      contactRole === 'contributor'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    Contributor
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactRole('team')}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      contactRole === 'team'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    Team
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-transparent text-white placeholder-white/70 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    placeholder="First Name *"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-transparent text-white placeholder-white/70 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    placeholder="Last Name *"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-transparent text-white placeholder-white/70 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Email Address *"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-transparent text-white placeholder-white/70 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Phone Number"
                />
              </div>

              {/* Company */}
              <div>
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-transparent text-white placeholder-white/70 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Company Name"
                />
              </div>

              {/* Status & Account Type Row */}
              <div className="grid grid-cols-2 gap-3">
                <select
                  id="status"
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-transparent text-white text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                >
                  {contactRole === 'client' && (
                    <>
                      <option value="lead" className="bg-slate-800 text-white">Lead</option>
                      <option value="prospect" className="bg-slate-800 text-white">Prospect</option>
                      <option value="active" className="bg-slate-800 text-white">Active Client</option>
                      <option value="inactive" className="bg-slate-800 text-white">Inactive</option>
                    </>
                  )}
                  {contactRole === 'subcontractor' && (
                    <>
                      <option value="available" className="bg-slate-800 text-white">Available</option>
                      <option value="active" className="bg-slate-800 text-white">Active</option>
                      <option value="preferred" className="bg-slate-800 text-white">Preferred</option>
                      <option value="inactive" className="bg-slate-800 text-white">Inactive</option>
                    </>
                  )}
                  {contactRole === 'vendor' && (
                    <>
                      <option value="approved" className="bg-slate-800 text-white">Approved</option>
                      <option value="pending" className="bg-slate-800 text-white">Pending</option>
                      <option value="active" className="bg-slate-800 text-white">Active</option>
                      <option value="inactive" className="bg-slate-800 text-white">Inactive</option>
                    </>
                  )}
                  {contactRole === 'contributor' && (
                    <>
                      <option value="active" className="bg-slate-800 text-white">Active</option>
                      <option value="freelance" className="bg-slate-800 text-white">Freelance</option>
                      <option value="occasional" className="bg-slate-800 text-white">Occasional</option>
                      <option value="inactive" className="bg-slate-800 text-white">Inactive</option>
                    </>
                  )}
                  {contactRole === 'team' && (
                    <>
                      <option value="active" className="bg-slate-800 text-white">Active</option>
                      <option value="part-time" className="bg-slate-800 text-white">Part-time</option>
                      <option value="contractor" className="bg-slate-800 text-white">Contractor</option>
                      <option value="inactive" className="bg-slate-800 text-white">Inactive</option>
                    </>
                  )}
                </select>
                <select
                  id="accountType"
                  value={formData.accountType ?? ''}
                  onChange={e => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-transparent text-white text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                >
                  {contactRole === 'client' && (
                    <>
                      <option value="" className="bg-slate-800 text-white">Client Type</option>
                      <option value="residential" className="bg-slate-800 text-white">Residential</option>
                      <option value="commercial" className="bg-slate-800 text-white">Commercial</option>
                      <option value="industrial" className="bg-slate-800 text-white">Industrial</option>
                    </>
                  )}
                  {(contactRole === 'subcontractor' || contactRole === 'contributor') && (
                    <>
                      <option value="" className="bg-slate-800 text-white">Specialty</option>
                      <option value="plumbing" className="bg-slate-800 text-white">Plumbing</option>
                      <option value="electrical" className="bg-slate-800 text-white">Electrical</option>
                      <option value="hvac" className="bg-slate-800 text-white">HVAC</option>
                      <option value="flooring" className="bg-slate-800 text-white">Flooring</option>
                      <option value="roofing" className="bg-slate-800 text-white">Roofing</option>
                      <option value="general" className="bg-slate-800 text-white">General</option>
                    </>
                  )}
                  {contactRole === 'vendor' && (
                    <>
                      <option value="" className="bg-slate-800 text-white">Category</option>
                      <option value="materials" className="bg-slate-800 text-white">Materials</option>
                      <option value="tools" className="bg-slate-800 text-white">Tools</option>
                      <option value="equipment" className="bg-slate-800 text-white">Equipment</option>
                      <option value="services" className="bg-slate-800 text-white">Services</option>
                    </>
                  )}
                  {contactRole === 'team' && (
                    <>
                      <option value="" className="bg-slate-800 text-white">Role</option>
                      <option value="project-manager" className="bg-slate-800 text-white">Project Manager</option>
                      <option value="foreman" className="bg-slate-800 text-white">Foreman</option>
                      <option value="admin" className="bg-slate-800 text-white">Admin</option>
                      <option value="sales" className="bg-slate-800 text-white">Sales</option>
                      <option value="estimator" className="bg-slate-800 text-white">Estimator</option>
                    </>
                  )}
                </select>
              </div>

              {/* Notes - Compact */}
              <div>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-transparent text-white placeholder-white/70 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none"
                  placeholder="Notes (optional)"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Link
                  href={returnTo}
                  className="flex-1 px-6 py-3 text-center rounded-2xl border border-white/20 bg-transparent hover:bg-white/10 text-white font-medium text-sm transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                >
                  {saving ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <CheckIcon className="h-4 w-4" />
                  )}
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
