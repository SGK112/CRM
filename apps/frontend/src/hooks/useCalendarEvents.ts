import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppointmentStatus, AppointmentType } from '@/config/appointments';

export interface CalendarAppointment {
  _id: string;
  title: string;
  description?: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  startDateTime: string; // ISO
  endDateTime: string;   // ISO
  location?: { street: string; city: string; state: string };
  client?: { name: string; phone?: string };
  isGoogleEvent?: boolean;
  googleEventId?: string;
}

interface UseCalendarEventsOptions {
  autoLoad?: boolean;
  mockOnError?: boolean;
}

const SAMPLE_EVENTS: CalendarAppointment[] = [
  {
    _id: 'sample-1',
    title: 'Sample Consultation',
    appointmentType: 'consultation',
    status: 'scheduled',
    startDateTime: new Date(Date.now() + 3600_000).toISOString(),
    endDateTime: new Date(Date.now() + 7200_000).toISOString(),
    description: 'Example event (local fallback)',
  },
  {
    _id: 'sample-2',
    title: 'Google Synced Meeting',
    appointmentType: 'meeting',
    status: 'confirmed',
    startDateTime: new Date(Date.now() + 26 * 3600_000).toISOString(),
    endDateTime: new Date(Date.now() + 27 * 3600_000).toISOString(),
    isGoogleEvent: true,
    googleEventId: 'gcal-123'
  }
];

export function useCalendarEvents(options: UseCalendarEventsOptions = {}) {
  const { autoLoad = true, mockOnError = true } = options;
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [lastLoaded, setLastLoaded] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken') || localStorage.getItem('token')
          : null;

      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const resp = await fetch('/api/appointments/calendar', { headers });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const events = await resp.json();

      interface RawEvent {
        id: string;
        title: string;
        description?: string;
        start: string;
        end: string;
        extendedProps?: {
          type?: string;
          status?: string;
          location?: string;
          source?: string;
          googleEventId?: string;
        };
      }
      const transformed: CalendarAppointment[] = (events as RawEvent[] | undefined || []).map((event) => ({
        _id: event.id,
        title: event.title,
        description: event.description || '',
        appointmentType:
          event.extendedProps?.type === 'google_calendar'
            ? 'meeting'
            : (event.extendedProps?.type as AppointmentType) || 'meeting',
        status: (event.extendedProps?.status || 'scheduled') as AppointmentStatus,
        startDateTime: event.start,
        endDateTime: event.end,
        location: event.extendedProps?.location
          ? { street: event.extendedProps.location, city: '', state: '' }
          : undefined,
        client: undefined,
        isGoogleEvent: event.extendedProps?.source === 'google',
        googleEventId: event.extendedProps?.googleEventId,
      }));
      setAppointments(transformed);
      setLastLoaded(Date.now());
    } catch (e) {
      // eslint-disable-next-line no-console -- Single warning allowed for diagnostics (could replace with toast/logger service)
      console.warn('Calendar load failed');
      if (mockOnError) {
        setAppointments(SAMPLE_EVENTS);
      }
      setError(e instanceof Error ? e.message : 'Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [mockOnError]);

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const today = appointments.filter(a => new Date(a.startDateTime).toDateString() === todayStr).length;
    const thisWeek = appointments.filter(a => {
      const d = new Date(a.startDateTime);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0,0,0,0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      return d >= weekStart && d < weekEnd;
    }).length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const pending = appointments.filter(a => a.status === 'scheduled').length;
    return { today, thisWeek, confirmed, pending };
  }, [appointments]);

  const upcoming = useMemo(
    () => appointments
      .filter(a => new Date(a.startDateTime) > new Date())
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
      .slice(0, 5),
    [appointments]
  );

  return { appointments, loading, error, stats, upcoming, refresh: load, lastLoaded };
}

export type UseCalendarEventsReturn = ReturnType<typeof useCalendarEvents>;
