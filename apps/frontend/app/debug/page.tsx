'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [tokens, setTokens] = useState<Record<string, string | null>>({});
  const [apiStatus, setApiStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage tokens
    const tokenCheck = {
      accessToken: localStorage.getItem('accessToken'),
      token: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken'),
      user: localStorage.getItem('user'),
      authToken: localStorage.getItem('authToken'),
    };
    setTokens(tokenCheck);

    // Test API endpoints
    const testApis = async () => {
      const results: Record<string, any> = {};

      // Test clients API
      try {
        const response = await fetch('/api/clients');
        results.clients = {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text(),
        };
      } catch (error) {
        results.clients = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test client count
      try {
        const response = await fetch('/api/clients/count');
        results.count = {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text(),
        };
      } catch (error) {
        results.count = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test individual client
      try {
        const response = await fetch('/api/clients/1757142919929');
        results.individual = {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text(),
        };
      } catch (error) {
        results.individual = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      setApiStatus(results);
      setLoading(false);
    };

    testApis();
  }, []);

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');

    // Update state
    setTokens({
      accessToken: null,
      token: null,
      refreshToken: null,
      user: null,
      authToken: null,
    });

    // Reload page to clear any cached headers
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🔧 CRM Debug Dashboard</h1>

          {/* Token Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔑 LocalStorage Tokens</h2>
            <div className="bg-gray-100 rounded-lg p-4">
              {Object.entries(tokens).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span className="font-mono text-sm">{key}:</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {value ? `"${value.substring(0, 20)}..."` : 'null'}
                  </span>
                </div>
              ))}
            </div>

            {Object.values(tokens).some(v => v) && (
              <button
                onClick={clearTokens}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                🧹 Clear All Tokens & Reload
              </button>
            )}
          </div>

          {/* API Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🌐 API Status</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Testing API endpoints...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(apiStatus).map(([endpoint, result]) => (
                  <div key={endpoint} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-mono text-lg">/{endpoint}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status || 'ERROR'}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded p-3 overflow-auto max-h-40">
                      <pre className="text-xs text-gray-700">
                        {JSON.stringify(result.data || result.error, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Console Check */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔍 Browser Console</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 mb-3">
                To check for console errors:
              </p>
              <ol className="list-decimal list-inside text-blue-700 space-y-1">
                <li>Press F12 to open Developer Tools</li>
                <li>Click the "Console" tab</li>
                <li>Look for red error messages</li>
                <li>Clear console (🚫 icon) and reload this page</li>
              </ol>
            </div>
          </div>

          {/* Environment Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">⚙️ Environment</h2>
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="font-mono">Development</span>
              </div>
              <div className="flex justify-between">
                <span>Frontend:</span>
                <span className="font-mono">localhost:3000</span>
              </div>
              <div className="flex justify-between">
                <span>Backend:</span>
                <span className="font-mono">localhost:3001</span>
              </div>
              <div className="flex justify-between">
                <span>Storage:</span>
                <span className="font-mono">In-Memory (Development)</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">⚡ Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/dashboard/clients"
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                📋 View Clients
              </a>
              <a
                href="/dashboard/clients/1757142919929/edit"
                className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                ✏️ Edit Test Contact
              </a>
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                🔄 Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                🗑️ Clear All Storage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
