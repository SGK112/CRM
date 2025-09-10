'use client';

import {
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckIcon,
  CloudArrowUpIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ArrowRightIcon,
  UserPlusIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  StandardPageWrapper,
  StandardCard,
  StandardSection,
  StandardButton,
  StandardGrid
} from '@/components/ui/StandardPageWrapper';
import Link from 'next/link';

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
    description: 'Suppliers and service providers'
  }
];

const businessTypeOptions = {
  client: [
    'Residential Property Owner',
    'Commercial Property Owner',
    'Real Estate Developer',
    'Property Manager',
    'General Contractor',
    'Other'
  ],
  subcontractor: [
    'Electrician',
    'Plumber', 
    'HVAC Technician',
    'Flooring Specialist',
    'Painter',
    'Roofer',
    'Landscaper',
    'Other'
  ],
  vendor: [
    'Building Materials Supplier',
    'Equipment Rental',
    'Tool Supplier',
    'Specialty Materials',
    'Professional Services',
    'Other'
  ]
};

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEnhanced = searchParams?.get('enhanced') === 'true';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    syncCalendar: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to clients page with success message
      router.push('/dashboard/clients?created=true');
    } catch (error: unknown) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create contact. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncData = async (syncType: string) => {
    setLoading(true);
    
    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success feedback
      setFormData(prev => ({
        ...prev,
        [syncType]: true
      }));
    } catch (error) {
      // Handle sync error silently or show user feedback
    } finally {
      setLoading(false);
    }
  };

  if (submitting) {
    return (
      <StandardPageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <StandardCard className="max-w-md mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Creating Contact...</h2>
            <p className="text-slate-400">
              {formData.autoSync && 'Syncing data and '}Setting up your new contact
            </p>
          </StandardCard>
        </div>
      </StandardPageWrapper>
    );
  }

  return (
    <StandardPageWrapper
      title="Add New Contact"
      subtitle={isEnhanced ? "Enhanced contact creation with advanced options" : "Quick contact setup"}
      icon={<UserPlusIcon className="h-6 w-6" />}
      headerActions={
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/clients/import"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
            Bulk Import
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">
              Step {currentStep} of 3
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    step <= currentStep ? 'bg-amber-500' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <StandardSection>
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <StandardCard>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Contact Information</h2>
                  <p className="text-slate-400">
                    Let's start with the basic details
                  </p>
                </div>

                <StandardGrid cols={2} gap="md">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.firstName 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                      } text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.lastName 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                      } text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </StandardGrid>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      errors.email 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    } text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BuildingOfficeIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company/Organization
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="Company name (optional)"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <StandardButton onClick={handleNext} size="lg">
                    Continue
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </StandardButton>
                </div>
              </div>
            </StandardCard>
          )}

          {/* Step 2: Contact Type */}
          {currentStep === 2 && (
            <StandardCard>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BuildingOfficeIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Contact Type</h2>
                  <p className="text-slate-400">
                    What type of contact is this?
                  </p>
                </div>

                <StandardGrid cols={1} gap="md">
                  {entityTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setFormData(prev => ({ ...prev, entityType: option.value as OnboardingFormData['entityType'] }))}
                      className={`cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:scale-105 ${
                        formData.entityType === option.value
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-300 dark:border-slate-600 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{option.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{option.label}</h3>
                          <p className="text-slate-400">{option.description}</p>
                        </div>
                        {formData.entityType === option.value && (
                          <CheckIcon className="h-6 w-6 text-amber-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </StandardGrid>

                {formData.entityType && (
                  <div className="space-y-4 animate-in slide-in-from-bottom">
                    <label className="block text-sm font-medium text-slate-300">
                      Specialization/Type
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select specialization...</option>
                      {businessTypeOptions[formData.entityType].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <StandardButton variant="secondary" onClick={handleBack}>
                    Back
                  </StandardButton>
                  <StandardButton onClick={handleNext} size="lg">
                    Continue
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </StandardButton>
                </div>
              </div>
            </StandardCard>
          )}

          {/* Step 3: Sync Preferences */}
          {currentStep === 3 && (
            <StandardCard>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CloudArrowUpIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Sync Preferences</h2>
                  <p className="text-slate-400">
                    Connect your systems for seamless workflow
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <CheckIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Auto-sync Contact Data</h4>
                        <p className="text-sm text-slate-400">Automatically sync basic contact information</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.autoSync}
                      onChange={(e) => setFormData(prev => ({ ...prev, autoSync: e.target.checked }))}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <CurrencyDollarIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">QuickBooks Integration</h4>
                        <p className="text-sm text-slate-400">Sync financial data and invoicing</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.syncQuickBooks}
                        onChange={(e) => setFormData(prev => ({ ...prev, syncQuickBooks: e.target.checked }))}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      {!formData.syncQuickBooks && (
                        <StandardButton 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleSyncData('syncQuickBooks')}
                          disabled={loading}
                        >
                          {loading ? 'Connecting...' : 'Connect'}
                        </StandardButton>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <SparklesIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Calendar Integration</h4>
                        <p className="text-sm text-slate-400">Sync appointments and meetings</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.syncCalendar}
                      onChange={(e) => setFormData(prev => ({ ...prev, syncCalendar: e.target.checked }))}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                  </div>
                </div>

                {errors.submit && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm">{errors.submit}</p>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <StandardButton variant="secondary" onClick={handleBack}>
                    Back
                  </StandardButton>
                  <StandardButton 
                    onClick={handleSubmit} 
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create Contact'}
                    {!submitting && <CheckIcon className="h-4 w-4 ml-2" />}
                  </StandardButton>
                </div>
              </div>
            </StandardCard>
          )}
        </div>
      </StandardSection>
    </StandardPageWrapper>
  );
}
