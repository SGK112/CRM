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
        eventColor="#d97706" // Amber-600
        eventTextColor="#ffffff"
        eventBorderColor="#b45309" // Amber-700
        // --- Enhanced Display Options ---
        dayMaxEventRows={3}
        moreLinkClick="popover"
        eventMaxStack={3}
        // --- Slot/Time Formatting ---
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
        scrollTime="08:00:00"
        nowIndicator={true}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: false,
          meridiem: 'short'
        }}
        // --- Business Hours ---
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
          startTime: '08:00',
          endTime: '18:00',
        }}
        // --- Navigation ---
        navLinks={true}
        navLinkDayClick="timeGridDay"
        // --- Event Interaction ---
        eventMouseEnter={(info) => {
          info.el.style.transform = 'scale(1.02)';
          info.el.style.zIndex = '10';
          info.el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        eventMouseLeave={(info) => {
          info.el.style.transform = 'scale(1)';
          info.el.style.zIndex = '1';
          info.el.style.boxShadow = 'none';
        }}
        // --- Interaction Callbacks ---
        // select={handleDateSelect} // Example for creating new events
      />
      <style jsx global>{`
        /* Enhanced FullCalendar styling for professional scheduling */
        .fc {
          font-family: inherit;
          background-color: #ffffff;
          color: #1f2937;
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .dark .fc {
          background-color: #1f2937;
          color: #f9fafb;
        }
        
        /* Calendar background and structure */
        .fc .fc-view-harness {
          background-color: #ffffff;
          border-radius: 0.75rem;
        }
        
        .dark .fc .fc-view-harness {
          background-color: #1f2937;
        }
        
        .fc table {
          background-color: #ffffff;
        }
        
        .dark .fc table {
          background-color: #1f2937;
        }
        
        .fc .fc-scrollgrid {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .dark .fc .fc-scrollgrid {
          border-color: #374151;
        }
        
        .fc .fc-scrollgrid-section > * {
          border-color: #e5e7eb;
        }
        
        .dark .fc .fc-scrollgrid-section > * {
          border-color: #374151;
        }
        
        /* Enhanced day cells with solid backgrounds */
        .fc .fc-daygrid-day {
          background-color: #ffffff;
          border: 1px solid #f3f4f6;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .dark .fc .fc-daygrid-day {
          background-color: #1f2937;
          border-color: #374151;
        }
        
        .fc .fc-daygrid-day:hover {
          background-color: #f8fafc;
          border-color: #d97706;
        }
        
        .dark .fc .fc-daygrid-day:hover {
          background-color: #374151;
          border-color: #f59e0b;
        }
        
        .fc .fc-daygrid-day.fc-day-today {
          background-color: #fef3c7;
          border-color: #d97706;
          box-shadow: inset 0 0 0 1px #d97706;
        }
        
        .dark .fc .fc-daygrid-day.fc-day-today {
          background-color: #451a03;
          border-color: #f59e0b;
          box-shadow: inset 0 0 0 1px #f59e0b;
        }
        
        .fc .fc-daygrid-day.fc-day-past {
          background-color: #f9fafb;
          opacity: 0.8;
        }
        
        .dark .fc .fc-daygrid-day.fc-day-past {
          background-color: #111827;
          opacity: 0.8;
        }
        
        .fc .fc-daygrid-day.fc-day-other {
          background-color: #f9fafb;
          opacity: 0.6;
        }
        
        .dark .fc .fc-daygrid-day.fc-day-other {
          background-color: #111827;
          opacity: 0.6;
        }
        
        /* Enhanced header styling */
        .fc .fc-toolbar {
          background-color: #ffffff;
          color: #1f2937;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 0;
        }
        
        .dark .fc .fc-toolbar {
          background-color: #1f2937;
          color: #f9fafb;
          border-bottom-color: #374151;
        }
        
        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          text-shadow: none;
        }
        
        .dark .fc .fc-toolbar-title {
          color: #f9fafb;
        }
        
        /* Enhanced button styling with solid backgrounds */
        .fc .fc-button {
          background-color: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          text-transform: capitalize;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }
        
        .dark .fc .fc-button {
          background-color: #374151;
          color: #d1d5db;
          border-color: #4b5563;
        }
        
        .fc .fc-button:hover {
          background-color: #e5e7eb;
          border-color: #9ca3af;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .dark .fc .fc-button:hover {
          background-color: #4b5563;
          border-color: #6b7280;
        }
        
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #d97706;
          border-color: #b45309;
          color: white;
          box-shadow: 0 2px 4px 0 rgba(217, 119, 6, 0.2);
        }
        
        .dark .fc .fc-button-primary:not(:disabled).fc-button-active,
        .dark .fc .fc-button-primary:not(:disabled):active {
          background-color: #f59e0b;
          border-color: #d97706;
        }
        
        .fc .fc-button:disabled {
          opacity: 0.5;
          background-color: #f9fafb;
          color: #9ca3af;
          border-color: #e5e7eb;
          cursor: not-allowed;
        }
        
        .dark .fc .fc-button:disabled {
          background-color: #111827;
          color: #6b7280;
          border-color: #374151;
        }
        
        /* Enhanced day headers with solid backgrounds */
        .fc .fc-col-header {
          background-color: #f8fafc;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .dark .fc .fc-col-header {
          background-color: #374151;
          border-bottom-color: #4b5563;
        }
        
        .fc .fc-col-header-cell {
          background-color: #f8fafc;
          color: #6b7280;
          border-right: 1px solid #e5e7eb;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          padding: 0.75rem 0.5rem;
        }
        
        .dark .fc .fc-col-header-cell {
          background-color: #374151;
          color: #9ca3af;
          border-right-color: #4b5563;
        }
        
        .fc .fc-daygrid-day-number {
          color: #1f2937;
          padding: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .dark .fc .fc-daygrid-day-number {
          color: #f9fafb;
        }
        
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          color: #d97706;
          font-weight: 700;
          background-color: rgba(217, 119, 6, 0.1);
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          margin: 0.25rem;
        }
        
        .dark .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          color: #f59e0b;
          background-color: rgba(245, 158, 11, 0.2);
        }
        
        /* Enhanced time grid styling */
        .fc .fc-timegrid-slot {
          border-color: #f3f4f6;
          background-color: #ffffff;
        }
        
        .dark .fc .fc-timegrid-slot {
          border-color: #374151;
          background-color: #1f2937;
        }
        
        .fc .fc-timegrid-slot-label {
          color: #6b7280;
          border-color: #f3f4f6;
          background-color: #f8fafc;
          font-weight: 500;
          font-size: 0.75rem;
          padding: 0.5rem;
        }
        
        .dark .fc .fc-timegrid-slot-label {
          color: #9ca3af;
          border-color: #374151;
          background-color: #374151;
        }
        
        .fc .fc-timegrid-divider {
          border-color: #e5e7eb;
          background-color: #f8fafc;
        }
        
        .dark .fc .fc-timegrid-divider {
          border-color: #374151;
          background-color: #374151;
        }
        
        /* Enhanced event styling with solid backgrounds */
        .fc-event {
          cursor: pointer;
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          border: none;
          font-weight: 600;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          background-color: #d97706 !important;
          border-color: #b45309 !important;
          color: #ffffff !important;
        }
        
        .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
        }
        
        .fc .fc-event-title {
          color: white;
          font-weight: 600;
          text-shadow: none;
        }
        
        .fc .fc-event-time {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }
        
        /* Enhanced list view styling */
        .fc .fc-list {
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .dark .fc .fc-list {
          background-color: #1f2937;
          border-color: #374151;
        }
        
        .fc .fc-list-day {
          background-color: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
          padding: 0.75rem 1rem;
        }
        
        .dark .fc .fc-list-day {
          background-color: #374151;
          border-bottom-color: #4b5563;
        }
        
        .fc .fc-list-day-text {
          color: #1f2937;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .dark .fc .fc-list-day-text {
          color: #f9fafb;
        }
        
        .fc .fc-list-event {
          background-color: #ffffff;
          border-bottom: 1px solid #f3f4f6;
          padding: 0.75rem 1rem;
          transition: background-color 0.2s ease;
        }
        
        .dark .fc .fc-list-event {
          background-color: #1f2937;
          border-bottom-color: #374151;
        }
        
        .fc .fc-list-event:hover {
          background-color: #f8fafc;
        }
        
        .dark .fc .fc-list-event:hover {
          background-color: #374151;
        }
        
        .fc .fc-list-event-title a {
          color: #1f2937;
          text-decoration: none;
          font-weight: 600;
        }
        
        .dark .fc .fc-list-event-title a {
          color: #f9fafb;
        }
        
        .fc .fc-list-event-time {
          color: #6b7280;
          font-weight: 500;
        }
        
        .dark .fc .fc-list-event-time {
          color: #9ca3af;
        }
        
        .fc .fc-list-event-dot {
          border-color: #d97706;
          background-color: #d97706;
        }
        
        .dark .fc .fc-list-event-dot {
          border-color: #f59e0b;
          background-color: #f59e0b;
        }
        
        /* Enhanced more event link */
        .fc .fc-more-link {
          color: #d97706;
          background-color: #fef3c7;
          border: 1px solid #fed7aa;
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          font-weight: 600;
          font-size: 0.75rem;
          transition: all 0.2s ease;
        }
        
        .dark .fc .fc-more-link {
          color: #f59e0b;
          background-color: #451a03;
          border-color: #92400e;
        }
        
        .fc .fc-more-link:hover {
          background-color: #fed7aa;
          color: #b45309;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        }
        
        .dark .fc .fc-more-link:hover {
          background-color: #92400e;
          color: #fbbf24;
        }
        
        /* Enhanced popover styling */
        .fc .fc-popover {
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .dark .fc .fc-popover {
          background-color: #1f2937;
          border-color: #374151;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
        }
        
        .fc .fc-popover-header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
          padding: 0.75rem 1rem;
          font-weight: 600;
        }
        
        .dark .fc .fc-popover-header {
          background-color: #374151;
          border-bottom-color: #4b5563;
          color: #f9fafb;
        }
        
        .fc .fc-popover-body {
          background-color: #ffffff;
          color: #1f2937;
          padding: 0.5rem;
        }
        
        .dark .fc .fc-popover-body {
          background-color: #1f2937;
          color: #f9fafb;
        }
        
        /* Business hours styling */
        .fc .fc-non-business {
          background-color: #f9fafb;
        }
        
        .dark .fc .fc-non-business {
          background-color: #111827;
        }
        
        /* Now indicator styling */
        .fc .fc-timegrid-now-indicator-line {
          border-color: #ef4444;
          border-width: 2px;
        }
        
        .fc .fc-timegrid-now-indicator-arrow {
          border-top-color: #ef4444;
          border-bottom-color: #ef4444;
        }
        
        /* Enhanced scrollbar */
        .fc .fc-scroller::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .fc .fc-scroller::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        
        .dark .fc .fc-scroller::-webkit-scrollbar-track {
          background: #374151;
        }
        
        .fc .fc-scroller::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
          border: 2px solid #f3f4f6;
        }
        
        .dark .fc .fc-scroller::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-color: #374151;
        }
        
        .fc .fc-scroller::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        .dark .fc .fc-scroller::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Selection styling */
        .fc .fc-highlight {
          background-color: rgba(217, 119, 6, 0.2);
          border-color: #d97706;
        }
        
        .dark .fc .fc-highlight {
          background-color: rgba(245, 158, 11, 0.2);
          border-color: #f59e0b;
        }
        
        /* Week number styling */
        .fc .fc-daygrid-week-number {
          color: #9ca3af;
          background-color: #f8fafc;
          font-weight: 600;
          font-size: 0.75rem;
        }
        
        .dark .fc .fc-daygrid-week-number {
          color: #6b7280;
          background-color: #374151;
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.75rem;
          }
          
          .fc .fc-toolbar-title {
            font-size: 1.25rem;
          }
          
          .fc .fc-button {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
          }
          
          .fc .fc-daygrid-day-number {
            font-size: 0.75rem;
            padding: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}
