import { Body, Controller, Get, Post, Param, Req, UseGuards, Patch } from '@nestjs/common';
import { EstimatesService } from './estimates.service';
import { InvoicesService } from '../invoices/invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('estimates')
@UseGuards(JwtAuthGuard)
export class EstimatesController {
  constructor(private estimates: EstimatesService, private invoices: InvoicesService) {}

  @Get()
  list(@Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.estimates.list(workspaceId);
  }

  @Post()
  create(@Body() body: any, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.estimates.create(body, workspaceId);
  }

  @Post(':id/recalc')
  recalc(@Param('id') id: string, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.estimates.recalc(id, workspaceId);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.estimates.findOne(id, workspaceId);
  }

  @Post(':id/send')
  send(@Param('id') id: string, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.estimates.send(id, workspaceId);
  }

  @Post(':id/status/:status')
  setStatus(@Param('id') id: string, @Param('status') status: string, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.estimates.updateStatus(id, workspaceId, status);
  }

  @Post(':id/convert')
  convert(@Param('id') id: string, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.fromEstimate(id, workspaceId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.estimates.update(id, workspaceId, body);
  }
}
