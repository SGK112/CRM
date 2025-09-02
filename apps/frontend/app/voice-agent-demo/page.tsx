'use client';

import React, { useEffect, useState } from 'react';
import ElevenLabsCallComponent from '@/components/voice/ElevenLabsCallComponent-Fixed';
import ElevenLabsWidgetComponent from '@/components/voice/ElevenLabsWidgetComponent';

// Sample client data for demonstration
const sampleClient = {
  id: 'demo_client_001',
  name: 'Demo Customer',
  phone: '4802555887',
  email: 'customer@example.com',
  address: '123 Main St, Anytown, USA',
  notes: 'Interested lead. Example context for agent prompt.',
};

const workspaceId = 'surprise_granite_workspace';

export default function VoiceAgentDemo() {
  const [activeTab, setActiveTab] = useState<'widget' | 'phone'>('widget');
  const [status, setStatus] = useState<null | {
    ok: boolean;
    feature: string;
    twilio: { configured: boolean; from: string | null };
    elevenlabs: { configured: boolean; agentId: string };
  }>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string>('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch('/api/voice-agent/status');
        if (!ignore) {
          if (res.ok) {
            setStatus(await res.json());
          } else {
            setStatusError('Failed to load voice agent status');
          }
        }
      } catch (e) {
        if (!ignore) setStatusError('Backend unavailable. Is the server running?');
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCallInitiated = (callInfo: any) => {
    console.log('Call setup completed:', callInfo);
    // In a real CRM, you would log this to the client's activity feed
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Voice Agents Demo</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let customers talk with your agents directly in the CRM using ElevenLabs ConvAI — via
            browser widget or outbound calls.
          </p>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900">System Status</h2>
            {statusError && <span className="text-sm text-red-600">{statusError}</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${status?.elevenlabs?.configured ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${status?.elevenlabs?.configured ? 'bg-green-500' : 'bg-yellow-500'}`}
              />
              ElevenLabs{' '}
              {status?.elevenlabs?.configured
                ? `configured (agent ${status?.elevenlabs?.agentId})`
                : 'not configured'}
            </span>
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${status?.twilio?.configured ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${status?.twilio?.configured ? 'bg-green-500' : 'bg-gray-400'}`}
              />
              Twilio{' '}
              {status?.twilio?.configured ? `connected (${status?.twilio?.from})` : 'not connected'}
            </span>
          </div>
          {!status?.elevenlabs?.configured && (
            <div className="mt-3 text-xs text-gray-600">
              To enable the demo, add ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID to the backend
              environment and restart. The widget and outbound call flows require ElevenLabs.
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Why AI Voice Agents?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-100 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-medium text-gray-900 mb-1">Higher Conversion</h3>
              <p className="text-sm text-gray-600">
                Natural, human-like conversations that build trust and close more sales
              </p>
            </div>
            <div className="text-center p-4 border border-gray-100 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-medium text-gray-900 mb-1">Cost Effective</h3>
              <p className="text-sm text-gray-600">
                24/7 availability without staffing costs or human limitations
              </p>
            </div>
            <div className="text-center p-4 border border-gray-100 rounded-lg">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-medium text-gray-900 mb-1">Instant Response</h3>
              <p className="text-sm text-gray-600">
                Immediate follow-up on leads while interest is highest
              </p>
            </div>
          </div>
        </div>

        {/* Agent Capabilities */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Agent Capabilities</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Expertise:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Product/service knowledge</li>
                <li>• Process explanations</li>
                <li>• Pricing and quote assistance</li>
                <li>• Appointment scheduling</li>
                <li>• Custom prompts per business</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Capabilities:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Natural conversation flow</li>
                <li>• Objection handling</li>
                <li>• Lead qualification</li>
                <li>• Follow-up scheduling</li>
                <li>• CRM integration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Demo: AI Voice Call Options</h2>
          <p className="text-gray-600 mb-6">
            Choose between traditional phone calls or the new widget-based approach for direct
            browser conversations.
          </p>

          {/* Agent Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Agent (optional)
            </label>
            <input
              type="text"
              placeholder={
                status?.elevenlabs?.agentId
                  ? `Default agent: ${status.elevenlabs.agentId}`
                  : 'Enter ElevenLabs agent ID'
              }
              value={agentId}
              onChange={e => setAgentId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to use the default agent configured on the backend.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('widget')}
                className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                  activeTab === 'widget'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Widget Conversation
              </button>
              <button
                onClick={() => setActiveTab('phone')}
                className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                  activeTab === 'phone'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Phone Call
              </button>
            </nav>
          </div>

          {/* Widget Demo */}
          {activeTab === 'widget' && (
            <div className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-800 mb-2">
                  🎯 NEW: Widget Approach (Recommended)
                </h3>
                <p className="text-sm text-blue-700">
                  Direct browser-to-agent conversation. No phone calls needed. Instant connection
                  with natural ElevenLabs voice.
                </p>
              </div>
              {status?.elevenlabs?.configured ? (
                <ElevenLabsWidgetComponent
                  client={sampleClient}
                  workspaceId={workspaceId}
                  onCallInitiated={handleCallInitiated}
                  agentId={agentId || undefined}
                />
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                  ElevenLabs isn’t configured yet. Configure your ElevenLabs API key and agent in
                  the backend to try the widget conversation here.
                </div>
              )}
            </div>
          )}

          {/* Traditional Call Demo */}
          {activeTab === 'phone' && (
            <div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-yellow-800 mb-2">📞 Traditional Phone Call</h3>
                <p className="text-sm text-yellow-700">
                  Calls the customer's phone number. Requires phone system setup and may have
                  connectivity issues.
                </p>
              </div>
              {status?.elevenlabs?.configured ? (
                <ElevenLabsCallComponent
                  client={sampleClient}
                  workspaceId={workspaceId}
                  onCallInitiated={handleCallInitiated}
                  agentId={agentId || undefined}
                />
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                  ElevenLabs isn’t configured yet. Add ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID to
                  enable phone call setup.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Integration Instructions */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Integration Steps for Your Business
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Set Up ElevenLabs Agent</h3>
                <p className="text-gray-600 text-sm">
                  Configure Sarah agent with your business knowledge and phone calling capabilities
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Integrate with CRM</h3>
                <p className="text-gray-600 text-sm">
                  Add voice call buttons to your client management interface
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Train Your Team</h3>
                <p className="text-gray-600 text-sm">
                  Show staff how to use the system for maximum effectiveness
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Monitor and Optimize</h3>
                <p className="text-gray-600 text-sm">
                  Track call outcomes and refine agent responses for better results
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
