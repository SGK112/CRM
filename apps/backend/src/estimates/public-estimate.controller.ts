import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { EstimatesService } from './estimates.service';

@Controller('share/estimate')
export class PublicEstimateController {
  constructor(private estimates: EstimatesService) {}

  @Get(':token')
  async publicView(@Param('token') token: string, @Res() res: Response) {
    const est = await this.estimates.findByShareToken(token);
    if (!est) return res.status(404).send('Not found');
    // Render simple HTML (could be replaced with SSR/SPA in future)
    return res.send(`
      <html><head><title>Estimate ${est.number}</title></head><body>
      <h1>Estimate #${est.number}</h1>
      <p>Status: ${est.status}</p>
      <p>Client: ${est.client?.firstName || ''} ${est.client?.lastName || ''}</p>
      <p>Total: $${est.total.toFixed(2)}</p>
      <a href="/share/estimate/${token}/pdf">Download PDF</a>
      </body></html>
    `);
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
