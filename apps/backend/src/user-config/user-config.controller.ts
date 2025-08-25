import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserConfigService } from './user-config.service';
import { UpdateEmailConfigDto, UpdateTwilioConfigDto } from './dto/user-config.dto';

@ApiTags('User Configuration')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserConfigController {
  constructor(private readonly userConfigService: UserConfigService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get user configuration' })
  @ApiResponse({ status: 200, description: 'User configuration retrieved successfully' })
  getConfig(@Request() req) {
    return this.userConfigService.getUserConfig(req.user._id);
  }

  @Post('email-config')
  @ApiOperation({ summary: 'Update email configuration' })
  @ApiResponse({ status: 200, description: 'Email configuration updated successfully' })
  updateEmailConfig(@Body() updateEmailConfigDto: UpdateEmailConfigDto, @Request() req) {
    return this.userConfigService.updateEmailConfig(req.user._id, updateEmailConfigDto);
  }

  @Post('twilio-config')
  @ApiOperation({ summary: 'Update Twilio configuration' })
  @ApiResponse({ status: 200, description: 'Twilio configuration updated successfully' })
  updateTwilioConfig(@Body() updateTwilioConfigDto: UpdateTwilioConfigDto, @Request() req) {
    return this.userConfigService.updateTwilioConfig(req.user._id, updateTwilioConfigDto);
  }
}
