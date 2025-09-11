'use client';

import {
  ArrowRightIcon,
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CheckIcon,
  MapPinIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  BuildingStorefrontIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserPlusIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  StandardPageWrapper,
  StandardCard,
  StandardSection,
  StandardButton,
  StandardGrid
} from '@/components/ui/StandardPageWrapper';
import {
  FormattedInput
} from '@/components/forms/FormattedInputs';
import Link from 'next/link';

interface OnboardingFormData {
  // Essential Info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  workPhone?: string;
  company?: string;
  title?: string;
  website?: string;

  // Address Information
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;

  // Billing Address (if different)
  billingDifferent: boolean;
  billingAddress?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;

  // Service Information
  serviceLocation: 'primary_address' | 'billing_address' | 'custom' | 'multiple';
  customServiceAddress?: string;
  accessInstructions?: string;
  preferredServiceTimes?: string;
  emergencyContact?: string;
  emergencyPhone?: string;

  // Type & Project Info
  entityType: 'client' | 'subcontractor' | 'vendor';
  businessType?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  description?: string;

  // Additional Service Industry Fields
  licenseNumber?: string;
  insuranceNumber?: string;
  hourlyRate?: string;
  workAddress?: string;
  accountNumber?: string;
  taxId?: string;
  notes?: string;
  preferredContactMethod?: 'phone' | 'email' | 'text' | 'app';
  specialRequirements?: string;
  petInformation?: string;
  hasKeys?: boolean;
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
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    // Essential Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    workPhone: '',
    company: '',
    title: '',
    website: '',

    // Address Information
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',

    // Billing Address
    billingDifferent: false,
    billingAddress: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',

    // Service Information
    serviceLocation: 'primary_address',
    customServiceAddress: '',
    accessInstructions: '',
    preferredServiceTimes: '',
    emergencyContact: '',
    emergencyPhone: '',

    // Type & Project Info
    entityType: 'client',
    businessType: '',
    projectType: '',
    budget: '',
    timeline: '',
    description: '',

    // Additional Fields
    licenseNumber: '',
    insuranceNumber: '',
    hourlyRate: '',
    workAddress: '',
    accountNumber: '',
    taxId: '',
    notes: '',
    preferredContactMethod: 'phone',
    specialRequirements: '',
    petInformation: '',
    hasKeys: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Basic contact information validation
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (step === 2) {
      // Contact type validation
      if (!formData.entityType) newErrors.entityType = 'Please select a contact type';
    } else if (step === 3) {
      // Type-specific validation
      if (formData.entityType === 'client') {
        if (!formData.address.trim()) newErrors.address = 'Address is required for clients';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
      } else if (formData.entityType === 'subcontractor') {
        if (!formData.businessType) newErrors.businessType = 'Please specify your trade/specialty';
        if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required for subcontractors';
      } else if (formData.entityType === 'vendor') {
        if (!formData.company?.trim()) newErrors.company = 'Company name is required for vendors';
        if (!formData.businessType) newErrors.businessType = 'Please specify vendor type';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 3) {
      // Submit the form on step 3
      setSubmitting(true);

      try {
        const authToken = localStorage.getItem('accessToken');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (authToken && authToken !== 'null' && authToken !== 'undefined' && authToken.length > 10) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        // Create the contact using the same structure as other forms
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`.trim() || formData.company,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            type: formData.entityType,
            contactType: formData.entityType,
            businessType: formData.businessType,
            entityType: formData.entityType,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            licenseNumber: formData.licenseNumber,
            insuranceNumber: formData.insuranceNumber,
            hourlyRate: formData.hourlyRate,
            workAddress: formData.workAddress,
            accountNumber: formData.accountNumber,
            taxId: formData.taxId,
            notes: formData.notes,
            status: 'lead'
          }),
        });

        if (response.ok) {
          const created = await response.json();
          const newContactId = created?._id || created?.id;

          if (!newContactId) {
            throw new Error('Contact created but no ID returned');
          }

          // Store contact in localStorage as backup (for server restart recovery)
          try {
            const existingContacts = JSON.parse(localStorage.getItem('crm-dev-contacts') || '[]');
            const contactExists = existingContacts.find((c: { id?: string; _id?: string }) => c.id === newContactId || c._id === newContactId);
            if (!contactExists) {
              existingContacts.unshift(created);
              localStorage.setItem('crm-dev-contacts', JSON.stringify(existingContacts));
            }
          } catch (e) {
            // Silent fail
          }

          // Verify the contact exists before redirecting
          const verifyResponse = await fetch(`/api/clients/${newContactId}`, { headers });

          if (verifyResponse.ok) {
            // Contact verified - safe to redirect
            router.push(`/dashboard/clients/${newContactId}?created=true&type=${formData.entityType}`);
          } else {
            // Contact not found immediately - wait and retry
            await new Promise(resolve => setTimeout(resolve, 200));
            const retryResponse = await fetch(`/api/clients/${newContactId}`, { headers });

            if (retryResponse.ok) {
              router.push(`/dashboard/clients/${newContactId}?created=true&type=${formData.entityType}`);
            } else {
              // Fallback: redirect to contacts list with success message
              router.push(`/dashboard/clients?created=${newContactId}&name=${encodeURIComponent(created.name || 'Contact')}`);
            }
          }
        } else {
          const errorData = await response.text();
          throw new Error(`Create failed: ${errorData}`);
        }
      } catch (error: unknown) {
        setErrors({ submit: error instanceof Error ? error.message : 'Failed to create contact. Please try again.' });
      } finally {
        setSubmitting(false);
      }
    } else {
      // Move to next step
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (submitting) {
    return (
      <StandardPageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <StandardCard className="max-w-md mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Creating Contact...</h2>
            <p className="text-slate-400">
              Setting up your new contact...
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

          {/* Step 1: Basic Contact Information */}
          {currentStep === 1 && (
            <StandardCard>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Basic Contact Information</h2>
                  <p className="text-slate-400">
                    Let's start with the essential contact details
                  </p>
                </div>

                {/* Essential Contact Info */}
                <StandardGrid cols={2} gap="md">
                  <FormattedInput
                    label="First Name *"
                    type="text"
                    value={formData.firstName}
                    onChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
                    placeholder="Enter first name"
                    icon={UserIcon}
                    error={errors.firstName}
                    required
                  />

                  <FormattedInput
                    label="Last Name *"
                    type="text"
                    value={formData.lastName}
                    onChange={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
                    placeholder="Enter last name"
                    icon={UserIcon}
                    error={errors.lastName}
                    required
                  />
                </StandardGrid>

                <FormattedInput
                  label="Email Address *"
                  type="email"
                  value={formData.email}
                  onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                  placeholder="contact@example.com"
                  icon={EnvelopeIcon}
                  error={errors.email}
                  required
                />

                <FormattedInput
                  label="Primary Phone"
                  type="phone"
                  value={formData.phone || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                  placeholder="(555) 123-4567"
                  icon={PhoneIcon}
                />

                <div className="flex justify-end pt-6">
                  <StandardButton onClick={handleNext} size="lg">
                    Continue to Contact Type
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </StandardButton>
                </div>
              </div>
            </StandardCard>
          )}

          {/* Step 2: Contact Type Selection */}
          {currentStep === 2 && (
            <StandardCard>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BuildingOfficeIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Contact Type</h2>
                  <p className="text-slate-400">
                    What type of contact is this? This will determine what additional information we collect.
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
                    {errors.businessType && (
                      <p className="text-red-500 text-sm">{errors.businessType}</p>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <StandardButton variant="secondary" onClick={handleBack}>
                    Back
                  </StandardButton>
                  <StandardButton onClick={handleNext} size="lg">
                    Continue to Details
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </StandardButton>
                </div>
              </div>
            </StandardCard>
          )}

          {/* Step 3: Contact-Specific Information */}
          {currentStep === 3 && (
            <StandardCard>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    {formData.entityType === 'client' && <UserGroupIcon className="h-8 w-8 text-white" />}
                    {formData.entityType === 'subcontractor' && <WrenchScrewdriverIcon className="h-8 w-8 text-white" />}
                    {formData.entityType === 'vendor' && <BuildingStorefrontIcon className="h-8 w-8 text-white" />}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {formData.entityType === 'client' && 'Client Information'}
                    {formData.entityType === 'subcontractor' && 'Contractor Details'}
                    {formData.entityType === 'vendor' && 'Vendor Information'}
                  </h2>
                  <p className="text-slate-400">
                    {formData.entityType === 'client' && 'Location and project details for your client'}
                    {formData.entityType === 'subcontractor' && 'Trade skills and licensing information'}
                    {formData.entityType === 'vendor' && 'Company and service information'}
                  </p>
                </div>

                {/* Client-specific fields */}
                {formData.entityType === 'client' && (
                  <div className="space-y-6">
                    {/* Primary Address */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Project Address</h3>

                      <FormattedInput
                        label="Street Address *"
                        type="address"
                        value={formData.address}
                        onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                        placeholder="123 Main Street"
                        icon={MapPinIcon}
                        required
                      />

                      <FormattedInput
                        label="Address Line 2"
                        type="address"
                        value={formData.address2 || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, address2: value }))}
                        placeholder="Apt, Suite, Unit, Building, Floor, etc."
                        icon={MapPinIcon}
                      />

                      <StandardGrid cols={3} gap="md">
                        <FormattedInput
                          label="City *"
                          type="text"
                          value={formData.city}
                          onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                          placeholder="City"
                          icon={MapPinIcon}
                          required
                        />

                        <FormattedInput
                          label="State *"
                          type="text"
                          value={formData.state}
                          onChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                          placeholder="State"
                          icon={MapPinIcon}
                          required
                        />

                        <FormattedInput
                          label="ZIP Code *"
                          type="zip"
                          value={formData.zipCode}
                          onChange={(value) => setFormData(prev => ({ ...prev, zipCode: value }))}
                          placeholder="12345"
                          icon={MapPinIcon}
                          required
                        />
                      </StandardGrid>
                    </div>

                    {/* Billing Address Option */}
                    <div className="border-t border-slate-600 pt-6">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.billingDifferent}
                          onChange={(e) => setFormData(prev => ({ ...prev, billingDifferent: e.target.checked }))}
                          className="w-5 h-5 text-amber-500 bg-slate-700 border-slate-600 rounded focus:ring-amber-500 focus:ring-2"
                        />
                        <span className="text-slate-300">Billing address is different from project address</span>
                      </label>

                      {formData.billingDifferent && (
                        <div className="mt-6 space-y-4 animate-in slide-in-from-bottom">
                          <h3 className="text-lg font-semibold text-white">Billing Address</h3>

                          <FormattedInput
                            label="Billing Street Address"
                            type="address"
                            value={formData.billingAddress || ''}
                            onChange={(value) => setFormData(prev => ({ ...prev, billingAddress: value }))}
                            placeholder="123 Business Street"
                            icon={MapPinIcon}
                          />

                          <StandardGrid cols={3} gap="md">
                            <FormattedInput
                              label="Billing City"
                              type="text"
                              value={formData.billingCity || ''}
                              onChange={(value) => setFormData(prev => ({ ...prev, billingCity: value }))}
                              placeholder="City"
                              icon={MapPinIcon}
                            />

                            <FormattedInput
                              label="Billing State"
                              type="text"
                              value={formData.billingState || ''}
                              onChange={(value) => setFormData(prev => ({ ...prev, billingState: value }))}
                              placeholder="State"
                              icon={MapPinIcon}
                            />

                            <FormattedInput
                              label="Billing ZIP"
                              type="zip"
                              value={formData.billingZipCode || ''}
                              onChange={(value) => setFormData(prev => ({ ...prev, billingZipCode: value }))}
                              placeholder="12345"
                              icon={MapPinIcon}
                            />
                          </StandardGrid>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Subcontractor-specific fields */}
                {formData.entityType === 'subcontractor' && (
                  <div className="space-y-6">
                    <StandardGrid cols={2} gap="md">
                      <FormattedInput
                        label="License Number"
                        type="text"
                        value={formData.licenseNumber || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, licenseNumber: value }))}
                        placeholder="LIC123456"
                        icon={DocumentCheckIcon}
                      />

                      <FormattedInput
                        label="Insurance Policy Number"
                        type="text"
                        value={formData.insuranceNumber || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, insuranceNumber: value }))}
                        placeholder="INS789012"
                        icon={ShieldCheckIcon}
                      />
                    </StandardGrid>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-300">
                        Hourly Rate
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-400 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={formData.hourlyRate || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                          className="pl-7 w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="75.00"
                        />
                      </div>
                    </div>

                    <FormattedInput
                      label="Work Address (if different from home)"
                      type="address"
                      value={formData.workAddress || ''}
                      onChange={(value) => setFormData(prev => ({ ...prev, workAddress: value }))}
                      placeholder="123 Workshop Street"
                      icon={MapPinIcon}
                    />
                  </div>
                )}

                {/* Vendor-specific fields */}
                {formData.entityType === 'vendor' && (
                  <div className="space-y-6">
                    <FormattedInput
                      label="Company Name *"
                      type="text"
                      value={formData.company || ''}
                      onChange={(value) => setFormData(prev => ({ ...prev, company: value }))}
                      placeholder="ABC Supply Company"
                      icon={BuildingOfficeIcon}
                      required
                    />

                    <StandardGrid cols={2} gap="md">
                      <FormattedInput
                        label="Account Number"
                        type="text"
                        value={formData.accountNumber || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, accountNumber: value }))}
                        placeholder="ACC123456"
                        icon={CreditCardIcon}
                      />

                      <FormattedInput
                        label="Tax ID / EIN"
                        type="text"
                        value={formData.taxId || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, taxId: value }))}
                        placeholder="12-3456789"
                        icon={DocumentTextIcon}
                      />
                    </StandardGrid>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Company Address</h3>

                      <FormattedInput
                        label="Street Address *"
                        type="address"
                        value={formData.address}
                        onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                        placeholder="123 Business Drive"
                        icon={MapPinIcon}
                        required
                      />

                      <StandardGrid cols={3} gap="md">
                        <FormattedInput
                          label="City *"
                          type="text"
                          value={formData.city}
                          onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                          placeholder="City"
                          icon={MapPinIcon}
                          required
                        />

                        <FormattedInput
                          label="State *"
                          type="text"
                          value={formData.state}
                          onChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                          placeholder="State"
                          icon={MapPinIcon}
                          required
                        />

                        <FormattedInput
                          label="ZIP Code *"
                          type="zip"
                          value={formData.zipCode}
                          onChange={(value) => setFormData(prev => ({ ...prev, zipCode: value }))}
                          placeholder="12345"
                          icon={MapPinIcon}
                          required
                        />
                      </StandardGrid>
                    </div>
                  </div>
                )}

                {/* Notes section for all types */}
                <div className="border-t border-slate-600 pt-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-300">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                      placeholder="Any additional notes or special requirements..."
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <StandardButton variant="secondary" onClick={handleBack}>
                    Back
                  </StandardButton>
                  <StandardButton
                    onClick={handleNext}
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Contact...
                      </>
                    ) : (
                      <>
                        Create Contact
                        <CheckIcon className="h-4 w-4 ml-2" />
                      </>
                    )}
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
