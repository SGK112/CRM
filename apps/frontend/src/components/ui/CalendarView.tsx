
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

type Contact = { id: string; name: string };

interface CalendarViewProps {
  events: EventInput[];
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
  onEventClick?: (info: EventClickArg) => void;
  onDateClick?: (info: DateClickArg) => void;
  currentView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
  // New: list of contacts to attach to events and a creation callback
  contacts?: Contact[];
  onCreateEvent?: (payload: {
    title: string;
    start: string;
    end?: string;
    contactIds?: string[];
  }) => void | Promise<void>;
}

export default function CalendarView({
  events,
  initialView = 'listWeek',
  onEventClick,
  onDateClick,
  currentView,
  contacts = [],
  onCreateEvent,
}: CalendarViewProps) {
  const [view, setView] = useState(currentView || initialView);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createStart, setCreateStart] = useState('');
  const [createEnd, setCreateEnd] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Event action popover / AI summary
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);
  const [showEventActions, setShowEventActions] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    // prefer list view on small screens
    if (isMobile) setView('listWeek');
  }, [isMobile]);

  function openCreate(dateIso?: string) {
    setCreateTitle('');
    setSelectedContacts([]);
    setCreateEnd('');
    if (dateIso) setCreateStart(dateIso);
    else setCreateStart(new Date().toISOString().slice(0, 16));
    setShowCreate(true);
  }

  function handleDateClickLocal(info: DateClickArg) {
    // call optional parent handler
    onDateClick?.(info);
    // open the create modal with the clicked date/time
    openCreate(info.dateStr?.slice(0, 16) || info.date.toISOString().slice(0, 16));
  }

  async function handleCreateSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!createTitle || !createStart) return;
    const payload = {
      title: createTitle,
      start: createStart,
      end: createEnd || undefined,
      contactIds: selectedContacts.length ? selectedContacts : undefined,
    };
    await onCreateEvent?.(payload);
    setShowCreate(false);
  }

  function toggleContact(id: string) {
    setSelectedContacts(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  return (
    <div className="cal-root">
      <div className="cal-header">
        <h2 className="cal-title">Calendar</h2>
        <div className="cal-controls">
          <button
            className={`btn ${view === 'dayGridMonth' ? 'active' : ''}`}
            onClick={() => setView('dayGridMonth')}
          >
            Month
          </button>
          <button
            className={`btn ${view === 'timeGridWeek' ? 'active' : ''}`}
            onClick={() => setView('timeGridWeek')}
          >
            Week
          </button>
          <button
            className={`btn ${view === 'timeGridDay' ? 'active' : ''}`}
            onClick={() => setView('timeGridDay')}
          >
            Day
          </button>
          <button
            className={`btn ${view === 'listWeek' ? 'active' : ''}`}
            onClick={() => setView('listWeek')}
          >
            List
          </button>
        </div>
      </div>

      <div className="cal-body">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={view}
          key={view}
          headerToolbar={false}
          events={events}
          eventClick={(info) => {
            info.jsEvent?.preventDefault?.();
            setSelectedEvent(info as EventClickArg);
            setShowEventActions(true);
            onEventClick?.(info as EventClickArg);
          }}
          dateClick={handleDateClickLocal}
          editable={false}
          selectable={true}
          weekends={true}
          height="auto"
          listDayFormat={{ weekday: 'short', month: 'short', day: 'numeric' }}
          nowIndicator={true}
        />
      </div>

      <button className="floating-new" onClick={() => openCreate()} aria-label="Create event">
        New
      </button>

      {showCreate && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal" onSubmit={handleCreateSubmit}>
            <h3>Create event</h3>
            <label>
              Title
              <input
                value={createTitle}
                onChange={e => setCreateTitle(e.target.value)}
                placeholder="Event title"
                className="input"
                required
              />
            </label>

            <label>
              Start
              <input
                type="datetime-local"
                value={createStart}
                onChange={e => setCreateStart(e.target.value)}
                className="input"
                required
              />
            </label>

            <label>
              End (optional)
              <input
                type="datetime-local"
                value={createEnd}
                onChange={e => setCreateEnd(e.target.value)}
                className="input"
              />
            </label>

            <fieldset className="contacts-field">
              <legend>Attach contacts</legend>
              {contacts.length === 0 && <p className="muted">No contacts available</p>}
              {contacts.map(c => (
                <label key={c.id} className="contact-row">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(c.id)}
                    onChange={() => toggleContact(c.id)}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </fieldset>

            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button type="submit" className="btn primary">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {showEventActions && selectedEvent && (
        <div className="event-popover" role="dialog" aria-modal="false">
          <div className="event-popover-card">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="event-popover-title">{selectedEvent.event.title}</h4>
                <p className="muted">{selectedEvent.event.start ? new Date(String(selectedEvent.event.start)).toLocaleString() : ''}</p>
              </div>
              <button className="btn ghost" onClick={() => { setShowEventActions(false); setSelectedEvent(null); }}>Close</button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="btn"
                onClick={() => {
                  const ext = selectedEvent?.event?.extendedProps as unknown;
                  type AppointmentLike = { client?: { id?: string; _id?: string }; clientId?: string };
                  let appt: AppointmentLike = {};
                  if (ext && typeof ext === 'object' && 'appointment' in (ext as Record<string, unknown>)) {
                    const maybe = (ext as Record<string, unknown>)['appointment'];
                    if (maybe && typeof maybe === 'object') appt = maybe as AppointmentLike;
                  }
                  const clientId = appt.client?.id ?? appt.client?._id ?? appt.clientId ?? '';
                  setShowEventActions(false);
                  if (clientId) router.push(`/dashboard/inbox/compose?to=${clientId}`);
                  else router.push('/dashboard/inbox/compose');
                }}
              >
                Message client
              </button>

              <button
                className="btn"
                onClick={() => {
                  const ext = selectedEvent?.event?.extendedProps as unknown;
                  type AppointmentLike = { client?: { id?: string; _id?: string }; clientId?: string };
                  let appt: AppointmentLike = {};
                  if (ext && typeof ext === 'object' && 'appointment' in (ext as Record<string, unknown>)) {
                    const maybe = (ext as Record<string, unknown>)['appointment'];
                    if (maybe && typeof maybe === 'object') appt = maybe as AppointmentLike;
                  }
                  const clientId = appt.client?.id ?? appt.client?._id ?? appt.clientId;
                  setShowEventActions(false);
                  if (clientId) router.push(`/dashboard/contacts/${clientId}`);
                  else window.alert('No contact linked to this event');
                }}
              >
                Open contact
              </button>

              <button
                className="btn"
                onClick={() => {
                  const ext = selectedEvent?.event?.extendedProps as unknown;
                  type AppointmentProj = { projectId?: string; project?: { _id?: string } };
                  let appt: AppointmentProj = {};
                  if (ext && typeof ext === 'object' && 'appointment' in (ext as Record<string, unknown>)) {
                    const maybe = (ext as Record<string, unknown>)['appointment'];
                    if (maybe && typeof maybe === 'object') appt = maybe as AppointmentProj;
                  }
                  const projectId = appt?.projectId ?? appt?.project?._id;
                  setShowEventActions(false);
                  if (projectId) router.push(`/dashboard/projects/${projectId}`);
                  else window.alert('No project linked');
                }}
              >
                Open project
              </button>

              <button
                className="btn"
                onClick={() => {
                  const ext = selectedEvent?.event?.extendedProps as unknown;
                  type AppointmentLike = { client?: { id?: string; _id?: string }; clientId?: string };
                  let appt: AppointmentLike = {};
                  if (ext && typeof ext === 'object' && 'appointment' in (ext as Record<string, unknown>)) {
                    const maybe = (ext as Record<string, unknown>)['appointment'];
                    if (maybe && typeof maybe === 'object') appt = maybe as AppointmentLike;
                  }
                  const clientId = appt.client?.id ?? appt.client?._id ?? appt.clientId ?? '';
                  setShowEventActions(false);
                  router.push(`/dashboard/estimates/new?clientId=${clientId}&fromEvent=${selectedEvent.event.id}`);
                }}
              >
                New estimate
              </button>

              <button
                className="btn"
                onClick={() => {
                  const ext = selectedEvent?.event?.extendedProps as unknown;
                  type AppointmentLike = { client?: { id?: string; _id?: string }; clientId?: string };
                  let appt: AppointmentLike = {};
                  if (ext && typeof ext === 'object' && 'appointment' in (ext as Record<string, unknown>)) {
                    const maybe = (ext as Record<string, unknown>)['appointment'];
                    if (maybe && typeof maybe === 'object') appt = maybe as AppointmentLike;
                  }
                  const clientId = appt.client?.id ?? appt.client?._id ?? appt.clientId ?? '';
                  setShowEventActions(false);
                  router.push(`/dashboard/invoices/new?clientId=${clientId}&fromEvent=${selectedEvent.event.id}`);
                }}
              >
                New invoice
              </button>

              <button
                className="btn primary col-span-2"
                onClick={async () => {
                  setShowEventActions(false);
                  setAiSummary(null);
                  setShowAiModal(true);
                  try {
                    const res = await fetch('/api/ai/summarize', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ eventId: selectedEvent?.event?.id }),
                    });
                    if (res.ok) {
                      const json = await res.json();
                      setAiSummary(json.summary || JSON.stringify(json));
                    } else {
                      const txt = await res.text();
                      setAiSummary(`AI unavailable: ${res.status} ${txt}`);
                    }
                  } catch (e: unknown) {
                    const errMsg = typeof e === 'object' && e && 'message' in (e as Record<string, unknown>) ? String((e as Record<string, unknown>)['message']) : String(e);
                    setAiSummary(`AI error: ${errMsg}`);
                  }
                }}
              >
                AI summary
              </button>
            </div>
          </div>
        </div>
      )}

      {showAiModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="flex items-start justify-between">
              <h3>AI Summary</h3>
              <button className="btn ghost" onClick={() => setShowAiModal(false)}>Close</button>
            </div>
            <div className="mt-3">
              {aiSummary ? <pre className="whitespace-pre-wrap text-sm">{aiSummary}</pre> : <p className="muted">Generating summary…</p>}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Root - use site surface for branding (slate) */
        .cal-root { padding: 0.5rem; background: var(--surface-1); color: var(--text); border-radius: 0.5rem; }

        /* Header */
        .cal-header { display:flex; align-items:center; justify-content:space-between; gap:0.5rem; margin-bottom:0.5rem; padding:0.5rem; background: transparent; }
        .cal-title { font-size:1.125rem; font-weight:700; margin:0; color: var(--text); }
        .cal-controls { display:flex; gap:0.25rem; }

        /* Buttons: use site surfaces and borders for good contrast */
        .btn { background: var(--surface-2); border:1px solid var(--border); padding:0.35rem 0.6rem; border-radius:0.375rem; font-weight:600; cursor:pointer; color:var(--text); }
        .btn.active { background:#d97706; color:white; border-color:#b45309 }
        .btn.primary { background:#d97706; color:white; border-color:#b45309 }
        .btn.ghost { background:transparent; border:1px solid var(--border); color:var(--text); }

        /* Calendar body: make sure FullCalendar sits on a slate-gray canvas */
        .cal-body { min-height:240px; padding:0.5rem; background: transparent; }

        /* Floating new button keeps brand accent */
        .floating-new { position:fixed; right:1rem; bottom:5rem; background:#d97706; color:white; border:none; padding:0.6rem 0.9rem; border-radius:9999px; font-weight:700 }

        /* Modal - keep existing theme-aware styles */
        .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.28); display:flex; align-items:flex-end; justify-content:center; padding:1rem; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
          .modal { width:100%; max-width:720px; background:var(--surface-1); color:var(--text); border-radius:0.75rem; padding:1rem; box-shadow:0 10px 25px rgba(0,0,0,0.12); border:1px solid var(--border); }
          .dark .modal { background:var(--surface-2); color:var(--text); }
          .modal h3 { margin:0 0 0.5rem 0 }
          .input { width:100%; padding:0.5rem; border:1px solid var(--border); border-radius:0.375rem; margin-top:0.25rem; margin-bottom:0.5rem; background:var(--surface-2); color:var(--text); }
        .contacts-field { border-top:1px solid var(--border); padding-top:0.5rem; margin-top:0.5rem }
        .contact-row { display:flex; gap:0.5rem; align-items:center; padding:0.25rem 0 }
        .muted { color:var(--text-dim); font-size:0.9rem }
        .modal-actions { display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem }

        @media (min-width: 769px) {
          .modal-backdrop { align-items:center }
        }

        /* FullCalendar specific tweaks for readability */
        .fc { font-family: inherit; }

        /* Day of week header (e.g. Mon, Tue) */
        .fc .fc-col-header-cell-cushion {
          color: var(--text);
          font-weight: 600;
        }

        /* Day numbers inside month view */
        .fc .fc-daygrid-day-number {
          color: var(--text-dim);
          font-weight: 600;
        }

        /* Make day cells slightly transparent so events stand out on dark slate */
        .fc .fc-daygrid-day-top {
          background: transparent;
        }

        /* TOOL CARD: slate-gray background for day headers and time axis with white text */
        .fc .fc-col-header-cell,
        .fc .fc-col-header-cell-cushion,
        .fc .fc-timegrid-axis,
        .fc .fc-timegrid-axis-cushion,
        .fc .fc-timegrid-axis .fc-scrollgrid-sync-inner {
          background: #334155; /* slate gray */
          color: #ffffff !important;
        }

        /* Ensure the small labels inside the axis are white and readable */
        .fc .fc-timegrid-axis-cushion,
        .fc .fc-timegrid-axis .fc-timegrid-slot-label {
          color: #ffffff !important;
          font-weight: 600;
        }

        /* Stronger contrast for header separators */
        .fc .fc-scrollgrid-section > .fc-scrollgrid-section-header {
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        /* Event titles in list view and grid */
        .fc .fc-list-event-title,
        .fc .fc-event-title {
          color: var(--text);
        }

        /* Ensure toolbar buttons (if any) use site surfaces */
        .fc .fc-button {
          background: var(--surface-2);
          border: 1px solid var(--border);
          color: var(--text);
        }

        /* Improve contrast for now-indicator and separators */
        .fc .fc-today {
          background: rgba(217, 119, 6, 0.06);
        }
      `}</style>
    </div>
  );
}
