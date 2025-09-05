import {
    ConflictException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from '../services/email.service';
import { TwilioService } from '../services/twilio.service';
import {
    AppointmentFilters,
    AppointmentStats,
    AppointmentStatus,
    AppointmentType,
    AvailabilityCheckDto,
    CalendarEventDto,
    ConflictCheckResult,
    CreateAppointmentDto,
    PaginationOptions,
    UpdateAppointmentDto,
    AppointmentDocument,
} from './dto/appointment.dto';
import { Appointment } from './schemas/appointment.schema';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    private emailService: EmailService,
    private twilioService: TwilioService
  ) {}

  // Create a new appointment
  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Check for conflicts before creating
    const scheduledDate = new Date(createAppointmentDto.scheduledDate);
    const endDate = new Date(scheduledDate.getTime() + createAppointmentDto.duration * 60000);

    const conflictCheck = await this.checkTimeSlotAvailability(
      createAppointmentDto.workspaceId!,
      scheduledDate,
      endDate,
      createAppointmentDto.assignedTo
    );

    if (conflictCheck.hasConflict) {
      throw new ConflictException('Time slot not available');
    }

    const appointmentData = {
      ...createAppointmentDto,
      scheduledDate,
      metadata: {
        priority: createAppointmentDto.priority || 'medium',
        followUpRequired: createAppointmentDto.followUpRequired || false,
        preferredContactMethod: createAppointmentDto.preferredContactMethod || 'email',
        estimateId: createAppointmentDto.estimateId,
        invoiceId: createAppointmentDto.invoiceId,
      },
    };

    const appointment = new this.appointmentModel(appointmentData);
    const saved = await appointment.save();

    // Send confirmation email if requested
    if (createAppointmentDto.sendReminders) {
      await this.sendConfirmationEmail();
    }

    return saved as Appointment;
  }

  // Find all appointments with filters and pagination
  async findAllWithFilters(
    filters: AppointmentFilters,
    pagination: PaginationOptions
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const query: {
      workspaceId: string;
      scheduledDate?: { $gte?: Date; $lte?: Date };
      status?: string;
      type?: string;
      assignedTo?: string;
      clientId?: string;
      $or?: Array<Record<string, unknown>>;
    } = { workspaceId: filters.workspaceId };

    // Apply date filters
    if (filters.startDate || filters.endDate) {
      query.scheduledDate = {};
      if (filters.startDate) query.scheduledDate.$gte = filters.startDate;
      if (filters.endDate) query.scheduledDate.$lte = filters.endDate;
    }

    // Apply other filters
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.clientId) query.clientId = filters.clientId;

    // Search in title and description
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const total = await this.appointmentModel.countDocuments(query);
    const appointments = await this.appointmentModel
      .find(query)
      .sort({ scheduledDate: 1 })
      .skip(pagination.offset)
      .limit(pagination.limit)
      .exec();

    return { appointments: appointments as Appointment[], total };
  }

  // Get calendar events formatted for FullCalendar
  async getCalendarEvents(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEventDto[]> {
    const appointments = await this.appointmentModel
      .find({
        workspaceId,
        scheduledDate: { $gte: startDate, $lte: endDate },
      })
      .sort({ scheduledDate: 1 })
      .exec();

    return appointments.map(appointment => ({
      id: appointment._id.toString(),
      title: appointment.title,
      start: appointment.scheduledDate.toISOString(),
      end: new Date(
        appointment.scheduledDate.getTime() + appointment.duration * 60000
      ).toISOString(),
      description: appointment.description,
      backgroundColor: this.getStatusColor(appointment.status),
      borderColor: this.getStatusColor(appointment.status),
      textColor: '#ffffff',
      extendedProps: {
        type: appointment.type as AppointmentType,
        status: appointment.status as AppointmentStatus,
        priority: appointment.metadata?.priority,
        clientId: appointment.clientId,
        location: appointment.location,
        assignedTo: appointment.assignedTo,
      },
    }));
  }

  // Check availability for a specific time slot
  async checkAvailability(
    workspaceId: string,
    availabilityDto: AvailabilityCheckDto
  ): Promise<ConflictCheckResult> {
    const date = new Date(availabilityDto.date);
    const [hours, minutes] = availabilityDto.startTime.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = new Date(startTime.getTime() + availabilityDto.duration * 60000);

    return this.checkTimeSlotAvailability(
      workspaceId,
      startTime,
      endTime,
      availabilityDto.assignedTo,
      availabilityDto.excludeAppointmentId
    );
  }

  // Get upcoming appointments
  async getUpcomingAppointments(workspaceId: string, days: number = 7): Promise<Appointment[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return (await this.appointmentModel
      .find({
        workspaceId,
        scheduledDate: { $gte: now, $lte: futureDate },
        status: { $nin: ['cancelled', 'completed'] },
      })
      .sort({ scheduledDate: 1 })
      .exec()) as Appointment[];
  }

  // Get appointment statistics
  async getAppointmentStats(workspaceId: string): Promise<AppointmentStats> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      statusCounts,
      typeCounts,
      todayCount,
      weekCount,
      monthCount,
      upcomingCount,
      overdueCount,
    ] = await Promise.all([
      this.appointmentModel.countDocuments({ workspaceId }),
      this.appointmentModel.aggregate([
        { $match: { workspaceId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.appointmentModel.aggregate([
        { $match: { workspaceId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      this.appointmentModel.countDocuments({
        workspaceId,
        scheduledDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      }),
      this.appointmentModel.countDocuments({
        workspaceId,
        scheduledDate: { $gte: thisWeek },
      }),
      this.appointmentModel.countDocuments({
        workspaceId,
        scheduledDate: { $gte: thisMonth },
      }),
      this.appointmentModel.countDocuments({
        workspaceId,
        scheduledDate: { $gte: now },
        status: { $nin: ['cancelled', 'completed'] },
      }),
      this.appointmentModel.countDocuments({
        workspaceId,
        scheduledDate: { $lt: now },
        status: { $nin: ['cancelled', 'completed'] },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    statusCounts.forEach((item: { _id: string; count: number }) => {
      byStatus[item._id] = item.count;
    });

    const byType: Record<string, number> = {};
    typeCounts.forEach((item: { _id: string; count: number }) => {
      byType[item._id] = item.count;
    });

    return {
      total,
      byStatus,
      byType,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      upcoming: upcomingCount,
      overdue: overdueCount,
    };
  }

  // Find scheduling conflicts
  async findConflicts(workspaceId: string): Promise<Appointment[]> {
    const appointments = (await this.appointmentModel
      .find({
        workspaceId,
        status: { $nin: ['cancelled', 'completed'] },
      })
      .sort({ scheduledDate: 1 })
      .exec()) as Appointment[];

    const conflicts: Appointment[] = [];

    for (let i = 0; i < appointments.length - 1; i++) {
      const current = appointments[i];
      const next = appointments[i + 1];

      const currentEnd = new Date(current.scheduledDate.getTime() + current.duration * 60000);

      if (current.assignedTo === next.assignedTo && currentEnd > next.scheduledDate) {
        if (!conflicts.find(a => a._id.toString() === current._id.toString())) {
          conflicts.push(current);
        }
        if (!conflicts.find(a => a._id.toString() === next._id.toString())) {
          conflicts.push(next);
        }
      }
    }

    return conflicts;
  }

  // Find one appointment
  async findOne(id: string, workspaceId: string): Promise<Appointment | null> {
    return (await this.appointmentModel.findOne({ _id: id, workspaceId }).exec()) as Appointment | null;
  }

  // Update appointment
  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    workspaceId: string
  ): Promise<Appointment> {
    const appointment = await this.appointmentModel.findOne({ _id: id, workspaceId });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check for conflicts if rescheduling
    if (updateAppointmentDto.scheduledDate || updateAppointmentDto.duration) {
      const newDate = updateAppointmentDto.scheduledDate
        ? new Date(updateAppointmentDto.scheduledDate)
        : appointment.scheduledDate;
      const newDuration = updateAppointmentDto.duration || appointment.duration;
      const endDate = new Date(newDate.getTime() + newDuration * 60000);

      const conflictCheck = await this.checkTimeSlotAvailability(
        workspaceId,
        newDate,
        endDate,
        updateAppointmentDto.assignedTo || appointment.assignedTo,
        id
      );

      if (conflictCheck.hasConflict) {
        throw new ConflictException('Time slot is already booked. Please choose a different time.');
      }
    }

    const updateData: Partial<Appointment> & { scheduledDate?: Date } = {};
    if (updateAppointmentDto.scheduledDate) {
      updateData.scheduledDate = new Date(updateAppointmentDto.scheduledDate);
    }
    Object.assign(updateData, updateAppointmentDto);

    // Update metadata
    if (
      updateAppointmentDto.priority ||
      updateAppointmentDto.followUpRequired ||
      updateAppointmentDto.preferredContactMethod ||
      updateAppointmentDto.estimateId ||
      updateAppointmentDto.invoiceId
    ) {
      updateData.metadata = {
        ...appointment.metadata,
        ...(updateAppointmentDto.priority && { priority: updateAppointmentDto.priority }),
        ...(updateAppointmentDto.followUpRequired !== undefined && {
          followUpRequired: updateAppointmentDto.followUpRequired,
        }),
        ...(updateAppointmentDto.preferredContactMethod && {
          preferredContactMethod: updateAppointmentDto.preferredContactMethod,
        }),
        ...(updateAppointmentDto.estimateId && { estimateId: updateAppointmentDto.estimateId }),
        ...(updateAppointmentDto.invoiceId && { invoiceId: updateAppointmentDto.invoiceId }),
      };
    }

    const updated = await this.appointmentModel
      .findOneAndUpdate({ _id: id, workspaceId }, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Appointment not found');
    }

    return updated as Appointment;
  }

  // Update appointment status
  async updateStatus(
    id: string,
    status: AppointmentStatus,
    workspaceId: string,
    notes?: string
  ): Promise<Appointment> {
    const updateData: { status: AppointmentStatus; notes?: string } = { status };
    if (notes) {
      updateData.notes = notes;
    }

    const updated = await this.appointmentModel
      .findOneAndUpdate({ _id: id, workspaceId }, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Appointment not found');
    }

    return updated as Appointment;
  }

  // Reschedule appointment
  async reschedule(
    id: string,
    newDate: Date,
    workspaceId: string,
    notes?: string
  ): Promise<Appointment> {
    const appointment = await this.appointmentModel.findOne({ _id: id, workspaceId });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const endDate = new Date(newDate.getTime() + appointment.duration * 60000);
    const conflictCheck = await this.checkTimeSlotAvailability(
      workspaceId,
      newDate,
      endDate,
      appointment.assignedTo,
      id
    );

    if (conflictCheck.hasConflict) {
      throw new ConflictException(
        'New time slot is already booked. Please choose a different time.'
      );
    }

    const updated = await this.appointmentModel
      .findOneAndUpdate(
        { _id: id, workspaceId },
        {
          scheduledDate: newDate,
          status: AppointmentStatus.SCHEDULED,
          reminderSent: false,
          confirmationSent: false,
          ...(notes && { notes }),
        },
        { new: true }
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Appointment not found');
    }

    // Send reschedule notification
    await this.sendRescheduleNotification();

    return updated as Appointment;
  }

  // Confirm appointment
  async confirmAppointment(id: string, workspaceId: string): Promise<Appointment> {
    const updated = await this.appointmentModel
      .findOneAndUpdate(
        { _id: id, workspaceId },
        { status: AppointmentStatus.CONFIRMED, confirmationSent: true },
        { new: true }
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Appointment not found');
    }

    return updated as Appointment;
  }

  // Send reminder
  async sendReminder(
    id: string,
    workspaceId: string
  ): Promise<{ success: boolean; message: string }> {
    const appointment = await this.appointmentModel.findOne({ _id: id, workspaceId });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    try {
      await this.sendReminderNotification();

      await this.appointmentModel.findOneAndUpdate(
        { _id: id, workspaceId },
        { reminderSent: true }
      );

      return { success: true, message: 'Reminder sent successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to send reminder' };
    }
  }

  // Remove appointment
  async remove(id: string, workspaceId: string): Promise<boolean> {
    const result = await this.appointmentModel.deleteOne({ _id: id, workspaceId });
    return result.deletedCount > 0;
  }

  // Export to ICS format
  async exportToICS(id: string, workspaceId: string): Promise<string> {
    const appointment = await this.appointmentModel.findOne({ _id: id, workspaceId });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const startDate = appointment.scheduledDate;
    const endDate = new Date(startDate.getTime() + appointment.duration * 60000);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CRM System//Appointment//EN',
      'BEGIN:VEVENT',
      `UID:${appointment._id}@crm-system.com`,
      `DTSTART:${this.formatDateForICS(startDate)}`,
      `DTEND:${this.formatDateForICS(endDate)}`,
      `SUMMARY:${appointment.title}`,
      appointment.description ? `DESCRIPTION:${appointment.description}` : '',
      appointment.location ? `LOCATION:${appointment.location}` : '',
      `STATUS:${appointment.status.toUpperCase()}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(line => line !== '')
      .join('\r\n');

    return icsContent;
  }

  // Bulk actions on appointments
  async bulkActions(
    appointmentIds: string[],
    action: 'confirm' | 'cancel' | 'reschedule' | 'delete',
    workspaceId: string,
    data?: Record<string, unknown>
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const id of appointmentIds) {
      try {
        switch (action) {
          case 'confirm':
            await this.confirmAppointment(id, workspaceId);
            break;
          case 'cancel':
            await this.updateStatus(id, AppointmentStatus.CANCELLED, workspaceId);
            break;
          case 'reschedule':
            if (data?.newDate) {
              await this.reschedule(id, new Date(data.newDate as string), workspaceId, data.notes as string);
            } else {
              throw new Error('New date required for rescheduling');
            }
            break;
          case 'delete':
            await this.remove(id, workspaceId);
            break;
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${id}: ${(error as Error).message}`);
      }
    }

    return results;
  }

  // Private helper methods

  private async checkTimeSlotAvailability(
    workspaceId: string,
    startTime: Date,
    endTime: Date,
    assignedTo?: string,
    excludeId?: string
  ): Promise<ConflictCheckResult> {
    const query: {
      workspaceId: string;
      status: { $nin: string[] };
      $or: Array<Record<string, unknown>>;
      assignedTo?: string;
      _id?: { $ne: string };
    } = {
      workspaceId,
      status: { $nin: ['cancelled', 'completed'] },
      $or: [
        // Appointment starts during this time slot
        {
          scheduledDate: { $gte: startTime, $lt: endTime },
        },
        // Appointment ends during this time slot
        {
          $expr: {
            $and: [
              { $lt: ['$scheduledDate', endTime] },
              {
                $gt: [{ $add: ['$scheduledDate', { $multiply: ['$duration', 60000] }] }, startTime],
              },
            ],
          },
        },
      ],
    };

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const conflictingAppointments = (await this.appointmentModel.find(query).exec()) as Appointment[];

    return {
      hasConflict: conflictingAppointments.length > 0,
      conflictingAppointments:
        conflictingAppointments.length > 0 ? conflictingAppointments : undefined,
    };
  }

  private getStatusColor(status: string): string {
    const colors = {
      scheduled: '#3b82f6', // Blue
      confirmed: '#10b981', // Emerald
      completed: '#6b7280', // Gray
      cancelled: '#ef4444', // Red
      'no-show': '#f59e0b', // Amber
      rescheduled: '#8b5cf6', // Purple
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  }

  private formatDateForICS(date: Date): string {
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  }

  public async sendConfirmationEmail(): Promise<void> {
    // Implementation depends on your email service
    // This is a placeholder - logging removed for production
  }

  private async sendRescheduleNotification(): Promise<void> {
    // Implementation depends on your notification service
    // This is a placeholder - logging removed for production
  }

  private async sendReminderNotification(): Promise<void> {
    // Implementation depends on your notification service
    // This is a placeholder - logging removed for production
  }

  // Legacy methods for backward compatibility
  async sendReminderSMS(): Promise<boolean> {
    try {
      // Implementation with TwilioService
      return true;
    } catch (error) {
      return false;
    }
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
    const createDto: CreateAppointmentDto = {
      clientId: callData.clientId,
      workspaceId: callData.workspaceId,
      title: `${callData.appointmentType} - Scheduled via Voice Agent`,
      scheduledDate: callData.appointmentDate.toISOString(),
      duration: callData.duration || 60,
      type: this.mapStringToAppointmentType(callData.appointmentType),
      location: callData.location,
      notes: callData.notes,
      createdBy: 'voice_agent',
      priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
      preferredContactMethod: 'phone',
    };

    return this.create(createDto);
  }

  private mapStringToAppointmentType(typeString: string): AppointmentType {
    const mapping: Record<string, AppointmentType> = {
      consultation: AppointmentType.CONSULTATION,
      estimate: AppointmentType.ESTIMATE,
      follow_up: AppointmentType.FOLLOW_UP,
      installation: AppointmentType.INSTALLATION,
      inspection: AppointmentType.INSPECTION,
      site_visit: AppointmentType.SITE_VISIT,
      meeting: AppointmentType.MEETING,
    };
    return mapping[typeString.toLowerCase()] || AppointmentType.OTHER;
  }
}
