'use client';

import { CapabilityGate, PlanBadge } from '@/components/CapabilityGate';
import Layout from '@/components/Layout';
import { PageHeader } from '@/components/ui/PageHeader';
import ElevenLabsWidgetComponent from '@/components/voice/ElevenLabsWidgetComponent';
import { API_BASE } from '@/lib/api';
import { getUserPlan, hasCapability } from '@/lib/plans';
import {
    ArrowPathIcon,
    ChartBarIcon,
    ClockIcon,
    CogIcon,
    PhoneIcon,
    PlayIcon,
    SpeakerWaveIcon,
    StarIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface OutboundResponse {
  sid: string;
  status: string;
  simulated?: boolean;
  to: string;
  agentId?: string;
}

interface VoiceAgentStatus {
  ok: boolean;
  feature: string;
  twilio: {
    configured: boolean;
    from: string | null;
  };
  elevenlabs: {
    configured: boolean;
    agentId: string;
  };
  inbound?: {
    webhookUrl: string;
  };
}

interface VoiceAgent {
  id: string;
  name: string;
  description: string;
  voice: string;
  specialty: string;
  active: boolean;
  callsHandled: number;
  avgRating: number;
  responseTime: number;
}

const VOICE_AGENTS: VoiceAgent[] = [
  {
    id: 'sarah-scheduler',
    name: 'Sarah - Appointment Scheduler',
    description: 'Specialized in scheduling appointments, follow-ups, and calendar management',
    voice: 'Professional Female',
    specialty: 'Scheduling',
    active: true,
    callsHandled: 234,
    avgRating: 4.8,
    responseTime: 1.2,
  },
  {
    id: 'mike-sales',
    name: 'Mike - Sales Representative',
    description: 'Expert at qualifying leads, providing quotes, and closing deals',
    voice: 'Confident Male',
    specialty: 'Sales',
    active: true,
    callsHandled: 189,
    avgRating: 4.6,
    responseTime: 1.8,
  },
  {
    id: 'lisa-support',
    name: 'Lisa - Customer Support',
    description: 'Handles customer inquiries, project updates, and support tickets',
    voice: 'Friendly Female',
    specialty: 'Support',
    active: true,
    callsHandled: 156,
    avgRating: 4.9,
    responseTime: 0.9,
  },
  {
    id: 'alex-follow-up',
    name: 'Alex - Follow-up Specialist',
    description: 'Manages post-project follow-ups, reviews, and referral requests',
    voice: 'Warm Neutral',
    specialty: 'Follow-up',
    active: false,
    callsHandled: 78,
    avgRating: 4.7,
    responseTime: 1.5,
  },
];

export default function VoiceAgentPage() {
  const [toNumber, setToNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [call, setCall] = useState<OutboundResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<VoiceAgentStatus | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<VoiceAgent>(VOICE_AGENTS[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'analytics' | 'settings'>(
    'overview'
  );
  const [showWidgetDemo, setShowWidgetDemo] = useState(false);

  const userPlan = getUserPlan();
  const hasVoiceAccess = hasCapability('voice.agents', userPlan);
  const inboundOnly = (process.env.NEXT_PUBLIC_VOICE_INBOUND_ONLY || '').toLowerCase() === 'true';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/voice-agent/status`);
        if (res.ok) {
          setStatus(await res.json());
        }
      } catch (error) {
        // Silently handle error
      }
    })();
  }, []);

  const startCall = async () => {
    if (!toNumber) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const baseUrl = API_BASE;
      const resp = await fetch(`${baseUrl}/voice-agent/outbound`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: toNumber,
          agentId: selectedAgent.id,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setCall(data);
      } else {
        setError('Failed to start call');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const demoClient = {
    id: 'demo-client',
    name: 'John Smith',
    phone: '+1234567890',
    email: 'john@example.com',
    notes: 'Kitchen remodel project, budget $25k, prefers morning calls',
  };

  return (
    <Layout>
      <div className="space-y-8">
        <PageHeader
          title="Voice Agents"
          subtitle="AI-powered conversational agents for inbound and outbound calls"
          titleClassName="font-bold text-brand-700 dark:text-brand-400 mb-0"
          actions={
            <div className="flex items-center gap-3">
              <PlanBadge />
              {hasVoiceAccess && (
                <button
                  onClick={() => setShowWidgetDemo(!showWidgetDemo)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <PlayIcon className="h-4 w-4" />
                  Try Widget Demo
                </button>
              )}
            </div>
          }
        />

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'agents', name: 'Voice Agents', icon: UserGroupIcon },
              { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
              { id: 'settings', name: 'Settings', icon: CogIcon },
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'agents' | 'analytics' | 'settings')}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Widget Demo Modal */}
        {showWidgetDemo && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                onClick={() => setShowWidgetDemo(false)}
              />
              <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    ElevenLabs Voice Widget Demo
                  </h3>
                  <button
                    onClick={() => setShowWidgetDemo(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                <ElevenLabsWidgetComponent
                  client={demoClient}
                  workspaceId="demo-workspace"
                  agentId={selectedAgent.id}
                  onCallInitiated={() => {
                    // Demo call initiated
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <CapabilityGate need="voice.agents">
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Calls</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">657</p>
                    </div>
                    <PhoneIcon className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
                    </div>
                    <ChartBarIcon className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">4.7</p>
                    </div>
                    <StarIcon className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">1.3s</p>
                    </div>
                    <ClockIcon className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Quick Call */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <PhoneIcon className="h-5 w-5" />
                    Quick Outbound Call
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Voice Agent
                      </label>
                      <select
                        value={selectedAgent.id}
                        onChange={e =>
                          setSelectedAgent(
                            VOICE_AGENTS.find(a => a.id === e.target.value) || VOICE_AGENTS[0]
                          )
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {VOICE_AGENTS.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} - {agent.specialty}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!inboundOnly && (
                      <>
                        <div className="flex gap-3">
                          <input
                            value={toNumber}
                            onChange={e => setToNumber(e.target.value)}
                            placeholder="Destination phone e.g. +15551234567"
                            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={startCall}
                            disabled={!toNumber || loading}
                            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                            Call Now
                          </button>
                        </div>

                        {status && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {status.twilio.configured ? (
                              <p>
                                ✅ Twilio connected. Calls from{' '}
                                <span className="font-medium">{status.twilio.from}</span>
                              </p>
                            ) : (
                              <p>⚠️ Twilio not configured. Using simulation mode</p>
                            )}
                          </div>
                        )}

                        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                        {call && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm">
                            <p>
                              <span className="font-medium">Status:</span> {call.status}{' '}
                              {call.simulated && <span className="text-xs">(simulated)</span>}
                            </p>
                            <p>
                              <span className="font-medium">Call SID:</span> {call.sid}
                            </p>
                            <p>
                              <span className="font-medium">To:</span> {call.to}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {inboundOnly && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                          Inbound Only Mode
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                          Configure your Twilio number to point to the webhook for inbound calls.
                        </p>
                        <code className="block text-xs bg-blue-100 dark:bg-blue-900/40 p-2 rounded text-blue-800 dark:text-blue-200">
                          POST {status?.inbound?.webhookUrl || '/api/voice-agent/webhook'}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent Status */}
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Active Agent
                  </h3>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <SpeakerWaveIcon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedAgent.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {selectedAgent.voice}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Calls Handled:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedAgent.callsHandled}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Avg Rating:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedAgent.avgRating}/5
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedAgent.responseTime}s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {VOICE_AGENTS.map(agent => (
                <div
                  key={agent.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{agent.voice}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agent.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {agent.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {agent.description}
                  </p>

                  <div className="space-y-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Specialty:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {agent.specialty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Calls:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {agent.callsHandled}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {agent.avgRating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAgent(agent)}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Select Agent
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Voice Agent Analytics
              </h2>
              <div className="text-center py-12">
                <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Advanced Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Detailed call analytics, performance metrics, and conversation insights coming
                  soon.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Call Volume Trends
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Track daily/weekly patterns
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Conversion Rates</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Measure call effectiveness
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Sentiment Analysis
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customer satisfaction insights
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Voice Agent Configuration
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Twilio Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">
                        TWILIO_ACCOUNT_SID
                      </code>
                      <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">
                        TWILIO_AUTH_TOKEN
                      </code>
                      <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">
                        TWILIO_PHONE_NUMBER
                      </code>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      <p>
                        Configure these environment variables in your backend to enable real phone
                        calls.
                      </p>
                      <p className="mt-2">Without Twilio, calls will be simulated for testing.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    ElevenLabs Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">
                        ELEVENLABS_API_KEY
                      </code>
                      <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">
                        ELEVENLABS_VOICE_ID
                      </code>
                      <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">
                        ELEVENLABS_AGENT_ID
                      </code>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      <p>Optional: Enhanced voice features and conversational AI capabilities.</p>
                      <p className="mt-2">
                        Includes widget embedding and advanced voice synthesis.
                      </p>
                    </div>
                  </div>
                </div>

                {status && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Current Status
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${status.twilio.configured ? 'bg-green-500' : 'bg-yellow-500'}`}
                        ></span>
                        Twilio:{' '}
                        {status.twilio.configured
                          ? `Connected (${status.twilio.from})`
                          : 'Not configured - using simulation'}
                      </p>
                      <p className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${status.elevenlabs.configured ? 'bg-green-500' : 'bg-gray-400'}`}
                        ></span>
                        ElevenLabs:{' '}
                        {status.elevenlabs.configured
                          ? `Configured (agent ${status.elevenlabs.agentId})`
                          : 'Optional - not configured'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CapabilityGate>
      </div>
    </Layout>
  );
}
