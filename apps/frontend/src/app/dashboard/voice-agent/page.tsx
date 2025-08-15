'use client';

import { useState } from 'react';
import Layout from '../../../components/Layout';
import { PhoneIcon, ArrowPathIcon, MicrophoneIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { API_BASE } from '@/lib/api';

interface OutboundResponse { sid: string; status: string; simulated?: boolean; to: string; agentId?: string }

export default function VoiceAgentPage() {
  const [toNumber, setToNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [call, setCall] = useState<OutboundResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    } catch (e:any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="space-y-8">
    <div className="flex items-center justify-between">
          <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-[var(--text)]">Voice Agent</h1>
      <p className="text-gray-600 dark:text-[var(--text-dim)] mt-1 text-sm">AI powered conversational agent for inbound & outbound calls (prototype).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-1 border border-token rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)] mb-4 flex items-center gap-2"><PhoneIcon className="h-5 w-5" /> Start Outbound Call</h2>
              <div className="flex gap-3">
                <input value={toNumber} onChange={e=>setToNumber(e.target.value)} placeholder="Destination phone e.g. +15551234567" className="flex-1 px-3 py-2 border border-gray-300 dark:border-token rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-[var(--surface-2)] dark:text-[var(--text)] placeholder:text-gray-400 dark:placeholder:text-[var(--text-faint)]" />
                <button onClick={startCall} disabled={!toNumber || loading} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-[var(--surface-2)] disabled:text-gray-600 dark:disabled:text-[var(--text-dim)] disabled:cursor-not-allowed flex items-center gap-2">
                  {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />} Call
                </button>
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400 mt-3">{error}</p>}
              {call && (
                <div className="mt-4 text-sm bg-gray-50 dark:bg-[var(--surface-2)] border border-gray-200 dark:border-token rounded-lg p-3 text-gray-700 dark:text-[var(--text)]">
                  <p><span className="font-medium">Status:</span> {call.status} {call.simulated && <span className="text-xs text-gray-500 dark:text-[var(--text-dim)]">(simulated)</span>}</p>
                  <p><span className="font-medium">Call SID:</span> {call.sid}</p>
                  <p><span className="font-medium">To:</span> {call.to}</p>
                </div>
              )}
            </div>

            <div className="surface-1 border border-token rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)] mb-4 flex items-center gap-2"><SpeakerWaveIcon className="h-5 w-5" /> Real-Time Audio (Coming Soon)</h2>
              <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">This section will enable browser microphone streaming to the ElevenLabs conversational session via WebRTC/WebSocket. For now calls are simulated unless Twilio credentials are configured.</p>
              <div className="mt-4 flex gap-3">
                <button disabled className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-[var(--surface-2)] text-gray-600 dark:text-[var(--text-dim)] text-sm flex items-center gap-2 border border-transparent dark:border-token"><MicrophoneIcon className="h-4 w-4" /> Start Mic</button>
                <button disabled className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-[var(--surface-2)] text-gray-600 dark:text-[var(--text-dim)] text-sm border border-transparent dark:border-token">Connect Stream</button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface-1 border border-token rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)] mb-3">Inbound Calls</h2>
              <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-3">Point your Twilio Voice phone number webhook to:</p>
              <code className="block text-xs bg-gray-100 dark:bg-[var(--surface-2)] p-2 rounded text-gray-800 dark:text-[var(--text)]">POST /voice-agent/webhook</code>
              <p className="text-xs text-gray-500 dark:text-[var(--text-faint)] mt-2">Inbound calls will receive an AI greeting and (future) streaming connection.</p>
            </div>
            <div className="surface-1 border border-token rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text)] mb-3">Configuration</h2>
              <ul className="text-xs text-gray-600 dark:text-[var(--text-dim)] space-y-1">
                <li>ELEVENLABS_API_KEY (optional for now)</li>
                <li>ELEVENLABS_VOICE_ID</li>
                <li>ELEVENLABS_AGENT_ID</li>
                <li>TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
