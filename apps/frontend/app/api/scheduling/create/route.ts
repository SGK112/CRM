import { NextRequest, NextResponse } from 'next/server';

// Mock database - in production, use your actual database
interface Appointment {
  id: string;
  contactId: string;
  dateTime: string;
  duration: number;
  title: string;
  type: 'consultation' | 'follow-up' | 'meeting' | 'service';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  notes?: string;
}

// In-memory storage (use database in production)
const appointments: Appointment[] = [];

export async function POST(request: NextRequest) {
  try {
    const { contactId, dateTime, duration = 60, title, type = 'consultation', notes } = await request.json();

    if (!contactId || !dateTime || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: contactId, dateTime, title' },
        { status: 400 }
      );
    }

    // Validate dateTime format
    const appointmentDate = new Date(dateTime);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid dateTime format' },
        { status: 400 }
      );
    }

    // Check if the time slot is available (basic check)
    const conflictingAppointment = appointments.find(apt => {
      const aptDate = new Date(apt.dateTime);
      const aptEnd = new Date(aptDate.getTime() + apt.duration * 60000);
      const newEnd = new Date(appointmentDate.getTime() + duration * 60000);
      
      return (appointmentDate >= aptDate && appointmentDate < aptEnd) ||
             (newEnd > aptDate && newEnd <= aptEnd) ||
             (appointmentDate <= aptDate && newEnd >= aptEnd);
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      );
    }

    // Create new appointment
    const newAppointment: Appointment = {
      id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contactId,
      dateTime: appointmentDate.toISOString(),
      duration,
      title,
      type,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      notes
    };

    appointments.push(newAppointment);

    // In a real application, you would:
    // 1. Save to database
    // 2. Send calendar invites
    // 3. Set up reminders
    // 4. Integrate with calendar systems (Google Calendar, Outlook, etc.)

    return NextResponse.json({
      success: true,
      appointment: newAppointment,
      message: 'Appointment scheduled successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const date = searchParams.get('date');

    let filteredAppointments = appointments;

    if (contactId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.contactId === contactId);
    }

    if (date) {
      const targetDate = new Date(date);
      filteredAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.dateTime);
        return aptDate.toDateString() === targetDate.toDateString();
      });
    }

    return NextResponse.json({
      success: true,
      appointments: filteredAppointments
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
