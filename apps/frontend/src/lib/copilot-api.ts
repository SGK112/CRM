import { API_BASE } from './api';

interface CopilotAPIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
  location?: string;
  type: 'meeting' | 'appointment' | 'call' | 'site_visit';
}

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

interface EmailDraft {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  template?: string;
}

interface AppointmentBooking {
  clientId: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  duration: number; // minutes
  type: 'consultation' | 'site_visit' | 'presentation' | 'follow_up';
  location?: string;
}

class CopilotAPI {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Calendar Operations
  async getCalendarEvents(
    startDate?: string,
    endDate?: string
  ): Promise<CopilotAPIResponse<CalendarEvent[]>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);

      const response = await fetch(`${API_BASE}/appointments?${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = (await response.json()) as unknown;
      if (!Array.isArray(raw)) {
        return { success: false, error: 'Unexpected calendar data' };
      }

      return { success: true, data: raw.map(this.mapToCalendarEvent) };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  async getAvailableSlots(
    date: string,
    duration: number = 60
  ): Promise<CopilotAPIResponse<string[]>> {
    try {
      // Get existing appointments for the day
      const eventsResponse = await this.getCalendarEvents(date, date);
      if (!eventsResponse.success) {
        // Cast to maintain return type CopilotAPIResponse<string[]>
        return { success: false, error: eventsResponse.error } as CopilotAPIResponse<string[]>;
      }

      const existingEvents = eventsResponse.data || [];
      const businessHours = { start: 9, end: 17 }; // 9 AM to 5 PM
      const availableSlots: string[] = [];

      // Generate possible time slots
      for (let hour = businessHours.start; hour < businessHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotStart = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const slotDateTime = new Date(`${date}T${slotStart}`);
          const slotEndTime = new Date(slotDateTime.getTime() + duration * 60000);

          // Check if slot conflicts with existing appointments
          const hasConflict = existingEvents.some(event => {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
            return slotDateTime < eventEnd && slotEndTime > eventStart;
          });

          if (!hasConflict) {
            availableSlots.push(slotStart);
          }
        }
      }

      return { success: true, data: availableSlots };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  async bookAppointment(booking: AppointmentBooking): Promise<CopilotAPIResponse<CalendarEvent>> {
    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          title: booking.title,
          description: booking.description,
          clientId: booking.clientId,
          date: booking.date,
          startTime: booking.startTime,
          duration: booking.duration,
          type: booking.type,
          location: booking.location,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = (await response.json()) as unknown;

      return { success: true, data: this.mapToCalendarEvent(raw) };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  // Client Operations
  async getClients(search?: string): Promise<CopilotAPIResponse<Client[]>> {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`${API_BASE}/clients${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = (await response.json()) as unknown;

      return { success: true, data: raw as Client[] };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  async getClientById(clientId: string): Promise<CopilotAPIResponse<Client>> {
    try {
      const response = await fetch(`${API_BASE}/clients/${clientId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = (await response.json()) as unknown;

      return { success: true, data: raw as Client };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  // Project Operations
  async getProjects(status?: string): Promise<CopilotAPIResponse<Project[]>> {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await fetch(`${API_BASE}/projects${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = (await response.json()) as unknown;

      return { success: true, data: raw as Project[] };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  async createProject(project: Partial<Project>): Promise<CopilotAPIResponse<Project>> {
    try {
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(project),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = (await response.json()) as unknown;

      return { success: true, data: raw as Project };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  // Email Operations
  async draftEmail(
    draft: EmailDraft
  ): Promise<CopilotAPIResponse<{ id: string; preview: string }>> {
    try {
      // For now, return a preview - in production this would integrate with email service
      const preview = `To: ${draft.to.join(', ')}\nSubject: ${draft.subject}\n\n${draft.body}`;
      return {
        success: true,
        data: {
          id: `draft_${Date.now()}`,
          preview,
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  async sendEmail(): Promise<CopilotAPIResponse<{ sent: boolean }>> {
    try {
      // In production, this would send the email via your email service
      return { success: true, data: { sent: true } };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  // Business Intelligence
  async getBusinessStats(): Promise<
    CopilotAPIResponse<{
      projectsActive: number;
      projectsCompleted: number;
      clientsTotal: number;
      revenueThisMonth: number;
      appointmentsThisWeek: number;
    }>
  > {
    try {
      const [projectsResp, clientsResp, appointmentsResp] = await Promise.all([
        this.getProjects(),
        this.getClients(),
        this.getCalendarEvents(),
      ]);

      const stats = {
        projectsActive: projectsResp.data?.filter(p => p.status === 'active').length || 0,
        projectsCompleted: projectsResp.data?.filter(p => p.status === 'completed').length || 0,
        clientsTotal: clientsResp.data?.length || 0,
        revenueThisMonth: 0, // Would calculate from projects/invoices
        appointmentsThisWeek: appointmentsResp.data?.length || 0,
      };

      return { success: true, data: stats };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  // Helper method to map API response to CalendarEvent
  private mapToCalendarEvent(apiEvent: unknown): CalendarEvent {
    const e = (apiEvent ?? {}) as Record<string, unknown>;
    const id = (e._id ?? e.id) as string | undefined;
    const title = (e.title as string) ?? String(e.id ?? '');
    const description = (e.description as string) ?? undefined;
    const startTime = (e.startTime as string) ?? (e.date as string) ?? '';
    const endTime = (e.endTime as string) ?? (e.date as string) ?? '';
    const attendees = Array.isArray(e.attendees) ? (e.attendees as string[]) : [];
    const location = (e.location as string) ?? undefined;
    const type = ((e.type as CalendarEvent['type']) || 'meeting') as CalendarEvent['type'];

    return {
      id: id ?? String(Date.now()),
      title,
      description,
      startTime,
      endTime,
      attendees,
      location,
      type,
    };
  }
}

// Lazily instantiate only on the client to avoid server-side serialization issues
export const copilotAPI = typeof window !== 'undefined' ? new CopilotAPI() : undefined;

export function getCopilotAPI(): CopilotAPI | undefined {
  return copilotAPI;
}
export type { CalendarEvent, Client, Project, EmailDraft, AppointmentBooking };
