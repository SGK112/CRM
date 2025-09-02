import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    description: 'The ID of the client to send email to',
    example: '64a8b123c456789012345678',
  })
  @IsMongoId()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'Email subject line',
    example: 'Project Update',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Email message content',
    example: 'Hi John, I wanted to update you on the progress of your project...',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Optional priority level',
    example: 'normal',
    required: false,
  })
  @IsOptional()
  @IsString()
  priority?: 'low' | 'normal' | 'high';
}

export class SendSmsDto {
  @ApiProperty({
    description: 'The ID of the client to send SMS to',
    example: '64a8b123c456789012345678',
  })
  @IsMongoId()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'SMS message content (max 160 characters for single SMS)',
    example: 'Hi John, your appointment is confirmed for tomorrow at 2 PM.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class SendTemplatedEmailDto {
  @ApiProperty({
    description: 'The ID of the client to send email to',
    example: '64a8b123c456789012345678',
  })
  @IsMongoId()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'Type of email template to use',
    example: 'appointment',
    enum: ['appointment', 'estimate', 'followup'],
  })
  @IsString()
  @IsNotEmpty()
  type: 'appointment' | 'estimate' | 'followup';

  @ApiProperty({
    description: 'Template data object',
    example: {
      appointmentDate: '2024-01-15T14:00:00Z',
      service: 'Kitchen Remodel Consultation',
    },
  })
  @IsOptional()
  templateData?: any;
}
