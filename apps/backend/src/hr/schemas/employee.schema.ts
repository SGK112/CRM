import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  position?: string; // Job title / role label

  @Prop()
  department?: string;

  @Prop({ type: Date })
  hireDate?: Date;

  @Prop({ type: Date })
  terminationDate?: Date;

  @Prop({ default: true })
  active: boolean;

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  })
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  @Prop({
    type: {
      provider: String, // carrier name
      policyNumber: String,
      effectiveDate: Date,
      expirationDate: Date,
    },
  })
  insurance?: {
    provider?: string;
    policyNumber?: string;
    effectiveDate?: Date;
    expirationDate?: Date;
  };

  @Prop({
    type: [
      {
        name: String,
        identifier: String, // license or cert number
        issuedDate: Date,
        expirationDate: Date,
        issuingAuthority: String,
      },
    ],
    default: [],
  })
  certifications: {
    name?: string;
    identifier?: string;
    issuedDate?: Date;
    expirationDate?: Date;
    issuingAuthority?: string;
  }[];

  @Prop({
    type: [
      {
        date: Date,
        type: { type: String }, // warning, suspension, termination_notice
        reason: String,
        notes: String,
        issuedBy: String,
        actionTaken: String,
      },
    ],
    default: [],
  })
  disciplinaryActions: {
    date?: Date;
    type?: string;
    reason?: string;
    notes?: string;
    issuedBy?: string;
    actionTaken?: string;
  }[];

  @Prop({
    type: [
      {
        date: Date,
        topic: String,
        description: String,
        hours: Number,
        trainer: String,
        certificateUrl: String,
      },
    ],
    default: [],
  })
  trainings: {
    date?: Date;
    topic?: string;
    description?: string;
    hours?: number;
    trainer?: string;
    certificateUrl?: string;
  }[];

  @Prop({
    type: [
      {
        periodStart: Date,
        periodEnd: Date,
        regularHours: Number,
        overtimeHours: Number,
        notes: String,
        approvedBy: String,
      },
    ],
    default: [],
  })
  timeEntries: {
    periodStart?: Date;
    periodEnd?: Date;
    regularHours?: number;
    overtimeHours?: number;
    notes?: string;
    approvedBy?: string;
  }[];

  @Prop({ type: Number, default: 0 })
  hourlyRate?: number;

  @Prop({ type: Number, default: 0 })
  salaryAnnual?: number;

  @Prop({ required: true })
  workspaceId: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Indexes for faster multi-tenant queries & lookups
EmployeeSchema.index({ workspaceId: 1, email: 1 }, { unique: true });
EmployeeSchema.index({ workspaceId: 1, active: 1 });
EmployeeSchema.index({ workspaceId: 1, lastName: 1, firstName: 1 });
