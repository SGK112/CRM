'use client';

import {
    StandardButton,
    StandardCard,
    StandardPageWrapper,
    StandardSection
} from '@/components/ui/StandardPageWrapper';
import {
    ArrowRightIcon,
    CheckIcon,
    UserPlusIcon,
    DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    contactType: 'client',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });

  const handleNext = async () => {
    // Validation
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Please fill in all required fields');
        return;
      }
    }

    if (step === 3) {
      // Submit form
      setSubmitting(true);
      setError('');

      try {
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            entityType: formData.contactType,
            status: 'lead'
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Create failed: ${errorData}`);
        }

        const result = await response.json();
        const newContactId = result.data?.id || result.data?._id;

        if (newContactId) {
          // Refresh sidebar counts
          if (typeof window !== 'undefined' && (window as any).refreshSidebarCounts) {
            (window as any).refreshSidebarCounts();
          }
          
          // Redirect to the contact page
          router.push(`/dashboard/clients/${newContactId}?created=true&type=${formData.contactType}`);
        } else {
          setSuccess(true);
          // Reset form after delay
          setTimeout(() => {
            setStep(1);
            setSuccess(false);
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              contactType: 'client',
              address: '',
              city: '',
              state: '',
              zipCode: '',
              notes: ''
            });
          }, 2000);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create contact');
      } finally {
        setSubmitting(false);
      }
    } else {
      setStep(step + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  if (success) {
    return (
      <StandardPageWrapper
        title="Contact Created!"
        subtitle="Successfully added new contact to your CRM"
        icon={<CheckIcon className="h-6 w-6" />}
      >
        <StandardSection>
          <div className="max-w-2xl mx-auto text-center">
            <StandardCard>
              <div className="p-8">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Success!</h2>
                <p className="text-slate-400 mb-6">Contact created successfully!</p>
                <p className="text-sm text-slate-500">Redirecting...</p>
              </div>
            </StandardCard>
          </div>
        </StandardSection>
      </StandardPageWrapper>
    );
  }

  return (
    <StandardPageWrapper
      title="Add New Contact"
      subtitle="Quick and easy contact onboarding process"
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
              Step {step} of 3
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    s <= step ? 'bg-amber-500' : 'bg-slate-600'
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
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <StandardCard>
            <div className="space-y-6">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlusIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
                    <p className="text-slate-400">
                      Let's start with essential contact details
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Type */}
              {step === 2 && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlusIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Contact Type</h2>
                    <p className="text-slate-400">
                      What type of contact is this?
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { value: 'client', label: 'Client', description: 'People who hire your services' },
                      { value: 'subcontractor', label: 'Subcontractor', description: 'Professionals you work with' },
                      { value: 'vendor', label: 'Vendor', description: 'Suppliers and service providers' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all hover:scale-105 ${
                          formData.contactType === option.value
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-slate-300 dark:border-slate-600 hover:border-amber-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="contactType"
                          value={option.value}
                          checked={formData.contactType === option.value}
                          onChange={(e) => setFormData({...formData, contactType: e.target.value})}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{option.label}</div>
                            <div className="text-sm text-slate-400">{option.description}</div>
                          </div>
                          {formData.contactType === option.value && (
                            <CheckIcon className="h-6 w-6 text-amber-500" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Additional Details */}
              {step === 3 && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Additional Details</h2>
                    <p className="text-slate-400">
                      Add location and other information
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">ZIP Code</label>
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="12345"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                        rows={3}
                        placeholder="Any additional notes or special requirements..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <StandardButton variant="secondary" onClick={handleBack}>
                    Back
                  </StandardButton>
                )}
                <StandardButton
                  onClick={handleNext}
                  size="lg"
                  disabled={submitting}
                  className="ml-auto"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : step === 3 ? (
                    <>
                      Create Contact
                      <CheckIcon className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </>
                  )}
                </StandardButton>
              </div>
            </div>
          </StandardCard>
        </div>
      </StandardSection>
    </StandardPageWrapper>
  );
}
