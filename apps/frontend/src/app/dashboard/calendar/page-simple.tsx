'use client';

import { simple } from '@/lib/simple-ui';
import {
    CalendarDaysIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CalendarView from '../../../components/ui/CalendarView';

interface Appointment {
  _id: string;
  title: string;
  description?: string;
  appointmentType: 'consultation' | 'site_visit' | 'meeting' | 'inspection' | 'other';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  startDateTime: string;
  endDateTime: string;
  location?: {
    street: string;
    city: string;
    state: string;
  };
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Mock data
    const mockAppointments: Appointment[] = [
      {
        _id: '1',
        title: 'Kitchen Consultation - Smith',
        description: 'Initial consultation for kitchen remodel',
        appointmentType: 'consultation',
        status: 'confirmed',
        startDateTime: '2025-09-02T10:00:00Z',
        endDateTime: '2025-09-02T11:00:00Z',
        location: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA'
        }
      },
      {
        _id: '2',
        title: 'Site Visit - Johnson Bathroom',
        description: 'Measure and assess bathroom space',
        appointmentType: 'site_visit',
        status: 'scheduled',
        startDateTime: '2025-09-03T14:00:00Z',
        endDateTime: '2025-09-03T15:30:00Z',
        location: {
          street: '456 Oak Ave',
          city: 'Oakland',
          state: 'CA'
        }
      }
    ];

    setAppointments(mockAppointments);
    setLoading(false);
  }, []);

  const getEventColor = (status: Appointment['status']) => {
    const colors = {
      confirmed: '#10b981',
      scheduled: '#3b82f6',
      completed: '#6b7280',
      cancelled: '#ef4444'
    };
    return colors[status] || colors.scheduled;
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calendarEvents = filteredAppointments.map(appointment => ({
    id: appointment._id,
    title: appointment.title,
    start: appointment.startDateTime,
    end: appointment.endDateTime,
    backgroundColor: getEventColor(appointment.status),
    borderColor: getEventColor(appointment.status),
    textColor: '#ffffff',
    extendedProps: {
      appointment: appointment
    }
  }));

  const stats = {
    today: appointments.filter(a =>
      new Date(a.startDateTime).toDateString() === new Date().toDateString()
    ).length,
    thisWeek: appointments.filter(a => {
      const appointmentDate = new Date(a.startDateTime);
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return appointmentDate >= weekStart && appointmentDate <= weekEnd;
    }).length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'scheduled').length
  };

  if (loading) {
    return (
      <div className={simple.page()}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={simple.page()}>
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className={simple.text.title()}>Calendar</h1>
          <p className={simple.text.body()}>Manage appointments and schedule</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/calendar/new')}
          className={simple.button('primary', 'flex items-center gap-2')}
        >
          <PlusIcon className="h-4 w-4" />
          New Appointment
        </button>
      </div>

      {/* Stats */}
      <div className={simple.grid.cols4 + ' mb-6'}>
        <div className={simple.card('p-4')}>
          <div className="flex items-center gap-3">
            <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className={simple.text.small()}>Today</p>
              <p className={simple.text.title('text-2xl')}>{stats.today}</p>
            </div>
          </div>
        </div>
        <div className={simple.card('p-4')}>
          <div className="flex items-center gap-3">
            <ClockIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className={simple.text.small()}>This Week</p>
              <p className={simple.text.title('text-2xl')}>{stats.thisWeek}</p>
            </div>
          </div>
        </div>
        <div className={simple.card('p-4')}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="h-3 w-3 bg-green-600 rounded-full"></div>
            </div>
            <div>
              <p className={simple.text.small()}>Confirmed</p>
              <p className={simple.text.title('text-2xl')}>{stats.confirmed}</p>
            </div>
          </div>
        </div>
        <div className={simple.card('p-4')}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <div className="h-3 w-3 bg-yellow-600 rounded-full"></div>
            </div>
            <div>
              <p className={simple.text.small()}>Pending</p>
              <p className={simple.text.title('text-2xl')}>{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={simple.input('pl-10')}
          />
        </div>

        {/* View Toggle */}
        <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-1">
          {[
            { key: 'dayGridMonth', label: 'Month' },
            { key: 'timeGridWeek', label: 'Week' },
            { key: 'timeGridDay', label: 'Day' }
          ].map((viewOption) => (
            <button
              key={viewOption.key}
              onClick={() => setView(viewOption.key as 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === viewOption.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {viewOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className={simple.card()}>
        <div className={simple.section()}>
          <CalendarView
            events={calendarEvents}
            initialView={view}
            currentView={view}
            onEventClick={(info) => {
              const appointment = info.event.extendedProps.appointment;
              router.push(`/dashboard/calendar/${appointment._id}`);
            }}
            onDateClick={(info) => {
              router.push(`/dashboard/calendar/new?date=${info.dateStr}`);
            }}
          />
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className={simple.card('mt-6')}>
        <div className={simple.section()}>
          <h2 className={simple.text.subtitle('mb-4')}>Upcoming Appointments</h2>
          <div className="space-y-3">
            {filteredAppointments
              .filter(apt => new Date(apt.startDateTime) > new Date())
              .slice(0, 5)
              .map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${getEventColor(appointment.status).substring(1)}`}></div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {appointment.title}
                      </h3>
                      <p className={simple.text.small()}>
                        {new Date(appointment.startDateTime).toLocaleDateString()} at{' '}
                        {new Date(appointment.startDateTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : appointment.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}

            {filteredAppointments.filter(apt => new Date(apt.startDateTime) > new Date()).length === 0 && (
              <div className="text-center py-8">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className={simple.text.subtitle('mt-2')}>No upcoming appointments</h3>
                <p className={simple.text.body('mt-1')}>
                  Schedule your next appointment to get started
                </p>
                <button
                  onClick={() => router.push('/dashboard/calendar/new')}
                  className={simple.button('primary', 'mt-4 inline-flex items-center gap-2')}
                >
                  <PlusIcon className="h-4 w-4" />
                  Schedule Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
