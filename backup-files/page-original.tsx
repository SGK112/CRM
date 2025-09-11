'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  EyeIcon,
  CalendarIcon,
  ArrowPathIcon,
  BellIcon,
  ShareIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
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
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>(
    'dayGridMonth'
  );
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const router = useRouter();

  const getEventColor = (status: Appointment['status'], priority: Appointment['priority']) => {
    // Priority-based color intensity
    const baseColors = {
      confirmed: {
        base: '#10b981',
        urgent: '#059669',
        high: '#10b981',
        medium: '#34d399',
        low: '#6ee7b7',
      },
      scheduled: {
        base: '#3b82f6',
        urgent: '#2563eb',
        high: '#3b82f6',
        medium: '#60a5fa',
        low: '#93c5fd',
      },
      completed: {
        base: '#6b7280',
        urgent: '#4b5563',
        high: '#6b7280',
        medium: '#9ca3af',
        low: '#d1d5db',
      },
      cancelled: {
        base: '#ef4444',
        urgent: '#dc2626',
        high: '#ef4444',
        medium: '#f87171',
        low: '#fca5a5',
      },
      rescheduled: {
        base: '#f59e0b',
        urgent: '#d97706',
        high: '#f59e0b',
        medium: '#fbbf24',
        low: '#fcd34d',
      },
    };

    const colors = baseColors[status] || baseColors.scheduled;
    return colors[priority] || colors.base;
  };

  // Filter appointments based on current filters
  const filterAppointments = () => {
    let filtered = appointments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        apt =>
          apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (apt.location &&
            Object.values(apt.location).some(val =>
              val.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(apt => apt.appointmentType === typeFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(apt => apt.priority === priorityFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));

      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.startDateTime);

        switch (dateRange) {
          case 'today':
            return aptDate.toDateString() === today.toDateString();
          case 'week': {
            const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return aptDate >= today && aptDate <= weekEnd;
          }
          case 'month': {
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return aptDate >= today && aptDate <= monthEnd;
          }
          default:
            return true;
        }
      });
    }

    setFilteredAppointments(filtered);
  };

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, typeFilter, priorityFilter, dateRange]);

  // Convert appointments to FullCalendar events
  const calendarEvents = filteredAppointments.map(appointment => ({
    id: appointment._id,
    title: appointment.title,
    start: appointment.startDateTime,
    end: appointment.endDateTime,
    backgroundColor: getEventColor(appointment.status, appointment.priority),
    borderColor: getEventColor(appointment.status, appointment.priority),
    textColor: '#ffffff',
    extendedProps: {
      appointment: appointment,
    },
  }));

  const handleEventClick = (info: any) => {
    const appointment = info.event.extendedProps.appointment;
    setSelectedEvent(appointment);
  };

  const handleDateClick = (info: any) => {
    // Show create modal with the clicked date
    const date = info.dateStr;
    setSelectedDate(date);
    setShowCreateModal(true);
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
    // Enhanced mock data for comprehensive scheduling demo
    const mockAppointments: Appointment[] = [
      {
        _id: '1',
        title: 'Initial Consultation - Smith Kitchen',
        description: 'Discuss kitchen remodeling requirements and budget',
        appointmentType: 'consultation',
        status: 'scheduled',
        priority: 'high',
        startDateTime: '2025-08-27T10:00:00Z',
        endDateTime: '2025-08-27T11:00:00Z',
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
        startDateTime: '2025-08-28T14:00:00Z',
        endDateTime: '2025-08-28T15:30:00Z',
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
        startDateTime: '2025-08-26T09:00:00Z',
        endDateTime: '2025-08-26T10:00:00Z',
        attendees: [],
        reminderSet: false,
        createdAt: '2025-08-12T06:00:00Z',
        updatedAt: '2025-08-12T06:00:00Z',
      },
      {
        _id: '4',
        title: 'Emergency Repair - Martinez Plumbing',
        description: 'Urgent pipe leak repair in kitchen',
        appointmentType: 'other',
        status: 'confirmed',
        priority: 'urgent',
        startDateTime: '2025-08-27T08:00:00Z',
        endDateTime: '2025-08-27T10:00:00Z',
        location: {
          street: '789 Pine St',
          city: 'Berkeley',
          state: 'CA',
          zipCode: '94702',
          country: 'USA',
        },
        attendees: [],
        reminderSet: true,
        createdAt: '2025-08-26T06:00:00Z',
        updatedAt: '2025-08-26T06:00:00Z',
      },
      {
        _id: '5',
        title: 'Follow-up Meeting - Wilson Project',
        description: 'Review progress and address any concerns',
        appointmentType: 'meeting',
        status: 'scheduled',
        priority: 'low',
        startDateTime: '2025-08-29T16:00:00Z',
        endDateTime: '2025-08-29T17:00:00Z',
        attendees: [],
        reminderSet: true,
        createdAt: '2025-08-20T06:00:00Z',
        updatedAt: '2025-08-20T06:00:00Z',
      },
      {
        _id: '6',
        title: 'Material Delivery - Thompson Renovation',
        description: 'Coordinate delivery of kitchen cabinets and countertops',
        appointmentType: 'other',
        status: 'rescheduled',
        priority: 'medium',
        startDateTime: '2025-08-30T11:00:00Z',
        endDateTime: '2025-08-30T12:00:00Z',
        location: {
          street: '321 Elm Street',
          city: 'San Jose',
          state: 'CA',
          zipCode: '95112',
          country: 'USA',
        },
        attendees: [],
        reminderSet: true,
        createdAt: '2025-08-18T06:00:00Z',
        updatedAt: '2025-08-25T06:00:00Z',
      },
    ];

    setAppointments(mockAppointments);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="space-y-6 p-6">
        {/* Enhanced Header with Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400 mb-2">
                Schedule & Calendar Management
              </h1>
              <p className="text-gray-800 dark:text-gray-200">
                Professional appointment scheduling and calendar management system
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-64 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                  showFilters
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
                {(statusFilter !== 'all' ||
                  typeFilter !== 'all' ||
                  priorityFilter !== 'all' ||
                  dateRange !== 'all') && (
                  <span className="ml-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {
                      [statusFilter, typeFilter, priorityFilter, dateRange].filter(f => f !== 'all')
                        .length
                    }
                  </span>
                )}
              </button>

              {/* View Switcher */}
              <div className="flex bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 p-1">
                {[
                  { key: 'dayGridMonth', label: 'Month', icon: CalendarIcon },
                  { key: 'timeGridWeek', label: 'Week', icon: ClockIcon },
                  { key: 'timeGridDay', label: 'Day', icon: EyeIcon },
                ].map(viewOption => (
                  <button
                    key={viewOption.key}
                    onClick={() => setView(viewOption.key as any)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      view === viewOption.key
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <viewOption.icon className="h-4 w-4 mr-1.5" />
                    {viewOption.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Appointment
              </button>
            </div>
          </div>

          {/* Enhanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-black dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-black dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="consultation">Consultation</option>
                    <option value="site_visit">Site Visit</option>
                    <option value="meeting">Meeting</option>
                    <option value="inspection">Inspection</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Priority
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-black dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-black dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                      setPriorityFilter('all');
                      setDateRange('all');
                    }}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Today's Appointments
                </p>
                <p className="text-3xl font-bold text-black dark:text-white mt-1">
                  {
                    filteredAppointments.filter(
                      a => new Date(a.startDateTime).toDateString() === new Date().toDateString()
                    ).length
                  }
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                  {
                    filteredAppointments.filter(
                      a =>
                        new Date(a.startDateTime).toDateString() === new Date().toDateString() &&
                        a.status === 'confirmed'
                    ).length
                  }{' '}
                  confirmed
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CalendarDaysIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">This Week</p>
                <p className="text-3xl font-bold text-black dark:text-white mt-1">
                  {
                    filteredAppointments.filter(a => {
                      const appointmentDate = new Date(a.startDateTime);
                      const today = new Date();
                      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return appointmentDate >= weekStart && appointmentDate <= weekEnd;
                    }).length
                  }
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  +{Math.floor(Math.random() * 5 + 1)} from last week
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Pending</p>
                <p className="text-3xl font-bold text-black dark:text-white mt-1">
                  {filteredAppointments.filter(a => a.status === 'scheduled').length}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Needs confirmation
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <ClockIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Total Filtered
                </p>
                <p className="text-3xl font-bold text-black dark:text-white mt-1">
                  {filteredAppointments.length}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                  of {appointments.length} total
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <UserIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Calendar View */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black dark:text-white">Calendar View</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <ShareIcon className="h-4 w-4 mr-1.5" />
                  Export
                </button>
                <button
                  onClick={() => {
                    setAppointments([...appointments]);
                    setLoading(true);
                    setTimeout(() => setLoading(false), 1000);
                  }}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <CalendarView
              events={calendarEvents}
              initialView={view}
              currentView={view}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          </div>
        </div>

        {/* Enhanced Event Details Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedEvent.priority === 'urgent'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : selectedEvent.priority === 'high'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                              : selectedEvent.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}
                      >
                        {selectedEvent.priority.toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedEvent.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : selectedEvent.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : selectedEvent.status === 'completed'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                : selectedEvent.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}
                      >
                        {selectedEvent.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      {selectedEvent.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-6 space-y-6">
                {selectedEvent.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-black dark:text-white mb-2">
                      Description
                    </h4>
                    <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                {/* Time and Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <ClockIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(selectedEvent.startDateTime).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">
                          {new Date(selectedEvent.startDateTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -
                          {new Date(selectedEvent.endDateTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <UserIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Appointment Type
                        </div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 capitalize">
                          {selectedEvent.appointmentType.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedEvent.location && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Location
                          </div>
                          <div className="text-sm text-gray-800 dark:text-gray-200">
                            {selectedEvent.location.street}
                            <br />
                            {selectedEvent.location.city}, {selectedEvent.location.state}{' '}
                            {selectedEvent.location.zipCode}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <BellIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Reminders
                        </div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">
                          {selectedEvent.reminderSet ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        handleAddToGoogle(selectedEvent);
                      }}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                    >
                      <CalendarIcon className="h-4 w-4 mr-1.5" />
                      Add to Google
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadIcs(selectedEvent);
                      }}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                    >
                      <ShareIcon className="h-4 w-4 mr-1.5" />
                      Export ICS
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/calendar/edit/${selectedEvent._id}`)}
                      className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      Edit Appointment
                    </button>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Appointment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-black dark:text-white">
                    Create New Appointment
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedDate(null);
                    }}
                    className="text-gray-700 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="Appointment title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        defaultValue={selectedDate || ''}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </label>
                      <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200">
                        <option value="consultation">Consultation</option>
                        <option value="measurement">Measurement</option>
                        <option value="installation">Installation</option>
                        <option value="followup">Follow-up</option>
                        <option value="meeting">Meeting</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Time *
                      </label>
                      <input
                        type="time"
                        required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Client
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="Client name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200">
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="Address or meeting link"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="Appointment details and notes"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setSelectedDate(null);
                      }}
                      className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200 font-medium"
                    >
                      Create Appointment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
