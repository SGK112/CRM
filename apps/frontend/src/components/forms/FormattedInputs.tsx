'use client';

import { EnvelopeIcon, GlobeAltIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface FormattedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: 'phone' | 'zip' | 'email' | 'address' | 'website' | 'text';
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function FormattedInput({
  label,
  value,
  onChange,
  type,
  placeholder,
  required,
  error,
  icon: Icon,
  className = ''
}: FormattedInputProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const formatPhone = (input: string): string => {
    // Remove all non-digits
    const cleaned = input.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return cleaned;
    }
  };

  const formatZip = (input: string): string => {
    // Remove all non-digits and hyphens
    const cleaned = input.replace(/[^\d-]/g, '');

    // Format as XXXXX or XXXXX-XXXX
    if (cleaned.length > 5 && !cleaned.includes('-')) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}`;
    }
    return cleaned.slice(0, 10); // Max length for ZIP+4
  };

  const formatWebsite = (input: string): string => {
    let url = input.toLowerCase().trim();

    // Add https:// if no protocol specified
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      // Add www. if it looks like a domain without subdomain
      if (!url.includes('.') || (!url.startsWith('www.') && !url.includes('://'))) {
        if (!url.startsWith('www.')) {
          url = `www.${url}`;
        }
      }
      url = `https://${url}`;
    }

    return url;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    switch (type) {
      case 'phone':
        newValue = formatPhone(newValue);
        break;
      case 'zip':
        newValue = formatZip(newValue);
        break;
      case 'website':
        newValue = formatWebsite(newValue);
        break;
      case 'email':
        newValue = newValue.toLowerCase().trim();
        break;
      default:
        break;
    }

    setDisplayValue(newValue);
    onChange(newValue);
  };

  const getInputType = () => {
    switch (type) {
      case 'email':
        return 'email';
      case 'website':
        return 'url';
      default:
        return 'text';
    }
  };

  const getIcon = () => {
    if (Icon) return Icon;

    switch (type) {
      case 'phone':
        return PhoneIcon;
      case 'address':
      case 'zip':
        return MapPinIcon;
      case 'email':
        return EnvelopeIcon;
      case 'website':
        return GlobeAltIcon;
      default:
        return null;
    }
  };

  const IconComponent = getIcon();

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconComponent className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          type={getInputType()}
          value={displayValue}
          onChange={handleChange}
          className={`w-full ${IconComponent ? 'pl-10' : ''} pr-4 py-3 rounded-xl border ${
            error
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
          } text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
          placeholder={placeholder}
          required={required}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

interface AddressInputProps {
  label: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  onChange: (field: string, value: string) => void;
  required?: boolean;
  className?: string;
}

export function AddressInput({
  label,
  address,
  address2 = '',
  city,
  state,
  zipCode,
  country = 'US',
  onChange,
  required,
  className = ''
}: AddressInputProps) {
  const states = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="space-y-3">
        {/* Street Address */}
        <div className="relative">
          <MapPinIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={address}
            onChange={(e) => onChange('address', e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-600 bg-slate-800 text-white focus:ring-2 focus:ring-amber-500"
            placeholder="Street address"
            required={required}
          />
        </div>

        {/* Address Line 2 */}
        <input
          type="text"
          value={address2}
          onChange={(e) => onChange('address2', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-800 text-white focus:ring-2 focus:ring-amber-500"
          placeholder="Apt, suite, unit, building (optional)"
        />

        {/* City, State, ZIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-800 text-white focus:ring-2 focus:ring-amber-500"
            placeholder="City"
            required={required}
          />

          <select
            value={state}
            onChange={(e) => onChange('state', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-800 text-white focus:ring-2 focus:ring-amber-500"
            required={required}
          >
            <option value="">State</option>
            {states.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>

          <FormattedInput
            label=""
            value={zipCode}
            onChange={(value) => onChange('zipCode', value)}
            type="zip"
            placeholder="ZIP code"
            required={required}
          />
        </div>
      </div>
    </div>
  );
}

interface ServiceLocationInputProps {
  serviceLocation: 'primary_address' | 'billing_address' | 'custom' | 'multiple';
  customServiceAddress?: string;
  accessInstructions?: string;
  onChange: (field: string, value: string) => void;
  className?: string;
}

export function ServiceLocationInput({
  serviceLocation,
  customServiceAddress = '',
  accessInstructions = '',
  onChange,
  className = ''
}: ServiceLocationInputProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Service Location
      </label>

      <div className="space-y-4">
        {/* Service Location Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { value: 'primary_address', label: 'Same as address above' },
            { value: 'billing_address', label: 'Same as billing address' },
            { value: 'custom', label: 'Different location' },
            { value: 'multiple', label: 'Multiple locations' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange('serviceLocation', option.value)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                serviceLocation === option.value
                  ? 'border-amber-600 bg-amber-600/20 text-amber-400'
                  : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Custom Address Input */}
        {serviceLocation === 'custom' && (
          <div className="relative">
            <MapPinIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={customServiceAddress}
              onChange={(e) => onChange('customServiceAddress', e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-600 bg-slate-800 text-white focus:ring-2 focus:ring-amber-500"
              placeholder="Enter service address"
            />
          </div>
        )}

        {/* Access Instructions */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Access Instructions
          </label>
          <textarea
            value={accessInstructions}
            onChange={(e) => onChange('accessInstructions', e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-800 text-white focus:ring-2 focus:ring-amber-500"
            placeholder="Gate codes, building access, parking instructions, etc."
          />
        </div>
      </div>
    </div>
  );
}
