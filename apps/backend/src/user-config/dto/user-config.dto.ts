import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateEmailConfigDto {
  @ApiProperty({ description: 'Email provider', example: 'smtp' })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiProperty({ description: 'SMTP host', example: 'smtp.gmail.com' })
  @IsString()
  @IsOptional()
  smtpHost?: string;

  @ApiProperty({ description: 'SMTP port', example: 587 })
  @IsNumber()
  @IsOptional()
  smtpPort?: number;

  @ApiProperty({ description: 'SMTP username', example: 'user@example.com' })
  @IsString()
  @IsOptional()
  smtpUser?: string;

  @ApiProperty({ description: 'SMTP password', example: 'app-password' })
  @IsString()
  @IsOptional()
  smtpPassword?: string;

  @ApiProperty({ description: 'From email address', example: 'noreply@company.com' })
  @IsString()
  @IsOptional()
  fromEmail?: string;

  @ApiProperty({ description: 'From name', example: 'Company Name' })
  @IsString()
  @IsOptional()
  fromName?: string;

  @ApiProperty({ description: 'Use secure connection', example: true })
  @IsBoolean()
  @IsOptional()
  secure?: boolean;
}

export class UpdateTwilioConfigDto {
  @ApiProperty({ description: 'Twilio Account SID', example: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsOptional()
  accountSid?: string;

  @ApiProperty({ description: 'Twilio Auth Token', example: 'your-auth-token' })
  @IsString()
  @IsOptional()
  authToken?: string;

  @ApiProperty({ description: 'Twilio phone number', example: '+1234567890' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'Webhook URL', example: 'https://yourapp.com/webhook' })
  @IsString()
  @IsOptional()
  webhookUrl?: string;
}

export class UpdatePdfTemplatesDto {
  @ApiProperty({
    description: 'Default template for estimates',
    example: 'professional',
    enum: ['professional', 'modern', 'classic']
  })
  @IsString()
  @IsOptional()
  @IsIn(['professional', 'modern', 'classic'])
  estimateTemplate?: 'professional' | 'modern' | 'classic';

  @ApiProperty({
    description: 'Default template for invoices',
    example: 'professional',
    enum: ['professional', 'modern', 'classic']
  })
  @IsString()
  @IsOptional()
  @IsIn(['professional', 'modern', 'classic'])
  invoiceTemplate?: 'professional' | 'modern' | 'classic';
}
