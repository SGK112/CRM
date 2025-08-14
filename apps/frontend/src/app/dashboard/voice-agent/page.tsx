'use client';

import { useState } from 'react';
import Layout from '../../../components/Layout';
import { PhoneIcon, ArrowPathIcon, MicrophoneIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
            <h1 className="text-3xl font-bold text-gray-900">Voice Agent</h1>
            <p className="text-gray-600 mt-1 text-sm">AI powered conversational agent for inbound & outbound calls (prototype).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><PhoneIcon className="h-5 w-5" /> Start Outbound Call</h2>
              <div className="flex gap-3">
                <input value={toNumber} onChange={e=>setToNumber(e.target.value)} placeholder="Destination phone e.g. +15551234567" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                <button onClick={startCall} disabled={!toNumber || loading} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2">
                  {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />} Call
                </button>
              </div>
              {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
              {call && (
                <div className="mt-4 text-sm bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p><span className="font-medium">Status:</span> {call.status} {call.simulated && <span className="text-xs text-gray-500">(simulated)</span>}</p>
                  <p><span className="font-medium">Call SID:</span> {call.sid}</p>
                  <p><span className="font-medium">To:</span> {call.to}</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><SpeakerWaveIcon className="h-5 w-5" /> Real-Time Audio (Coming Soon)</h2>
              <p className="text-sm text-gray-600">This section will enable browser microphone streaming to the ElevenLabs conversational session via WebRTC/WebSocket. For now calls are simulated unless Twilio credentials are configured.</p>
              <div className="mt-4 flex gap-3">
                <button disabled className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 text-sm flex items-center gap-2"><MicrophoneIcon className="h-4 w-4" /> Start Mic</button>
                <button disabled className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 text-sm">Connect Stream</button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Inbound Calls</h2>
              <p className="text-sm text-gray-600 mb-3">Point your Twilio Voice phone number webhook to:</p>
              <code className="block text-xs bg-gray-100 p-2 rounded">POST /voice-agent/webhook</code>
              <p className="text-xs text-gray-500 mt-2">Inbound calls will receive an AI greeting and (future) streaming connection.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Configuration</h2>
              <ul className="text-xs text-gray-600 space-y-1">
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
