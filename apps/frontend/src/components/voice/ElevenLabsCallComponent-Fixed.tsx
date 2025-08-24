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

export function ElevenLabsCallComponent({ client, workspaceId, onCallInitiated }: ElevenLabsCallProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [callResult, setCallResult] = useState<any>(null);
  const [purpose, setPurpose] = useState('');
  const [context, setContext] = useState('');
  const [copied, setCopied] = useState(false);

  const defaultPurposes = [
    'Schedule granite countertop consultation',
    'Follow up on quote request',
    'Discuss installation timeline',
    'Address customer concerns',
    'Book site measurement appointment',
    'Confirm installation date'
  ];

  const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
    // Simple alert for now - replace with proper toast in production
    console.log(`${type.toUpperCase()}: ${title} - ${description}`);
    alert(`${title}: ${description}`);
  };

  const handleInitiateCall = async () => {
    if (!purpose.trim()) {
      showToast("Purpose Required", "Please specify the purpose of this call", 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/voice-agent/elevenlabs-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: client.id,
          clientName: client.name,
          phoneNumber: client.phone,
          workspaceId,
          purpose,
          context: context || `Client: ${client.name}, Phone: ${client.phone}${client.email ? `, Email: ${client.email}` : ''}${client.address ? `, Address: ${client.address}` : ''}${client.notes ? `, Notes: ${client.notes}` : ''}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setCallResult(result);
        onCallInitiated?.(result);
        showToast("Call Setup Ready", "ElevenLabs call instructions generated successfully");
      } else {
        throw new Error(result.error || 'Failed to setup call');
      }
    } catch (error: any) {
      console.error('Error initiating call:', error);
      showToast("Call Setup Failed", error.message || "Failed to setup ElevenLabs call", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast("Copied!", "Instructions copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast("Copy Failed", "Failed to copy to clipboard", 'error');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Client Info Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
            <Phone className="h-5 w-5" />
            ElevenLabs AI Voice Call Setup
          </h2>
          <p className="text-gray-600 mt-1">
            Initiate a high-quality AI voice call with Sarah (Surprise Granite specialist) to: {client.name}
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input 
                type="text" 
                value={client.name} 
                readOnly 
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                value={client.phone} 
                readOnly 
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Call Purpose *</label>
            <select
              value={purpose}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select call purpose...</option>
              {defaultPurposes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
              <option value="custom">Custom (specify below)</option>
            </select>
            {purpose === 'custom' && (
              <input
                type="text"
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter custom call purpose..."
                value={purpose}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPurpose(e.target.value)}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Context (Optional)</label>
            <textarea
              placeholder="Any specific details Sarah should know about this client or call..."
              value={context}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContext(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleInitiateCall}
            disabled={isLoading || !purpose.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            {isLoading ? "Setting up call..." : "Setup ElevenLabs Call"}
          </button>
        </div>
      </div>

      {/* Call Instructions Result */}
      {callResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-green-200">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              ElevenLabs Call Setup Complete
            </h3>
            <p className="text-green-700 mt-1">
              Follow these steps to initiate the AI voice call
            </p>
          </div>
          <div className="p-6 space-y-4">
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.open(callResult.batchUrl, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open Batch Calling
              </button>
              <button
                onClick={() => window.open(callResult.agentUrl, '_blank')}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open Agent Direct
              </button>
              <button
                onClick={() => copyToClipboard(callResult.instructions)}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy Instructions
              </button>
            </div>

            {/* Instructions Display */}
            <div className="bg-white p-4 rounded border border-gray-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono overflow-x-auto">
                {callResult.instructions}
              </pre>
            </div>

            {/* Client Summary */}
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Call Summary:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>Client:</strong> {callResult.clientInfo.name}</li>
                <li><strong>Phone:</strong> {callResult.clientInfo.phone}</li>
                <li><strong>Purpose:</strong> {callResult.clientInfo.purpose}</li>
                {callResult.clientInfo.context && (
                  <li><strong>Context:</strong> {callResult.clientInfo.context}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ElevenLabsCallComponent;
