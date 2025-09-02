import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    Min
} from 'class-validator';
import { Document } from 'mongoose';

// Enums for validation
export enum AppointmentType {
  CONSULTATION = 'consultation',
  ESTIMATE = 'estimate',
  FOLLOW_UP = 'follow_up',
  INSTALLATION = 'installation',
  INSPECTION = 'inspection',
  SITE_VISIT = 'site_visit',
  MEETING = 'meeting',
  OTHER = 'other',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show',
  RESCHEDULED = 'rescheduled',
}

// Type for appointments with MongoDB document
export interface AppointmentDocument extends Document {
  clientId: string;
  workspaceId: string;
  projectId?: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  duration: number;
  status: string;
  type: string;
  location?: string;
  assignedTo?: string;
  notes?: string;
  reminderSent?: boolean;
  confirmationSent?: boolean;
  voiceCallId?: string;
  createdBy?: string;
  attendees?: string[];
  metadata?: Record<string, string | number | boolean | Date>;
  recurrence?: Record<string, string | number | boolean | Date>;
  notifications?: Record<string, boolean | number[]>;
}

// Export interfaces that are used externally
export interface ConflictCheckResult {
  isAvailable: boolean;
  conflicts: AppointmentDocument[];
  suggestions?: Date[];
}

export interface AppointmentStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  averageDuration: number;
  mostCommonType: string;
  busyDays: Record<string, number>;
  revenueProjection: number;
}

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Client ID' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ description: 'Workspace ID' })
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @ApiPropertyOptional({ description: 'Project ID' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ description: 'Appointment title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Appointment description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Scheduled date and time', type: String, format: 'date-time' })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiProperty({ description: 'Duration in minutes', minimum: 15, maximum: 480 })
  @IsNumber()
  @IsPositive()
  @Min(15)
  @Max(480)
  duration: number;

  @ApiProperty({ enum: AppointmentType })
  @IsEnum(AppointmentType)
  type: AppointmentType;

  @ApiPropertyOptional({ description: 'Meeting location or address' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Voice call ID that created this appointment' })
  @IsString()
  @IsOptional()
  voiceCallId?: string;

  @ApiPropertyOptional({ description: 'Who created this appointment', default: 'user' })
  @IsString()
  @IsOptional()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Array of attendee user IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attendees?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: {
    estimateId?: string;
    invoiceId?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    followUpRequired?: boolean;
    preferredContactMethod?: 'phone' | 'email' | 'text';
    tags?: string[];
    customFields?: Record<string, string | number | boolean | Date>;
  };

  @ApiPropertyOptional({ description: 'Recurrence settings' })
  @IsObject()
  @IsOptional()
  recurrence?: {
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    endDate?: string;
    maxOccurrences?: number;
    daysOfWeek?: number[];
  };

  @ApiPropertyOptional({ description: 'Notification preferences' })
  @IsObject()
  @IsOptional()
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    reminderTimes?: number[];
  };
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ description: 'Appointment title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Appointment description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Scheduled date and time',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', minimum: 15, maximum: 480 })
  @IsNumber()
  @IsPositive()
  @Min(15)
  @Max(480)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({ enum: AppointmentType })
  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @ApiPropertyOptional({ description: 'Meeting location or address' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Array of attendee user IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attendees?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: {
    estimateId?: string;
    invoiceId?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    followUpRequired?: boolean;
    preferredContactMethod?: 'phone' | 'email' | 'text';
    tags?: string[];
    customFields?: Record<string, string | number | boolean | Date>;
  };

  @ApiPropertyOptional({ description: 'Recurrence settings' })
  @IsObject()
  @IsOptional()
  recurrence?: {
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    endDate?: string;
    maxOccurrences?: number;
    daysOfWeek?: number[];
  };

  @ApiPropertyOptional({ description: 'Notification preferences' })
  @IsObject()
  @IsOptional()
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    reminderTimes?: number[];
  };
}

export class AvailabilityCheckDto {
  @ApiProperty({ description: 'Workspace ID' })
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({ description: 'Start date and time', type: String, format: 'date-time' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'Duration in minutes', minimum: 15, maximum: 480 })
  @IsNumber()
  @IsPositive()
  @Min(15)
  @Max(480)
  duration: number;

  @ApiPropertyOptional({ description: 'Assigned user ID to check availability for' })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Appointment ID to exclude from conflict check (for rescheduling)',
  })
  @IsString()
  @IsOptional()
  excludeAppointmentId?: string;
}

export class AppointmentQueryDto {
  @ApiPropertyOptional({ description: 'Workspace ID filter' })
  @IsString()
  @IsOptional()
  workspaceId?: string;

  @ApiPropertyOptional({ description: 'Client ID filter' })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Project ID filter' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Assigned user ID filter' })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({ enum: AppointmentStatus, description: 'Status filter' })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({ enum: AppointmentType, description: 'Type filter' })
  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @ApiPropertyOptional({
    description: 'Start date for date range filter',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for date range filter',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1, default: 1 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

export class CalendarEventDto {
  @ApiProperty({ description: 'Event ID' })
  id: string;

  @ApiProperty({ description: 'Event title' })
  title: string;

  @ApiProperty({ description: 'Start date and time', type: String, format: 'date-time' })
  start: string;

  @ApiProperty({ description: 'End date and time', type: String, format: 'date-time' })
  end: string;

  @ApiPropertyOptional({ description: 'Event description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Background color' })
  backgroundColor?: string;

  @ApiPropertyOptional({ description: 'Border color' })
  borderColor?: string;

  @ApiPropertyOptional({ description: 'Text color' })
  textColor?: string;

  @ApiProperty({ description: 'Extended properties' })
  extendedProps: {
    type: AppointmentType;
    status: AppointmentStatus;
    location?: string;
    clientId: string;
    assignedTo?: string;
  };
}

export class BulkActionDto {
  @ApiProperty({ description: 'Array of appointment IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  appointmentIds: string[];

  @ApiProperty({
    description: 'Action to perform',
    enum: ['delete', 'cancel', 'confirm', 'reschedule'],
  })
  @IsEnum(['delete', 'cancel', 'confirm', 'reschedule'])
  action: 'delete' | 'cancel' | 'confirm' | 'reschedule';

  @ApiPropertyOptional({ description: 'Additional data for the action' })
  @IsObject()
  @IsOptional()
  data?: Record<string, string | number | boolean | Date>;
}

export class RescheduleDto {
  @ApiProperty({ description: 'New scheduled date and time', type: String, format: 'date-time' })
  @IsDateString()
  @IsNotEmpty()
  newDate: string;

  @ApiPropertyOptional({ description: 'New duration in minutes', minimum: 15, maximum: 480 })
  @IsNumber()
  @IsPositive()
  @Min(15)
  @Max(480)
  @IsOptional()
  newDuration?: number;

  @ApiPropertyOptional({ description: 'Reason for rescheduling' })
  @IsString()
  @IsOptional()
  reason?: string;
}
