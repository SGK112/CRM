'use client';

import { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CogIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import TeamManagement from './TeamManagement';

interface BusinessProfile {
  id?: string;
  name: string;
  description: string;
  industry:
    | 'remodeling'
    | 'construction'
    | 'landscaping'
    | 'electrical'
    | 'plumbing'
    | 'roofing'
    | 'painting'
    | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  businessType: 'sole_proprietor' | 'llc' | 'corporation' | 'partnership';
  licenseNumber?: string;
  insuranceProvider?: string;
  logo?: string;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  component?: React.ReactNode;
}

interface BusinessOnboardingProps {
  onComplete?: (business: BusinessProfile) => void;
  existingBusiness?: BusinessProfile;
  className?: string;
}

const INDUSTRIES = [
  { value: 'remodeling', label: 'Home Remodeling' },
  { value: 'construction', label: 'General Construction' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'electrical', label: 'Electrical Services' },
  { value: 'plumbing', label: 'Plumbing Services' },
  { value: 'roofing', label: 'Roofing Services' },
  { value: 'painting', label: 'Painting Services' },
  { value: 'other', label: 'Other' },
];

const BUSINESS_TYPES = [
  { value: 'sole_proprietor', label: 'Sole Proprietor' },
  { value: 'llc', label: 'Limited Liability Company (LLC)' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'partnership', label: 'Partnership' },
];

export default function BusinessOnboarding({
  onComplete,
  existingBusiness,
  className = '',
}: BusinessOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: '',
    description: '',
    industry: 'remodeling',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    contact: {
      phone: '',
      email: '',
      website: '',
    },
    businessType: 'llc',
    licenseNumber: '',
    insuranceProvider: '',
  });

  useEffect(() => {
    if (existingBusiness) {
      setBusinessProfile(existingBusiness);
    }
  }, [existingBusiness]);

  const steps: OnboardingStep[] = [
    {
      id: 'business-info',
      title: 'Business Information',
      description: 'Set up your basic business profile',
      completed: !!(businessProfile.name && businessProfile.industry),
      required: true,
      component: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                Business Name *
              </label>
              <input
                type="text"
                value={businessProfile.name}
                onChange={e => setBusinessProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
                placeholder="Your Business Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                Industry *
              </label>
              <select
                value={businessProfile.industry}
                onChange={e =>
                  setBusinessProfile(prev => ({
                    ...prev,
                    industry: e.target.value as BusinessProfile['industry'],
                  }))
                }
                className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
                required
              >
                {INDUSTRIES.map(industry => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Business Description
            </label>
            <textarea
              value={businessProfile.description}
              onChange={e => setBusinessProfile(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
              rows={3}
              placeholder="Brief description of your business services..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Business Type
            </label>
            <select
              value={businessProfile.businessType}
              onChange={e =>
                setBusinessProfile(prev => ({
                  ...prev,
                  businessType: e.target.value as BusinessProfile['businessType'],
                }))
              }
              className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
            >
              {BUSINESS_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ),
    },
    {
      id: 'contact-address',
      title: 'Contact & Address',
      description: 'Add your business contact information and address',
      completed: !!(
        businessProfile.contact.phone &&
        businessProfile.contact.email &&
        businessProfile.address.street
      ),
      required: true,
      component: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                Business Phone *
              </label>
              <input
                type="tel"
                value={businessProfile.contact.phone}
                onChange={e =>
                  setBusinessProfile(prev => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value },
                  }))
                }
                className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
                placeholder="(555) 123-4567"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                Business Email *
              </label>
              <input
                type="email"
                value={businessProfile.contact.email}
                onChange={e =>
                  setBusinessProfile(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value },
                  }))
                }
                className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
                placeholder="info@yourbusiness.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Website (Optional)
            </label>
            <input
              type="url"
              value={businessProfile.contact.website}
              onChange={e =>
                setBusinessProfile(prev => ({
                  ...prev,
                  contact: { ...prev.contact, website: e.target.value },
                }))
              }
              className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
              placeholder="https://yourbusiness.com"
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-[var(--text)]">Business Address</h4>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={businessProfile.address.street}
                onChange={e =>
                  setBusinessProfile(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value },
                  }))
                }
                className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
                placeholder="123 Business Street"
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">City *</label>
                <input
                  type="text"
                  value={businessProfile.address.city}
                  onChange={e =>
                    setBusinessProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value },
                    }))
                  }
                  className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">State *</label>
                <input
                  type="text"
                  value={businessProfile.address.state}
                  onChange={e =>
                    setBusinessProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value },
                    }))
                  }
                  className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
                  placeholder="State"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={businessProfile.address.zipCode}
                  onChange={e =>
                    setBusinessProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value },
                    }))
                  }
                  className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
                  placeholder="12345"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'licenses-insurance',
      title: 'Licenses & Insurance',
      description: 'Add your professional credentials (optional)',
      completed: true, // Optional step
      required: false,
      component: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Professional Credentials
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Adding your license and insurance information builds trust with clients and can be
                  displayed on estimates and invoices.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              License Number
            </label>
            <input
              type="text"
              value={businessProfile.licenseNumber}
              onChange={e =>
                setBusinessProfile(prev => ({ ...prev, licenseNumber: e.target.value }))
              }
              className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
              placeholder="Enter your business license number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Insurance Provider
            </label>
            <input
              type="text"
              value={businessProfile.insuranceProvider}
              onChange={e =>
                setBusinessProfile(prev => ({ ...prev, insuranceProvider: e.target.value }))
              }
              className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)]"
              placeholder="Enter your insurance provider name"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'team-setup',
      title: 'Team Setup',
      description: 'Invite your team members and set up roles',
      completed: false, // Will be updated based on team members
      required: false,
      component: <TeamManagement businessId="current-business" />,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save business profile
      console.log('Saving business profile:', businessProfile);
      onComplete?.(businessProfile);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = steps[currentStep];
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercent = (completedSteps / steps.length) * 100;

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Welcome to Remodely CRM</h1>
        <p className="text-lg text-[var(--text-dim)]">
          Let's set up your business profile to get started
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--text)]">Setup Progress</span>
          <span className="text-sm text-[var(--text-dim)]">
            {completedSteps} of {steps.length} completed
          </span>
        </div>
        <div className="w-full bg-[var(--surface)] rounded-full h-2">
          <div
            className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                index === currentStep
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                  : index < currentStep
                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    : 'text-[var(--text-dim)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed
                    ? 'bg-green-600 text-white'
                    : index === currentStep
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface)] text-[var(--text-dim)]'
                }`}
              >
                {step.completed ? <CheckCircleIcon className="w-5 h-5" /> : index + 1}
              </div>
              <div className="hidden md:block text-left">
                <div className="font-medium">{step.title}</div>
                <div className="text-xs text-[var(--text-dim)]">{step.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="surface-solid p-8 mb-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold text-[var(--text)]">{currentStepData.title}</h2>
            {currentStepData.required && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 text-xs font-medium rounded">
                Required
              </span>
            )}
          </div>
          <p className="text-[var(--text-dim)]">{currentStepData.description}</p>
        </div>

        {currentStepData.component}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="pill pill-ghost disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex items-center gap-3">
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="pill pill-tint-amber disabled:opacity-50"
            >
              {loading ? 'Completing...' : 'Complete Setup'}
            </button>
          ) : (
            <button onClick={handleNext} className="pill pill-tint-amber flex items-center gap-2">
              Next Step
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
