'use client';

import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface OnboardingTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({
  steps,
  isActive,
  onComplete,
  onSkip,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const element = document.querySelector(steps[currentStep].target) as HTMLElement;
    setTargetElement(element);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('onboarding-highlight');
    }

    return () => {
      if (element) {
        element.classList.remove('onboarding-highlight');
      }
    };
  }, [currentStep, isActive, steps]);

  if (!isActive || !steps.length) return null;

  const nextStep = () => {
    if (steps[currentStep].action) {
      steps[currentStep].action!();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onSkip} />

      {/* Tour Tooltip */}
      <div className="fixed z-[60] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <PlayIcon className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6">{step.content}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep
                    ? 'bg-amber-600'
                    : index < currentStep
                      ? 'bg-amber-300'
                      : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="flex items-center gap-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            {currentStep < steps.length - 1 && <ChevronRightIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 55;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05));
          transition: all 0.3s ease;
        }

        .onboarding-highlight::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          background: linear-gradient(
            45deg,
            rgba(245, 158, 11, 0.6),
            rgba(251, 191, 36, 0.4),
            rgba(245, 158, 11, 0.6)
          );
          border-radius: 15px;
          z-index: -1;
          animation: onboarding-border-rotate 3s linear infinite;
        }

        @keyframes onboarding-border-rotate {
          0% {
            background: linear-gradient(
              45deg,
              rgba(245, 158, 11, 0.6),
              rgba(251, 191, 36, 0.4),
              rgba(245, 158, 11, 0.6)
            );
          }
          33% {
            background: linear-gradient(
              135deg,
              rgba(251, 191, 36, 0.6),
              rgba(245, 158, 11, 0.4),
              rgba(251, 191, 36, 0.6)
            );
          }
          66% {
            background: linear-gradient(
              225deg,
              rgba(245, 158, 11, 0.6),
              rgba(251, 191, 36, 0.4),
              rgba(245, 158, 11, 0.6)
            );
          }
          100% {
            background: linear-gradient(
              315deg,
              rgba(251, 191, 36, 0.6),
              rgba(245, 158, 11, 0.4),
              rgba(251, 191, 36, 0.6)
            );
          }
        }
      `}</style>
    </>
  );
}
