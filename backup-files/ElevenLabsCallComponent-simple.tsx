'use client';

import React, { useState } from 'react';
import { Phone, ExternalLink, Copy, CheckCircle } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface ElevenLabsCallProps {
  client: Client;
  workspaceId: string;
  onCallInitiated?: (callInfo: any) => void;
}

export function ElevenLabsCallComponent({
  client,
  workspaceId,
  onCallInitiated,
}: ElevenLabsCallProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [callResult, setCallResult] = useState<any>(null);
  const [purpose, setPurpose] = useState('');
  const [context, setContext] = useState('');
  const [copied, setCopied] = useState(false);

  const defaultPurposes = [
    'Schedule granite countertop consultation',
    'Follow up on quote request',
    'Discuss installation timeline',
    'Quality check and satisfaction survey',
    'Schedule follow-up appointment',
  ];

  const handleInitiateCall = async () => {
    if (!purpose.trim()) {
      alert('Please enter or select a call purpose');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Initiating call for client:', client.name);
      console.log('Purpose:', purpose);

      // Simulated call result
      const mockResult = {
        success: true,
        callId: `call_${Date.now()}`,
        status: 'initiated',
        url: `https://call.elevenlabs.io/demo/${client.id}`,
        message: `Call initiated successfully for ${client.name}`,
      };

      setCallResult(mockResult);
      onCallInitiated?.(mockResult);
    } catch (error: any) {
      console.error('Call initiation failed:', error);
      alert('Failed to setup ElevenLabs call: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Setup Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Call Setup</h3>
          <p className="text-sm text-gray-600">
            Initiate an AI-powered voice call with {client.name}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Phone</label>
            <input
              type="tel"
              value={client.phone}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
            <input
              type="email"
              value={client.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Call Purpose</label>
            <div className="space-y-2">
              {defaultPurposes.map((defaultPurpose, index) => (
                <button
                  key={index}
                  onClick={() => setPurpose(defaultPurpose)}
                  className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                    purpose === defaultPurpose
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {defaultPurpose}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="Or enter custom purpose..."
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Context (Optional)
            </label>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              rows={3}
              placeholder="Any additional context or notes for the AI assistant..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleInitiateCall}
            disabled={isLoading || !purpose.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Phone className="h-4 w-4" />
            {isLoading ? 'Initiating Call...' : 'Start AI Voice Call'}
          </button>
        </div>
      </div>

      {/* Results Card */}
      {callResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Status</h3>
            <p className="text-sm text-gray-600">Your ElevenLabs call has been initiated</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{callResult.message}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Call ID:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-mono">{callResult.callId}</span>
                  <button
                    onClick={() => copyToClipboard(callResult.callId)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className="text-sm text-green-600 capitalize">{callResult.status}</span>
              </div>
            </div>

            {callResult.url && (
              <button
                onClick={() => window.open(callResult.url, '_blank')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Monitor Call Progress
              </button>
            )}

            <button
              onClick={() => copyToClipboard(callResult.url)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy Call URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ElevenLabsCallComponent;
