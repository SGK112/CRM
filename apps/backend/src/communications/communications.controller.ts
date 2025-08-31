import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunicationsService } from './communications.service';
import { SendEmailDto, SendSmsDto } from './dto/communications.dto';

@ApiTags('Communications')
@Controller('communications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get communications service status' })
  @ApiResponse({ status: 200, description: 'Service status retrieved successfully' })
  getStatus(@Request() req) {
    return this.communicationsService.getServiceStatus(req.user.workspaceId);
  }

  @Post('email')
  @ApiOperation({ summary: 'Send email to client' })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  async sendEmail(@Body() sendEmailDto: SendEmailDto, @Request() req) {
    return this.communicationsService.sendEmail(sendEmailDto, req.user.workspaceId, req.user._id);
  }

  @Post('sms')
  @ApiOperation({ summary: 'Send SMS to client' })
  @ApiResponse({ status: 201, description: 'SMS sent successfully' })
  async sendSms(@Body() sendSmsDto: SendSmsDto, @Request() req) {
    return this.communicationsService.sendSms(sendSmsDto, req.user.workspaceId, req.user._id);
  }

  @Post('email/template')
  @ApiOperation({ summary: 'Send templated email to client' })
  @ApiResponse({ status: 201, description: 'Templated email sent successfully' })
  async sendTemplatedEmail(@Body() data: {
    type: 'appointment' | 'estimate' | 'followup';
    clientId: string;
    clientName?: string;
    appointmentDate?: string; // ISO string from client
    appointmentType?: string;
    location?: string;
    notes?: string;
    estimateNumber?: string;
    estimateAmount?: number;
    subject?: string;
    message?: string;
    callNotes?: string;
  }, @Request() req) {
    // Convert appointmentDate to Date if provided
    const normalized: {
      type: 'appointment' | 'estimate' | 'followup';
      clientId: string;
      clientName?: string;
      appointmentDate?: Date;
      appointmentType?: string;
      location?: string;
      notes?: string;
      estimateNumber?: string;
      estimateAmount?: number;
      subject?: string;
      message?: string;
      callNotes?: string;
    } = {
      ...data,
      appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : undefined,
    };
    return this.communicationsService.sendTemplatedEmail(normalized, req.user.workspaceId, req.user._id);
  }

  @Post('test-email')
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: 201, description: 'Test email sent successfully' })
  async sendTestEmail(@Body() data: { testEmail: string }, @Request() req) {
    return this.communicationsService.sendTestEmail(data.testEmail, req.user._id);
  }

  @Post('test-sms')
  @ApiOperation({ summary: 'Send test SMS' })
  @ApiResponse({ status: 201, description: 'Test SMS sent successfully' })
  async sendTestSms(@Body() data: { testPhone: string }, @Request() req) {
    return this.communicationsService.sendTestSms(data.testPhone, req.user._id);
  }
}
