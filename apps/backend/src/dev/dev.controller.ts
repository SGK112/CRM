import { Controller, Post, UseGuards, Get, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DevService } from './dev.service';
import { Request } from 'express';

@Controller('dev')
@UseGuards(JwtAuthGuard)
export class DevController {
  constructor(private readonly devService: DevService) {}

  @Post('setup-super-admin')
  async setupSuperAdmin(@Req() req: Request) {
    const user = req.user as any;
    if (user.email !== 'help.remodely@gmail.com') {
      throw new Error('Unauthorized: This endpoint is only for help.remodely@gmail.com');
    }
    
    return await this.devService.setupSuperAdminAccount(user.email);
  }

  @Get('verify-access')
  async verifyAccess(@Req() req: Request) {
    const user = req.user as any;
    return await this.devService.verifyUserAccess(user);
  }
}
