import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  TwilioNumbersService,
  AvailablePhoneNumber,
  PurchasePhoneNumberDto,
} from './twilio-numbers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Twilio Phone Numbers')
@Controller('twilio-numbers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TwilioNumbersController {
  constructor(private readonly twilioNumbersService: TwilioNumbersService) {}

  @Get('available')
  @ApiOperation({ summary: 'Search available phone numbers for purchase' })
  @ApiResponse({ status: 200, description: 'Available phone numbers retrieved successfully' })
  async searchAvailableNumbers(
    @Request() req,
    @Query('areaCode') areaCode?: string,
    @Query('contains') contains?: string,
    @Query('limit') limit?: number
  ): Promise<AvailablePhoneNumber[]> {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.twilioNumbersService.searchAvailableNumbers(
      workspaceId,
      areaCode,
      contains,
      limit ? parseInt(limit.toString()) : 20
    );
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Purchase a phone number' })
  @ApiResponse({ status: 201, description: 'Phone number purchased successfully' })
  async purchasePhoneNumber(@Request() req, @Body() body: PurchasePhoneNumberDto) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.twilioNumbersService.purchasePhoneNumber(workspaceId, body);
  }

  @Get('my-numbers')
  @ApiOperation({ summary: "Get user's purchased phone numbers" })
  @ApiResponse({ status: 200, description: 'Phone numbers retrieved successfully' })
  async getUserPhoneNumbers(@Request() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.twilioNumbersService.getUserPhoneNumbers(workspaceId);
  }

  @Post(':id/set-default')
  @ApiOperation({ summary: 'Set phone number as default' })
  @ApiResponse({ status: 200, description: 'Default phone number updated successfully' })
  async setDefaultPhoneNumber(@Request() req, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.twilioNumbersService.setDefaultPhoneNumber(workspaceId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel/release a phone number' })
  @ApiResponse({ status: 200, description: 'Phone number cancelled successfully' })
  async cancelPhoneNumber(@Request() req, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    await this.twilioNumbersService.cancelPhoneNumber(workspaceId, id);
    return { message: 'Phone number cancelled successfully' };
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Get phone number usage statistics' })
  @ApiResponse({ status: 200, description: 'Usage statistics retrieved successfully' })
  async getPhoneNumberUsage(
    @Request() req,
    @Param('id') id: string,
    @Query('month') month?: string
  ) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.twilioNumbersService.getPhoneNumberUsage(workspaceId, id, month);
  }
}
