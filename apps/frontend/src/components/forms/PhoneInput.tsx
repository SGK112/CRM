import React, { useState, useEffect } from 'react';
import { PhoneIcon } from '@heroicons/react/24/outline';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Phone input component that formats numbers in +1 (XXX) XXX-XXXX format
 * Automatically adds +1 prefix for US/Canadian numbers
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Phone number",
  className = "input",
  required = false,
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format phone number as user types
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Handle different lengths
    if (digits.length === 0) return '';
    
    // If it starts with 1, assume it's already country code
    if (digits.startsWith('1')) {
      const number = digits.slice(1); // Remove the 1
      if (number.length === 0) return '+1 ';
      if (number.length <= 3) return `+1 (${number}`;
      if (number.length <= 6) return `+1 (${number.slice(0, 3)}) ${number.slice(3)}`;
      return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6, 10)}`;
    } else {
      // Add +1 prefix for US/Canadian numbers
      if (digits.length <= 3) return `+1 (${digits}`;
      if (digits.length <= 6) return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  // Extract clean phone number (digits only with country code)
  const getCleanPhoneNumber = (formatted: string): string => {
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 0) return '';
    
    // Ensure it starts with 1 for US/Canadian numbers
    if (digits.startsWith('1')) {
      return digits;
    } else {
      return '1' + digits;
    }
  };

  // Update display when value prop changes
  useEffect(() => {
    if (value) {
      setDisplayValue(formatPhoneNumber(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    const clean = getCleanPhoneNumber(formatted);
    
    setDisplayValue(formatted);
    onChange(clean);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative">
      <input
        type="tel"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        required={required}
        disabled={disabled}
        autoComplete="tel"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <PhoneIcon className="h-5 w-5 text-[var(--text-muted)]" />
      </div>
    </div>
  );
};

export default PhoneInput;
