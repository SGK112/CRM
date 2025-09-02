'use client';

import { useState } from 'react';

export default function TestLoginPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@test.com',
          password: 'demo123',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setResult(`✅ Login successful! Token: ${data.accessToken.substring(0, 20)}...`);
      } else {
        setResult(`❌ Login failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          password: 'test123',
          firstName: 'Test',
          lastName: 'User',
          workspaceName: 'Test Company',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setResult(`✅ Registration successful! Token: ${data.accessToken.substring(0, 20)}...`);
      } else {
        setResult(`❌ Registration failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-center">Test Authentication</h1>

        <div className="space-y-4">
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-md font-medium disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Demo Login (demo@test.com)'}
          </button>

          <button
            onClick={testRegister}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test New Registration'}
          </button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-slate-800 rounded-md">
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="text-center">
          <a href="/" className="text-amber-400 hover:text-amber-300">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
