import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, AvailabilityCheckDto, AppointmentQueryDto, BulkActionDto, RescheduleDto, ConflictCheckResult, AppointmentStats } from './dto/appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid appointment data' })
  @ApiResponse({ status: 409, description: 'Time slot conflict' })
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req: any) {
    // Ensure the appointment belongs to the user's workspace
    createAppointmentDto.workspaceId = req.user.workspaceId;

    // Check for conflicts before creating
    const conflicts = await this.appointmentsService.findConflicts(
      new Date(createAppointmentDto.scheduledDate),
      createAppointmentDto.duration,
      createAppointmentDto.workspaceId,
      createAppointmentDto.assignedTo,
    );

    if (conflicts.length > 0) {
      throw new HttpException('Time slot conflict detected', HttpStatus.CONFLICT);
    }

    return await this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get appointments with filters' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  async findAll(@Query() query: AppointmentQueryDto, @Request() req: any) {
    query.workspaceId = req.user.workspaceId;
    return await this.appointmentsService.findAll(query);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming appointments' })
  @ApiResponse({ status: 200, description: 'Upcoming appointments retrieved' })
  async getUpcoming(@Request() req: any, @Query('limit') limit?: number) {
    return await this.appointmentsService.getUpcoming(
      req.user.workspaceId,
      limit || 10
    );
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get appointments formatted for calendar view' })
  async getCalendarEvents(
    @Request() req: any,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('view') view?: string,
  ) {
    return this.appointmentsService.getCalendarEvents(
      req.user.workspaceId,
      start ? new Date(start) : undefined,
      end ? new Date(end) : undefined,
      view,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get appointment statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req: any): Promise<AppointmentStats> {
    return await this.appointmentsService.getAppointmentStats(req.user.workspaceId);
  }

  @Post('check-availability')
  @ApiOperation({ summary: 'Check time slot availability' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  async checkAvailability(@Body() availabilityDto: AvailabilityCheckDto, @Request() req: any): Promise<ConflictCheckResult> {
    availabilityDto.workspaceId = req.user.workspaceId;

    const conflicts = await this.appointmentsService.findConflicts(
      new Date(availabilityDto.startTime),
      availabilityDto.duration,
      availabilityDto.workspaceId,
      availabilityDto.assignedTo,
      availabilityDto.excludeAppointmentId,
    );

    return {
      isAvailable: conflicts.length === 0,
      conflicts,
      suggestions: conflicts.length > 0
        ? await this.appointmentsService.suggestAlternativeTimes(
            new Date(availabilityDto.startTime),
            availabilityDto.duration,
            availabilityDto.workspaceId,
            availabilityDto.assignedTo,
          )
        : undefined,
    };
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
  @ApiResponse({ status: 409, description: 'Time slot conflict' })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req: any,
  ) {
    // If updating scheduled date, check for conflicts
    if (updateAppointmentDto.scheduledDate) {
      const conflicts = await this.appointmentsService.findConflicts(
        new Date(updateAppointmentDto.scheduledDate),
        updateAppointmentDto.duration || 60, // Default duration if not provided
        req.user.workspaceId,
        updateAppointmentDto.assignedTo,
        id, // Exclude current appointment from conflict check
      );

      if (conflicts.length > 0) {
        throw new HttpException('Time slot conflict detected', HttpStatus.CONFLICT);
      }
    }

    return await this.appointmentsService.update(id, updateAppointmentDto, req.user.workspaceId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return await this.appointmentsService.remove(id, req.user.workspaceId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body('status') status: string,
    @Body('notes') notes?: string,
  ) {
    return await this.appointmentsService.updateStatus(
      id,
      status as any,
      req.user.workspaceId,
      notes
    );
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule appointment' })
  @ApiResponse({ status: 200, description: 'Appointment rescheduled successfully' })
  @ApiResponse({ status: 409, description: 'Conflict - new time slot unavailable' })
  async reschedule(
    @Param('id') id: string,
    @Request() req: any,
    @Body() rescheduleDto: RescheduleDto,
  ) {
    try {
      return await this.appointmentsService.reschedule(
        id,
        new Date(rescheduleDto.newDate),
        req.user.workspaceId,
        rescheduleDto.reason,
        rescheduleDto.newDuration
      );
    } catch (error) {
      if (error.message.includes('conflict')) {
        throw new HttpException('Time slot conflict detected', HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm appointment' })
  @ApiResponse({ status: 200, description: 'Appointment confirmed' })
  async confirm(@Param('id') id: string, @Request() req: any) {
    return await this.appointmentsService.updateStatus(
      id,
      'confirmed' as any,
      req.user.workspaceId
    );
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled' })
  async cancel(
    @Param('id') id: string,
    @Request() req: any,
    @Body('reason') reason?: string,
  ) {
    return await this.appointmentsService.updateStatus(
      id,
      'cancelled' as any,
      req.user.workspaceId,
      reason
    );
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark appointment as completed' })
  @ApiResponse({ status: 200, description: 'Appointment marked as completed' })
  async complete(
    @Param('id') id: string,
    @Request() req: any,
    @Body('notes') notes?: string,
  ) {
    return await this.appointmentsService.updateStatus(
      id,
      'completed' as any,
      req.user.workspaceId,
      notes
    );
  }

  @Post('bulk-action')
  @ApiOperation({ summary: 'Perform bulk action on appointments' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  async bulkAction(@Body() bulkActionDto: BulkActionDto, @Request() req: any) {
    return await this.appointmentsService.bulkAction(
      bulkActionDto.appointmentIds,
      bulkActionDto.action,
      req.user.workspaceId,
      bulkActionDto.data
    );
  }

  @Get('export/ics')
  @ApiOperation({ summary: 'Export appointments as ICS calendar file' })
  @ApiResponse({ status: 200, description: 'Calendar file generated' })
  async exportICS(@Request() req: any, @Query() query: AppointmentQueryDto) {
    query.workspaceId = req.user.workspaceId;
    return await this.appointmentsService.exportToICS(query);
  }

  @Get('conflicts/:date/:duration')
  @ApiOperation({ summary: 'Find conflicts for a specific date/time' })
  @ApiResponse({ status: 200, description: 'Conflicts found' })
  async findConflicts(
    @Param('date') date: string,
    @Param('duration') duration: string,
    @Request() req: any,
    @Query('assignedTo') assignedTo?: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return await this.appointmentsService.findConflicts(
      new Date(date),
      parseInt(duration),
      req.user.workspaceId,
      assignedTo,
      excludeId,
    );
  }

  @Get('suggestions/:date/:duration')
  @ApiOperation({ summary: 'Get alternative time suggestions' })
  @ApiResponse({ status: 200, description: 'Time suggestions generated' })
  async getSuggestions(
    @Param('date') date: string,
    @Param('duration') duration: string,
    @Request() req: any,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return await this.appointmentsService.suggestAlternativeTimes(
      new Date(date),
      parseInt(duration),
      req.user.workspaceId,
      assignedTo,
    );
  }
}
