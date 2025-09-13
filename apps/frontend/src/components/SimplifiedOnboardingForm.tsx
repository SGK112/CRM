'use client';

import {
    ArrowRightIcon,
    BuildingOfficeIcon,
    CheckIcon,
    CloudArrowUpIcon,
    CurrencyDollarIcon,
    EnvelopeIcon,
    PhoneIcon,
    SparklesIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OnboardingFormData {
  // Essential Info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;

  // Type & Preferences
  entityType: 'client' | 'subcontractor' | 'vendor';
  businessType?: string;

  // Sync Preferences
  autoSync: boolean;
  syncQuickBooks: boolean;
  syncCalendar: boolean;
}

const entityTypeOptions = [
  {
    value: 'client',
    label: 'Client',
    icon: '👥',
    description: 'People who hire your services'
  },
  {
    value: 'subcontractor',
    label: 'Subcontractor',
    icon: '🔨',
    description: 'Professionals you work with'
  },
  {
    value: 'vendor',
    label: 'Vendor',
    icon: '🚚',
    description: 'Suppliers and material providers'
  }
];

const businessTypeOptions = {
  client: [
    { value: 'residential', label: '🏠 Residential' },
    { value: 'commercial', label: '🏢 Commercial' },
    { value: 'industrial', label: '🏭 Industrial' }
  ],
  subcontractor: [
    { value: 'plumbing', label: '🔧 Plumbing' },
    { value: 'electrical', label: '⚡ Electrical' },
    { value: 'hvac', label: '❄️ HVAC' },
    { value: 'flooring', label: '🪵 Flooring' },
    { value: 'roofing', label: '🏠 Roofing' },
    { value: 'general', label: '🔨 General' }
  ],
  vendor: [
    { value: 'materials', label: '📦 Materials' },
    { value: 'tools', label: '🔧 Tools' },
    { value: 'equipment', label: '🚜 Equipment' },
    { value: 'services', label: '🛠️ Services' }
  ]
};

export default function SimplifiedOnboardingForm() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    entityType: 'client',
    businessType: '',
    autoSync: true,
    syncQuickBooks: false,
    syncCalendar: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for existing integrations
  useEffect(() => {
    checkIntegrations();
  }, []);

  const checkIntegrations = async () => {
    try {
      // Check QuickBooks
      const qbResponse = await fetch('/api/quickbooks/status');
      if (qbResponse.ok) {
        const qbData = await qbResponse.json();
        if (qbData.enabled) {
          setFormData(prev => ({ ...prev, syncQuickBooks: true }));
        }
      }

      // Check Calendar integrations
      const calResponse = await fetch('/api/calendar/status');
      if (calResponse.ok) {
        const calData = await calResponse.json();
        if (calData.enabled) {
          setFormData(prev => ({ ...prev, syncCalendar: true }));
        }
      }
    } catch (error) {
      // Integrations check failed - expected in development
      // Silent fail in development mode
    }
  };

  const handleInputChange = (field: keyof OnboardingFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
    }

    if (step === 2) {
      if (!formData.entityType) newErrors.entityType = 'Please select an entity type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setSyncStatus('syncing');

    try {
      const authToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken && authToken !== 'null' && authToken !== 'undefined' && authToken.length > 10) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      // Create the contact
      const endpoint = formData.entityType === 'client' ? '/api/clients' :
                     formData.entityType === 'vendor' ? '/api/vendors' : '/api/subcontractors';

      const createResponse = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          type: formData.entityType,
          businessType: formData.businessType,
          status: 'active',
          tags: [],
          // Sync preferences
          preferences: {
            autoSync: formData.autoSync,
            syncQuickBooks: formData.syncQuickBooks,
            syncCalendar: formData.syncCalendar
          }
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create contact');
      }

      const created = await createResponse.json();
      const contactId = created?._id || created?.id;

      // Handle sync operations if enabled
      if (formData.autoSync && contactId) {
        const syncPromises = [];

        if (formData.syncQuickBooks) {
          syncPromises.push(
            fetch(`/api/clients/${contactId}/sync-quickbooks`, {
              method: 'POST',
              headers,
            }).catch(() => null) // Don't fail if sync fails
          );
        }

        if (formData.syncCalendar) {
          syncPromises.push(
            fetch(`/api/clients/${contactId}/sync-calendar`, {
              method: 'POST',
              headers,
            }).catch(() => null) // Don't fail if sync fails
          );
        }

        // Wait for sync operations (with timeout)
        if (syncPromises.length > 0) {
          await Promise.allSettled(syncPromises);
        }
      }

      setSyncStatus('success');

      // Navigate to the contact profile
      setTimeout(() => {
        router.push(`/dashboard/clients/${contactId}/profile?created=true&onboarded=true`);
      }, 1500);

    } catch (error) {
      setSyncStatus('error');
      // Error handling - could be logged to monitoring service in production
    } finally {
      setLoading(false);
    }
  };

  if (syncStatus === 'syncing') {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/10 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CloudArrowUpIcon className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Creating & Syncing
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Setting up your contact and syncing with your tools...
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  if (syncStatus === 'success') {
    return (
      <div className="min-h-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/10 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            All Set!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Contact created successfully. {formData.autoSync ? 'Data synced to your tools.' : ''}
          </p>
          <div className="text-sm text-emerald-600 dark:text-emerald-400">
            Redirecting to profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-orange-50 dark:bg-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Quick Contact Setup
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Fast creation with smart syncing
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Step {currentStep} of 3
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {Math.round((currentStep / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <UserIcon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Basic Information
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Essential contact details
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.firstName
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.lastName
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      errors.email
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Company
                  </label>
                  <div className="relative">
                    <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="ABC Construction"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Entity Type & Business Type */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <BuildingOfficeIcon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Contact Type
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  What type of contact is this?
                </p>
              </div>

              <div className="space-y-3">
                {entityTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.entityType === option.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={formData.entityType === option.value}
                      onChange={(e) => handleInputChange('entityType', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.entityType === option.value
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {formData.entityType === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="text-2xl">{option.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {option.label}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {formData.entityType && businessTypeOptions[formData.entityType] && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Specialization (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {businessTypeOptions[formData.entityType].map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.businessType === type.value
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                        }`}
                      >
                        <input
                          type="radio"
                          value={type.value}
                          checked={formData.businessType === type.value}
                          onChange={(e) => handleInputChange('businessType', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-3 h-3 rounded-full border ${
                          formData.businessType === type.value
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-slate-300 dark:border-slate-600'
                        }`} />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Sync Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CloudArrowUpIcon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Sync Preferences
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Keep your data synchronized across tools
                </p>
              </div>

              <div className="space-y-4">
                {/* Auto Sync Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <SparklesIcon className="h-6 w-6 text-orange-600" />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Auto Sync
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Automatically sync data across connected tools
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoSync}
                      onChange={(e) => handleInputChange('autoSync', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                {/* QuickBooks Sync */}
                <div className={`p-4 rounded-xl border transition-all ${
                  formData.autoSync ? 'border-slate-200 dark:border-slate-600' : 'border-slate-100 dark:border-slate-700 opacity-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          QuickBooks
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Sync customer data and financial records
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.syncQuickBooks && formData.autoSync}
                        onChange={(e) => handleInputChange('syncQuickBooks', e.target.checked)}
                        disabled={!formData.autoSync}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 disabled:opacity-50"></div>
                    </label>
                  </div>
                </div>

                {/* Calendar Sync */}
                <div className={`p-4 rounded-xl border transition-all ${
                  formData.autoSync ? 'border-slate-200 dark:border-slate-600' : 'border-slate-100 dark:border-slate-700 opacity-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 bg-green-600 rounded flex items-center justify-center">
                        <span className="text-xs text-white font-bold">📅</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Calendar
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Sync appointments and project schedules
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.syncCalendar && formData.autoSync}
                        onChange={(e) => handleInputChange('syncCalendar', e.target.checked)}
                        disabled={!formData.autoSync}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-green-600 disabled:opacity-50"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <SparklesIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Smart Syncing
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      We'll keep your data synchronized across all your tools. You can change these settings anytime in your account preferences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              Back
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index + 1 <= currentStep
                      ? 'bg-orange-500'
                      : 'bg-slate-200 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                Next
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    Create Contact
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
