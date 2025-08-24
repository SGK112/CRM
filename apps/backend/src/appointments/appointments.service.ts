import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { EmailService } from '../services/email.service';
import { TwilioService } from '../services/twilio.service';

interface CreateAppointmentDto {
  clientId: string;
  workspaceId: string;
  projectId?: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  duration: number;
  type: 'consultation' | 'estimate' | 'follow_up' | 'installation' | 'inspection' | 'other';
  location?: string;
  assignedTo?: string;
  notes?: string;
  voiceCallId?: string;
  createdBy?: string;
  metadata?: {
    estimateId?: string;
    invoiceId?: string;
    priority?: 'low' | 'medium' | 'high';
    followUpRequired?: boolean;
    preferredContactMethod?: 'phone' | 'email' | 'text';
  };
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    private emailService: EmailService,
    private twilioService: TwilioService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = new this.appointmentModel({
      ...createAppointmentDto,
      status: 'scheduled',
      reminderSent: false,
      confirmationSent: false,
    });

    return appointment.save();
  }

  async findByWorkspace(workspaceId: string, filters?: {
    clientId?: string;
    status?: string;
    type?: string;
    assignedTo?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Appointment[]> {
    const query: any = { workspaceId };

    if (filters) {
      if (filters.clientId) query.clientId = filters.clientId;
      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;
      if (filters.assignedTo) query.assignedTo = filters.assignedTo;
      
      if (filters.startDate || filters.endDate) {
        query.scheduledDate = {};
        if (filters.startDate) query.scheduledDate.$gte = filters.startDate;
        if (filters.endDate) query.scheduledDate.$lte = filters.endDate;
      }
    }

    return this.appointmentModel.find(query).sort({ scheduledDate: 1 }).exec();
  }

  async findById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id).exec();
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async updateStatus(id: string, status: Appointment['status'], notes?: string): Promise<Appointment> {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      { 
        status, 
        ...(notes && { notes: notes }),
        ...(status === 'completed' && { endedAt: new Date() })
      },
      { new: true }
    ).exec();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async sendConfirmationEmail(appointmentId: string, clientData: {
    email: string;
    name: string;
  }): Promise<boolean> {
    const appointment = await this.findById(appointmentId);
    
    const success = await this.emailService.sendAppointmentConfirmation({
      clientEmail: clientData.email,
      clientName: clientData.name,
      appointmentDate: appointment.scheduledDate,
      appointmentType: appointment.type,
      location: appointment.location,
      notes: appointment.notes,
    });

    if (success) {
      await this.appointmentModel.findByIdAndUpdate(appointmentId, {
        confirmationSent: true
      });
    }

    return success;
  }

  async sendReminderSMS(appointmentId: string, clientPhone: string, clientName: string): Promise<boolean> {
    const appointment = await this.findById(appointmentId);
    
    const appointmentDate = appointment.scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    const message = `Hi ${clientName}, this is a reminder about your ${appointment.type} appointment scheduled for ${appointmentDate}. ${appointment.location ? `Location: ${appointment.location}. ` : ''}Please contact us if you need to reschedule.`;

    const success = await this.twilioService.sendSMS(clientPhone, message);

    if (success) {
      await this.appointmentModel.findByIdAndUpdate(appointmentId, {
        reminderSent: true
      });
    }

    return success;
  }

  async scheduleFromVoiceCall(callData: {
    clientId: string;
    workspaceId: string;
    voiceCallId: string;
    appointmentDate: Date;
    appointmentType: string;
    duration?: number;
    location?: string;
    notes?: string;
  }): Promise<Appointment> {
    const appointment = await this.create({
      clientId: callData.clientId,
      workspaceId: callData.workspaceId,
      title: `${callData.appointmentType} - Scheduled via Voice Agent`,
      scheduledDate: callData.appointmentDate,
      duration: callData.duration || 60,
      type: this.mapStringToAppointmentType(callData.appointmentType),
      location: callData.location,
      notes: callData.notes,
      voiceCallId: callData.voiceCallId,
      createdBy: 'voice_agent',
      metadata: {
        priority: 'medium',
        preferredContactMethod: 'phone'
      }
    });

    return appointment;
  }

  private mapStringToAppointmentType(typeString: string): Appointment['type'] {
    const lowerType = typeString.toLowerCase();
    if (lowerType.includes('consultation')) return 'consultation';
    if (lowerType.includes('estimate')) return 'estimate';
    if (lowerType.includes('follow')) return 'follow_up';
    if (lowerType.includes('install')) return 'installation';
    if (lowerType.includes('inspection') || lowerType.includes('inspect')) return 'inspection';
    return 'other';
  }

  async getUpcomingAppointments(workspaceId: string, days: number = 7): Promise<Appointment[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.findByWorkspace(workspaceId, {
      startDate,
      endDate,
      status: 'scheduled'
    });
  }

  async reschedule(appointmentId: string, newDate: Date, notes?: string): Promise<Appointment> {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      appointmentId,
      { 
        scheduledDate: newDate,
        status: 'scheduled',
        reminderSent: false,
        confirmationSent: false,
        ...(notes && { notes: notes })
      },
      { new: true }
    ).exec();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }
}
