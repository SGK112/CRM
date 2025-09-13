'use client';

import {
    ArrowLeftIcon,
    CheckIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface ContactFormData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  // Contact Type & Business
  contactType: 'client' | 'subcontractor' | 'vendor' | 'contributor' | 'team';
  company?: string;

  // Additional
  status: string;
}

const contactTypeOptions = [
  { value: 'client', label: '👥 Client' },
  { value: 'subcontractor', label: '🔨 Subcontractor' },
  { value: 'vendor', label: '🚚 Vendor' },
  { value: 'contributor', label: '❤️ Contributor' },
  { value: 'team', label: '👨‍💼 Team Member' }
];

export default function EnhancedContactCreationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard/clients';
  const contactType = (searchParams.get('type') as string) || 'client';

  const [_contactId, setContactId] = useState<string | null>(null);
  const [, setQuickBooksEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    defaultValues: {
      contactType: contactType as ContactFormData['contactType'],
      status: 'lead'
    }
  });

  // Check QuickBooks integration status
  useEffect(() => {
    const checkQuickBooksStatus = async () => {
      try {
        const response = await fetch('/api/quickbooks/status');
        if (response.ok) {
          const data = await response.json();
          setQuickBooksEnabled(data.enabled || false);
        }
      } catch (error) {
        // QuickBooks status check failed (expected in development)
      }
    };

    checkQuickBooksStatus();
  }, []);

  const onQuickSubmit = async (data: ContactFormData) => {
    try {
      const authToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken && authToken !== 'null' && authToken !== 'undefined' && authToken.length > 10) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...data,
          status: 'lead', // Default status
          type: data.contactType,
          contactRole: data.contactType
        }),
      });

      if (response.ok) {
        const created = await response.json();
        const newContactId = created?._id || created?.id;
        setContactId(newContactId);

        // Go to profile completion
        router.push(`/dashboard/clients/${newContactId}/profile?created=true&type=${data.contactType}&quick=true`);
      } else {
        const errorData = await response.text();
        throw new Error(`Create failed (${response.status}): ${errorData}`);
      }
    } catch (error) {
      alert('Failed to create contact. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-slate-900 p-3">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <Link
            href={returnTo}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 border border-white/20 hover:bg-white/30 transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5 text-slate-700 dark:text-white" />
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">New Contact</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Create contact profile</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>

        {/* Single Column Layout */}
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Contact Creation</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Fill out basic information</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Step 1 of 2
              </div>
            </div>
          </div>

          {/* Main Form - Simplified JotForm Style */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-slate-700/20 shadow-xl p-8">
            <form onSubmit={handleSubmit(onQuickSubmit)} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Contact Information</h2>
                <p className="text-slate-600 dark:text-slate-400">Please provide contact details</p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-white">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: { value: 2, message: 'Minimum 2 characters' }
                    })}
                    type="text"
                    placeholder="First Name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <input
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: { value: 2, message: 'Minimum 2 characters' }
                    })}
                    type="text"
                    placeholder="Last Name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                {(errors.firstName || errors.lastName) && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName?.message || errors.lastName?.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-white">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[+]?[1-9][\d]{0,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  type="tel"
                  placeholder="Please enter a valid phone number."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-white">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  type="email"
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Contact Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-white">
                  Contact Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('contactType', { required: 'Contact type is required' })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="">Select contact type...</option>
                  {contactTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.contactType && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactType.message}</p>
                )}
              </div>

              {/* Company Name (Optional) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-white">
                  Company Name
                </label>
                <input
                  {...register('company')}
                  type="text"
                  placeholder="ABC Construction (optional)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckIcon className="h-5 w-5" />
                    Create Contact
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Communication Methods Footer */}
          <div className="mt-6 p-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-white/20 dark:border-slate-700/20 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              <strong className="text-slate-900 dark:text-white">Next step:</strong> Complete the contact profile to enable communication
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span>📱 SMS Available</span>
              <span>•</span>
              <span>📧 Email Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
