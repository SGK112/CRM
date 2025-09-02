import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CatalogService } from './catalog.service';
import { PDFProcessingService, PDFProcessingResult } from './pdf-processing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { CapabilityGuard } from '../billing/guards/capability.guard';
import { RequiresFeature } from '../billing/decorators/requires-feature.decorator';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Controller('catalog')
@UseGuards(JwtAuthGuard, ActiveSubscriptionGuard, CapabilityGuard)
export class CatalogController {
  constructor(
    private catalog: CatalogService,
    private pdfProcessing: PDFProcessingService
  ) {}

  @Get()
  @RequiresFeature('pricing.read')
  search(
    @Req() req,
    @Query('q') q?: string,
    @Query('vendorId') vendorId?: string,
    @Query('tag') tag?: string,
    @Query('limit') limit?: string
  ) {
    return this.catalog.search(req.user.workspaceId, {
      q,
      vendorId,
      tag,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Post('upload-pdf')
  @RequiresFeature('pricing.write')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = path.join(process.cwd(), 'uploads', 'pdfs');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only PDF files are allowed'), false);
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
    })
  )
  async uploadPDF(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Body()
    body: {
      vendorId: string;
      defaultMarginPct?: string;
      defaultUnit?: string;
      skipDuplicates?: string;
    }
  ): Promise<PDFProcessingResult> {
    try {
      // Validate required parameters
      if (!body.vendorId) {
        throw new Error('vendorId is required');
      }

      // Validate PDF file
      const validation = await this.pdfProcessing.validatePDFFile(file.path);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Process the PDF
      const result = await this.pdfProcessing.processPDFFile(
        file.path,
        body.vendorId,
        req.user.workspaceId,
        {
          defaultMarginPct: body.defaultMarginPct ? parseFloat(body.defaultMarginPct) : 0,
          defaultUnit: body.defaultUnit || 'ea',
          skipDuplicates: body.skipDuplicates === 'true',
        }
      );

      // Clean up uploaded file
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupError) {
        // Log cleanup error but don't fail the request
      }

      return result;
    } catch (error) {
      // Clean up file on error
      if (file?.path) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          // Log cleanup error but don't fail the request
        }
      }

      throw error;
    }
  }

  @Post('process-pdf-text')
  @RequiresFeature('pricing.write')
  async processPDFText(
    @Req() req,
    @Body()
    body: {
      text: string;
      vendorId: string;
      defaultMarginPct?: string;
      defaultUnit?: string;
      skipDuplicates?: string;
    }
  ): Promise<PDFProcessingResult> {
    if (!body.text || !body.vendorId) {
      throw new Error('text and vendorId are required');
    }

    // Parse products from text
    const products = this.pdfProcessing.parseProductsFromText(body.text, {
      defaultUnit: body.defaultUnit || 'ea',
    });

    const result: PDFProcessingResult = {
      success: true,
      products,
      errors: [],
      totalPages: 1,
      processedPages: 1,
    };

    // Save to database if products found
    if (products.length > 0) {
      await this.pdfProcessing.saveProductsToDatabase(
        products,
        body.vendorId,
        req.user.workspaceId,
        {
          defaultMarginPct: body.defaultMarginPct ? parseFloat(body.defaultMarginPct) : 0,
          skipDuplicates: body.skipDuplicates === 'true',
        }
      );
    }

    return result;
  }
}
