import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { EstimatesService } from './estimates.service';

@Controller('share/estimate')
export class PublicEstimateController {
  constructor(private estimates: EstimatesService) {}

  @Get(':token')
  async publicView(@Param('token') token: string, @Res() res: Response) {
    const est = await this.estimates.findByShareToken(token);
    if (!est) return res.status(404).json({ error: 'Estimate not found' });
    
    // Return JSON data for frontend consumption
    return res.json({
      // @ts-expect-error _id exists on document
      _id: est._id,
      number: est.number,
      status: est.status,
      items: est.items,
      subtotalSell: est.subtotalSell,
      taxAmount: est.taxAmount,
      total: est.total,
      notes: est.notes,
      client: est.client,
      // @ts-expect-error createdAt exists on document
      createdAt: est.createdAt,
      // @ts-expect-error validUntil may exist on document
      validUntil: est.validUntil,
      shareToken: token
    });
  }

  @Get(':token/pdf')
  async publicPdf(@Param('token') token: string, @Res() res: Response) {
    const est = await this.estimates.findByShareToken(token);
    if (!est) return res.status(404).send('Not found');
    // Use workspaceId for PDF
  // @ts-expect-error workspaceId is present on underlying document
  const pdfResult = await this.estimates.getPdf(est._id, est.workspaceId);
    if (!pdfResult) return res.status(500).send('PDF error');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
    return res.send(pdfResult.buffer);
  }
}
