'use client';

import {
    CalendarDaysIcon,
    CheckCircleIcon,
    ChevronRightIcon,
    ClockIcon,
    ClockIcon as ClockSolidIcon,
    ExclamationTriangleIcon,
    FunnelIcon,
    ListBulletIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    PlusIcon,
    Squares2X2Icon,
    UserIcon,
    ViewColumnsIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CalendarView from '../../../components/ui/CalendarView';

interface Appointment {
  _id: string;
  title: string;
  description?: string;
  appointmentType: 'consultation' | 'site_visit' | 'meeting' | 'inspection' | 'other' | 'google_calendar';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'confirmed';
  startDateTime: string;
  endDateTime: string;
  location?: {
    street: string;
    city: string;
    state: string;
  };
  client?: {
    name: string;
    phone?: string;
  };
  isGoogleEvent?: boolean;
  googleEventId?: string;
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('dayGridMonth');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch('/api/appointments/calendar', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const events = await response.json();
          // Transform API events to frontend format
          const transformedAppointments: Appointment[] = events.map((event: {
            id: string;
            title: string;
            start: string;
            end: string;
            description?: string;
            extendedProps: {
              type: string;
              status: string;
              location?: string;
              source?: string;
              googleEventId?: string;
            };
          }) => ({
            _id: event.id,
            title: event.title,
            description: event.description || '',
            appointmentType: event.extendedProps.type === 'google_calendar' ? 'meeting' : (event.extendedProps.type as Appointment['appointmentType']),
            status: (event.extendedProps.status || 'scheduled') as Appointment['status'],
            startDateTime: event.start,
            endDateTime: event.end,
            location: event.extendedProps.location ? {
              street: event.extendedProps.location,
              city: '',
              state: ''
            } : undefined,
            client: undefined, // Google events don't have client info
            isGoogleEvent: event.extendedProps.source === 'google',
            googleEventId: event.extendedProps.googleEventId,
          }));
          setAppointments(transformedAppointments);
        } else {
          // Handle error silently for better UX
          setAppointments([]);
        }
      } catch (error) {
        // Handle error silently for better UX
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarEvents();
  }, [router]);

  const getEventColor = (appointment: Appointment) => {
    // Google Calendar events use their own color
    if (appointment.isGoogleEvent) {
      return '#ea4335'; // Google Calendar red
    }

    const colors = {
      confirmed: '#10b981', // Emerald-500
      scheduled: '#3b82f6', // Blue-500
      completed: '#6b7280', // Gray-500
      cancelled: '#ef4444'  // Red-500
    };
    return colors[appointment.status as keyof typeof colors] || colors.scheduled;
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return CheckCircleSolidIcon;
      case 'scheduled':
        return ClockSolidIcon;
      case 'completed':
        return CheckCircleIcon;
      case 'cancelled':
        return ExclamationTriangleIcon;
      default:
        return ClockIcon;
    }
  };

  const getAppointmentTypeIcon = (type: Appointment['appointmentType']) => {
    switch (type) {
      case 'consultation':
        return UserIcon;
      case 'site_visit':
        return MapPinIcon;
      case 'meeting':
        return UserIcon;
      case 'inspection':
        return CheckCircleIcon;
      case 'google_calendar':
        return CalendarDaysIcon;
      default:
        return CalendarDaysIcon;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(apt.status);
    const matchesType = typeFilter.length === 0 || typeFilter.includes(apt.appointmentType);

    return matchesSearch && matchesStatus && matchesType;
  });

  const calendarEvents = filteredAppointments.map(appointment => ({
    id: appointment._id,
    title: appointment.isGoogleEvent ? `📅 ${appointment.title}` : appointment.title,
    start: appointment.startDateTime,
    end: appointment.endDateTime,
    backgroundColor: getEventColor(appointment),
    borderColor: getEventColor(appointment),
    textColor: '#ffffff',
    extendedProps: {
      appointment: appointment
    }
  }));

  const today = new Date();
  const stats = {
    today: appointments.filter(a =>
      new Date(a.startDateTime).toDateString() === today.toDateString()
    ).length,
    thisWeek: appointments.filter(a => {
      const appointmentDate = new Date(a.startDateTime);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return appointmentDate >= weekStart && appointmentDate <= weekEnd;
    }).length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'scheduled').length
  };

  const upcomingAppointments = filteredAppointments
    .filter(apt => new Date(apt.startDateTime) > new Date())
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CalendarDaysIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage your appointments and schedule</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  showFilters
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
              </button>

              <button
                onClick={() => router.push('/dashboard/calendar/new')}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <PlusIcon className="h-4 w-4" />
                New Appointment
              </button>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                  <CalendarDaysIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Today</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.today}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg shadow-sm">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">This Week</p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.thisWeek}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg shadow-sm">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Confirmed</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.confirmed}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-600 rounded-lg shadow-sm">
                  <ClockSolidIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Pending</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.pending}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Enhanced Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Appointments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['scheduled', 'confirmed', 'completed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(prev =>
                          prev.includes(status)
                            ? prev.filter(s => s !== status)
                            : [...prev, status]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        statusFilter.includes(status)
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <div className="flex flex-wrap gap-2">
                  {['consultation', 'site_visit', 'meeting', 'inspection', 'other', 'google_calendar'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setTypeFilter(prev =>
                          prev.includes(type)
                            ? prev.filter(t => t !== type)
                            : [...prev, type]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        typeFilter.includes(type)
                          ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-600'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {type === 'google_calendar' ? 'Google Calendar' : type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {(statusFilter.length > 0 || typeFilter.length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setStatusFilter([]);
                    setTypeFilter([]);
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments, clients, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-1 shadow-sm">
            {[
              { key: 'dayGridMonth', label: 'Month', icon: Squares2X2Icon },
              { key: 'timeGridWeek', label: 'Week', icon: ViewColumnsIcon },
              { key: 'timeGridDay', label: 'Day', icon: ViewColumnsIcon },
              { key: 'listWeek', label: 'List', icon: ListBulletIcon }
            ].map((viewOption) => {
              const IconComponent = viewOption.icon;
              return (
                <button
                  key={viewOption.key}
                  onClick={() => setView(viewOption.key as 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    view === viewOption.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {viewOption.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Enhanced Calendar */}
          <div className="xl:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
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

          {/* Enhanced Sidebar - Upcoming Appointments */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Next 5 scheduled appointments</p>
              </div>

              <div className="p-6">
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => {
                      const StatusIcon = getStatusIcon(appointment.status);
                      const TypeIcon = getAppointmentTypeIcon(appointment.appointmentType);
                      const appointmentDate = new Date(appointment.startDateTime);

                      return (
                        <div
                          key={appointment._id}
                          onClick={() => router.push(`/dashboard/calendar/${appointment._id}`)}
                          className="group p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className={`p-2 rounded-lg ${
                                appointment.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30' :
                                appointment.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                appointment.status === 'completed' ? 'bg-gray-100 dark:bg-gray-900/30' :
                                'bg-red-100 dark:bg-red-900/30'
                              }`}>
                                <StatusIcon className={`h-4 w-4 ${
                                  appointment.status === 'confirmed' ? 'text-green-600 dark:text-green-400' :
                                  appointment.status === 'scheduled' ? 'text-blue-600 dark:text-blue-400' :
                                  appointment.status === 'completed' ? 'text-gray-600 dark:text-gray-400' :
                                  'text-red-600 dark:text-red-400'
                                }`} />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                {appointment.title}
                              </h3>

                              <div className="flex items-center gap-2 mt-1">
                                <TypeIcon className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                  {appointment.appointmentType.replace('_', ' ')}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                <ClockIcon className="h-3 w-3" />
                                <span>
                                  {appointmentDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })} at {appointmentDate.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>

                              {appointment.client && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                  <UserIcon className="h-3 w-3" />
                                  <span className="truncate">{appointment.client.name}</span>
                                </div>
                              )}

                              {appointment.location && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                  <MapPinIcon className="h-3 w-3" />
                                  <span className="truncate">
                                    {appointment.location.city}, {appointment.location.state}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex justify-between items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                : appointment.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                : appointment.status === 'completed'
                                ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>

                            <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4">
                      <CalendarDaysIcon className="h-10 w-10 text-gray-400 mx-auto" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">No upcoming appointments</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                      Schedule your next appointment to get started
                    </p>
                    <button
                      onClick={() => router.push('/dashboard/calendar/new')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Schedule Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
