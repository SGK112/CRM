"use client";

import MapEmbed from '@/components/MapEmbed';
import { useEffect, useState } from 'react';

interface PortalClient {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
  };
}

interface PortalMessage {
  id: string;
  from: 'client' | 'team' | 'system';
  content: string;
  createdAt: string;
}

export default function ClientPortalPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [client, setClient] = useState<PortalClient | null>(null);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Public-friendly client data (mocked via frontend route)
        const res = await fetch(`/api/clients/${id}`);
        if (res.ok) setClient(await res.json());

        // Pull communications preview (mock)
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const comm = await fetch(`/api/clients/${id}/communications`, { headers });
        if (comm.ok) {
          const data: Array<{ _id?: string; direction?: 'inbound' | 'outbound'; subject?: string; content?: string; timestamp?: string }>
            = await comm.json();
          const simplified = data.slice(0, 15).map((c, i: number) => ({
            id: c._id || String(i),
            from: (c.direction === 'inbound' ? 'client' : 'team') as 'client' | 'team' | 'system',
            content: c.subject ? `${c.subject}: ${c.content || ''}` : (c.content || 'No content'),
            createdAt: c.timestamp || new Date().toISOString(),
          }));
          setMessages(simplified);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const draft: PortalMessage = {
      id: `${Date.now()}`,
      from: 'client',
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, draft]);
    setInput('');
    // Optional: POST to a public endpoint or queue; for now, no-op
  };

  const fullAddress = client?.address
    ? [client.address.street, `${client.address.city || ''}${client.address.state ? ', ' + client.address.state : ''} ${client.address.zipCode || ''}`]
        .filter(Boolean)
        .join('\n')
    : undefined;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-[var(--text)]">Client Portal</h1>
          {client && <p className="text-[var(--text-dim)]">Welcome, {client.name}</p>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
          <h2 className="font-medium text-[var(--text)] mb-3">Messages</h2>
          <div className="h-80 overflow-y-auto space-y-3 pr-2">
            {loading ? (
              <div className="flex items-center justify-center h-full text-[var(--text-dim)]">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-[var(--text-dim)]">No messages yet.</div>
            ) : (
              messages.map(m => (
                <div key={m.id} className={`max-w-[80%] ${m.from === 'client' ? 'ml-auto bg-amber-50 text-amber-900' : 'bg-[var(--surface-2)] text-[var(--text)]'} px-3 py-2 rounded-lg border border-[var(--border)]`}>
                  <div className="text-xs text-[var(--text-dim)] mb-0.5">{new Date(m.createdAt).toLocaleString()}</div>
                  <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 input"
              placeholder="Write a message to your contractor..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey ? (e.preventDefault(), handleSend()) : undefined}
            />
            <button className="btn btn-amber" onClick={handleSend}>Send</button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="font-medium text-[var(--text)] mb-3">Project Location</h3>
            <MapEmbed
              address={fullAddress}
              coordinates={client?.address?.coordinates ? {
                lat: Number(client.address.coordinates.lat),
                lng: Number(client.address.coordinates.lng)
              } : undefined}
              height={220}
            />
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 text-sm text-[var(--text-dim)]">
            <p>Use this portal to message your project team, review updates, and share documents.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
