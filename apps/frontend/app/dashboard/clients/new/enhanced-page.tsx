'use client';

import { FormField, FormProgress, FormSection, QuickStartForm } from '@/components/ui/forms';
import {
    ArrowLeftIcon,
    BuildingOfficeIcon,
    CheckIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    PhoneIcon,
    SparklesIcon,
    UserIcon
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
  accountType?: string;
  company?: string;

  // Additional
  status: string;
  source?: string;
  notes?: string;

  // Quick capture fields
  quickCapture?: boolean;
  integrateQuickBooks?: boolean;
}

const contactTypeOptions = [
  { value: 'client', label: '👥 Client' },
  { value: 'subcontractor', label: '🔨 Subcontractor' },
  { value: 'vendor', label: '🚚 Vendor' },
  { value: 'contributor', label: '❤️ Contributor' },
  { value: 'team', label: '👨‍💼 Team Member' }
];

const getAccountTypeOptions = (contactType: string) => {
  switch (contactType) {
    case 'client':
      return [
        { value: 'residential', label: '🏠 Residential' },
        { value: 'commercial', label: '🏢 Commercial' },
        { value: 'industrial', label: '🏭 Industrial' }
      ];
    case 'subcontractor':
    case 'contributor':
      return [
        { value: 'plumbing', label: '🔧 Plumbing' },
        { value: 'electrical', label: '⚡ Electrical' },
        { value: 'hvac', label: '❄️ HVAC' },
        { value: 'flooring', label: '🪵 Flooring' },
        { value: 'roofing', label: '🏠 Roofing' },
        { value: 'general', label: '🔨 General' }
      ];
    case 'vendor':
      return [
        { value: 'materials', label: '📦 Materials' },
        { value: 'tools', label: '🔧 Tools' },
        { value: 'equipment', label: '🚜 Equipment' },
        { value: 'services', label: '🛠️ Services' }
      ];
    case 'team':
      return [
        { value: 'project-manager', label: '📋 Project Manager' },
        { value: 'foreman', label: '👷 Foreman' },
        { value: 'admin', label: '💼 Admin' },
        { value: 'sales', label: '💰 Sales' },
        { value: 'estimator', label: '📊 Estimator' }
      ];
    default:
      return [];
  }
};

const getStatusOptions = (contactType: string) => {
  switch (contactType) {
    case 'client':
      return [
        { value: 'lead', label: '🎯 Lead' },
        { value: 'prospect', label: '👀 Prospect' },
        { value: 'active', label: '✅ Active Client' },
        { value: 'inactive', label: '⏸️ Inactive' }
      ];
    case 'subcontractor':
      return [
        { value: 'available', label: '✅ Available' },
        { value: 'active', label: '🔥 Active' },
        { value: 'preferred', label: '⭐ Preferred' },
        { value: 'inactive', label: '⏸️ Inactive' }
      ];
    case 'vendor':
      return [
        { value: 'approved', label: '✅ Approved' },
        { value: 'pending', label: '⏳ Pending' },
        { value: 'active', label: '🔥 Active' },
        { value: 'inactive', label: '⏸️ Inactive' }
      ];
    case 'contributor':
      return [
        { value: 'active', label: '✅ Active' },
        { value: 'freelance', label: '💼 Freelance' },
        { value: 'occasional', label: '🔄 Occasional' },
        { value: 'inactive', label: '⏸️ Inactive' }
      ];
    case 'team':
      return [
        { value: 'active', label: '✅ Active' },
        { value: 'part-time', label: '⏰ Part-time' },
        { value: 'contractor', label: '📝 Contractor' },
        { value: 'inactive', label: '⏸️ Inactive' }
      ];
    default:
      return [{ value: 'active', label: '✅ Active' }];
  }
};

export default function EnhancedContactCreationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard/clients';
  const contactType = (searchParams.get('type') as string) || 'client';

  const [currentStep, setCurrentStep] = useState<'quick' | 'enhanced' | 'quickbooks'>('quick');
  const [contactId, setContactId] = useState<string | null>(null);
  const [quickBooksEnabled, setQuickBooksEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<ContactFormData>({
    defaultValues: {
      contactType: contactType as ContactFormData['contactType'],
      status: 'lead',
      quickCapture: true,
      integrateQuickBooks: true
    }
  });

  const watchedContactType = watch('contactType');
  const watchedQuickCapture = watch('quickCapture');

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

  // Update status when contact type changes
  useEffect(() => {
    const statusOptions = getStatusOptions(watchedContactType);
    if (statusOptions.length > 0) {
      setValue('status', statusOptions[0].value);
    }
  }, [watchedContactType, setValue]);

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
          status: data.contactType === 'client' ? 'client' : data.status || 'lead', // Map contactType to status
          type: 'residential', // Default type for schema compliance
          contactRole: data.contactType
        }),
      });

      if (response.ok) {
        const created = await response.json();
        const newContactId = created?._id || created?.id;
        setContactId(newContactId);

        if (data.quickCapture) {
          // Quick capture - go straight to profile completion
          router.push(`/dashboard/clients/${newContactId}/profile?created=true&type=${data.contactType}&quick=true`);
        } else if (quickBooksEnabled && data.integrateQuickBooks) {
          // Move to QuickBooks integration step
          setCurrentStep('quickbooks');
        } else {
          // Go to enhanced form
          setCurrentStep('enhanced');
        }
      } else {
        const errorData = await response.text();
        throw new Error(`Create failed (${response.status}): ${errorData}`);
      }
    } catch (error) {
      alert('Failed to create contact. Please try again.');
    }
  };

  const handleQuickBooksSync = async () => {
    if (!contactId) return;

    try {
      const response = await fetch(`/api/clients/${contactId}/sync-quickbooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push(`/dashboard/clients/${contactId}/profile?created=true&synced=true`);
      } else {
        // Continue anyway, just show that sync failed
        router.push(`/dashboard/clients/${contactId}/profile?created=true&sync_failed=true`);
      }
    } catch (error) {
      router.push(`/dashboard/clients/${contactId}/profile?created=true&sync_failed=true`);
    }
  };

  const formSections = [
    {
      id: 'basic',
      title: 'Basic Info',
      completed: !!(watch('firstName') && watch('lastName') && watch('email')),
      required: true
    },
    {
      id: 'type',
      title: 'Contact Type',
      completed: !!(watch('contactType') && watch('status')),
      required: true
    },
    {
      id: 'business',
      title: 'Business Info',
      completed: !!(watch('company') || watch('accountType')),
      required: false
    }
  ];

  const completedSections = formSections.filter(s => s.completed).length;

  if (currentStep === 'quickbooks' && contactId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/10 p-3">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6 pt-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CurrencyDollarIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              QuickBooks Integration
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Sync this contact to QuickBooks for seamless financial management
            </p>
          </div>

          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-slate-700/20 shadow-xl p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Customer Records</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Sync contact info and addresses</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">Financial Tracking</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Track invoices and payments</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <SparklesIcon className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900 dark:text-purple-100">Automated Sync</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Keep data in sync automatically</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleQuickBooksSync}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg"
            >
              <CurrencyDollarIcon className="h-5 w-5" />
              Sync to QuickBooks
            </button>

            <button
              onClick={() => router.push(`/dashboard/clients/${contactId}/profile?created=true&skipped_sync=true`)}
              className="w-full px-6 py-3 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-slate-900 p-3">
      <div className="max-w-md mx-auto">
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
            <p className="text-sm text-slate-600 dark:text-slate-400">Quick capture</p>
          </div>
          <div className="w-10" />
        </div>

        {/* Progress */}
        <FormProgress
          current={completedSections}
          total={formSections.length}
          sections={formSections}
          className="mb-6"
        />

        {/* Quick Capture Toggle */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClockIcon className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">Quick Capture Mode</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Create contact fast, enhance profile later
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('quickCapture')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>

        {/* Main Form */}
        <QuickStartForm
          onSubmit={handleSubmit(onQuickSubmit)}
          isSubmitting={isSubmitting}
          submitIcon={<CheckIcon className="h-5 w-5" />}
          submitLabel={watchedQuickCapture ? "Create & Complete Profile" : "Create Contact"}
        >
          {/* Contact Type Selection */}
          <FormSection
            title="Contact Type"
            description="What type of contact is this?"
            required
            completed={!!watchedContactType}
          >
            <div className="grid grid-cols-1 gap-2">
              {contactTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    watchedContactType === option.value
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register('contactType', { required: 'Contact type is required' })}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    watchedContactType === option.value
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {watchedContactType === option.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </FormSection>

          {/* Basic Information */}
          <FormSection
            title="Basic Information"
            description="Essential contact details"
            required
            completed={!!(watch('firstName') && watch('lastName') && watch('email'))}
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField<ContactFormData>
                label="First Name"
                name="firstName"
                placeholder="John"
                required
                register={register}
                error={errors.firstName}
                icon={<UserIcon className="h-5 w-5" />}
                autoComplete="given-name"
                validation={{
                  minLength: { value: 2, message: 'Minimum 2 characters' }
                }}
              />

              <FormField<ContactFormData>
                label="Last Name"
                name="lastName"
                placeholder="Doe"
                required
                register={register}
                error={errors.lastName}
                autoComplete="family-name"
                validation={{
                  minLength: { value: 2, message: 'Minimum 2 characters' }
                }}
              />
            </div>

            <FormField<ContactFormData>
              label="Email"
              name="email"
              type="email"
              placeholder="john@example.com"
              required
              register={register}
              error={errors.email}
              icon={<EnvelopeIcon className="h-5 w-5" />}
              autoComplete="email"
              inputMode="email"
              validation={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
            />

            <FormField<ContactFormData>
              label="Phone"
              name="phone"
              type="tel"
              placeholder="(555) 123-4567"
              register={register}
              error={errors.phone}
              icon={<PhoneIcon className="h-5 w-5" />}
              autoComplete="tel"
              inputMode="tel"
              helpText="Optional but recommended for better communication"
            />
          </FormSection>

          {/* Business Information */}
          <FormSection
            title="Business Information"
            description="Company and specialization details"
            completed={!!(watch('company') || watch('accountType'))}
          >
            {(watchedContactType !== 'team') && (
              <FormField<ContactFormData>
                label="Company Name"
                name="company"
                placeholder="ABC Construction"
                register={register}
                error={errors.company}
                icon={<BuildingOfficeIcon className="h-5 w-5" />}
                autoComplete="organization"
                helpText="Leave blank for individuals"
              />
            )}

            <FormField<ContactFormData>
              label={watchedContactType === 'client' ? 'Client Type' : 'Specialization'}
              name="accountType"
              type="select"
              options={getAccountTypeOptions(watchedContactType)}
              register={register}
              error={errors.accountType}
              helpText="Helps us customize your experience"
            />

            <FormField<ContactFormData>
              label="Status"
              name="status"
              type="select"
              options={getStatusOptions(watchedContactType)}
              register={register}
              error={errors.status}
              required
            />
          </FormSection>

          {/* QuickBooks Integration Prompt */}
          {quickBooksEnabled && !watchedQuickCapture && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    QuickBooks Integration Available
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    Sync this contact to QuickBooks for seamless financial tracking and reporting.
                  </p>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('integrateQuickBooks')}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Sync to QuickBooks after creation
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <FormField<ContactFormData>
            label="Notes"
            name="notes"
            type="textarea"
            placeholder="Additional notes about this contact..."
            register={register}
            error={errors.notes}
            rows={2}
            helpText="Any additional information or special requirements"
          />
        </QuickStartForm>

        {/* Enhancement Promise */}
        {watchedQuickCapture && (
          <div className="mt-4 p-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-white/20 dark:border-slate-700/20">
            <div className="flex items-center gap-3 text-sm">
              <SparklesIcon className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div className="text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white">Next step:</strong> Complete the contact profile to unlock advanced CRM features, automated workflows, and better insights.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
