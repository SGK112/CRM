'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

interface CalendarViewProps {
  events: EventInput[];
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
  onEventClick: (info: any) => void;
  onDateClick: (info: any) => void;
  currentView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
}

export default function CalendarView({
  events,
  initialView = 'dayGridMonth',
  onEventClick,
  onDateClick,
  currentView
}: CalendarViewProps) {
  return (
    <div className="fullcalendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={currentView || initialView}
        key={currentView || initialView} // Force re-render when view changes
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '' // Remove view buttons since we handle them externally
        }}
        events={events}
        eventClick={onEventClick}
        dateClick={onDateClick}
        editable={true}
        selectable={true}
        dayMaxEvents={true}
        weekends={true}
        height="auto" // Adjust height to fit container
        // --- Custom Styling ---
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          list: 'List'
        }}
        themeSystem="standard"
        // --- Event Appearance ---
        eventColor="#2563eb" // Blue-600
        eventTextColor="#ffffff"
        eventBorderColor="#1d4ed8" // Blue-700
        // --- Slot/Time Formatting ---
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: false,
          meridiem: 'short'
        }}
        // --- Interaction Callbacks ---
        // select={handleDateSelect} // Example for creating new events
      />
      <style jsx global>{`
        .fc {
          font-family: inherit;
          background-color: var(--surface-1);
          color: var(--text);
        }
        
        /* Calendar background and structure */
        .fc .fc-view-harness {
          background-color: var(--surface-1);
        }
        
        .fc table {
          background-color: var(--surface-1);
        }
        
        .fc .fc-scrollgrid {
          border-color: var(--border);
        }
        
        .fc .fc-scrollgrid-section > * {
          border-color: var(--border);
        }
        
        /* Day cells */
        .fc .fc-daygrid-day {
          background-color: var(--surface-1);
          border-color: var(--border);
        }
        
        .fc .fc-daygrid-day:hover {
          background-color: var(--surface-2);
        }
        
        .fc .fc-daygrid-day.fc-day-today {
          background-color: var(--surface-2);
          border-color: var(--accent-alt);
        }
        
        .fc .fc-daygrid-day.fc-day-past {
          background-color: var(--surface-1);
          opacity: 0.7;
        }
        
        /* Header styling */
        .fc .fc-toolbar {
          background-color: var(--surface-1);
          color: var(--text);
        }
        
        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text);
        }
        
        /* Button styling */
        .fc .fc-button {
          background-color: var(--surface-2);
          color: var(--text);
          border: 1px solid var(--border);
          box-shadow: none;
          text-transform: capitalize;
        }
        
        .fc .fc-button:hover {
          background-color: var(--surface-3);
          border-color: var(--border-strong);
        }
        
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: var(--accent-alt);
          border-color: var(--accent-alt);
          color: white;
        }
        
        .fc .fc-button:disabled {
          opacity: 0.5;
          background-color: var(--surface-2);
          color: var(--text-faint);
        }
        
        /* Day headers */
        .fc .fc-col-header {
          background-color: var(--surface-2);
          border-color: var(--border);
        }
        
        .fc .fc-col-header-cell {
          background-color: var(--surface-2);
          color: var(--text-dim);
          border-color: var(--border);
        }
        
        .fc .fc-daygrid-day-number {
          color: var(--text);
          padding: 4px 8px;
        }
        
        /* Time grid styling */
        .fc .fc-timegrid-slot {
          border-color: var(--border);
        }
        
        .fc .fc-timegrid-slot-label {
          color: var(--text-dim);
          border-color: var(--border);
        }
        
        .fc .fc-timegrid-divider {
          border-color: var(--border);
        }
        
        /* Event styling */
        .fc-event {
          cursor: pointer;
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 0.75rem;
          border: none;
        }
        
        .fc .fc-event-title {
          color: white;
          font-weight: 500;
        }
        
        /* List view styling */
        .fc .fc-list {
          background-color: var(--surface-1);
          border-color: var(--border);
        }
        
        .fc .fc-list-day {
          background-color: var(--surface-2);
          border-color: var(--border);
        }
        
        .fc .fc-list-day-text {
          color: var(--text);
        }
        
        .fc .fc-list-event {
          background-color: var(--surface-1);
          border-color: var(--border);
        }
        
        .fc .fc-list-event:hover {
          background-color: var(--surface-2);
        }
        
        .fc .fc-list-event-title a {
          color: var(--text);
          text-decoration: none;
        }
        
        .fc .fc-list-event-time {
          color: var(--text-dim);
        }
        
        .fc .fc-list-event-dot {
          border-color: var(--accent-alt);
        }
        
        /* More event link */
        .fc .fc-more-link {
          color: var(--accent-alt);
          background-color: var(--surface-2);
          border: 1px solid var(--border);
        }
        
        .fc .fc-more-link:hover {
          background-color: var(--surface-3);
          color: var(--accent-alt-hover);
        }
        
        /* Popover styling */
        .fc .fc-popover {
          background-color: var(--surface-1);
          border: 1px solid var(--border);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .dark .fc .fc-popover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        
        .fc .fc-popover-header {
          background-color: var(--surface-2);
          border-bottom: 1px solid var(--border);
          color: var(--text);
        }
        
        .fc .fc-popover-body {
          background-color: var(--surface-1);
          color: var(--text);
        }
        
        /* Scroll bars */
        .fc .fc-scroller::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .fc .fc-scroller::-webkit-scrollbar-track {
          background: var(--surface-2);
        }
        
        .fc .fc-scroller::-webkit-scrollbar-thumb {
          background: var(--border-strong);
          border-radius: 4px;
        }
        
        .fc .fc-scroller::-webkit-scrollbar-thumb:hover {
          background: var(--text-faint);
        }
        
        /* Selection styling */
        .fc .fc-highlight {
          background-color: var(--accent-alt);
          opacity: 0.2;
        }
        
        /* Week number styling */
        .fc .fc-daygrid-week-number {
          color: var(--text-faint);
          background-color: var(--surface-2);
        }
        
        /* Now indicator */
        .fc .fc-timegrid-now-indicator-line {
          border-color: var(--accent);
        }
        
        .fc .fc-timegrid-now-indicator-arrow {
          border-color: var(--accent);
        }
      `}</style>
    </div>
  );
}
