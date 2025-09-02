'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function ClientsImportPage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Handle file upload logic here
      console.log('File uploaded:', file.name);
    } catch (e: any) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

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
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              How it works
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>1. Upload a CSV file with client information</p>
              <p>2. Map your columns to our fields</p>
              <p>3. Preview and import your clients</p>
            </div>
          </div>
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
                Columns recognized automatically: firstName, lastName, email, phone, company, tags,
                status, source
              </p>
            </div>
          </div>
        </div>
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
                Client's first name
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">lastName</code> -
                Client's last name
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">email</code> - Valid
                email address
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Optional Columns
            </h4>
            <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">phone</code> - Phone
                number
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">company</code> -
                Company name
              </li>
              <li>
                • <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">tags</code> -
                Comma-separated tags
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
