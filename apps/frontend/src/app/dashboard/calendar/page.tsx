'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
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

// Helper mapping to unified pill tint classes
const statusTint = (s: Appointment['status']) => {
  switch (s) {
    case 'scheduled': return 'blue';
    case 'confirmed': return 'green';
    case 'completed': return 'neutral';
    case 'cancelled': return 'red';
    case 'rescheduled': return 'yellow';
    default: return 'neutral';
  }
};

const typeTint = (t: Appointment['appointmentType']) => {
  switch (t) {
    case 'consultation': return 'purple';
    case 'site_visit': return 'orange';
    case 'meeting': return 'blue';
    case 'inspection': return 'green';
    case 'other': return 'neutral';
    default: return 'neutral';
  }
};

const priorityTint = (p: Appointment['priority']) => {
  switch (p) {
    case 'low': return 'neutral';
    case 'medium': return 'blue';
    case 'high': return 'yellow';
    case 'urgent': return 'red';
    default: return 'neutral';
  }
};

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    // For now, using mock data since the backend appointment endpoint isn't implemented yet
    const mockAppointments: Appointment[] = [
      {
        _id: '1',
        title: 'Initial Consultation - Smith Kitchen',
        description: 'Discuss kitchen remodeling requirements and budget',
        appointmentType: 'consultation',
        status: 'scheduled',
        priority: 'high',
        startDateTime: '2025-08-15T10:00:00Z',
        endDateTime: '2025-08-15T11:00:00Z',
        location: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        },
        attendees: [],
        reminderSet: true,
        createdAt: '2025-08-12T06:00:00Z',
        updatedAt: '2025-08-12T06:00:00Z'
      },
      {
        _id: '2',
        title: 'Site Visit - Johnson Bathroom',
        description: 'Measure bathroom space and assess plumbing',
        appointmentType: 'site_visit',
        status: 'confirmed',
        priority: 'medium',
        startDateTime: '2025-08-16T14:00:00Z',
        endDateTime: '2025-08-16T15:30:00Z',
        location: {
          street: '456 Oak Ave',
          city: 'Oakland',
          state: 'CA',
          zipCode: '94601',
          country: 'USA'
        },
        attendees: [],
        reminderSet: true,
        createdAt: '2025-08-12T06:00:00Z',
        updatedAt: '2025-08-12T06:00:00Z'
      },
      {
        _id: '3',
        title: 'Final Inspection - Davis Deck',
        description: 'Final walkthrough and project completion',
        appointmentType: 'inspection',
        status: 'completed',
        priority: 'medium',
        startDateTime: '2025-08-10T09:00:00Z',
        endDateTime: '2025-08-10T10:00:00Z',
        attendees: [],
        reminderSet: false,
        createdAt: '2025-08-12T06:00:00Z',
        updatedAt: '2025-08-12T06:00:00Z'
      }
    ];

    setAppointments(mockAppointments);
    setLoading(false);
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesType = typeFilter === 'all' || appointment.appointmentType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

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
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar & Appointments</h1>
            <p className="text-gray-600">Manage your appointments and schedule</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex rounded-lg border border-gray-300">
              {(['list', 'month', 'week', 'day'] as const).map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-3 py-2 text-sm font-medium capitalize ${
                    view === viewType
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${viewType === 'list' ? 'rounded-l-lg' : ''} ${viewType === 'day' ? 'rounded-r-lg' : ''}`}
                >
                  {viewType}
                </button>
              ))}
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => 
                    new Date(a.startDateTime).toDateString() === new Date().toDateString()
                  ).length}
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
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => {
                    const appointmentDate = new Date(a.startDateTime);
                    const today = new Date();
                    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    return appointmentDate >= weekStart && appointmentDate <= weekEnd;
                  }).length}
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[var(--surface-2)] dark:border-token"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[var(--surface-2)] dark:border-token"
            >
              <option value="all">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="site_visit">Site Visit</option>
              <option value="meeting">Meeting</option>
              <option value="inspection">Inspection</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-4">Schedule your first appointment to get started.</p>
              <Link
                href="/dashboard/calendar/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Schedule Appointment
              </Link>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-1">{appointment.title}</h3>
                      <span className={`pill pill-tint-${statusTint(appointment.status)} sm capitalize`}>{appointment.status.replace('_',' ')}</span>
                      <span className={`pill pill-tint-${typeTint(appointment.appointmentType)} sm capitalize`}>{appointment.appointmentType.replace('_', ' ')}</span>
                      <span className={`pill pill-tint-${priorityTint(appointment.priority)} sm capitalize flex items-center gap-1`}>{appointment.priority}
                        {appointment.priority === 'urgent' && <ExclamationTriangleIcon className="h-3.5 w-3.5" />}
                      </span>
                    </div>
                    
                    {appointment.description && (
                      <p className="text-gray-600 mb-3">{appointment.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{formatDateTime(appointment.startDateTime)} - {formatTime(appointment.endDateTime)}</span>
                      </div>
                      
                      {appointment.location && (
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          <span>{appointment.location.street}, {appointment.location.city}</span>
                        </div>
                      )}

                      {appointment.attendees.length > 0 && (
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-2" />
                          <span>{appointment.attendees.length} attendees</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
