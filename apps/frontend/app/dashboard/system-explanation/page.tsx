'use client';

import React, { useState, useEffect } from 'react';

interface SystemStatus {
  demoMode: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  paymentsEnabled: boolean;
  explanation: string;
}

const SystemExplanation: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    demoMode: true,
    emailEnabled: false,
    smsEnabled: false,
    paymentsEnabled: false,
    explanation: 'Loading...',
  });

  useEffect(() => {
    // Check if user is in demo mode
    const userEmail = localStorage.getItem('userEmail') || '';
    const isDemoUser = userEmail.includes('demo@') || userEmail.includes('test@');

    setSystemStatus({
      demoMode: isDemoUser,
      emailEnabled: false, // Would check backend configuration
      smsEnabled: false, // Would check backend configuration
      paymentsEnabled: false, // Would check backend configuration
      explanation: isDemoUser
        ? 'You are using a demo account. Communication features are simulated.'
        : 'Connect your tools to unlock powerful features.',
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Main Explanation */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
          How Communication Works in Your CRM
        </h1>
        <p className="text-lg text-gray-800 dark:text-gray-200 max-w-2xl mx-auto">
          {systemStatus.explanation}
        </p>
      </div>

      {/* Demo Mode Banner */}
      {systemStatus.demoMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Demo Mode Active
              </h3>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                You're using demo@test.com - perfect for exploring the CRM! All communication
                features are simulated so you can test them safely without sending real emails or
                SMS.
              </p>
              <div className="bg-white dark:bg-blue-950 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  What happens in demo mode:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>✅ Email tests show "success" but don't send real emails</li>
                  <li>✅ SMS tests show "success" but don't send real text messages</li>
                  <li>✅ All features work normally for testing</li>
                  <li>✅ No real accounts or billing required</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* For Real Users */}
      {!systemStatus.demoMode && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Real Account Setup
              </h3>
              <p className="text-green-800 dark:text-green-200 mb-4">
                You're using a real account! Let's connect your tools to unlock powerful
                communication features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* How It Should Work (The Vision) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Email */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">📧</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h3>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-800 dark:text-gray-200">
              <strong>Ideal Experience:</strong>
            </div>
            <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
              <li>• Click "Connect Gmail" button</li>
              <li>• Grant permission (OAuth)</li>
              <li>• Send emails as yourself</li>
              <li>• No SMTP setup needed</li>
            </ul>

            {systemStatus.demoMode ? (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xs font-medium text-blue-900 dark:text-blue-100">
                  Demo Mode
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-200">Emails are simulated</div>
              </div>
            ) : (
              <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Connect Gmail
              </button>
            )}
          </div>
        </div>

        {/* SMS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">💬</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Text Messages</h3>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-800 dark:text-gray-200">
              <strong>Ideal Experience:</strong>
            </div>
            <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
              <li>• No setup required</li>
              <li>• CRM provides SMS service</li>
              <li>• Pay per message sent</li>
              <li>• Professional phone numbers</li>
            </ul>

            {systemStatus.demoMode ? (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xs font-medium text-blue-900 dark:text-blue-100">
                  Demo Mode
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-200">SMS are simulated</div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xs font-medium text-green-900 dark:text-green-100">
                  Ready to Use
                </div>
                <div className="text-xs text-green-800 dark:text-green-200">$0.01 per message</div>
              </div>
            )}
          </div>
        </div>

        {/* Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">💳</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payments</h3>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-800 dark:text-gray-200">
              <strong>Ideal Experience:</strong>
            </div>
            <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
              <li>• Connect your bank account</li>
              <li>• Accept credit cards instantly</li>
              <li>• Get paid faster</li>
              <li>• No Stripe account needed</li>
            </ul>

            {systemStatus.demoMode ? (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xs font-medium text-blue-900 dark:text-blue-100">
                  Demo Mode
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  Payments are simulated
                </div>
              </div>
            ) : (
              <button className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Connect Bank Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Technical Reality vs User-Friendly Vision */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Behind the Scenes (For Developers)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Current Implementation:
            </h3>
            <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
              <li>• Users configure their own SMTP/Twilio</li>
              <li>• Requires technical knowledge</li>
              <li>• Demo mode simulates everything</li>
              <li>• Perfect for testing</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Production Vision:</h3>
            <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
              <li>• CRM handles all API integrations</li>
              <li>• Users only connect OAuth accounts</li>
              <li>• Seamless contractor experience</li>
              <li>• Revenue through service margins</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
          Next Steps for Production
        </h2>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
              1
            </span>
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                Set up master API accounts
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Get business accounts with Twilio, SendGrid, Stripe
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
              2
            </span>
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                Implement OAuth flows
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Gmail, Outlook, bank account connections
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
              3
            </span>
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                Create billing system
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Charge for SMS, storage, payment processing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemExplanation;
