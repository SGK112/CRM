import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';
import { PriceItem, PriceItemDocument } from '../pricing/schemas/price-item.schema';
import { Vendor, VendorDocument } from '../vendors/schemas/vendor.schema';

export interface ParsedProduct {
  sku?: string;
  name: string;
  description?: string;
  baseCost: number;
  unit?: string;
  tags?: string[];
}

export interface PDFProcessingResult {
  success: boolean;
  products: ParsedProduct[];
  errors: string[];
  totalPages: number;
  processedPages: number;
}

@Injectable()
export class PDFProcessingService {
  private readonly logger = new Logger(PDFProcessingService.name);

  constructor(
    @InjectModel(PriceItem.name) private priceItemModel: Model<PriceItemDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>
  ) {}

  /**
   * Process a PDF file and extract product data
   */
  async processPDFFile(
    filePath: string,
    vendorId: string,
    workspaceId: string,
    options: {
      skipDuplicates?: boolean;
      defaultMarginPct?: number;
      defaultUnit?: string;
    } = {}
  ): Promise<PDFProcessingResult> {
    const result: PDFProcessingResult = {
      success: false,
      products: [],
      errors: [],
      totalPages: 0,
      processedPages: 0,
    };

    try {
      // Read and parse PDF
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);

      result.totalPages = pdfData.numpages;
      this.logger.log(`Processing PDF with ${result.totalPages} pages`);

      // Extract text content
      const fullText = pdfData.text;
      this.logger.debug(`Extracted ${fullText.length} characters from PDF`);

      // Parse products from text
      const products = this.parseProductsFromText(fullText, options);

      result.products = products;
      result.processedPages = result.totalPages;
      result.success = true;

      this.logger.log(`Successfully parsed ${products.length} products from PDF`);

      // Optionally save to database
      if (products.length > 0) {
        await this.saveProductsToDatabase(products, vendorId, workspaceId, options);
      }
    } catch (error) {
      this.logger.error(`Error processing PDF: ${error.message}`, error.stack);
      result.errors.push(`PDF processing failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Parse product data from extracted PDF text
   */
  parseProductsFromText(text: string, options: { defaultUnit?: string } = {}): ParsedProduct[] {
    const products: ParsedProduct[] = [];
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    this.logger.debug(`Processing ${lines.length} text lines`);

    // Common patterns for price sheets
    const pricePatterns = [
      // Pattern: "Product Name $123.45 each"
      /^(.+?)\s+\$?(\d+(?:\.\d{2})?)\s*(ea|each|sqft|ft|lb|kg|hour|hr)?$/i,

      // Pattern: "SKU-123 Product Name 123.45 ea"
      /^([A-Z0-9-]+)\s+(.+?)\s+(\d+(?:\.\d{2})?)\s*(ea|each|sqft|ft|lb|kg|hour|hr)?$/i,

      // Pattern: "Product Name - $123.45"
      /^(.+?)\s*-\s*\$?(\d+(?:\.\d{2})?)\s*(ea|each|sqft|ft|lb|kg|hour|hr)?$/i,
    ];

    for (const line of lines) {
      for (const pattern of pricePatterns) {
        const match = line.match(pattern);
        if (match) {
          try {
            const product: ParsedProduct = {
              name: match[1]?.trim() || 'Unknown Product',
              baseCost: parseFloat(match[2]),
              unit: match[3] || options.defaultUnit || 'ea',
            };

            // If we captured an SKU-like pattern in group 1, use it as SKU
            if (match[1] && /^[A-Z0-9-]+$/.test(match[1].trim())) {
              product.sku = match[1].trim();
              product.name = match[2]?.trim() || 'Unknown Product';
            }

            // Basic validation
            if (product.baseCost > 0 && product.name.length > 2) {
              products.push(product);
              this.logger.debug(`Parsed product: ${product.name} - $${product.baseCost}`);
            }
          } catch (error) {
            this.logger.warn(`Failed to parse line: ${line}`, error.message);
          }
          break; // Stop trying other patterns for this line
        }
      }
    }

    // Remove duplicates based on name and price
    const uniqueProducts = this.removeDuplicateProducts(products);

    this.logger.log(
      `Parsed ${uniqueProducts.length} unique products from ${products.length} total matches`
    );
    return uniqueProducts;
  }

  /**
   * Remove duplicate products based on name and price
   */
  private removeDuplicateProducts(products: ParsedProduct[]): ParsedProduct[] {
    const seen = new Set<string>();
    return products.filter(product => {
      const key = `${product.name.toLowerCase()}-${product.baseCost}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Save parsed products to database
   */
  async saveProductsToDatabase(
    products: ParsedProduct[],
    vendorId: string,
    workspaceId: string,
    options: {
      skipDuplicates?: boolean;
      defaultMarginPct?: number;
    } = {}
  ): Promise<void> {
    const { skipDuplicates = true, defaultMarginPct = 0 } = options;

    this.logger.log(`Saving ${products.length} products to database`);

    for (const product of products) {
      try {
        // Generate SKU if not provided
        const sku = product.sku || this.generateSKU(product.name);

        // Check for duplicates if requested
        if (skipDuplicates) {
          const existing = await this.priceItemModel.findOne({
            workspaceId,
            vendorId,
            sku,
          });

          if (existing) {
            this.logger.debug(`Skipping duplicate product: ${product.name}`);
            continue;
          }
        }

        // Create new price item
        const priceItem = new this.priceItemModel({
          sku,
          name: product.name,
          description: product.description || '',
          baseCost: product.baseCost,
          unit: product.unit || 'ea',
          defaultMarginPct,
          vendorId,
          workspaceId,
          tags: product.tags || [],
          inventoryQty: 0,
        });

        await priceItem.save();
        this.logger.debug(`Saved product: ${product.name} (${sku})`);
      } catch (error) {
        this.logger.error(`Failed to save product ${product.name}: ${error.message}`);
      }
    }
  }

  /**
   * Generate a simple SKU from product name
   */
  private generateSKU(name: string): string {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10)
      .padEnd(6, '0');
  }

  /**
   * Advanced text processing for complex PDF layouts
   */
  private processComplexLayout(text: string): ParsedProduct[] {
    // This could be enhanced with:
    // - Table detection algorithms
    // - OCR for scanned PDFs
    // - Machine learning for pattern recognition
    // - Multi-column layout parsing

    this.logger.debug('Processing complex PDF layout (basic implementation)');

    // For now, return basic parsing results
    return this.parseProductsFromText(text);
  }

  /**
   * Validate PDF file before processing
   */
  async validatePDFFile(filePath: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return { valid: false, error: 'PDF file not found' };
      }

      // Check file size (max 50MB)
      const stats = fs.statSync(filePath);
      if (stats.size > 50 * 1024 * 1024) {
        return { valid: false, error: 'PDF file too large (max 50MB)' };
      }

      // Try to parse PDF to ensure it's valid
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);

      if (pdfData.numpages === 0) {
        return { valid: false, error: 'PDF contains no pages' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: `Invalid PDF file: ${error.message}` };
    }
  }
}
