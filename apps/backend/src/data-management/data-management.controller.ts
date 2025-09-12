import { Controller, Post, Body, UseGuards, Req, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DataManagementService } from './data-management.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    workspaceId?: string;
  };
}

export class BulkActionDto {
  action: 'delete' | 'archive' | 'organize';
  categories: string[];
  includeDemo?: boolean;
}

export class ExportDataDto {
  categories: string[];
  format: 'json' | 'csv';
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
