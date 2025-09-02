'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import HelpTooltip from '@/components/ui/HelpTooltip';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  industry: string;
  teamSize: string;
  businessType: string;
  primaryGoals: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    industry: '',
    teamSize: '',
    businessType: '',
    primaryGoals: [],
  });

  const [steps] = useState<OnboardingStep[]>([
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Tell us about yourself and your business',
      completed: false,
    },
    {
      id: 'team',
      title: 'Set Up Your Team',
      description: 'Invite team members and set their roles',
      completed: false,
    },
    {
      id: 'clients',
      title: 'Add Your First Client',
      description: 'Start building your client database',
      completed: false,
    },
    {
      id: 'project',
      title: 'Create Your First Project',
      description: 'Set up a project to see how it all works',
      completed: false,
    },
  ]);

  useEffect(() => {
    // Load existing user data
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setProfile(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      }));
    }
  }, []);

  const industries = [
    'Construction & Remodeling',
    'Home Services',
    'HVAC',
    'Electrical',
    'Plumbing',
    'Landscaping',
    'Roofing',
    'Flooring',
    'Other',
  ];

  const teamSizes = ['Just me', '2-5 people', '6-15 people', '16-50 people', '50+ people'];

  const businessTypes = [
    'General Contractor',
    'Specialty Contractor',
    'Home Services',
    'Property Management',
    'Real Estate',
    'Other',
  ];

  const goals = [
    'Organize client information',
    'Track project progress',
    'Send professional estimates',
    'Manage team schedules',
    'Improve communication',
    'Increase revenue',
    'Automate workflows',
    'Better reporting',
  ];

  const handleNext = async () => {
    if (currentStep === 0) {
      await saveProfile();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          jobTitle: profile.jobTitle,
          company: profile.company,
          industry: profile.industry,
          teamSize: profile.teamSize,
          businessType: profile.businessType,
          primaryGoals: profile.primaryGoals,
          onboardingCompleted: true,
        }),
      });

      if (response.ok) {
        // Update localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const updatedUser = { ...user, ...profile, onboardingCompleted: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      // Mark onboarding as completed
      localStorage.setItem('onboardingCompleted', 'true');
      router.push('/dashboard?welcome=true');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-amber-600" />
        <h2 className="mt-4 text-2xl font-bold text-[var(--text)]">Tell us about your business</h2>
        <p className="mt-2 text-[var(--text-dim)]">
          This helps us personalize your experience and provide better recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">First Name *</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={e => setProfile({ ...profile, firstName: e.target.value })}
            className="input"
            placeholder="John"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Last Name *</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={e => setProfile({ ...profile, lastName: e.target.value })}
            className="input"
            placeholder="Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Phone Number</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={e => setProfile({ ...profile, phone: e.target.value })}
            className="input"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Job Title</label>
          <input
            type="text"
            value={profile.jobTitle}
            onChange={e => setProfile({ ...profile, jobTitle: e.target.value })}
            className="input"
            placeholder="Owner, Project Manager, etc."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={profile.company}
            onChange={e => setProfile({ ...profile, company: e.target.value })}
            className="input"
            placeholder="Your Construction Company"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Industry</label>
          <select
            value={profile.industry}
            onChange={e => setProfile({ ...profile, industry: e.target.value })}
            className="input"
          >
            <option value="">Select your industry</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Team Size</label>
          <select
            value={profile.teamSize}
            onChange={e => setProfile({ ...profile, teamSize: e.target.value })}
            className="input"
          >
            <option value="">Select team size</option>
            {teamSizes.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Business Type</label>
          <select
            value={profile.businessType}
            onChange={e => setProfile({ ...profile, businessType: e.target.value })}
            className="input"
          >
            <option value="">Select business type</option>
            {businessTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Primary Goals (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {goals.map(goal => (
              <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.primaryGoals.includes(goal)}
                  onChange={e => {
                    if (e.target.checked) {
                      setProfile({ ...profile, primaryGoals: [...profile.primaryGoals, goal] });
                    } else {
                      setProfile({
                        ...profile,
                        primaryGoals: profile.primaryGoals.filter(g => g !== goal),
                      });
                    }
                  }}
                  className="rounded border-[var(--border)] text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-[var(--text)]">{goal}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <UserGroupIcon className="mx-auto h-12 w-12 text-amber-600" />
        <h2 className="mt-4 text-2xl font-bold text-[var(--text)]">Set up your team</h2>
        <p className="mt-2 text-[var(--text-dim)]">
          Invite team members and assign roles. You can always add more later.
        </p>
      </div>

      <div className="bg-[var(--surface-2)] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Team Roles Available</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-[var(--text)]">Owner</p>
              <p className="text-sm text-[var(--text-dim)]">Full access to all features</p>
            </div>
            <span className="text-sm text-amber-600">You</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-[var(--text)]">Admin</p>
              <p className="text-sm text-[var(--text-dim)]">
                Manage projects, clients, and team members
              </p>
            </div>
            <span className="text-sm text-[var(--text-dim)]">
              Up to {profile.teamSize === 'Just me' ? '0' : '5'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-[var(--text)]">Project Manager</p>
              <p className="text-sm text-[var(--text-dim)]">Manage projects and view reports</p>
            </div>
            <span className="text-sm text-[var(--text-dim)]">Unlimited</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-[var(--text)]">Team Member</p>
              <p className="text-sm text-[var(--text-dim)]">View assigned projects and tasks</p>
            </div>
            <span className="text-sm text-[var(--text-dim)]">Unlimited</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[var(--text-dim)] mb-4">
          Skip for now and add team members later from Settings → Team
        </p>
        <button onClick={() => router.push('/dashboard/settings?tab=team')} className="btn-outline">
          Add Team Members Now
        </button>
      </div>
    </div>
  );

  const renderClientStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-amber-600" />
        <h2 className="mt-4 text-2xl font-bold text-[var(--text)]">Add your first client</h2>
        <p className="mt-2 text-[var(--text-dim)]">
          Start building your client database to track projects and communications
        </p>
      </div>

      <div className="text-center">
        <p className="text-[var(--text-dim)] mb-6">
          You can skip this step and add clients later, or add your first client now
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push('/dashboard/clients/new')} className="btn-amber">
            Add First Client
          </button>
          <button onClick={handleNext} className="btn-outline">
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );

  const renderProjectStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CreditCardIcon className="mx-auto h-12 w-12 text-amber-600" />
        <h2 className="mt-4 text-2xl font-bold text-[var(--text)]">Create your first project</h2>
        <p className="mt-2 text-[var(--text-dim)]">
          Projects help you organize work, track progress, and manage timelines
        </p>
      </div>

      <div className="bg-[var(--surface-2)] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
          What you can do with projects:
        </h3>
        <ul className="space-y-2 text-[var(--text-dim)]">
          <li className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
            Track project progress and milestones
          </li>
          <li className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
            Manage tasks and deadlines
          </li>
          <li className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
            Generate estimates and invoices
          </li>
          <li className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
            Communicate with clients
          </li>
          <li className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
            Store project documents and photos
          </li>
        </ul>
      </div>

      <div className="text-center">
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push('/dashboard/projects/new')} className="btn-amber">
            Create First Project
          </button>
          <button onClick={completeOnboarding} className="btn-outline">
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderProfileStep();
      case 1:
        return renderTeamStep();
      case 2:
        return renderClientStep();
      case 3:
        return renderProjectStep();
      default:
        return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 0) {
      return profile.firstName && profile.lastName && profile.company;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text)]">Welcome to Remodely CRM!</h1>
          <p className="mt-2 text-[var(--text-dim)]">Let's get you set up in just a few minutes</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    index <= currentStep
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'border-[var(--border)] text-[var(--text-dim)]'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-amber-600' : 'bg-[var(--border)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--text-dim)] text-center">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title}
          </p>
        </div>

        {/* Step Content */}
        <div className="bg-[var(--surface-1)] rounded-xl shadow-sm border border-[var(--border)] p-8 mb-8">
          {getCurrentStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-3">
            <button onClick={() => router.push('/dashboard')} className="btn-ghost">
              Skip Setup
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="btn-amber disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
