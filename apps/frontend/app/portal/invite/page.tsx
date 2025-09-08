'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UserPlusIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface InvitationData {
  clientName: string;
  clientEmail: string;
  permissionLevel: 'full' | 'custom';
  permissions: string[];
  expiresInDays: number;
}

export default function ClientPortalInvitePage() {
  const [isInviting, setIsInviting] = useState(false);
  const [inviteStep, setInviteStep] = useState<'setup' | 'sending' | 'success' | 'error'>('setup');
  const [inviteLink, setInviteLink] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<'full' | 'custom'>('full');
  const [customPermissions, setCustomPermissions] = useState({
    viewProjects: true,
    viewEstimates: true,
    viewInvoices: true,
    viewMessages: true,
    viewCalendar: true,
    editProfile: false,
    payInvoices: false,
    communicateWithTeam: false
  });
  const [expirationDays, setExpirationDays] = useState(30);
  const [customMessage, setCustomMessage] = useState('');

  const handleSendInvitation = async () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      setErrorMessage('Please enter both client name and email');
      return;
    }

    setIsInviting(true);
    setInviteStep('sending');

    try {
      const invitationData: InvitationData = {
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        permissionLevel,
        permissions: permissionLevel === 'full' 
          ? ['viewProjects', 'viewEstimates', 'viewInvoices', 'viewMessages', 'viewCalendar', 'editProfile', 'payInvoices', 'communicateWithTeam']
          : Object.entries(customPermissions)
              .filter(([, enabled]) => enabled)
              .map(([permission]) => permission),
        expiresInDays: expirationDays
      };

      const response = await fetch('/api/portal/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers here
        },
        body: JSON.stringify({
          ...invitationData,
          customMessage: customMessage || `Hi ${clientName},\\n\\nYou've been invited to access your client portal where you can view project updates, estimates, invoices, and communicate with our team.\\n\\nClick the link below to get started:`
        })
      });

      if (response.ok) {
        const result = await response.json();
        setInviteLink(result.inviteLink);
        setInviteStep('success');
      } else {
        const error = await response.json();
        setErrorMessage(error.message || 'Failed to send invitation');
        setInviteStep('error');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
      setInviteStep('error');
    } finally {
      setIsInviting(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      // Could add a toast notification here
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const resetInvite = () => {
    setInviteStep('setup');
    setInviteLink('');
    setErrorMessage('');
    setClientName('');
    setClientEmail('');
    setCustomMessage('');
  };

  if (inviteStep === 'success') {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Client Portal Invitation</h1>
              <p className="text-slate-400">Send secure portal access to clients</p>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-6 border border-slate-700">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900 mb-6">
                <CheckIcon className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Invitation Sent Successfully!</h3>
              <p className="text-slate-400 mb-8">
                {clientName} has been invited to access their client portal. They will receive an email with instructions.
              </p>

              {inviteLink && (
                <div className="bg-slate-800 rounded-xl p-6 mb-8">
                  <p className="text-sm text-slate-400 mb-3">Backup invite link:</p>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg text-sm"
                    />
                    <button
                      onClick={copyInviteLink}
                      className="p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetInvite}
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  Send Another Invitation
                </button>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (inviteStep === 'error') {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Client Portal Invitation</h1>
              <p className="text-slate-400">Send secure portal access to clients</p>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-6 border border-slate-700">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900 mb-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Invitation Failed</h3>
              <p className="text-slate-400 mb-8">{errorMessage}</p>
              <button
                onClick={resetInvite}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Client Portal Invitation</h1>
            <p className="text-slate-400">Send secure portal access to clients</p>
          </div>
        </div>

        <div className="bg-black rounded-2xl p-8 border border-slate-700">
          <div className="flex items-center mb-8">
            <div className="p-3 bg-amber-600 rounded-xl mr-4">
              <UserPlusIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Invite Client to Portal</h3>
              <p className="text-slate-400">Send secure access to project information</p>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-white font-medium mb-2">Client Name *</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3"
                placeholder="Enter client's full name"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Client Email *</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3"
                placeholder="Enter client's email address"
                required
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="mb-8">
            <h4 className="text-white font-medium mb-4">Portal Permissions</h4>
            <div className="space-y-4">
              <select
                value={permissionLevel}
                onChange={(e) => setPermissionLevel(e.target.value as 'full' | 'custom')}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3"
              >
                <option value="full">Full Access - View and manage all client data</option>
                <option value="custom">Custom Permissions - Select specific features</option>
              </select>
              
              {permissionLevel === 'custom' && (
                <div className="bg-slate-800 rounded-xl p-6 mt-4">
                  <h5 className="text-sm font-medium text-white mb-4">Select Permissions:</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(customPermissions).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setCustomPermissions(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="rounded border-slate-600 bg-slate-700 text-amber-600 focus:ring-amber-600 focus:ring-offset-slate-900"
                        />
                        <span className="ml-3 text-sm text-slate-300">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expiration */}
          <div className="mb-8">
            <label className="block text-white font-medium mb-2">Invitation Expires</label>
            <select
              value={expirationDays}
              onChange={(e) => setExpirationDays(parseInt(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>

          {/* Custom Message */}
          <div className="mb-8">
            <label className="block text-white font-medium mb-2">Custom Message (Optional)</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm"
              placeholder="Add a personalized message to the invitation email..."
            />
          </div>

          {/* Info Notice */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6 mb-8">
            <div className="flex">
              <InformationCircleIcon className="h-6 w-6 text-blue-400 mr-4 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-2">About Client Portal Access</p>
                <p>
                  Clients will receive a secure link to access their personalized portal. They can view their 
                  project information, communicate with your team, and manage their account based on the permissions you set.
                </p>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendInvitation}
            disabled={isInviting || !clientEmail.trim() || !clientName.trim()}
            className="w-full bg-amber-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {isInviting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Sending Invitation...
              </div>
            ) : (
              <>
                <GlobeAltIcon className="h-5 w-5 inline mr-2" />
                Send Portal Invitation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
