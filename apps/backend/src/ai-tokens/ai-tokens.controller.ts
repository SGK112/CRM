import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AiTokensService } from './ai-tokens.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { PermissionsGuard } from '../common/permissions/permissions.guard';
import { RequiresPermissions } from '../common/permissions/permissions.decorator';
import { PurchaseTokensDto, ConsumeTokensDto } from './dto/purchase.dto';

@UseGuards(JwtAuthGuard, ActiveSubscriptionGuard, PermissionsGuard)
@Controller('ai-tokens')
export class AiTokensController {
  constructor(private service: AiTokensService) {}

  @Get('balance')
  @RequiresPermissions('ai.tokens.read')
  balance(@Req() req) {
    return this.service.balance(req.user.workspaceId);
  }

  @Post('purchase')
  @RequiresPermissions('ai.tokens.purchase')
  purchase(@Req() req, @Body() body: PurchaseTokensDto) {
    return this.service.purchase(req.user.workspaceId, body.quantity, body.paymentIntentId);
  }

  @Post('consume')
  @RequiresPermissions('ai.tokens.consume')
  consume(@Req() req, @Body() body: ConsumeTokensDto) {
    return this.service.consume(req.user.workspaceId, body.quantity, {
      reason: body.reason,
      referenceId: body.referenceId,
    });
  }
}
