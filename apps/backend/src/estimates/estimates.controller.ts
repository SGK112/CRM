import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoicesService } from '../invoices/invoices.service';
import { CreateEstimateDto, EstimatesService, UpdateEstimateDto } from './estimates.service';

@Controller('estimates')
@UseGuards(JwtAuthGuard)
export class EstimatesController {
  constructor(
    private estimates: EstimatesService,
    private invoices: InvoicesService
  ) {}

  @Get()
  list(@Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.estimates.list(workspaceId);
  }

  @Post()
  create(@Body() body: CreateEstimateDto, @Req() req) {
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
  update(@Param('id') id: string, @Body() body: UpdateEstimateDto, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.estimates.update(id, workspaceId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.estimates.remove(id, workspaceId);
  }

  // Download estimate as PDF
  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Req() req, @Res() res: Response) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    const result = await this.estimates.getPdf(id, workspaceId);
    if (!result) {
      return res.status(404).json({ message: 'Estimate not found' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.buffer);
  }
}
