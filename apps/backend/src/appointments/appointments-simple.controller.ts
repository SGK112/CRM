import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
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
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req: any) {
    createAppointmentDto.workspaceId = req.user.workspaceId;
    return await this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get appointments with filters' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  async findWithFilters(@Request() req: any, @Query() query: any) {
    const filters = {
      workspaceId: req.user.workspaceId,
      ...query
    };
    const pagination = {
      limit: query.limit || 10,
      offset: query.offset || 0
    };
    return await this.appointmentsService.findWithFilters(filters, pagination);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get appointments formatted for calendar view' })
  async getCalendarEvents(@Request() req: any, @Query() query: any) {
    const filters = {
      workspaceId: req.user.workspaceId,
      ...query
    };
    return this.appointmentsService.getCalendarEvents(filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get appointment statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req: any) {
    return await this.appointmentsService.getAppointmentStats(req.user.workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment found' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return await this.appointmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req: any,
  ) {
    return await this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return await this.appointmentsService.remove(id);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule appointment' })
  @ApiResponse({ status: 200, description: 'Appointment rescheduled successfully' })
  async reschedule(
    @Param('id') id: string,
    @Body('newDate') newDate: string,
    @Body('reason') reason: string,
    @Request() req: any,
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

  @Get('export/ics')
  @ApiOperation({ summary: 'Export appointments as ICS calendar file' })
  @ApiResponse({ status: 200, description: 'Calendar file generated' })
  async exportICS(@Request() req: any, @Query() query: any) {
    const filters = {
      workspaceId: req.user.workspaceId,
      ...query
    };
    return await this.appointmentsService.exportToICS(req.user.workspaceId, filters);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm appointment' })
  @ApiResponse({ status: 200, description: 'Appointment confirmed' })
  async confirm(@Param('id') id: string, @Request() req: any) {
    return await this.appointmentsService.update(id, { status: 'confirmed' as any });
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled' })
  async cancel(@Param('id') id: string, @Body('reason') reason: string, @Request() req: any) {
    return await this.appointmentsService.update(id, {
      status: 'cancelled' as any,
      notes: reason
    });
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark appointment as completed' })
  @ApiResponse({ status: 200, description: 'Appointment marked as completed' })
  async complete(@Param('id') id: string, @Body('notes') notes: string, @Request() req: any) {
    return await this.appointmentsService.update(id, {
      status: 'completed' as any,
      notes: notes
    });
  }
}
