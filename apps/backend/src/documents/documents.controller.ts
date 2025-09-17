import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, ActiveSubscriptionGuard)
@ApiBearerAuth()
export class DocumentsController {
  
  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  findAll() {
    // TODO: Implement documents service
    return [];
  }

  @Get('count')
  @ApiOperation({ summary: 'Get document count' })
  @ApiResponse({ status: 200, description: 'Document count retrieved successfully' })
  async getCount() {
    // TODO: Implement documents count
    return { count: 0 };
  }
}