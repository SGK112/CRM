'use client';

import { useState } from 'react';

export default function SuperAdminSetup() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState(null);

  const setupSuperAdmin = async () => {
    setLoading(true);
    setStatus('Setting up super admin...');
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setStatus('Error: No auth token found. Please login first.');
        return;
      }

      const response = await fetch('/api/dev/setup-super-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      setStatus('Super admin setup completed successfully!');
      console.log('Setup result:', data);
    } catch (error) {
      console.error('Setup failed:', error);
      setStatus(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyAccess = async () => {
    setLoading(true);
    setStatus('Verifying access...');
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setStatus('Error: No auth token found. Please login first.');
        return;
      }

      const response = await fetch('/api/dev/verify-access', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      setVerificationData(data);
      setStatus('Access verification completed');
      console.log('Verification result:', data);
    } catch (error) {
      console.error('Verification failed:', error);
      setStatus(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Super Admin Setup</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Instructions</h2>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Make sure you're logged in with help.remodely@gmail.com</li>
            <li>Click "Setup Super Admin" to configure your account</li>
            <li>Click "Verify Access" to check your permissions</li>
            <li>Navigate to other pages to test functionality</li>
          </ol>
        </div>

        <div className="flex gap-4">
          <button
            onClick={setupSuperAdmin}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
          >
            {loading ? 'Processing...' : 'Setup Super Admin'}
          </button>

          <button
            onClick={verifyAccess}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
          >
            {loading ? 'Processing...' : 'Verify Access'}
          </button>
        </div>

        {status && (
          <div className={`p-4 rounded-lg ${
            status.includes('Error') || status.includes('failed') 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            {status}
          </div>
        )}

        {verificationData && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Access Details</h3>
            <pre className="text-sm bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(verificationData, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Test Areas</h3>
          <ul className="space-y-1 text-yellow-700">
            <li><a href="/dashboard/estimates" className="underline">• Estimates Page</a></li>
            <li><a href="/dashboard/ai" className="underline">• AI Features</a></li>
            <li><a href="/dashboard/projects" className="underline">• Projects</a></li>
            <li><a href="/dashboard/clients" className="underline">• Clients</a></li>
            <li><a href="/dashboard/billing" className="underline">• Billing</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
