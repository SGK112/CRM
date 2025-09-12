'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function ClientsImportPage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to download CSV template
  const downloadTemplate = () => {
    const csvContent = `firstName,lastName,email,phone,company,contactType,address,city,state,zipCode,country,website,tags,notes
,,,(555) 000-0000,,client,,,,,USA,,,"Notes here"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (!rows || rows.length === 0) {
        setError('No rows found in CSV');
        return;
      }

      // Basic validation: ensure required columns exist
      const headers = Object.keys(rows[0]);
      const required = ['firstName', 'lastName', 'email'];
      const missing = required.filter(r => !headers.includes(r));
      if (missing.length) {
        setError(`Missing required columns: ${missing.join(', ')}`);
        return;
      }

      setParsed(rows);
      // show preview; actual import happens when user clicks Import
    } catch (e: unknown) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  // Simple CSV parser that handles quoted fields
  const parseCSV = (text: string) => {
    const lines: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"') {
        // Look ahead for escaped quote
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++; // skip escaped
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === '\n' && !inQuotes) {
        lines.push(cur.replace(/\r$/, ''));
        cur = '';
      } else {
        cur += ch;
      }
    }
    if (cur.length) lines.push(cur.replace(/\r$/, ''));

    if (lines.length === 0) return [];

    const header = splitCSVLine(lines[0]);
    const rows = [] as Record<string, string>[];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = splitCSVLine(lines[i]);
      const obj: Record<string, string> = {};
      for (let j = 0; j < header.length; j++) {
        obj[header[j].trim()] = (cols[j] ?? '').trim();
      }
      rows.push(obj);
    }
    return rows;
  };

  const splitCSVLine = (line: string) => {
    const cols: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cols.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur);
    return cols;
  };

  const router = useRouter();

  const importAll = async () => {
    if (!parsed || parsed.length === 0) return;
    setUploading(true);
    setImportErrors([]);
    setProgress({ done: 0, total: parsed.length });

    const successes: string[] = [];
    const failures: { row: number; error: string }[] = [];

  for (let i = 0; i < parsed.length; i++) {
      const row = parsed[i];
      const payload: Record<string, unknown> = {
        // Name fields with multiple variations
        firstName: row.firstName || row.firstname || row.FirstName || row.first_name || row['First Name'] || '',
        lastName: row.lastName || row.lastname || row.LastName || row.last_name || row['Last Name'] || '',
        
        // Contact information
        email: row.email || row.Email || row.emailAddress || row.EmailAddress || row['Email Address'] || '',
        phone: row.phone || row.Phone || row.phoneNumber || row.PhoneNumber || row['Phone Number'] || row.mobile || row.Mobile || '',
        
        // Business information
        company: row.company || row.Company || row.organization || row.Organization || row.business || row.Business || '',
        
        // Additional fields
        status: row.status || row.Status || 'active',
        notes: row.notes || row.Notes || row.description || row.Description || '',
        tags: row.tags || row.Tags ? (row.tags || row.Tags).split(',').map((t: string) => t.trim()) : undefined,
        
        // Contact type mapping
        contactType: row.contactType || row.type || row.Type || row.category || row.Category || 'client',
        
        // Address fields if present
        address: row.address || row.Address || row['Street Address'] || '',
        city: row.city || row.City || '',
        state: row.state || row.State || row.province || row.Province || '',
        zipCode: row.zipCode || row.zip || row.Zip || row.postal || row.Postal || row['Postal Code'] || '',
        country: row.country || row.Country || '',
        
        // Additional contact fields
        website: row.website || row.Website || row.url || row.URL || '',
        linkedIn: row.linkedIn || row.LinkedIn || row.linkedin || ''
      };

      try {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          successes.push(String(i));
        } else {
          const txt = await res.text();
          failures.push({ row: i + 1, error: `${res.status} ${txt}` });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        failures.push({ row: i + 1, error: msg });
      }

      setProgress({ done: i + 1, total: parsed.length });
    }

    if (failures.length) {
      setImportErrors(failures.map(f => `Row ${f.row}: ${f.error}`));
    }

    setUploading(false);

  // After import, navigate back to clients listing to refresh data
  router.push('/dashboard/clients');
  };

  const [parsed, setParsed] = useState<Record<string, string>[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard/clients"
              className="inline-flex items-center text-gray-700 hover:text-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back to Clients
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400">Import Clients</h1>
          <p className="text-gray-800 mt-1">Upload a CSV file to add multiple clients at once</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              How it works
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>1. Upload a CSV file with client information</p>
              <p>2. Map your columns to our fields</p>
              <p>3. Preview and import your clients</p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700 rounded-md transition-colors"
          >
            Download Template
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upload CSV File
        </h2>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
          <div className="text-center">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Drop your CSV file here, or click to browse
                </span>
              </label>
              <input
                id="file-upload"
                ref={fileInputRef}
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">CSV files only, up to 10MB</p>
          </div>

          {uploading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Uploading...</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Upload Error
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">CSV Format</h4>
              <p className="text-xs text-gray-700">
                Columns recognized automatically: firstName, lastName, email, phone, company, address, city, state, zipCode, country, contactType, website, tags, status, notes
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Multiple column name variations supported (e.g., firstName, firstname, FirstName, first_name, "First Name")
              </p>
            </div>
          </div>
        </div>

        {/* Preview & Import Controls */}
        {parsed.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h2>
            <div className="max-h-64 overflow-y-auto border rounded p-2">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {Object.keys(parsed[0]).slice(0, 6).map((h) => (
                      <th key={h} className="text-left pr-4 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-t">
                      {Object.keys(parsed[0]).slice(0, 6).map((k) => (
                        <td key={k} className="py-1 pr-4">{row[k]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={importAll}
                disabled={uploading}
                className="px-4 py-2 bg-amber-600 text-white rounded-md disabled:opacity-50"
              >
                {uploading ? 'Importing...' : `Import ${parsed.length} clients`}
              </button>

              {progress && (
                <div className="text-sm text-gray-600">{progress.done}/{progress.total} imported</div>
              )}
            </div>

            {importErrors.length > 0 && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <h4 className="font-medium text-red-800 dark:text-red-200">Import errors</h4>
                <ul className="text-sm mt-2 list-disc list-inside">
                  {importErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          CSV Format Requirements
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Required Columns
            </h4>
            <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">firstName</code> -
                Client's first name (also: firstname, FirstName, first_name, "First Name")
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">lastName</code> -
                Client's last name (also: lastname, LastName, last_name, "Last Name")
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">email</code> - Valid
                email address (also: Email, emailAddress, "Email Address")
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Information
            </h4>
            <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">phone</code> - Phone
                number (also: Phone, phoneNumber, mobile)
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">company</code> -
                Company name (also: Company, organization, business)
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">contactType</code> -
                Type of contact (client, subcontractor, vendor)
              </li>
            </ul>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address Fields
            </h4>
            <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">address</code> -
                Street address
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">city</code> - City
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">state</code> - State/Province
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">zipCode</code> - ZIP/Postal code
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Fields
            </h4>
            <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">website</code> - Website URL
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">linkedIn</code> - LinkedIn profile
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">tags</code> -
                Comma-separated tags
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">notes</code> - Additional notes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
