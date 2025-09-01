"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { simple } from '../../../../lib/simple-ui';

type GCalStatus = { connected: boolean; hasRefreshToken: boolean; email: string };
type CalendarEvent = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

export default function IntegrationsSettingsPage() {
  const [status, setStatus] = useState<GCalStatus | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    summary: '',
    description: '',
    start: '', // datetime-local
    end: '',   // datetime-local
  });

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : '';
      const res = await fetch(`${API_BASE}/integrations/google-calendar/status`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = (await res.json()) as GCalStatus;
        setStatus(data);
      } else {
        setStatus(null);
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  const fetchEvents = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : '';
      const res = await fetch(`${API_BASE}/integrations/google-calendar/events`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = (await res.json()) as { events: CalendarEvent[] };
        setEvents(data.events || []);
      }
    } catch {
      // ignore
    }
  }, [API_BASE]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  // When connected, fetch upcoming events automatically
  useEffect(() => {
    if (status?.connected) {
      void fetchEvents();
    }
  }, [status?.connected, fetchEvents]);

  const handleConnect = () => {
    const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${backend}/auth/google`;
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.summary || !form.start || !form.end) return;
    try {
      setCreating(true);
      const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : '';
      const payload = {
        summary: form.summary,
        description: form.description,
        start: { dateTime: new Date(form.start).toISOString() },
        end: { dateTime: new Date(form.end).toISOString() },
      };
      const res = await fetch(`${API_BASE}/integrations/google-calendar/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setForm({ summary: '', description: '', start: '', end: '' });
        await fetchEvents();
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={simple.page()}>
      <div className="mb-4">
        <h1 className={simple.text.title()}>Integrations</h1>
        <p className={simple.text.body('mt-1')}>Connect Google Calendar to sync appointments.</p>
      </div>

      <div className={simple.grid.cols1}>
        <div className={simple.card()}>
          <div className="p-4 sm:p-6">
            <h2 className={simple.text.subtitle()}>Google Calendar</h2>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            {loading ? (
              <div className={simple.loading.container}>
                <div className={`${simple.loading.spinner} h-6 w-6`} />
                <span className={simple.text.small('ml-2')}>Checking…</span>
              </div>
            ) : status?.connected ? (
              <div className="space-y-3">
                <div>
                  <span className={simple.badge('success')}>Connected</span>
                </div>
                <div className={simple.text.body()}>Account: {status.email || '—'}</div>
                <button onClick={fetchEvents} className={simple.button('secondary')}>
                  Refresh Upcoming Events
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className={simple.badge('warning')}>Not Connected</span>
                </div>
                <div className={simple.text.body()}>Connect your Google account to enable calendar sync.</div>
                <button onClick={handleConnect} className={simple.button('primary')}>
                  Connect Google Calendar
                </button>
              </div>
            )}
          </div>
        </div>

        {status?.connected && (
          <div className={simple.card()}>
            <div className="p-4 sm:p-6">
              <h2 className={simple.text.subtitle()}>Upcoming Google Events</h2>
            </div>
            <div className="p-4 sm:p-6 pt-0">
              {events.length === 0 ? (
                <div className={simple.empty.container}>
                  <div className={simple.empty.title}>No upcoming events</div>
                  <div className={simple.empty.description}>Click "Refresh Upcoming Events" to load.</div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                  {events.map((e) => (
                    <li key={e.id} className="py-2">
                      <div className="font-medium">{e.summary || 'Untitled event'}</div>
                      <div className={simple.text.small()}>
                        {(e.start?.dateTime || e.start?.date || '').toString()} → {(e.end?.dateTime || e.end?.date || '').toString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {status?.connected && (
          <div className={simple.card()}>
            <div className="p-4 sm:p-6">
              <h2 className={simple.text.subtitle()}>Create Event</h2>
            </div>
            <form onSubmit={createEvent} className="p-4 sm:p-6 pt-0 space-y-4">
              <div>
                <label className={simple.text.small('block mb-1')}>Title</label>
                <input
                  className={simple.input()}
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  placeholder="Team meeting"
                />
              </div>
              <div>
                <label className={simple.text.small('block mb-1')}>Description</label>
                <textarea
                  className={simple.input()}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Agenda or notes (optional)"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={simple.text.small('block mb-1')}>Start</label>
                  <input
                    type="datetime-local"
                    className={simple.input()}
                    value={form.start}
                    onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={simple.text.small('block mb-1')}>End</label>
                  <input
                    type="datetime-local"
                    className={simple.input()}
                    value={form.end}
                    onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <button type="submit" disabled={creating} className={simple.button('primary')}>
                  {creating ? 'Creating…' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
