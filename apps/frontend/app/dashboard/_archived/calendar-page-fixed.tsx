'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import CalendarView from '../../../components/ui/CalendarView';
import { getGoogleCalendarUrl, generateIcsContent, downloadIcsFile } from '../../../lib/calendar';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface Appointment {
  _id: string;
  title: string;
  description?: string;
  appointmentType: 'consultation' | 'site_visit' | 'meeting' | 'inspection' | 'other';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDateTime: string;
  endDateTime: string;
  location?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  clientId?: string;
  projectId?: string;
  attendees: string[];
  notes?: string;
  reminderSet: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>(
    'dayGridMonth'
  );
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const router = useRouter();

  // Convert appointments to FullCalendar events
  const calendarEvents = appointments.map(appointment => ({
    id: appointment._id,
    title: appointment.title,
    start: appointment.startDateTime,
    end: appointment.endDateTime,
    backgroundColor: getEventColor(appointment.status),
    borderColor: getEventColor(appointment.status),
    extendedProps: {
      appointment: appointment,
    },
  }));

  const getEventColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return '#10b981'; // green-500
      case 'scheduled':
        return '#3b82f6'; // blue-500
      case 'completed':
        return '#6b7280'; // gray-500
      case 'cancelled':
        return '#ef4444'; // red-500
      case 'rescheduled':
        return '#f59e0b'; // amber-500
      default:
        return '#6366f1'; // indigo-500
    }
  };

  const handleEventClick = (info: any) => {
    const appointment = info.event.extendedProps.appointment;
    setSelectedEvent(appointment);
  };

  const handleDateClick = (info: any) => {
    // Navigate to new appointment with the clicked date
    const date = info.dateStr;
    router.push(`/dashboard/calendar/new?date=${date}`);
  };

  const handleAddToGoogle = (appointment: Appointment) => {
    const calendarEvent = {
      title: appointment.title,
      description: appointment.description,
      start: new Date(appointment.startDateTime),
      end: new Date(appointment.endDateTime),
      location: appointment.location
        ? `${appointment.location.street}, ${appointment.location.city}, ${appointment.location.state}`
        : undefined,
    };
    const url = getGoogleCalendarUrl(calendarEvent);
    window.open(url, '_blank');
  };

  const handleDownloadIcs = (appointment: Appointment) => {
    const calendarEvent = {
      title: appointment.title,
      description: appointment.description,
      start: new Date(appointment.startDateTime),
      end: new Date(appointment.endDateTime),
      location: appointment.location
        ? `${appointment.location.street}, ${appointment.location.city}, ${appointment.location.state}`
        : undefined,
    };
    const icsContent = generateIcsContent(calendarEvent);
    downloadIcsFile(icsContent, `${appointment.title.replace(/\s+/g, '_')}.ics`);
  };

  useEffect(() => {
    // Mock data for demo purposes
    const mockAppointments: Appointment[] = [
      {
        _id: '1',
        title: 'Initial Consultation - Smith Kitchen',
        description: 'Discuss kitchen remodeling requirements and budget',
        appointmentType: 'consultation',
        status: 'scheduled',
        priority: 'high',
        startDateTime: '2025-08-25T10:00:00Z',
        endDateTime: '2025-08-25T11:00:00Z',
        location: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA',
        },
        attendees: [],
        reminderSet: true,
        createdAt: '2025-08-12T06:00:00Z',
        updatedAt: '2025-08-12T06:00:00Z',
      },
      {
        _id: '2',
        title: 'Site Visit - Johnson Bathroom',
        description: 'Measure bathroom space and assess plumbing',
        appointmentType: 'site_visit',
        status: 'confirmed',
        priority: 'medium',
        startDateTime: '2025-08-26T14:00:00Z',
        endDateTime: '2025-08-26T15:30:00Z',
        location: {
          street: '456 Oak Ave',
          city: 'Oakland',
          state: 'CA',
          zipCode: '94601',
          country: 'USA',
        },
        attendees: [],
        reminderSet: true,
        createdAt: '2025-08-12T06:00:00Z',
        updatedAt: '2025-08-12T06:00:00Z',
      },
      {
        _id: '3',
        title: 'Final Inspection - Davis Deck',
        description: 'Final walkthrough and project completion',
        appointmentType: 'inspection',
        status: 'completed',
        priority: 'medium',
        startDateTime: '2025-08-24T09:00:00Z',
        endDateTime: '2025-08-24T10:00:00Z',
        attendees: [],
        reminderSet: false,
        createdAt: '2025-08-12T06:00:00Z',
        updatedAt: '2025-08-12T06:00:00Z',
      },
    ];

    setAppointments(mockAppointments);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar & Appointments</h1>
            <p className="text-gray-800">
              Manage your appointments and schedule with calendar integrations
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link
              href="/dashboard/calendar/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Appointment
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    appointments.filter(
                      a => new Date(a.startDateTime).toDateString() === new Date().toDateString()
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    appointments.filter(a => {
                      const appointmentDate = new Date(a.startDateTime);
                      const today = new Date();
                      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return appointmentDate >= weekStart && appointmentDate <= weekEnd;
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">Total</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Integration Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar Integrations</h3>
              <p className="text-gray-800 text-sm">
                Export appointments to your favorite calendar app
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <GlobeAltIcon className="h-4 w-4 mr-2" />
                Connect Google
              </button>
              <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Sync Outlook
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <CalendarView
            events={calendarEvents}
            initialView={view}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-800"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              {selectedEvent.description && (
                <p className="text-gray-800 mb-4">{selectedEvent.description}</p>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    {new Date(selectedEvent.startDateTime).toLocaleString()} -{' '}
                    {new Date(selectedEvent.endDateTime).toLocaleTimeString()}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {selectedEvent.location.street}, {selectedEvent.location.city}
                    </span>
                  </div>
                )}

                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="capitalize">
                    {selectedEvent.appointmentType.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleAddToGoogle(selectedEvent)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <GlobeAltIcon className="h-4 w-4 mr-2" />
                  Add to Google
                </button>
                <button
                  onClick={() => handleDownloadIcs(selectedEvent)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download .ics
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
