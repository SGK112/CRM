import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { HrService } from './hr.service';
import { Employee } from './schemas/employee.schema';

@Controller('hr/employees')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // For now workspaceId is passed via query until auth decorator supplies it
  @Post()
  create(@Body() body: Partial<Employee>, @Query('workspaceId') workspaceId: string) {
    return this.hrService.create({ ...body, workspaceId });
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
  update(@Param('id') id: string, @Body() body: Partial<Employee>, @Query('workspaceId') workspaceId: string) {
    return this.hrService.update(id, workspaceId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('workspaceId') workspaceId: string) {
    return this.hrService.remove(id, workspaceId);
  }

  @Post(':id/certifications')
  addCertification(@Param('id') id: string, @Body() body: any, @Query('workspaceId') workspaceId: string) {
    return this.hrService.addCertification(id, workspaceId, body);
  }

  @Post(':id/trainings')
  addTraining(@Param('id') id: string, @Body() body: any, @Query('workspaceId') workspaceId: string) {
    return this.hrService.addTraining(id, workspaceId, body);
  }

  @Post(':id/disciplinary')
  addDisciplinary(@Param('id') id: string, @Body() body: any, @Query('workspaceId') workspaceId: string) {
    return this.hrService.addDisciplinaryAction(id, workspaceId, body);
  }

  @Post(':id/time-entries')
  addTimeEntry(@Param('id') id: string, @Body() body: any, @Query('workspaceId') workspaceId: string) {
    return this.hrService.addTimeEntry(id, workspaceId, body);
  }
}
