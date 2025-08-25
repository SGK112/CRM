'use client';

import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { useTheme } from '../../../components/ThemeProvider';
import CommunicationSettings from '../../../components/CommunicationSettings';
import {
  UserIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  GlobeAltIcon,
  KeyIcon,
  CloudIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface IntegrationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  configured: boolean;
  icon: any;
  configFields: {
    name: string;
    label: string;
    type: 'text' | 'password' | 'url';
    value: string;
    required: boolean;
  }[];
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    timezone: 'America/Los_Angeles',
    language: 'en',
    notifications: {
      email: true,
      sms: true,
      push: true,
      marketing: false
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
      sessionTimeout: 60
    }
  });

  // Load user profile data on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.user) {
        const user = data.user;
        setFormData(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          company: user.workspaceName || user.company || '',
          notifications: user.notificationPreferences || prev.notifications,
        }));
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile data' });
      console.error('Profile load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        return;
      }

      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update localStorage user data
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.firstName = formData.firstName;
          user.lastName = formData.lastName;
          user.phone = formData.phone;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        return;
      }

      const response = await fetch('/api/users/notifications', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData.notifications),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Notification preferences updated!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update notifications' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update notification preferences' });
      console.error('Notification update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const [integrations, setIntegrations] = useState<IntegrationSetting[]>([
    {
      id: 'google',
      name: 'Google Workspace',
      description: 'Connect Google Calendar, Drive, and Gmail for seamless integration',
      enabled: false,
      configured: false,
      icon: GlobeAltIcon,
      configFields: [
        { name: 'clientId', label: 'Client ID', type: 'text', value: '', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', value: '', required: true },
        { name: 'redirectUri', label: 'Redirect URI', type: 'url', value: '', required: true }
      ]
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Process payments and manage invoices with Stripe',
      enabled: false,
      configured: false,
      icon: CreditCardIcon,
      configFields: [
        { name: 'publishableKey', label: 'Publishable Key', type: 'text', value: '', required: true },
        { name: 'secretKey', label: 'Secret Key', type: 'password', value: '', required: true },
        { name: 'webhookSecret', label: 'Webhook Secret', type: 'password', value: '', required: false }
      ]
    },
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'Send SMS notifications and verify phone numbers',
      enabled: false,
      configured: false,
      icon: DevicePhoneMobileIcon,
      configFields: [
        { name: 'accountSid', label: 'Account SID', type: 'text', value: '', required: true },
        { name: 'authToken', label: 'Auth Token', type: 'password', value: '', required: true },
        { name: 'phoneNumber', label: 'Twilio Phone Number', type: 'text', value: '', required: true }
      ]
    },
    {
      id: 'cloudinary',
      name: 'Cloudinary',
      description: 'Manage and optimize images and videos',
      enabled: false,
      configured: false,
      icon: CloudIcon,
      configFields: [
        { name: 'cloudName', label: 'Cloud Name', type: 'text', value: '', required: true },
        { name: 'apiKey', label: 'API Key', type: 'text', value: '', required: true },
        { name: 'apiSecret', label: 'API Secret', type: 'password', value: '', required: true }
      ]
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Send transactional and marketing emails',
      enabled: false,
      configured: false,
      icon: EnvelopeIcon,
      configFields: [
        { name: 'apiKey', label: 'API Key', type: 'password', value: '', required: true },
        { name: 'fromEmail', label: 'From Email', type: 'text', value: '', required: true },
        { name: 'fromName', label: 'From Name', type: 'text', value: '', required: true }
      ]
    }
  ]);

  const tabs = [
    { id: 'general', name: 'General', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'communications', name: 'Communications', icon: EnvelopeIcon },
    { id: 'integrations', name: 'Integrations', icon: KeyIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => {
      const parentData = prev[parent as keyof typeof prev] as Record<string, any>;
      return {
        ...prev,
        [parent]: {
          ...parentData,
          [field]: value
        }
      };
    });
  };

  const handleIntegrationFieldChange = (integrationId: string, fieldName: string, value: string) => {
    setIntegrations(prev => 
      prev.map(integration => {
        if (integration.id === integrationId) {
          return {
            ...integration,
            configFields: integration.configFields.map(field => 
              field.name === fieldName ? { ...field, value } : field
            )
          };
        }
        return integration;
      })
    );
  };

  const handleIntegrationToggle = (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(integration => {
        if (integration.id === integrationId) {
          const allRequiredFieldsFilled = integration.configFields
            .filter(field => field.required)
            .every(field => field.value.trim() !== '');
          
          return {
            ...integration,
            enabled: !integration.enabled,
            configured: allRequiredFieldsFilled
          };
        }
        return integration;
      })
    );
  };

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="input"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="input"
            >
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="input"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
        <ThemeSettingsSection />
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(formData.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {key === 'sms' ? 'SMS' : key} Notifications
                </p>
                <p className="text-sm text-gray-600">
                  Receive notifications via {key === 'sms' ? 'SMS' : key}
                </p>
              </div>
              <button
                onClick={() => handleNestedInputChange('notifications', key, !value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => handleNestedInputChange('security', 'twoFactor', !formData.security.twoFactor)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.security.twoFactor ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.security.twoFactor ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Login Alerts</p>
              <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
            </div>
            <button
              onClick={() => handleNestedInputChange('security', 'loginAlerts', !formData.security.loginAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.security.loginAlerts ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.security.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <select
              value={formData.security.sessionTimeout}
              onChange={(e) => handleNestedInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="input"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={480}>8 hours</option>
              <option value={1440}>24 hours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Third-Party Integrations</h3>
        <p className="text-sm text-gray-600 mb-6">
          Connect your CRM with external services to enhance functionality.
        </p>
        
        <div className="space-y-6">
          {integrations.map((integration) => {
            const IconComponent = integration.icon;
            
            return (
              <div key={integration.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{integration.name}</h4>
                      <p className="text-sm text-gray-600">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {integration.configured ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    )}
                    <button
                      onClick={() => handleIntegrationToggle(integration.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        integration.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          integration.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {integration.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    {integration.configFields.map((field) => {
                      const fieldId = `${integration.id}-${field.name}`;
                      const showPassword = showPasswords[fieldId];
                      
                      return (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <div className="relative">
                            <input
                              type={field.type === 'password' && !showPassword ? 'password' : 'text'}
                              value={field.value}
                              onChange={(e) => handleIntegrationFieldChange(integration.id, field.name, e.target.value)}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              className="input"
                            />
                            {field.type === 'password' && (
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(fieldId)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPassword ? (
                                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <EyeIcon className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Professional Plan</h4>
              <p className="text-sm text-gray-600">$99/month • Billed monthly</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">$99.00</p>
              <p className="text-sm text-gray-600">Next billing: Sep 14, 2025</p>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Manage Subscription
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              View Invoices
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/26</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'communications':
        return <CommunicationSettings />;
      case 'integrations':
        return renderIntegrationsTab();
      case 'billing':
        return renderBillingTab();
      default:
        return renderGeneralTab();
    }
  };

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-600/20 dark:text-blue-300 dark:border-blue-500'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-[var(--text-dim)] dark:hover:bg-[var(--surface-2)] dark:border-token'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="surface-1 rounded-lg shadow-sm border border-token p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : (
                renderTabContent()
              )}
              
              {message && (
                <div className={`mt-4 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button 
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-token text-gray-700 dark:text-[var(--text)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--surface-2)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (activeTab === 'general') {
                      handleSaveProfile();
                    } else if (activeTab === 'notifications') {
                      handleSaveNotifications();
                    }
                  }}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Theme settings subsection
function ThemeSettingsSection() {
  const { theme, setTheme, toggleTheme, system } = useTheme();
  return (
    <div className="border border-gray-200 dark:border-token rounded-lg p-4 bg-white dark:bg-[var(--surface-2)]">
      <p className="text-sm text-gray-600 mb-4">Choose between light and dark mode. Your preference is saved to this device.</p>
      <div className="flex gap-4">
        {(['light','dark'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`flex-1 rounded-lg p-4 border text-left transition-colors ${
              theme === t
                ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50 dark:bg-blue-600/20 dark:ring-blue-500/40'
                : 'border-gray-200 dark:border-token hover:border-gray-300 dark:hover:border-blue-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium capitalize">{t}</span>
              {theme === t && <span className="text-xs text-blue-600 font-medium">Active</span>}
            </div>
            <div className="h-6 rounded bg-gradient-to-r from-gray-100 to-gray-200 dark:from-[var(--surface-2)] dark:to-[var(--surface-3)] flex items-center justify-center text-[10px] text-gray-500 dark:text-[var(--text-dim)]">
              {t === 'dark' ? 'Dark palette preview' : 'Light palette preview'}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-[var(--text-dim)]">System preference: {system}</p>
        <button onClick={toggleTheme} className="text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-token hover:bg-gray-50 dark:hover:bg-[var(--surface-2)] font-medium">Toggle</button>
      </div>
    </div>
  );
}
