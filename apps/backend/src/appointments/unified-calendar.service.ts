import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { AppointmentsService } from '../appointments/appointments.service';
import { AppointmentType, CalendarEventDto } from '../appointments/dto/appointment.dto';
import { GoogleCalendarService } from '../integrations/google-calendar.service';

@Injectable()
export class UnifiedCalendarService {
  private readonly logger = new Logger('UnifiedCalendarService');

  constructor(
    @Inject(forwardRef(() => AppointmentsService))
    private appointmentsService: AppointmentsService,
    private googleCalendarService: GoogleCalendarService
  ) {}

  async getUnifiedCalendarEvents(
    userId: string,
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEventDto[]> {
    // Get CRM appointments
    const crmEvents = await this.appointmentsService.getCalendarEvents(
      workspaceId,
      startDate,
      endDate
    );

    // Get Google Calendar events unless API is suspended
    let googleEvents: CalendarEventDto[] = [];
    const suspended = process.env.GOOGLE_API_SUSPENDED === 'true';
    if (!suspended) {
      try {
        const googleCalendarData = await this.googleCalendarService.listEvents(userId);

        if (googleCalendarData.connected && googleCalendarData.events) {
          googleEvents = googleCalendarData.events
            .filter(event => event.start && event.end)
            .map(event => ({
              id: `google-${event.id}`,
              title: event.summary || 'Untitled Event',
              start: event.start.dateTime || event.start.date,
              end: event.end.dateTime || event.end.date,
              description: event.description || '',
              backgroundColor: '#ea4335',
              borderColor: '#ea4335',
              textColor: '#ffffff',
              extendedProps: {
                type: AppointmentType.GOOGLE_CALENDAR,
                source: 'google',
                googleEventId: event.id,
                status: 'confirmed',
                location: event.location,
                attendees: event.attendees,
                isAllDay: !event.start.dateTime,
              },
            }));
        }
      } catch (error) {
        this.logger.warn('Failed to fetch Google Calendar events:', error.message);
      }
    } else {
      this.logger.debug('GOOGLE_API_SUSPENDED flag active - skipping Google events fetch');
    }

    // Combine and sort all events by start time
    const allEvents = [...crmEvents, ...googleEvents];
    return allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }

  async createGoogleCalendarEvent(
    userId: string,
    event: { summary: string; description?: string; start: string; end: string; location?: string }
  ) {
    if (process.env.GOOGLE_API_SUSPENDED === 'true') {
      this.logger.warn('Google API suspended - storing event request as pending');
      return { pending: true, event }; // caller may decide to persist in metadata
    }
    return await this.googleCalendarService.createEvent(userId, event);
  }

  async getGoogleCalendarStatus(userId: string) {
    if (process.env.GOOGLE_API_SUSPENDED === 'true') {
      return { connected: false, suspended: true };
    }
    return await this.googleCalendarService.getStatus(userId);
  }
}
