'use client';
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

interface Appointment {
  _id: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  appointmentType: string;
}

interface CalendarViewProps {
  appointments: Appointment[];
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
  onEventClick: (info: any) => void;
  onDateClick: (info: any) => void;
}

const eventColorMap: Record<string, string> = {
  consultation: '#7c3aed', // purple
  site_visit: '#f97316',   // orange
  meeting: '#2563eb',      // blue
  inspection: '#16a34a',   // green
  other: '#64748b',        // slate
};

export function CalendarView({ appointments, initialView = 'dayGridMonth', onEventClick, onDateClick }: CalendarViewProps) {
  const calendarEvents = appointments.map(app => ({
    id: app._id,
    title: app.title,
    start: app.startDateTime,
    end: app.endDateTime,
    backgroundColor: eventColorMap[app.appointmentType] || eventColorMap.other,
    borderColor: eventColorMap[app.appointmentType] || eventColorMap.other,
  }));

  return (
    <div className="surface-solid p-4 rounded-lg">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        events={calendarEvents}
        eventClick={onEventClick}
        dateClick={onDateClick}
        editable={true}
        selectable={true}
        dayMaxEvents={true}
        weekends={true}
        height="auto"
        // Theming
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          list: 'List',
        }}
        themeSystem="standard"
        // Custom styling via CSS variables to match app theme
        eventClassNames="cursor-pointer"
        viewClassNames="fc-theme"
      />
      <style jsx global>{`
        .fc-theme .fc-button-primary {
          background-color: var(--accent-alt) !important;
          border-color: var(--accent-alt) !important;
          color: white !important;
        }
        .fc-theme .fc-button-primary:hover {
          background-color: var(--accent-alt-hover) !important;
          border-color: var(--accent-alt-hover) !important;
        }
        .fc-theme .fc-button-primary:active {
          background-color: var(--accent-alt-hover) !important;
          border-color: var(--accent-alt-hover) !important;
        }
        .fc-theme .fc-daygrid-day.fc-day-today {
          background-color: rgba(96, 165, 250, 0.1) !important;
        }
        .fc-theme .fc-list-event:hover td {
          background-color: var(--surface-2) !important;
        }
        .fc-theme .fc-event {
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
