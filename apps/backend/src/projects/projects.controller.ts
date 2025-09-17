import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, ActiveSubscriptionGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.workspaceId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user.workspaceId);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get project count' })
  @ApiResponse({ status: 200, description: 'Project count retrieved successfully' })
  async getCount(@Request() req) {
    const projects = await this.projectsService.findAll(req.user.workspaceId);
    return { count: projects.length };
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get projects by status' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findByStatus(@Param('status') status: string, @Request() req) {
    return this.projectsService.findByStatus(status, req.user.workspaceId);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get projects by client ID' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findByClientId(@Param('clientId') clientId: string, @Request() req) {
    return this.projectsService.findByClientId(clientId, req.user.workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req) {
    return this.projectsService.update(id, updateProjectDto, req.user.workspaceId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.workspaceId);
  }
}
