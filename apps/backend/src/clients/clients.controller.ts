import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  findAll(@Request() req) {
    return this.clientsService.findAll(req.user.workspaceId);
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
    @Query('dedupeByPhone') dedupeByPhone?: string,
  ) {
    const parseBool = (v: string | undefined, def = false) => v === undefined ? def : /^(1|true|yes|on)$/i.test(v);
    return this.clientsService.importCsv(
      file,
      req.user.workspaceId,
      parseBool(dryRun),
      {
        allowEmailOnly: parseBool(allowEmailOnly),
        allowPhoneOnly: parseBool(allowPhoneOnly, true), // default: phone-only w/ synthesized email allowed
        synthEmailFromPhone: parseBool(synthEmailFromPhone, true),
        dedupeByPhone: parseBool(dedupeByPhone, true),
      }
    );
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create/update clients via JSON payload' })
  @ApiResponse({ status: 201, description: 'Bulk operation processed' })
  async bulkJson(
    @Body('clients') clients: any[],
    @Request() req,
  ) {
    return this.clientsService.bulkJson(clients || [], req.user.workspaceId);
  }
}
