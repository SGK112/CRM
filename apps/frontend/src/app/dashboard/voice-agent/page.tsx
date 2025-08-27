'use client';

import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import { PageHeader } from '../../../components/ui/PageHeader';
import { PhoneIcon, ArrowPathIcon, MicrophoneIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { API_BASE } from '@/lib/api';
import { CapabilityGate } from '../../../components/CapabilityGate';

interface OutboundResponse { sid: string; status: string; simulated?: boolean; to: string; agentId?: string }
interface VoiceAgentStatus { ok: boolean; feature: string; twilio: { configured: boolean; from: string | null }; elevenlabs: { configured: boolean; agentId: string }; inbound?: { webhookUrl: string } }

export default function VoiceAgentPage() {
  const [toNumber, setToNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [call, setCall] = useState<OutboundResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<VoiceAgentStatus | null>(null);
  const inboundOnly = (process.env.NEXT_PUBLIC_VOICE_INBOUND_ONLY || '').toLowerCase() === 'true';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/voice-agent/status`);
        if (res.ok) {
          setStatus(await res.json());
        }
      } catch (error) {
        console.error('Failed to fetch voice agent status:', error);
      }
    })();
  }, []);

  const startCall = async () => {
    if (!toNumber) return;
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) { setError('Not authenticated'); return; }
      const baseUrl = API_BASE;
      const resp = await fetch(`${baseUrl}/voice-agent/outbound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ to: toNumber })
      });
      if (resp.ok) {
        const data = await resp.json();
        setCall(data);
      } else {
        setError('Failed to start call');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <PageHeader 
          title="Voice Agent" 
          subtitle="AI-powered conversational agent for inbound and outbound calls." 
          titleClassName="font-bold text-brand-700 dark:text-brand-400 mb-0"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-1 border border-token rounded-xl p-6 shadow-sm">
              {inboundOnly ? (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)] mb-2 flex items-center gap-2"><PhoneIcon className="h-5 w-5" /> Inbound Only Mode</h2>
                  <p className="text-sm text-gray-800 dark:text-[var(--text-dim)] mb-3">Outbound calling is disabled. Configure a Twilio number to point to your inbound webhook and receive calls handled by the agent.</p>
                  <div className="text-xs bg-gray-50 dark:bg-[var(--surface-2)] border border-gray-200 dark:border-token rounded p-3">
                    <p className="font-medium mb-1">Voice Webhook URL:</p>
                    <code className="block break-all">{status?.inbound?.webhookUrl || '/api/voice-agent/webhook'}</code>
                    <ul className="list-disc ml-4 mt-3 space-y-1">
                      <li>In development, expose your backend with ngrok and set BACKEND_BASE_URL to the ngrok URL.</li>
                      <li>In Twilio Console, set the number’s Voice webhook to POST {status?.inbound?.webhookUrl || '/api/voice-agent/webhook'}.</li>
                      <li>Optional params: <code>?useElevenLabs=true&amp;agentId=YOUR_AGENT_ID</code> to customize greetings.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)] mb-4 flex items-center gap-2"><PhoneIcon className="h-5 w-5" /> Start Outbound Call</h2>
                  <CapabilityGate need="ai.voice" fallback={<div className="text-sm"><a href="/billing/cart" className="text-amber-400 underline">Upgrade your plan</a> to enable Voice Agent calling.</div>}>
                    <div className="flex gap-3">
                      <input value={toNumber} onChange={e=>setToNumber(e.target.value)} placeholder="Destination phone e.g. +15551234567" className="input flex-1" />
                      <button onClick={startCall} disabled={!toNumber || loading} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-[var(--surface-2)] disabled:text-gray-800 dark:disabled:text-[var(--text-dim)] disabled:cursor-not-allowed flex items-center gap-2">
                        {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />} Call
                      </button>
                    </div>
                  </CapabilityGate>
                  {status && (
                    <div className="mt-3 text-xs text-gray-800 dark:text-[var(--text-dim)]">
                      {status.twilio.configured ? (
                        <p>Twilio is connected. Calls will originate from <span className="font-medium">{status.twilio.from}</span>.</p>
                      ) : (
                        <p>Twilio not configured. Calls are simulated for testing.</p>
                      )}
                    </div>
                  )}
                  {error && <p className="text-sm text-red-600 dark:text-red-400 mt-3">{error}</p>}
                  {call && (
                    <div className="mt-4 text-sm bg-gray-50 dark:bg-[var(--surface-2)] border border-gray-200 dark:border-token rounded-lg p-3 text-gray-700 dark:text-[var(--text)]">
                      <p><span className="font-medium">Status:</span> {call.status} {call.simulated && <span className="text-xs text-gray-700 dark:text-[var(--text-dim)]">(simulated)</span>}</p>
                      <p><span className="font-medium">Call SID:</span> {call.sid}</p>
                      <p><span className="font-medium">To:</span> {call.to}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="surface-1 border border-token rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)] mb-4 flex items-center gap-2"><SpeakerWaveIcon className="h-5 w-5" /> Real-Time Audio (Coming Soon)</h2>
              <p className="text-sm text-gray-800 dark:text-[var(--text-dim)]">This section will enable browser microphone streaming to the ElevenLabs conversational session via WebRTC/WebSocket. For now calls are simulated unless Twilio credentials are configured.</p>
              <div className="mt-4 flex gap-3">
                <button disabled className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-[var(--surface-2)] text-gray-800 dark:text-[var(--text-dim)] text-sm flex items-center gap-2 border border-transparent dark:border-token"><MicrophoneIcon className="h-4 w-4" /> Start Mic</button>
                <button disabled className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-[var(--surface-2)] text-gray-800 dark:text-[var(--text-dim)] text-sm border border-transparent dark:border-token">Connect Stream</button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface-1 border border-token rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)] mb-3">Inbound Calls</h2>
              <p className="text-sm text-gray-800 dark:text-[var(--text-dim)] mb-3">Point your Twilio Voice phone number webhook to:</p>
              <code className="block text-xs bg-gray-100 dark:bg-[var(--surface-2)] p-2 rounded text-gray-800 dark:text-[var(--text)]">POST /api/voice-agent/webhook</code>
              <p className="text-xs text-gray-700 dark:text-[var(--text-faint)] mt-2">Inbound calls will receive an AI greeting and (future) streaming connection.</p>
            </div>
            <div className="surface-1 border border-token rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)] mb-3">Configuration</h2>
              <div className="text-xs text-gray-800 dark:text-[var(--text-dim)] space-y-2">
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Enter your phone number above and press Call. If Twilio isn’t connected, we’ll simulate the call.</li>
                  <li>To enable real calls, add these environment variables to the backend and restart:
                    <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-[var(--surface-2)] rounded">TWILIO_ACCOUNT_SID</code>
                      <code className="px-2 py-1 bg-gray-100 dark:bg-[var(--surface-2)] rounded">TWILIO_AUTH_TOKEN</code>
                      <code className="px-2 py-1 bg-gray-100 dark:bg-[var(--surface-2)] rounded">TWILIO_PHONE_NUMBER</code>
                    </div>
                  </li>
                  <li>Optional: Configure ElevenLabs for richer voice features:
                    <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-[var(--surface-2)] rounded">ELEVENLABS_API_KEY</code>
                      <code className="px-2 py-1 bg-gray-100 dark:bg-[var(--surface-2)] rounded">ELEVENLABS_VOICE_ID</code>
                      <code className="px-2 py-1 bg-gray-100 dark:bg-[var(--surface-2)] rounded">ELEVENLABS_AGENT_ID</code>
                    </div>
                  </li>
                </ol>
                {status && (
                  <div className="pt-2 text-xs">
                    <p className="font-medium">Status</p>
                    <p>Twilio: {status.twilio.configured ? `Connected (${status.twilio.from})` : 'Not configured – using simulation'}</p>
                    <p>ElevenLabs: {status.elevenlabs.configured ? `Configured (agent ${status.elevenlabs.agentId})` : 'Optional'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
