'use client';

import { useEffect, useState } from 'react';

export default function TestAuthPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [inboxData, setInboxData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check localStorage for token
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const user = localStorage.getItem('user');

    setTokenInfo({
      token: token ? `${token.substring(0, 20)}...` : 'None',
      user: user ? JSON.parse(user) : null,
      hasToken: !!token
    });

    // Test API call if token exists
    if (token) {
      fetch('http://localhost:3001/api/inbox', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        setInboxData(data);
      })
      .catch(err => {
        setError(err.message);
      });
    }
  }, []);

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@test.com',
          password: 'demo123'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        setError(`Login failed: ${data.message}`);
      }
    } catch (err) {
      setError(`Network error: ${err}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>

      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Token Info</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Inbox API Test</h2>
          {error && (
            <div className="text-red-500 mb-2">Error: {error}</div>
          )}
          <pre className="bg-gray-100 p-2 rounded text-sm max-h-64 overflow-auto">
            {JSON.stringify(inboxData, null, 2)}
          </pre>
        </div>

        <div className="space-x-4">
          <button
            onClick={testLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Login (demo@test.com)
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear Storage
          </button>
        </div>
      </div>
    </div>
  );
}
