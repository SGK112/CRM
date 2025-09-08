'use client';

import { useState } from 'react';
import {
  UserPlusIcon,
  EnvelopeIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface InvitationData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  invitedBy: string;
  permissions: string[];
  expiresInDays: number;
}

interface ClientInviteProps {
  clientId: string;
  clientName: string;
  clientEmail: string;
  onInviteSent?: (success: boolean, message?: string) => void;
}

export default function ClientInvite({ clientId, clientName, clientEmail, onInviteSent }: ClientInviteProps) {
  const [isInviting, setIsInviting] = useState(false);
  const [inviteStep, setInviteStep] = useState<'setup' | 'sending' | 'success' | 'error'>('setup');
  const [inviteLink, setInviteLink] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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
  const [customMessage, setCustomMessage] = useState(
    `Hi ${clientName},\\n\\nYou've been invited to access your client portal where you can view project updates, estimates, invoices, and communicate with our team.\\n\\nClick the link below to get started:`
  );

  const handleSendInvitation = async () => {
    setIsInviting(true);
    setInviteStep('sending');

    try {
      const invitationData: InvitationData = {
        clientId,
        clientName,
        clientEmail,
        invitedBy: 'current_user', // This would come from auth context
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
          permissionLevel,
          customMessage
        })
      });

      if (response.ok) {
        const result = await response.json();
        setInviteLink(result.inviteLink);
        setInviteStep('success');
        onInviteSent?.(true, 'Invitation sent successfully!');
      } else {
        const error = await response.json();
        setErrorMessage(error.message || 'Failed to send invitation');
        setInviteStep('error');
        onInviteSent?.(false, error.message);
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
      setInviteStep('error');
      onInviteSent?.(false, 'Network error');
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
  };

  if (inviteStep === 'success') {
    return (
      <div className="bg-black rounded-2xl p-6 border border-slate-700">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900 mb-4">
            <CheckIcon className="h-6 w-6 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Invitation Sent!</h3>
          <p className="text-slate-400 mb-6">
            {clientName} has been invited to access their client portal. They will receive an email with instructions.
          </p>

          {inviteLink && (
            <div className="bg-slate-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-400 mb-2">Backup invite link:</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg text-sm"
                />
                <button
                  onClick={copyInviteLink}
                  className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={resetInvite}
            className="px-4 py-2 text-sm text-amber-600 hover:text-amber-500"
          >
            Send Another Invitation
          </button>
        </div>
      </div>
    );
  }

  if (inviteStep === 'error') {
    return (
      <div className="bg-black rounded-2xl p-6 border border-slate-700">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Invitation Failed</h3>
          <p className="text-slate-400 mb-6">{errorMessage}</p>
          <button
            onClick={resetInvite}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center mb-6">
        <UserPlusIcon className="h-6 w-6 text-amber-600 mr-3" />
        <h3 className="text-lg font-semibold text-white">Invite {clientName} to Client Portal</h3>
      </div>

      {/* Client Info */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <EnvelopeIcon className="h-5 w-5 text-slate-400 mr-3" />
          <div>
            <p className="text-white font-medium">{clientName}</p>
            <p className="text-slate-400 text-sm">{clientEmail}</p>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-4">Portal Permissions</h4>
        <div className="space-y-4">
          <select
            value={permissionLevel}
            onChange={(e) => setPermissionLevel(e.target.value as 'full' | 'custom')}
            className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2"
          >
            <option value="full">Full Access - View and manage all client data</option>
            <option value="custom">Custom Permissions - Select specific features</option>
          </select>
          
          {permissionLevel === 'custom' && (
            <div className="bg-slate-800 rounded-xl p-4 mt-4">
              <h5 className="text-sm font-medium text-white mb-3">Select Permissions:</h5>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(customPermissions).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setCustomPermissions(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded border-slate-600 bg-slate-700 text-amber-600 focus:ring-amber-600 focus:ring-offset-slate-900"
                    />
                    <span className="ml-2 text-sm text-slate-300">
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
      <div className="mb-6">
        <label className="block text-white font-medium mb-2">Invitation Expires</label>
        <select
          value={expirationDays}
          onChange={(e) => setExpirationDays(parseInt(e.target.value))}
          className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2"
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      {/* Custom Message */}
      <div className="mb-6">
        <label className="block text-white font-medium mb-2">Invitation Message</label>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          rows={4}
          className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
          placeholder="Customize the invitation message..."
        />
      </div>

      {/* Info Notice */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 mb-6">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">About Client Portal Access</p>
            <p>
              Clients will be able to view their project information, communicate with your team, 
              and manage their account. They can only see data related to their own projects.
            </p>
          </div>
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSendInvitation}
        disabled={isInviting || !clientEmail}
        className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isInviting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Sending Invitation...
          </div>
        ) : (
          'Send Portal Invitation'
        )}
      </button>
    </div>
  );
}
