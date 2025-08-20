import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { HrService } from './hr.service';
import { Employee } from './schemas/employee.schema';
import { CreateEmployeeDto, UpdateEmployeeDto, AddCertificationDto, AddTrainingDto, AddDisciplinaryActionDto, AddTimeEntryDto } from './dto/create-employee.dto';

@Controller('hr/employees')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // For now workspaceId is passed via query until auth decorator supplies it
  @Post()
  create(@Body() body: CreateEmployeeDto, @Query('workspaceId') workspaceId: string) {
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
  findAll(@Query('workspaceId') workspaceId: string) {
    return this.hrService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('workspaceId') workspaceId: string) {
    return this.hrService.findOne(id, workspaceId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateEmployeeDto, @Query('workspaceId') workspaceId: string) {
  const mapped: any = { ...body };
  if (body.hireDate) mapped.hireDate = new Date(body.hireDate);
  if (body.terminationDate) mapped.terminationDate = new Date(body.terminationDate);
  return this.hrService.update(id, workspaceId, mapped);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('workspaceId') workspaceId: string) {
    return this.hrService.remove(id, workspaceId);
  }

  @Post(':id/certifications')
  addCertification(@Param('id') id: string, @Body() body: AddCertificationDto, @Query('workspaceId') workspaceId: string) {
    return this.hrService.addCertification(id, workspaceId, body);
  }

  @Post(':id/trainings')
  addTraining(@Param('id') id: string, @Body() body: AddTrainingDto, @Query('workspaceId') workspaceId: string) {
    return this.hrService.addTraining(id, workspaceId, body);
  }

  @Post(':id/disciplinary')
  addDisciplinary(@Param('id') id: string, @Body() body: AddDisciplinaryActionDto, @Query('workspaceId') workspaceId: string) {
    return this.hrService.addDisciplinaryAction(id, workspaceId, body);
  }

  @Post(':id/time-entries')
  addTimeEntry(@Param('id') id: string, @Body() body: AddTimeEntryDto, @Query('workspaceId') workspaceId: string) {
    return this.hrService.addTimeEntry(id, workspaceId, body);
  }
}
