import React from 'react';

// Professional CRM Form Components following Salesforce/HubSpot patterns

interface InputGroupProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}

export function InputGroup({ label, required, error, helpText, children }: InputGroupProps) {
  return (
    <div className="input-group">
      <label className={required ? 'required' : ''}>
        {label}
      </label>
      {children}
      {error && (
        <div className="error-message">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      {helpText && !error && (
        <div className="help-text">
          {helpText}
        </div>
      )}
    </div>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="form-section">
      <div className="form-section-header">
        <h3 className="form-section-title">{title}</h3>
        {description && (
          <p className="form-section-description">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export function SelectField({ label, value, onChange, options, placeholder, required, error, helpText }: SelectFieldProps) {
  return (
    <InputGroup label={label} required={required} error={error} helpText={helpText}>
      <select
        className={`input ${error ? 'error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </InputGroup>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'url' | 'password';
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function TextField({ label, value, onChange, type = 'text', placeholder, required, error, helpText, size = 'default' }: TextFieldProps) {
  const sizeClass = size === 'sm' ? 'input-sm' : size === 'lg' ? 'input-lg' : '';
  
  return (
    <InputGroup label={label} required={required} error={error} helpText={helpText}>
      <input
        type={type}
        className={`input ${sizeClass} ${error ? 'error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </InputGroup>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  rows?: number;
}

export function TextAreaField({ label, value, onChange, placeholder, required, error, helpText, rows = 4 }: TextAreaFieldProps) {
  return (
    <InputGroup label={label} required={required} error={error} helpText={helpText}>
      <textarea
        className={`input ${error ? 'error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
    </InputGroup>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
}

export function CheckboxField({ label, checked, onChange, helpText }: CheckboxFieldProps) {
  return (
    <div className="checkbox-item">
      <input
        type="checkbox"
        className="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div>
        <label>{label}</label>
        {helpText && <div className="field-hint">{helpText}</div>}
      </div>
    </div>
  );
}

interface RadioOption {
  value: string;
  label: string;
  helpText?: string;
}

interface RadioGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  required?: boolean;
  error?: string;
}

export function RadioGroup({ label, value, onChange, options, required, error }: RadioGroupProps) {
  return (
    <InputGroup label={label} required={required} error={error}>
      <div className="radio-group">
        {options.map((option) => (
          <div key={option.value} className="radio-item">
            <input
              type="radio"
              className="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              required={required}
            />
            <div>
              <label>{option.label}</label>
              {option.helpText && <div className="field-hint">{option.helpText}</div>}
            </div>
          </div>
        ))}
      </div>
    </InputGroup>
  );
}

// Status Badge Component for data display
interface StatusBadgeProps {
  status: 'active' | 'pending' | 'inactive' | 'error';
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${status}`}>
      {children}
    </span>
  );
}

// Professional Data Table Component
interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: TableColumn[];
  data: any[];
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export function DataTable({ columns, data, onSort, sortKey, sortDirection }: DataTableProps) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.sortable ? 'sortable' : ''}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center justify-between">
                  {column.label}
                  {column.sortable && sortKey === column.key && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
