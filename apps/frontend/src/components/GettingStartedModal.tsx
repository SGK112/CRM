'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  completed: boolean;
  href?: string;
}

export default function GettingStartedModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'clients',
      title: 'Add Your First Contact',
      description: 'Start by adding contact information to organize your customers',
      icon: UserGroupIcon,
      action: 'Add Contact',
      completed: false,
      href: '/dashboard/contacts?action=new',
    },
    {
      id: 'estimate',
      title: 'Create an Estimate',
      description: 'Build professional estimates with integrated pricing from your vendors',
      icon: ClipboardDocumentListIcon,
      action: 'Create Estimate',
      completed: false,
      href: '/dashboard/estimates/new',
    },
    {
      id: 'invoice',
      title: 'Send Your First Invoice',
      description: 'Convert estimates to invoices and get paid faster',
      icon: CurrencyDollarIcon,
      action: 'Create Invoice',
      completed: false,
      href: '/dashboard/invoices/new',
    },
  ]);



  useEffect(() => {
    // Check localStorage for completion status
    const savedProgress = localStorage.getItem('onboarding_progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setSteps(prev =>
        prev.map(step => ({
          ...step,
          completed: progress[step.id] || false,
        }))
      );
    }
  }, []);

  // Function to mark steps as completed when user visits pages
  // Currently unused but ready for future integration
  /*
  const markStepCompleted = (stepId: string) => {
    setSteps(prev => {
      const updated = prev.map(step => (step.id === stepId ? { ...step, completed: true } : step));

      // Save to localStorage
      const progress = updated.reduce(
        (acc, step) => {
          acc[step.id] = step.completed;
          return acc;
        },
        {} as Record<string, boolean>
      );
      localStorage.setItem('onboarding_progress', JSON.stringify(progress));

      return updated;
    });
  };
  */

  const handleActionClick = (step: OnboardingStep) => {
    if (step.href) {
      router.push(step.href);
      onClose();
    }
  };

  const tryDemo = () => {
    // Navigate to demo mode
    router.push('/dashboard?demo=true');
    onClose();
  };

  const allCompleted = steps.every(step => step.completed);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-100">Welcome to Remodely CRM</h2>
              <p className="text-slate-400 mt-1">
                Let's get you started with managing your remodeling business
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-300 text-2xl">
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!allCompleted ? (
            <>
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Your Progress</span>
                  <span className="text-sm text-slate-400">
                    {steps.filter(s => s.completed).length} of {steps.length} completed
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4 mb-6">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border transition-all ${
                      step.completed
                        ? 'bg-green-900/20 border-green-600/30'
                        : 'bg-slate-800/50 border-slate-700 hover:border-amber-600/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          step.completed ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircleIcon className="w-6 h-6" />
                        ) : (
                          <step.icon className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-100">{step.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                      </div>
                      {!step.completed && (
                        <button
                          onClick={() => handleActionClick(step)}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {step.action}
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Demo Option */}
              <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <PlayIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-100">Try Demo Mode</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Explore with sample data to see how everything works
                    </p>
                  </div>
                  <button
                    onClick={tryDemo}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Start Demo
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Completion Message */
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">You're All Set!</h3>
              <p className="text-slate-400 mb-6">
                Great job! You've completed the basic setup. You're ready to start managing your
                remodeling business.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
              >
                Start Using CRM
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
