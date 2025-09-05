import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Request,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { ClientsService } from './clients.service';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, ActiveSubscriptionGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  create(@Body() createClientDto: any, @Request() req) {
    return this.clientsService.create(createClientDto, req.user.workspaceId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'Clients retrieved successfully' })
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const searchParams = {
      search: search?.trim(),
      status: status?.trim(),
      source: source?.trim(),
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    };

    // Remove undefined values
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] === undefined || searchParams[key] === '') {
        delete searchParams[key];
      }
    });

    return this.clientsService.findAll(
      req.user.workspaceId,
      Object.keys(searchParams).length > 0 ? searchParams : undefined
    );
  }

  @Get('count')
  @ApiOperation({ summary: 'Get total count of clients' })
  @ApiResponse({ status: 200, description: 'Client count retrieved successfully' })
  count(
    @Request() req,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('source') source?: string
  ) {
    const searchParams = {
      search: search?.trim(),
      status: status?.trim(),
      source: source?.trim(),
    };

    // Remove undefined values
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] === undefined || searchParams[key] === '') {
        delete searchParams[key];
      }
    });

    return this.clientsService.count(
      req.user.workspaceId,
      Object.keys(searchParams).length > 0 ? searchParams : undefined
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({ status: 200, description: 'Client retrieved successfully' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.clientsService.findOne(id, req.user.workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update client' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  update(@Param('id') id: string, @Body() updateClientDto: any, @Request() req) {
    return this.clientsService.update(id, updateClientDto, req.user.workspaceId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete client' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  remove(@Param('id') id: string, @Request() req) {
    return this.clientsService.remove(id, req.user.workspaceId);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Bulk import clients via CSV' })
  @ApiResponse({ status: 201, description: 'Clients imported successfully' })
  async importCsv(
    @UploadedFile() file: any,
    @Request() req,
    @Query('dryRun') dryRun?: string,
    @Query('allowEmailOnly') allowEmailOnly?: string,
    @Query('allowPhoneOnly') allowPhoneOnly?: string,
    @Query('synthEmailFromPhone') synthEmailFromPhone?: string,
    @Query('dedupeByPhone') dedupeByPhone?: string
  ) {
    const parseBool = (v: string | undefined, def = false) =>
      v === undefined ? def : /^(1|true|yes|on)$/i.test(v);
    return this.clientsService.importCsv(file, req.user.workspaceId, parseBool(dryRun), {
      allowEmailOnly: parseBool(allowEmailOnly),
      allowPhoneOnly: parseBool(allowPhoneOnly, true), // default: phone-only w/ synthesized email allowed
      synthEmailFromPhone: parseBool(synthEmailFromPhone, true),
      dedupeByPhone: parseBool(dedupeByPhone, true),
    });
  }

    @Post(':id/sync-quickbooks')
  @ApiOperation({ summary: 'Sync client to QuickBooks' })
  @ApiResponse({ status: 200, description: 'Client synced to QuickBooks successfully' })
  syncToQuickBooks(@Param('id') id: string, @Request() req) {
    return this.clientsService.syncToQuickBooks(id, req.user.workspaceId);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create/update clients via JSON payload' })
  @ApiResponse({ status: 201, description: 'Bulk operation processed' })
  async bulkJson(@Body('clients') clients: any[], @Request() req) {
    return this.clientsService.bulkJson(clients || [], req.user.workspaceId);
  }
}
