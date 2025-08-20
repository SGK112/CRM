import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { HrService } from './hr.service';
import { Employee } from './schemas/employee.schema';
import { CreateEmployeeDto, UpdateEmployeeDto, AddCertificationDto, AddTrainingDto, AddDisciplinaryActionDto, AddTimeEntryDto } from './dto/create-employee.dto';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../common/permissions/permissions.guard';
import { RequiresPermissions } from '../common/permissions/permissions.decorator';

@UseGuards(AuthGuard('jwt'), WorkspaceGuard, PermissionsGuard)
@Controller('hr/employees')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // For now workspaceId is passed via query until auth decorator supplies it
  @Post()
  @RequiresPermissions('employees.create')
  create(@Body() body: CreateEmployeeDto, @Req() req: any) {
    const workspaceId = req.workspaceId;
    const mapped: any = { ...body, workspaceId };
  if (body.hireDate) mapped.hireDate = new Date(body.hireDate);
  if (body.terminationDate) mapped.terminationDate = new Date(body.terminationDate);
  mapped.certifications = body.certifications || [];
  mapped.trainings = body.trainings || [];
  mapped.disciplinaryActions = body.disciplinaryActions || [];
  mapped.timeEntries = body.timeEntries || [];
  return this.hrService.create(mapped);
  }

  @Get()
  findAll(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string, @Query('active') active?: string) {
    const workspaceId = req.workspaceId;
    return this.hrService.findAll(workspaceId, { page: page? parseInt(page,10): undefined, limit: limit? parseInt(limit,10): undefined, search, active: active !== undefined ? active === 'true' : undefined });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.hrService.findOne(id, req.workspaceId);
  }

  @Put(':id')
  @RequiresPermissions('employees.update')
  update(@Param('id') id: string, @Body() body: UpdateEmployeeDto, @Req() req: any) {
    const workspaceId = req.workspaceId;
    const mapped: any = { ...body };
  if (body.hireDate) mapped.hireDate = new Date(body.hireDate);
  if (body.terminationDate) mapped.terminationDate = new Date(body.terminationDate);
    return this.hrService.update(id, workspaceId, mapped);
  }

  @Delete(':id')
  @RequiresPermissions('employees.delete')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.hrService.remove(id, req.workspaceId);
  }

  @Post(':id/certifications')
  @RequiresPermissions('employees.manage.nested')
  addCertification(@Param('id') id: string, @Body() body: AddCertificationDto, @Req() req: any) {
    return this.hrService.addCertification(id, req.workspaceId, body);
  }

  @Post(':id/trainings')
  @RequiresPermissions('employees.manage.nested')
  addTraining(@Param('id') id: string, @Body() body: AddTrainingDto, @Req() req: any) {
    return this.hrService.addTraining(id, req.workspaceId, body);
  }

  @Post(':id/disciplinary')
  @RequiresPermissions('employees.manage.nested')
  addDisciplinary(@Param('id') id: string, @Body() body: AddDisciplinaryActionDto, @Req() req: any) {
    return this.hrService.addDisciplinaryAction(id, req.workspaceId, body);
  }

  @Post(':id/time-entries')
  @RequiresPermissions('employees.manage.nested')
  addTimeEntry(@Param('id') id: string, @Body() body: AddTimeEntryDto, @Req() req: any) {
    return this.hrService.addTimeEntry(id, req.workspaceId, body);
  }
}
