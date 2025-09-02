interface CalendarEvent {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
}

/**
 * Generates a Google Calendar URL.
 * @param event The event details.
 * @returns A URL to create a new Google Calendar event.
 */
export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');

  const url = new URL('https://www.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', event.title);
  url.searchParams.set('dates', `${formatDate(event.start)}/${formatDate(event.end)}`);
  if (event.description) {
    url.searchParams.set('details', event.description);
  }
  if (event.location) {
    url.searchParams.set('location', event.location);
  }

  return url.toString();
}

/**
 * Generates an .ics file content string.
 * This format is compatible with Outlook, Apple Calendar, and others.
 * @param event The event details.
 * @returns A string representing the .ics file content.
 */
export function generateIcsContent(event: CalendarEvent): string {
  const formatDate = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  const icsBody = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Remodely//CRM//EN',
    'BEGIN:VEVENT',
    `UID:${new Date().getTime()}@remodely.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.start)}`,
    `DTEND:${formatDate(event.end)}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  return icsBody;
}

/**
 * Triggers a download of an .ics file.
 * @param icsContent The content of the .ics file.
 * @param filename The desired filename (e.g., "appointment.ics").
 */
export function downloadIcsFile(icsContent: string, filename: string) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
