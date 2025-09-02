import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppointmentsService } from './appointments.service';
import {
    AppointmentFilters,
    AppointmentStats,
    CreateAppointmentDto,
    PaginationOptions,
    UpdateAppointmentDto
} from './dto/appointment.dto';
import { UnifiedCalendarService } from './unified-calendar.service';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly unifiedCalendarService: UnifiedCalendarService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req: any) {
    createAppointmentDto.workspaceId = req.user.workspaceId;
    return await this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get appointments with filters' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  async findWithFilters(@Request() req: any, @Query() query: any) {
    const filters: AppointmentFilters = {
      workspaceId: req.user.workspaceId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      status: query.status,
      type: query.type,
      assignedTo: query.assignedTo,
      clientId: query.clientId,
      search: query.search,
    };
    const pagination: PaginationOptions = {
      limit: parseInt(query.limit) || 10,
      offset: parseInt(query.offset) || 0,
    };
    return await this.appointmentsService.findAllWithFilters(filters, pagination);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get appointments formatted for calendar view' })
  async getCalendarEvents(@Request() req: any, @Query() query: any) {
    const startDate = query.start ? new Date(query.start) : new Date();
    const endDate = query.end
      ? new Date(query.end)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    return this.unifiedCalendarService.getUnifiedCalendarEvents(
      req.user._id || req.user.id || req.user.sub,
      req.user.workspaceId,
      startDate,
      endDate
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get appointment statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req: any): Promise<AppointmentStats> {
    return await this.appointmentsService.getAppointmentStats(req.user.workspaceId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming appointments' })
  @ApiResponse({ status: 200, description: 'Upcoming appointments retrieved' })
  async getUpcoming(@Request() req: any, @Query('limit') limit?: string) {
    return await this.appointmentsService.getUpcomingAppointments(
      req.user.workspaceId,
      parseInt(limit) || 10
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment found' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return await this.appointmentsService.findOne(id, req.user.workspaceId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req: any
  ) {
    return await this.appointmentsService.update(id, updateAppointmentDto, req.user.workspaceId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return await this.appointmentsService.remove(id, req.user.workspaceId);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule appointment' })
  @ApiResponse({ status: 200, description: 'Appointment rescheduled successfully' })
  async reschedule(
    @Param('id') id: string,
    @Body('newDate') newDate: string,
    @Body('reason') reason: string,
    @Request() req: any
  ) {
    return await this.appointmentsService.reschedule(
      id,
      new Date(newDate),
      req.user.workspaceId,
      reason
    );
  }

  @Post('bulk-actions')
  @ApiOperation({ summary: 'Perform bulk actions on appointments' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  async bulkActions(@Body() data: any, @Request() req: any) {
    return await this.appointmentsService.bulkActions(
      data.appointmentIds,
      data.action,
      req.user.workspaceId,
      data.data
    );
  }

  @Get(':id/export/ics')
  @ApiOperation({ summary: 'Export appointment as ICS calendar file' })
  @ApiResponse({ status: 200, description: 'Calendar file generated' })
  async exportICS(@Param('id') id: string, @Request() req: any) {
    return await this.appointmentsService.exportToICS(id, req.user.workspaceId);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm appointment' })
  @ApiResponse({ status: 200, description: 'Appointment confirmed' })
  async confirm(@Param('id') id: string, @Request() req: any) {
    return await this.appointmentsService.confirmAppointment(id, req.user.workspaceId);
  }

  @Post(':id/send-reminder')
  @ApiOperation({ summary: 'Send appointment reminder' })
  @ApiResponse({ status: 200, description: 'Reminder sent successfully' })
  async sendReminder(@Param('id') id: string, @Request() req: any) {
    return await this.appointmentsService.sendReminder(id, req.user.workspaceId);
  }

  @Post('google-calendar/sync')
  @ApiOperation({ summary: 'Sync CRM appointment to Google Calendar' })
  @ApiResponse({ status: 201, description: 'Event synced to Google Calendar' })
  async syncToGoogleCalendar(@Body() data: { appointmentId: string }, @Request() req: any) {
    // Get the appointment details
    const appointment = await this.appointmentsService.findOne(
      data.appointmentId,
      req.user.workspaceId
    );
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Create event in Google Calendar
    const googleEvent = await this.unifiedCalendarService.createGoogleCalendarEvent(
      req.user._id || req.user.id || req.user.sub,
      {
        summary: appointment.title,
        description: appointment.description,
        start: appointment.scheduledDate.toISOString(),
        end: new Date(
          appointment.scheduledDate.getTime() + appointment.duration * 60000
        ).toISOString(),
        location: appointment.location,
      }
    );

    return { success: true, googleEvent };
  }

  @Get('google-calendar/status')
  @ApiOperation({ summary: 'Get Google Calendar integration status' })
  @ApiResponse({ status: 200, description: 'Google Calendar status retrieved' })
  async getGoogleCalendarStatus(@Request() req: any) {
    return await this.unifiedCalendarService.getGoogleCalendarStatus(
      req.user._id || req.user.id || req.user.sub
    );
  }
}
