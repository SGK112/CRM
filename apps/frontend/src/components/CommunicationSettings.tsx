'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnvelopeIcon, DevicePhoneMobileIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface EmailConfig {
  provider: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
}

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  webhookUrl: string;
}

export default function CommunicationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ 
    email: { configured: false, provider: '' }, 
    sms: { configured: false, phoneNumber: '' } 
  });
  
  // Email configuration
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    provider: 'smtp',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    secure: true
  });

  // Twilio configuration
  const [twilioConfig, setTwilioConfig] = useState<TwilioConfig>({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
    webhookUrl: ''
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/communications/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const saveEmailConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailConfig),
      });

      if (response.ok) {
        toast.success('Email configuration saved successfully!');
        fetchStatus();
      } else {
        toast.error('Failed to save email configuration');
      }
    } catch (error) {
      console.error('Email config error:', error);
      toast.error('Failed to save email configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTwilioConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/twilio-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(twilioConfig),
      });

      if (response.ok) {
        toast.success('Twilio configuration saved successfully!');
        fetchStatus();
      } else {
        toast.error('Failed to save Twilio configuration');
      }
    } catch (error) {
      console.error('Twilio config error:', error);
      toast.error('Failed to save Twilio configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/communications/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail: emailConfig.fromEmail }),
      });

      if (response.ok) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error) {
      console.error('Test email error:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsLoading(false);
    }
  };

  const testSmsConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/communications/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testPhone: '+1234567890' }),
      });

      if (response.ok) {
        toast.success('Test SMS sent successfully!');
      } else {
        toast.error('Failed to send test SMS');
      }
    } catch (error) {
      console.error('Test SMS error:', error);
      toast.error('Failed to send test SMS');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communication Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Configure your email and SMS settings to communicate with clients
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${status.email.configured ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'}`}>
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="h-5 w-5" />
            <h3 className="font-semibold">Email Service</h3>
            {status.email.configured ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          <p className="text-sm mt-1">
            {status.email.configured ? 'Configured and ready' : 'Not configured'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${status.sms.configured ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'}`}>
          <div className="flex items-center gap-2">
            <DevicePhoneMobileIcon className="h-5 w-5" />
            <h3 className="font-semibold">SMS Service</h3>
            {status.sms.configured ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          <p className="text-sm mt-1">
            {status.sms.configured ? `Phone: ${status.sms.phoneNumber}` : 'Not configured'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email Configuration</TabsTrigger>
          <TabsTrigger value="sms">SMS Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">SMTP Email Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Email Provider</Label>
                <Select value={emailConfig.provider} onValueChange={(value) => setEmailConfig({...emailConfig, provider: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smtp">Custom SMTP</SelectItem>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={emailConfig.smtpHost}
                  onChange={(e) => setEmailConfig({...emailConfig, smtpHost: e.target.value})}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={emailConfig.smtpPort}
                  onChange={(e) => setEmailConfig({...emailConfig, smtpPort: parseInt(e.target.value)})}
                  placeholder="587"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secure">Security</Label>
                <Select value={emailConfig.secure.toString()} onValueChange={(value) => setEmailConfig({...emailConfig, secure: value === 'true'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">TLS/SSL (Recommended)</SelectItem>
                    <SelectItem value="false">No encryption</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUser">Email Username</Label>
                <Input
                  id="smtpUser"
                  value={emailConfig.smtpUser}
                  onChange={(e) => setEmailConfig({...emailConfig, smtpUser: e.target.value})}
                  placeholder="your.email@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPassword">Email Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={emailConfig.smtpPassword}
                  onChange={(e) => setEmailConfig({...emailConfig, smtpPassword: e.target.value})}
                  placeholder="Your app password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  value={emailConfig.fromEmail}
                  onChange={(e) => setEmailConfig({...emailConfig, fromEmail: e.target.value})}
                  placeholder="noreply@yourcompany.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={emailConfig.fromName}
                  onChange={(e) => setEmailConfig({...emailConfig, fromName: e.target.value})}
                  placeholder="Your Company Name"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={saveEmailConfig} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Email Config'}
              </Button>
              <Button intent="secondary" onClick={testEmailConfig} disabled={isLoading || !status.email.configured}>
                Test Email
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sms" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Twilio SMS Settings</h3>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> You need a Twilio account to send SMS. Visit{' '}
                <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="underline">
                  twilio.com
                </a>{' '}
                to sign up and get your credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountSid">Account SID</Label>
                <Input
                  id="accountSid"
                  value={twilioConfig.accountSid}
                  onChange={(e) => setTwilioConfig({...twilioConfig, accountSid: e.target.value})}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authToken">Auth Token</Label>
                <Input
                  id="authToken"
                  type="password"
                  value={twilioConfig.authToken}
                  onChange={(e) => setTwilioConfig({...twilioConfig, authToken: e.target.value})}
                  placeholder="Your Twilio auth token"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Twilio Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={twilioConfig.phoneNumber}
                  onChange={(e) => setTwilioConfig({...twilioConfig, phoneNumber: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                <Input
                  id="webhookUrl"
                  value={twilioConfig.webhookUrl}
                  onChange={(e) => setTwilioConfig({...twilioConfig, webhookUrl: e.target.value})}
                  placeholder="https://yourapp.com/webhook"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={saveTwilioConfig} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save SMS Config'}
              </Button>
              <Button intent="secondary" onClick={testSmsConfig} disabled={isLoading || !status.sms.configured}>
                Test SMS
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
