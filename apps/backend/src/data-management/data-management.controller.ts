import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DataManagementService } from './data-management.service';
import { BulkActionDto, ExportDataDto } from './data-management.types';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    workspaceId?: string;
  };
}

@Controller('data-management')
@UseGuards(JwtAuthGuard)
export class DataManagementController {
  constructor(private readonly dataManagementService: DataManagementService) {}

  @Post('bulk-action')
  async bulkAction(@Body() dto: BulkActionDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    return await this.dataManagementService.executeBulkAction(
      dto.action,
      dto.categories,
      user.workspaceId || user.id,
    );
  }

  @Post('export')
  async exportData(@Body() dto: ExportDataDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    return await this.dataManagementService.exportData(
      dto.categories,
      dto.format,
      user.workspaceId || user.id
    );
  }

  @Post('archive')
  async archiveData(@Body() body: { categories: string[] }, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    return await this.dataManagementService.archiveData(
      body.categories,
      user.workspaceId || user.id
    );
  }

  @Post('organize')
  async organizeData(@Body() body: { categories: string[] }, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    return await this.dataManagementService.organizeData(
      body.categories,
      user.workspaceId || user.id
    );
  }

  @Delete('reset-workspace')
  async resetWorkspaceData(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return await this.dataManagementService.resetWorkspaceData(
      user.workspaceId || user.id,
    );
  }
}
