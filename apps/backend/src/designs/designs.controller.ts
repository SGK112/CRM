import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DesignsService } from './designs.service';

@ApiTags('Designs')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DesignsController {
  constructor(private readonly designs: DesignsService) {}

  @Post('design-templates') createTemplate(@Body() dto: any, @Request() req) {
    return this.designs.createTemplate(dto, req.user.workspaceId);
  }
  @Get('design-templates') listTemplates(@Query() q: any, @Request() req) {
    return this.designs.listTemplates(req.user.workspaceId, q);
  }
  @Get('design-templates/:id') getTemplate(@Param('id') id: string, @Request() req) {
    return this.designs.getTemplate(id, req.user.workspaceId);
  }
  @Patch('design-templates/:id') updateTemplate(
    @Param('id') id: string,
    @Body() dto: any,
    @Request() req
  ) {
    return this.designs.updateTemplate(id, dto, req.user.workspaceId);
  }
  @Delete('design-templates/:id') deleteTemplate(@Param('id') id: string, @Request() req) {
    return this.designs.deleteTemplate(id, req.user.workspaceId);
  }

  @Post('designs') createDesign(@Body() dto: any, @Request() req) {
    return this.designs.createDesign(dto, req.user);
  }
  @Get('designs') listDesigns(@Query() q: any, @Request() req) {
    return this.designs.listDesigns(req.user.workspaceId, q, req.user.userId || req.user.sub);
  }
  @Get('designs/:id') getDesign(@Param('id') id: string, @Request() req) {
    return this.designs.getDesign(id, req.user.workspaceId);
  }
  @Patch('designs/:id') updateDesign(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.designs.updateDesign(id, dto, req.user.workspaceId);
  }
  @Delete('designs/:id') archiveDesign(@Param('id') id: string, @Request() req) {
    return this.designs.archiveDesign(id, req.user.workspaceId);
  }

  @Post('designs/:id/revisions') createRevision(
    @Param('id') id: string,
    @Body() dto: any,
    @Request() req
  ) {
    return this.designs.createRevision(id, dto, req.user);
  }
  @Get('designs/:id/revisions') listRevisions(@Param('id') id: string, @Request() req) {
    return this.designs.listRevisions(id, req.user.workspaceId);
  }
  @Get('designs/:id/revisions/:revId') getRevision(
    @Param('id') id: string,
    @Param('revId') revId: string,
    @Request() req
  ) {
    return this.designs.getRevision(id, revId, req.user.workspaceId);
  }
  @Post('designs/:id/restore/:revId') restoreRevision(
    @Param('id') id: string,
    @Param('revId') revId: string,
    @Request() req
  ) {
    return this.designs.restoreRevision(id, revId, req.user);
  }
}
