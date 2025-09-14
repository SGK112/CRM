'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FixTokenPage() {
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Fresh token obtained from backend login
    const freshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJzdWIiOiI2OGMzNzNiNDYwN2Q0MmY5NTEzNmEzZWUiLCJ3b3Jrc3BhY2VJZCI6IjY4YzM3M2IzNjA3ZDQyZjk1MTM2YTNlZCIsImlhdCI6MTc1NzgxMTk3NywiZXhwIjoxNzU3ODk4Mzc3fQ.DP906rduo6WkbpD66WCcejbgrF6BLou7-8pAW-sgBPg';
    
    try {
      localStorage.setItem('accessToken', freshToken);
      localStorage.setItem('token', freshToken);
      setStatus('✅ Token updated successfully!');
      
      // Auto redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      setStatus('❌ Failed to update token');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">🔧 Fixing Authentication</h1>
        <p className="text-gray-600 mb-4">
          Updating your authentication token to connect to the backend...
        </p>
        <div className="text-lg font-semibold text-green-600 mb-4">
          {status || 'Updating token...'}
        </div>
        <p className="text-sm text-gray-500">
          You will be redirected to the dashboard automatically.
        </p>
        <div className="mt-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}