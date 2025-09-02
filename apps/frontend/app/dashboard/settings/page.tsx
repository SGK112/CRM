'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import CommunicationSettings from '@/components/CommunicationSettings';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  KeyIcon,
  EnvelopeIcon,
  SwatchIcon,
  CogIcon,
  DocumentTextIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

// Integration components
function GoogleCalendarIntegration() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/integrations/google-calendar/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="border border-gray-200 dark:border-token rounded-lg p-4 bg-white dark:bg-[var(--surface-2)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)]">
              Google Calendar
            </h3>
            <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
              Sync appointments and events
            </p>
          </div>
        </div>
        {status?.connected ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Not Connected
          </span>
        )}
      </div>

      {status?.connected ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 dark:text-[var(--text-dim)]">
            Connected as: {status.email}
          </p>
          <button
            onClick={fetchStatus}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Status
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 dark:text-[var(--text-dim)]">
            Connect your Google account to sync calendar events and appointments.
          </p>
          <button
            onClick={handleConnect}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Connect Google Calendar
          </button>
        </div>
      )}
    </div>
  );
}

function EmailIntegration() {
  const [config, setConfig] = useState({
    provider: 'smtp',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    secure: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/user/email-config', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert('Email configuration saved successfully!');
      } else {
        alert('Failed to save email configuration');
      }
    } catch (error) {
      console.error('Email config error:', error);
      alert('Failed to save email configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-token rounded-lg p-4 bg-white dark:bg-[var(--surface-2)]">
      <div className="flex items-center space-x-3 mb-4">
        <EnvelopeIcon className="h-8 w-8 text-green-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)]">
            Email Service
          </h3>
          <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
            Configure SMTP for sending emails
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Provider
          </label>
          <select
            value={config.provider}
            onChange={e => setConfig({ ...config, provider: e.target.value })}
            className="input"
          >
            <option value="smtp">Custom SMTP</option>
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={config.smtpHost}
            onChange={e => setConfig({ ...config, smtpHost: e.target.value })}
            className="input"
            placeholder="smtp.gmail.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            SMTP Port
          </label>
          <input
            type="number"
            value={config.smtpPort}
            onChange={e => setConfig({ ...config, smtpPort: parseInt(e.target.value) })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Username
          </label>
          <input
            type="text"
            value={config.smtpUser}
            onChange={e => setConfig({ ...config, smtpUser: e.target.value })}
            className="input"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Password
          </label>
          <input
            type="password"
            value={config.smtpPassword}
            onChange={e => setConfig({ ...config, smtpPassword: e.target.value })}
            className="input"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Email Config'}
        </button>
      </div>
    </div>
  );
}

function SMSIntegration() {
  const [config, setConfig] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
    webhookUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/user/twilio-config', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert('SMS configuration saved successfully!');
      } else {
        alert('Failed to save SMS configuration');
      }
    } catch (error) {
      console.error('SMS config error:', error);
      alert('Failed to save SMS configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-token rounded-lg p-4 bg-white dark:bg-[var(--surface-2)]">
      <div className="flex items-center space-x-3 mb-4">
        <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)]">
            SMS Service
          </h3>
          <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
            Configure Twilio for SMS messaging
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Account SID
          </label>
          <input
            type="text"
            value={config.accountSid}
            onChange={e => setConfig({ ...config, accountSid: e.target.value })}
            className="input"
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Auth Token
          </label>
          <input
            type="password"
            value={config.authToken}
            onChange={e => setConfig({ ...config, authToken: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Phone Number
          </label>
          <input
            type="text"
            value={config.phoneNumber}
            onChange={e => setConfig({ ...config, phoneNumber: e.target.value })}
            className="input"
            placeholder="+1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Webhook URL
          </label>
          <input
            type="url"
            value={config.webhookUrl}
            onChange={e => setConfig({ ...config, webhookUrl: e.target.value })}
            className="input"
            placeholder="https://yourapp.com/webhook"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save SMS Config'}
        </button>
      </div>
    </div>
  );
}

function SocialMediaIntegrations() {
  return (
    <div className="space-y-4">
      <div className="border border-gray-200 dark:border-token rounded-lg p-4 bg-white dark:bg-[var(--surface-2)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <GlobeAltIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)]">
                Facebook
              </h3>
              <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
                Connect your Facebook business page
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Coming Soon
          </span>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-token rounded-lg p-4 bg-white dark:bg-[var(--surface-2)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <GlobeAltIcon className="h-8 w-8 text-pink-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)]">
                Instagram
              </h3>
              <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
                Connect your Instagram business account
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Coming Soon
          </span>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-token rounded-lg p-4 bg-white dark:bg-[var(--surface-2)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <GlobeAltIcon className="h-8 w-8 text-sky-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)]">
                Twitter/X
              </h3>
              <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
                Connect your Twitter business account
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}

function EstimateTemplates() {
  const [templates, setTemplates] = useState({
    termsAndConditions: '',
    defaultNotes: '',
    paymentTerms: '',
    warrantyInfo: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/workspace/estimate-templates', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templates),
      });

      if (response.ok) {
        alert('Estimate templates saved successfully!');
      } else {
        alert('Failed to save estimate templates');
      }
    } catch (error) {
      console.error('Template save error:', error);
      alert('Failed to save estimate templates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Estimate Form Templates
        </h3>
        <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-6">
          Set default terms, notes, and conditions that will appear on all new estimates
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Terms & Conditions
          </label>
          <textarea
            value={templates.termsAndConditions}
            onChange={e => setTemplates({ ...templates, termsAndConditions: e.target.value })}
            className="input"
            rows={4}
            placeholder="Enter your standard terms and conditions..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Default Notes
          </label>
          <textarea
            value={templates.defaultNotes}
            onChange={e => setTemplates({ ...templates, defaultNotes: e.target.value })}
            className="input"
            rows={3}
            placeholder="Default notes that appear on estimates..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Payment Terms
          </label>
          <textarea
            value={templates.paymentTerms}
            onChange={e => setTemplates({ ...templates, paymentTerms: e.target.value })}
            className="input"
            rows={3}
            placeholder="Payment terms and schedule..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Warranty Information
          </label>
          <textarea
            value={templates.warrantyInfo}
            onChange={e => setTemplates({ ...templates, warrantyInfo: e.target.value })}
            className="input"
            rows={3}
            placeholder="Warranty terms and coverage..."
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Templates'}
        </button>
      </div>
    </div>
  );
}

function InvoiceSettings() {
  const [settings, setSettings] = useState({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    taxRate: 0,
    defaultDueDays: 30,
    lateFeePercentage: 0,
    invoicePrefix: 'INV',
    nextInvoiceNumber: 1001,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/workspace/invoice-settings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Invoice settings saved successfully!');
      } else {
        alert('Failed to save invoice settings');
      }
    } catch (error) {
      console.error('Invoice settings error:', error);
      alert('Failed to save invoice settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Invoice Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-6">
          Configure your company information and default invoice settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={settings.companyName}
            onChange={e => setSettings({ ...settings, companyName: e.target.value })}
            className="input"
            placeholder="Your Company Name"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Company Address
          </label>
          <textarea
            value={settings.companyAddress}
            onChange={e => setSettings({ ...settings, companyAddress: e.target.value })}
            className="input"
            rows={3}
            placeholder="Street address, City, State, ZIP"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Company Phone
          </label>
          <input
            type="tel"
            value={settings.companyPhone}
            onChange={e => setSettings({ ...settings, companyPhone: e.target.value })}
            className="input"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Company Email
          </label>
          <input
            type="email"
            value={settings.companyEmail}
            onChange={e => setSettings({ ...settings, companyEmail: e.target.value })}
            className="input"
            placeholder="billing@yourcompany.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Default Tax Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            value={settings.taxRate}
            onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
            className="input"
            placeholder="8.25"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Payment Due Days
          </label>
          <input
            type="number"
            value={settings.defaultDueDays}
            onChange={e => setSettings({ ...settings, defaultDueDays: parseInt(e.target.value) })}
            className="input"
            placeholder="30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Late Fee (%)
          </label>
          <input
            type="number"
            step="0.01"
            value={settings.lateFeePercentage}
            onChange={e =>
              setSettings({ ...settings, lateFeePercentage: parseFloat(e.target.value) })
            }
            className="input"
            placeholder="1.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
            Invoice Number Prefix
          </label>
          <input
            type="text"
            value={settings.invoicePrefix}
            onChange={e => setSettings({ ...settings, invoicePrefix: e.target.value })}
            className="input"
            placeholder="INV"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Invoice Settings'}
        </button>
      </div>
    </div>
  );
}

function UserPermissions() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users/workspace-users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
        alert('User role updated successfully!');
      } else {
        alert('Failed to update user role');
      }
    } catch (error) {
      console.error('Role update error:', error);
      alert('Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'owner', label: 'Owner', description: 'Full access to all features' },
    { value: 'admin', label: 'Admin', description: 'Manage users and settings' },
    {
      value: 'project_manager',
      label: 'Project Manager',
      description: 'Manage projects and clients',
    },
    {
      value: 'sales_associate',
      label: 'Sales Associate',
      description: 'Create estimates and manage leads',
    },
    { value: 'team_member', label: 'Team Member', description: 'View assigned projects and tasks' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          User Permissions
        </h3>
        <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-6">
          Manage user roles and permissions for your team members
        </p>
      </div>

      <div className="space-y-4">
        {users.map((user: any) => (
          <div
            key={user._id}
            className="border border-gray-200 dark:border-token rounded-lg p-4 bg-white dark:bg-[var(--surface-2)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-[var(--text)]">
                  {user.firstName} {user.lastName}
                </h4>
                <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">{user.email}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
                  Current: {user.role}
                </span>
                <select
                  value={user.role}
                  onChange={e => updateUserRole(user._id, e.target.value)}
                  disabled={loading}
                  className="text-sm border border-gray-300 dark:border-token rounded px-2 py-1 bg-white dark:bg-[var(--surface-2)]"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Role Descriptions</h4>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          {roles.map(role => (
            <div key={role.value}>
              <strong>{role.label}:</strong> {role.description}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UnifiedSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      marketing: false,
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
      sessionTimeout: 60,
    },
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
          Authorization: `Bearer ${token}`,
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
          Authorization: `Bearer ${token}`,
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
          Authorization: `Bearer ${token}`,
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

  const tabs = [
    { id: 'general', name: 'General', icon: UserIcon },
    { id: 'business', name: 'Business', icon: BuildingStorefrontIcon },
    { id: 'estimates', name: 'Estimates', icon: DocumentTextIcon },
    { id: 'invoices', name: 'Invoices', icon: CreditCardIcon },
    { id: 'integrations', name: 'Integrations', icon: KeyIcon },
    { id: 'communications', name: 'Communications', icon: EnvelopeIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'colors', name: 'Colors', icon: SwatchIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'advanced', name: 'Advanced', icon: WrenchScrewdriverIcon },
  ];

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value as never,
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: unknown) => {
    setFormData(prev => {
      const parentData = prev[parent as keyof typeof prev] as Record<string, unknown>;
      return {
        ...prev,
        [parent]: {
          ...parentData,
          [field]: value as never,
        },
      };
    });
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Profile Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={e => handleInputChange('firstName', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={e => handleInputChange('lastName', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              className="input"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={e => handleInputChange('company', e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={e => handleInputChange('timezone', e.target.value)}
              className="input"
            >
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
              Language
            </label>
            <select
              value={formData.language}
              onChange={e => handleInputChange('language', e.target.value)}
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Appearance
        </h3>
        <ThemeSettingsSection />
      </div>
    </div>
  );

  const renderBusinessTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Business Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-6">
          Configure your business details that will appear on estimates, invoices, and
          communications
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={e => handleInputChange('company', e.target.value)}
              className="input"
              placeholder="Your Business Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
              Business Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              className="input"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
              Business Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              className="input"
              placeholder="info@yourbusiness.com"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Connected Services
        </h3>
        <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-6">
          Connect your favorite tools and services to streamline your workflow
        </p>
      </div>

      <div className="space-y-6">
        <GoogleCalendarIntegration />
        <EmailIntegration />
        <SMSIntegration />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Social Media
        </h3>
        <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-6">
          Connect your social media accounts for enhanced marketing and client engagement
        </p>
        <SocialMediaIntegrations />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'business':
        return renderBusinessTab();
      case 'estimates':
        return <EstimateTemplates />;
      case 'invoices':
        return <InvoiceSettings />;
      case 'integrations':
        return renderIntegrationsTab();
      case 'communications':
        return <CommunicationSettings />;
      case 'users':
        return <UserPermissions />;
      case 'colors':
        router.push('/dashboard/settings/colors');
        return null;
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'billing':
        return renderBillingTab();
      case 'advanced':
        return renderAdvancedTab();
      default:
        return renderGeneralTab();
    }
  };

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {Object.entries(formData.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[var(--text)] capitalize">
                  {key === 'sms' ? 'SMS' : key} Notifications
                </p>
                <p className="text-sm text-gray-800 dark:text-[var(--text-dim)]">
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Security Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-[var(--text)]">
                Two-Factor Authentication
              </p>
              <p className="text-sm text-gray-800 dark:text-[var(--text-dim)]">
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              onClick={() =>
                handleNestedInputChange('security', 'twoFactor', !formData.security.twoFactor)
              }
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
              <p className="text-sm font-medium text-gray-900 dark:text-[var(--text)]">
                Login Alerts
              </p>
              <p className="text-sm text-gray-800 dark:text-[var(--text-dim)]">
                Get notified when someone logs into your account
              </p>
            </div>
            <button
              onClick={() =>
                handleNestedInputChange('security', 'loginAlerts', !formData.security.loginAlerts)
              }
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
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={formData.security.sessionTimeout}
              onChange={e =>
                handleNestedInputChange('security', 'sessionTimeout', parseInt(e.target.value))
              }
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

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Billing Information
        </h3>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-600/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-[var(--text)]">
                Professional Plan
              </h4>
              <p className="text-sm text-gray-800 dark:text-[var(--text-dim)]">
                $99/month • Billed monthly
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text)]">$99.00</p>
              <p className="text-sm text-gray-800 dark:text-[var(--text-dim)]">
                Next billing: Sep 14, 2025
              </p>
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Payment Method
        </h3>
        <div className="border border-gray-200 dark:border-token rounded-lg p-4 bg-white dark:bg-[var(--surface-2)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[var(--text)]">
                  •••• •••• •••• 4242
                </p>
                <p className="text-sm text-gray-800 dark:text-[var(--text-dim)]">Expires 12/26</p>
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

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Advanced Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-6">
          Advanced configuration options for power users
        </p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 dark:border-token rounded-lg p-4 bg-white dark:bg-[var(--surface-2)]">
          <h4 className="font-medium text-gray-900 dark:text-[var(--text)] mb-2">API Access</h4>
          <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-4">
            Generate API keys for third-party integrations
          </p>
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
            Generate API Key
          </button>
        </div>

        <div className="border border-gray-200 dark:border-token rounded-lg p-4 bg-white dark:bg-[var(--surface-2)]">
          <h4 className="font-medium text-gray-900 dark:text-[var(--text)] mb-2">Data Export</h4>
          <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-4">
            Export all your CRM data for backup or migration
          </p>
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
            Export Data
          </button>
        </div>

        <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
          <h4 className="font-medium text-red-900 dark:text-red-300 mb-2">Danger Zone</h4>
          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
            These actions cannot be undone. Please be careful.
          </p>
          <div className="space-y-2">
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm">
              Reset All Data
            </button>
            <button className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm">
              Delete Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400 mb-2">
          Unified Settings
        </h1>
        <p className="text-gray-800 dark:text-[var(--text-dim)]">
          Manage all aspects of your CRM in one place
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors border ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-600/20 dark:text-blue-300 dark:border-blue-500'
                      : 'text-gray-800 hover:bg-gray-100 dark:text-[var(--text-dim)] dark:hover:bg-[var(--surface-2)] dark:border-token'
                  }`}
                >
                  <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="text-left">{tab.name}</span>
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
                <span className="ml-2 text-gray-800 dark:text-[var(--text-dim)]">Loading...</span>
              </div>
            ) : (
              renderTabContent()
            )}

            {message && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-token flex justify-end space-x-3">
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
  );
}

// Theme settings subsection
function ThemeSettingsSection() {
  const { theme, setTheme, toggleTheme, system } = useTheme();
  return (
    <div className="border border-gray-200 dark:border-token rounded-lg p-4 bg-white dark:bg-[var(--surface-2)]">
      <p className="text-sm text-gray-800 mb-4">
        Choose between light and dark mode. Your preference is saved to this device.
      </p>
      <div className="flex gap-4">
        {(['light', 'dark'] as const).map(t => (
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
            <div className="h-6 rounded bg-gradient-to-r from-gray-100 to-gray-200 dark:from-[var(--surface-2)] dark:to-[var(--surface-3)] flex items-center justify-center text-[10px] text-gray-700 dark:text-[var(--text-dim)]">
              {t === 'dark' ? 'Dark palette preview' : 'Light palette preview'}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-700 dark:text-[var(--text-dim)]">
          System preference: {system}
        </p>
        <button
          onClick={toggleTheme}
          className="text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-token hover:bg-gray-50 dark:hover:bg-[var(--surface-2)] font-medium"
        >
          Toggle
        </button>
      </div>
    </div>
  );
}
