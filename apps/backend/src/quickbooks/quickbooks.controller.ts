import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuickBooksService } from './quickbooks.service';
import {
  QuickBooksConfig,
  SyncEstimateDto,
  SyncInvoiceDto,
  TestConnectionDto,
} from './dto/quickbooks.dto';

@Controller('quickbooks')
@UseGuards(JwtAuthGuard)
export class QuickBooksController {
  constructor(private readonly quickbooksService: QuickBooksService) {}

  @Post('test')
  async testConnection(@Body() config: TestConnectionDto, @Request() req) {
    try {
      const result = await this.quickbooksService.testConnection(config, req.user.workspaceId);
      return {
        success: true,
        message: 'QuickBooks connection successful',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'QuickBooks connection failed',
        error: error.message,
      };
    }
  }

  @Post('sync/estimate/:id')
  async syncEstimate(@Param('id') estimateId: string, @Request() req) {
    try {
      const result = await this.quickbooksService.syncEstimate(estimateId, req.user.workspaceId);
      return {
        success: true,
        message: 'Estimate synced to QuickBooks successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sync estimate to QuickBooks',
        error: error.message,
        errors: [error.message],
      };
    }
  }

  @Post('sync/invoice/:id')
  async syncInvoice(@Param('id') invoiceId: string, @Request() req) {
    try {
      const result = await this.quickbooksService.syncInvoice(invoiceId, req.user.workspaceId);
      return {
        success: true,
        message: 'Invoice synced to QuickBooks successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sync invoice to QuickBooks',
        error: error.message,
        errors: [error.message],
      };
    }
  }

  @Get('customers')
  async getCustomers(@Request() req) {
    try {
      const customers = await this.quickbooksService.getCustomers(req.user.workspaceId);
      return {
        success: true,
        data: customers,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch QuickBooks customers',
        error: error.message,
      };
    }
  }

  @Get('items')
  async getItems(@Request() req) {
    try {
      const items = await this.quickbooksService.getItems(req.user.workspaceId);
      return {
        success: true,
        data: items,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch QuickBooks items',
        error: error.message,
      };
    }
  }

  @Post('sync/all')
  async syncAll(@Request() req) {
    try {
      const result = await this.quickbooksService.syncAll(req.user.workspaceId);
      return {
        success: true,
        message: 'Full sync completed successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Full sync failed',
        error: error.message,
      };
    }
  }

  @Get('sync/status')
  async getSyncStatus(@Request() req) {
    try {
      const status = await this.quickbooksService.getSyncStatus(req.user.workspaceId);
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get sync status',
        error: error.message,
      };
    }
  }
}
