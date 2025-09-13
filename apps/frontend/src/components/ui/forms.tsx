import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { FieldError, FieldValues, Path, RegisterOptions, UseFormRegister } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues = FieldValues> {
  label: string;
  name: Path<T>;
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'password' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  register: UseFormRegister<T>;
  error?: FieldError;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  icon?: React.ReactNode;
  validation?: RegisterOptions<T>;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal' | 'search';
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export const FormField = <T extends FieldValues = FieldValues>({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  register,
  error,
  helpText,
  options,
  icon,
  validation,
  autoComplete,
  inputMode,
  disabled,
  rows = 3,
  className = ''
}: FormFieldProps<T>) => {
  const baseInputClasses = `
    w-full px-4 py-3.5 rounded-2xl border transition-all duration-200 text-base
    bg-white dark:bg-slate-800 text-slate-900 dark:text-white
    placeholder-slate-500 dark:placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error
      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10'
      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
    }
    ${icon ? 'pl-12' : ''}
  `;

  const validationRules = {
    required: required ? `${label} is required` : false,
    ...validation,
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}

        {type === 'textarea' ? (
          <textarea
            id={name}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            className={baseInputClasses}
            {...register(name, validationRules)}
          />
        ) : type === 'select' ? (
          <select
            id={name}
            disabled={disabled}
            autoComplete={autoComplete}
            className={baseInputClasses}
            {...register(name, validationRules)}
          >
            <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-slate-800">
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            inputMode={inputMode}
            className={baseInputClasses}
            {...register(name, validationRules)}
          />
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      {helpText && !error && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <InformationCircleIcon className="h-4 w-4 flex-shrink-0" />
          <span>{helpText}</span>
        </div>
      )}
    </div>
  );
};

interface FormSectionProps {
  title: string;
  description?: string;
  required?: boolean;
  completed?: boolean;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  required,
  completed,
  children,
  className = '',
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      <div
        className={`p-4 border-b border-slate-200 dark:border-slate-700 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              completed
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              {completed ? (
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {title}
                {required && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Required</span>
                )}
              </h3>
              {description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {collapsible && (
            <div className="text-slate-400">
              <svg
                className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {(!collapsible || !isCollapsed) && (
        <div className="p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

interface FormProgressProps {
  current: number;
  total: number;
  sections: Array<{ id: string; title: string; completed: boolean; required: boolean }>;
  className?: string;
}

export const FormProgress: React.FC<FormProgressProps> = ({
  current,
  total,
  sections,
  className = ''
}) => {
  const percentage = Math.round((current / total) * 100);
  const completedRequired = sections.filter(s => s.required && s.completed).length;
  const totalRequired = sections.filter(s => s.required).length;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Form Progress</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {current} of {total} sections completed
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">{percentage}%</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {completedRequired}/{totalRequired} required
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
        <div
          className="bg-orange-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {sections.map((section) => (
          <div key={section.id} className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${
              section.completed ? 'bg-green-500' : section.required ? 'bg-red-300' : 'bg-slate-300'
            }`} />
            <span className={`${
              section.completed ? 'text-green-600' : section.required ? 'text-slate-900 dark:text-white' : 'text-slate-500'
            }`}>
              {section.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface QuickStartFormProps {
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  isSubmitting?: boolean;
  className?: string;
}

export const QuickStartForm: React.FC<QuickStartFormProps> = ({
  children,
  onSubmit,
  submitLabel = 'Save & Continue',
  submitIcon,
  isSubmitting = false,
  className = ''
}) => {
  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-slate-700/20 shadow-xl shadow-black/10 p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {children}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-orange-500/25"
            >
              {isSubmitting ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                submitIcon
              )}
              {isSubmitting ? 'Creating...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface FieldValidationProps {
  value: string | number | boolean;
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validate?: (value: string | number | boolean) => boolean | string;
  };
  realTime?: boolean;
}

export const useFieldValidation = ({ value, rules, realTime = false }: FieldValidationProps) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!realTime || !value) return;

    let errorMessage = null;
    const stringValue = value?.toString() || '';

    if (rules.required && (!value || stringValue.trim() === '')) {
      errorMessage = 'This field is required';
    } else if (rules.minLength && stringValue.length < rules.minLength) {
      errorMessage = `Minimum ${rules.minLength} characters required`;
    } else if (rules.maxLength && stringValue.length > rules.maxLength) {
      errorMessage = `Maximum ${rules.maxLength} characters allowed`;
    } else if (rules.pattern && !rules.pattern.test(stringValue)) {
      errorMessage = 'Invalid format';
    } else if (rules.validate) {
      const result = rules.validate(value);
      if (result !== true) {
        errorMessage = typeof result === 'string' ? result : 'Invalid value';
      }
    }

    setError(errorMessage);
    setIsValid(errorMessage === null);
  }, [value, rules, realTime]);

  return { isValid, error };
};
