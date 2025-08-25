'use client';

import React, { useState, useEffect } from 'react';

interface Integration {
  name: string;
  type: 'email' | 'sms' | 'payment' | 'storage' | 'social';
  isConfigured: boolean;
  requiresUserAuth: boolean;
  setupInstructions?: string;
  connectUrl?: string;
}

interface CommunicationCapability {
  email: {
    available: boolean;
    method: 'user_account' | 'system_account';
    provider: string;
  };
  sms: {
    available: boolean;
    method: 'user_account' | 'system_account';
    provider: string;
  };
  recommendedSetup: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
    actionUrl: string;
  }>;
}

const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [capabilities, setCapabilities] = useState<CommunicationCapability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
    fetchCapabilities();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations/available');
      const data = await response.json();
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    }
  };

  const fetchCapabilities = async () => {
    try {
      const response = await fetch('/api/integrations/communication-status');
      if (response.ok) {
        const data = await response.json();
        setCapabilities(data);
      } else {
        console.warn('Failed to fetch communication status, using defaults');
        // Set a default capabilities object if the API fails
        setCapabilities({
          email: { available: false, method: 'system_account', provider: 'none' },
          sms: { available: true, method: 'system_account', provider: 'twilio' },
          recommendedSetup: [
            {
              type: 'email',
              priority: 'high',
              title: 'Connect your email',
              description: 'Connect Gmail or Outlook to send professional emails to clients',
              action: 'Connect Email Account',
              actionUrl: '#'
            }
          ]
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch capabilities:', error);
      // Set a default capabilities object if the API fails
      setCapabilities({
        email: { available: false, method: 'system_account', provider: 'none' },
        sms: { available: true, method: 'system_account', provider: 'twilio' },
        recommendedSetup: [
          {
            type: 'email',
            priority: 'high',
            title: 'Connect your email',
            description: 'Connect Gmail or Outlook to send professional emails to clients',
            action: 'Connect Email Account',
            actionUrl: '#'
          }
        ]
      });
      setLoading(false);
    }
  };

  const handleConnect = async (integration: Integration) => {
    if (integration.connectUrl) {
      if (integration.name === 'Gmail' || integration.name === 'Outlook') {
        const provider = integration.name.toLowerCase();
        try {
          const response = await fetch(`/api/integrations/email/connect/${provider}`);
          const data = await response.json();
          if (data.oauthUrl) {
            window.location.href = data.oauthUrl;
          }
        } catch (error) {
          console.error(`Failed to connect ${integration.name}:`, error);
        }
      } else if (integration.name === 'Stripe Payments') {
        try {
          const response = await fetch('/api/integrations/stripe/connect', { method: 'POST' });
          const data = await response.json();
          if (data.oauthUrl) {
            window.location.href = data.oauthUrl;
          }
        } catch (error) {
          console.error('Failed to connect Stripe:', error);
        }
      }
    }
  };

  const getIntegrationIcon = (integration: Integration) => {
    const icons = {
      'Gmail': '📧',
      'Outlook': '📨',
      'Text Messaging': '💬',
      'Stripe Payments': '💳',
      'Photo Storage': '📸'
    };
    return icons[integration.name as keyof typeof icons] || '🔧';
  };

  const getStatusBadge = (integration: Integration) => {
    if (integration.isConfigured) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          ✓ Connected
        </span>
      );
    }
    
    if (!integration.requiresUserAuth) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          ✓ Available
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        Setup Required
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Connect Your Tools
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Connect your existing accounts to unlock powerful features. No technical setup required!
        </p>
      </div>

      {/* Quick Status Overview */}
      {capabilities && capabilities.email && capabilities.sms && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Communication Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${capabilities.email?.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">Email:</span>
              <span className={capabilities.email?.available ? 'text-green-600' : 'text-red-600'}>
                {capabilities.email?.available ? 'Ready' : 'Not Connected'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${capabilities.sms?.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">Text Messages:</span>
              <span className={capabilities.sms?.available ? 'text-green-600' : 'text-red-600'}>
                {capabilities.sms?.available ? 'Ready' : 'Not Available'}
              </span>
            </div>
          </div>

          {/* Recommendations */}
          {capabilities.recommendedSetup && capabilities.recommendedSetup.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Recommended Setup
              </h3>
              <div className="space-y-3">
                {capabilities.recommendedSetup.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                    'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}>
                    <h4 className="font-medium text-gray-900 dark:text-white">{rec.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{rec.description}</p>
                    <button
                      onClick={() => window.location.href = rec.actionUrl}
                      className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      {rec.action} →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getIntegrationIcon(integration)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {integration.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {integration.type}
                  </p>
                </div>
              </div>
              {getStatusBadge(integration)}
            </div>

            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              {integration.setupInstructions}
            </p>

            <div className="mt-6">
              {integration.isConfigured ? (
                <button
                  disabled
                  className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  Connected
                </button>
              ) : integration.requiresUserAuth ? (
                <button
                  onClick={() => handleConnect(integration)}
                  className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Connect {integration.name}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2 px-4 rounded-lg bg-green-100 text-green-800 cursor-not-allowed"
                >
                  Already Available
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Need Help?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Why connect these tools?
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Send professional emails directly from the CRM</li>
              <li>• Text appointment reminders to clients</li>
              <li>• Accept payments without leaving the platform</li>
              <li>• Store project photos securely</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Is my data secure?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Yes! We use industry-standard OAuth connections that never store your passwords. 
              You can disconnect any integration at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
