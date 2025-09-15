"use client";

import CalendarView from '@/components/ui/CalendarView';
import { EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import {
    CalendarDaysIcon,
    CheckCircleIcon,
    ChevronRightIcon,
    ClockIcon,
    ClockIcon as ClockSolidIcon,
    ExclamationTriangleIcon,
    ListBulletIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    PlusIcon,
    Squares2X2Icon,
    UserIcon,
    ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { STATUS_META, TYPE_ICON, getEventColor, AppointmentStatus, AppointmentType } from '@/config/appointments';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CalendarSkeleton from '@/components/ui/CalendarSkeleton';
import AppointmentModal from '@/components/scheduling/AppointmentModal';

// Appointment type now sourced from hook
interface Appointment {
  _id: string;
  title: string;
  description?: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  startDateTime: string;
  endDateTime: string;
  location?: { street: string; city: string; state: string };
  client?: { name: string; phone?: string };
  isGoogleEvent?: boolean;
  googleEventId?: string;
}

export default function CalendarPage() {
  const { appointments, loading, stats, upcoming, refresh } = useCalendarEvents();
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'listWeek'>(
    'dayGridMonth'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Modal state for appointment scheduling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<{
    selectedDate?: string;
    presetTitle?: string;
    presetContactId?: string;
  }>({});

  // Helper functions for opening the appointment modal
  const openAppointmentModal = (props?: {
    selectedDate?: string;
    presetTitle?: string;
    presetContactId?: string;
  }) => {
    setModalProps(props || {});
    setIsModalOpen(true);
  };

  const handleAppointmentCreated = () => {
    refresh(); // Refresh calendar events
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    const meta = STATUS_META[status];
    return meta.solidIcon || meta.icon;
  };

  const getAppointmentTypeIcon = (type: AppointmentType) => {
    return TYPE_ICON[type] || TYPE_ICON.other;
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch =
      apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const calendarEvents = filteredAppointments.map(appointment => ({
    id: appointment._id,
    title: appointment.isGoogleEvent ? `📅 ${appointment.title}` : appointment.title,
    start: appointment.startDateTime,
    end: appointment.endDateTime,
    backgroundColor: getEventColor(appointment.status, appointment.isGoogleEvent),
    borderColor: getEventColor(appointment.status, appointment.isGoogleEvent),
    textColor: '#ffffff',
    extendedProps: {
      appointment: appointment,
    },
  }));

  const upcomingAppointments = upcoming.filter(apt =>
    filteredAppointments.some(f => f._id === apt._id)
  );

  if (loading) return <CalendarSkeleton />;

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-black border-b border-slate-800">
        <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 rounded-lg">
                <CalendarDaysIcon className="h-6 w-6 text-brand-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Calendar</h1>
                <p className="text-sm text-slate-400">Manage appointments</p>
              </div>
            </div>
            <button
              onClick={() => openAppointmentModal()}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-600/90 rounded-lg transition-colors text-white font-medium text-sm shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label="Create new appointment"
            >
              <PlusIcon className="h-4 w-4" />
              New Appointment
            </button>
          </div>
            <div className="flex justify-end mb-2">
              <button onClick={() => refresh()} className="text-xs text-slate-400 hover:text-white transition-colors">Refresh</button>
            </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-slate-900 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{stats.today}</div>
              <div className="text-xs text-slate-400">Today</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{stats.thisWeek}</div>
              <div className="text-xs text-slate-400">Week</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-400">{stats.confirmed}</div>
              <div className="text-xs text-slate-400">Confirmed</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-slate-400">{stats.pending}</div>
              <div className="text-xs text-slate-400">Pending</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Mobile Controls */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-900 rounded-lg p-1">
            {[
              { key: 'dayGridMonth', label: 'Month', icon: Squares2X2Icon },
              { key: 'timeGridWeek', label: 'Week', icon: ViewColumnsIcon },
              { key: 'listWeek', label: 'List', icon: ListBulletIcon },
            ].map(viewOption => {
              const IconComponent = viewOption.icon;
              return (
                <button
                  key={viewOption.key}
                  onClick={() =>
                    setView(
                      viewOption.key as 'dayGridMonth' | 'timeGridWeek' | 'listWeek'
                    )
                  }
                  aria-pressed={view === viewOption.key}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded transition-all ${
                    view === viewOption.key
                      ? 'bg-brand-500 text-white shadow-inner'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {viewOption.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden mb-4">
          <CalendarView
            events={calendarEvents}
            initialView={view}
            currentView={view}
            onEventClick={(info: EventClickArg) => {
              const appointment = info.event.extendedProps.appointment;
              router.push(`/dashboard/calendar/${appointment._id}`);
            }}
            onDateClick={(info: DateClickArg) => {
              openAppointmentModal({ selectedDate: info.dateStr });
            }}
          />
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Upcoming Appointments</h2>
            <p className="text-sm text-slate-400">Next 5 scheduled</p>
          </div>

          <div className="p-4">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map(appointment => {
                  const StatusIcon = getStatusIcon(appointment.status);
                  const TypeIcon = getAppointmentTypeIcon(appointment.appointmentType);
                  const appointmentDate = new Date(appointment.startDateTime);

                  return (
                    <div
                      key={appointment._id}
                      onClick={() => router.push(`/dashboard/calendar/${appointment._id}`)}
                      className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div
                            className={`p-2 rounded-lg ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-500/20'
                                : appointment.status === 'scheduled'
                                  ? 'bg-brand-500/20'
                                  : appointment.status === 'completed'
                                    ? 'bg-slate-500/20'
                                    : 'bg-red-500/20'
                            }`}
                          >
                            <StatusIcon
                              className={`h-4 w-4 ${
                                appointment.status === 'confirmed'
                                  ? 'text-green-400'
                                  : appointment.status === 'scheduled'
                                    ? 'text-brand-400'
                                    : appointment.status === 'completed'
                                      ? 'text-slate-400'
                                      : 'text-red-400'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm">
                            {appointment.title}
                          </h3>

                          <div className="flex items-center gap-2 mt-1">
                            <TypeIcon className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-400 capitalize">
                              {appointment.appointmentType.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                            <ClockIcon className="h-3 w-3" />
                            <span>
                              {appointmentDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              at{' '}
                              {appointmentDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {appointment.client && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                              <UserIcon className="h-3 w-3" />
                              <span className="truncate">{appointment.client.name}</span>
                            </div>
                          )}

                          {appointment.location && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                              <MapPinIcon className="h-3 w-3" />
                              <span className="truncate">
                                {appointment.location.city}, {appointment.location.state}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_META[appointment.status].badge}`}
                        >
                          {STATUS_META[appointment.status].label}
                        </span>

                        <ChevronRightIcon className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-3 bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4">
                  <CalendarDaysIcon className="h-10 w-10 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-sm font-medium text-white mb-2">
                  No upcoming appointments
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Schedule your next appointment to get started
                </p>
                <button
                  onClick={() => openAppointmentModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-600/90 text-white rounded-lg text-sm font-medium transition-colors shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  aria-label="Schedule a new appointment"
                >
                  <PlusIcon className="h-4 w-4" />
                  Schedule Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAppointmentCreated={handleAppointmentCreated}
        selectedDate={modalProps.selectedDate}
        presetTitle={modalProps.presetTitle}
        presetContactId={modalProps.presetContactId}
      />
    </div>
  );
}
