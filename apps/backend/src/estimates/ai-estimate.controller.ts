import { Controller, Post, Body, UseGuards, Get, Param, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIEstimateService, EstimateAIInsights, AIEstimateItem } from './ai-estimate.service';

interface GenerateEstimateItemsDto {
  projectType: 'kitchen' | 'bathroom' | 'full-house' | 'addition' | 'exterior' | 'commercial';
  projectScope: string;
  budgetRange?: { min: number; max: number };
  clientPreferences?: string;
  propertyDetails?: string;
}

interface GenerateInsightsDto {
  projectType: string;
  projectScope: string;
  totalAmount: number;
  items: any[];
  clientPreferences?: string;
  timeline?: any;
}

interface EnhanceDescriptionsDto {
  items: any[];
}

@Controller('ai/estimates')
export class AIEstimateController {
  constructor(private aiEstimateService: AIEstimateService) {}

  /**
   * Generate AI-powered estimate items
   */
  @Post('generate-items')
  @UseGuards(JwtAuthGuard)
  async generateEstimateItems(
    @Body() dto: GenerateEstimateItemsDto,
    @Request() req: any
  ): Promise<{ items: AIEstimateItem[] }> {
    const items = await this.aiEstimateService.generateEstimateItems(dto);
    return { items };
  }

  /**
   * Generate AI insights for an estimate
   */
  @Post('generate-insights')
  @UseGuards(JwtAuthGuard)
  async generateInsights(
    @Body() dto: GenerateInsightsDto,
    @Request() req: any
  ): Promise<{ insights: EstimateAIInsights }> {
    const insights = await this.aiEstimateService.generateAIInsights(dto);
    return { insights };
  }

  /**
   * Enhance existing estimate descriptions with AI
   */
  @Post('enhance-descriptions')
  @UseGuards(JwtAuthGuard)
  async enhanceDescriptions(
    @Body() dto: EnhanceDescriptionsDto,
    @Request() req: any
  ): Promise<{ items: any[] }> {
    const items = await this.aiEstimateService.enhanceEstimateDescriptions(dto.items);
    return { items };
  }

  /**
   * Get market analysis for project type and scope
   */
  @Post('market-analysis')
  @UseGuards(JwtAuthGuard)
  async getMarketAnalysis(
    @Body() dto: { projectType: string; projectScope: string; location?: string },
    @Request() req: any
  ): Promise<{ analysis: any }> {
    // This could integrate with real market data APIs
    return {
      analysis: {
        averageCost: 35000,
        costRange: { low: 25000, high: 55000 },
        marketTrends: 'Kitchen renovation costs have increased 8% year-over-year',
        regionalFactors: 'Local market shows high demand for premium finishes',
        recommendations: [
          'Consider value-engineering options for cost-conscious clients',
          'Premium appliances add significant resale value',
          'Timeline may be extended due to high contractor demand'
        ]
      }
    };
  }

  /**
   * Get AI-powered project timeline estimation
   */
  @Post('timeline-estimate')
  @UseGuards(JwtAuthGuard)
  async getTimelineEstimate(
    @Body() dto: { projectType: string; projectScope: string; totalAmount: number },
    @Request() req: any
  ): Promise<{ timeline: any }> {
    const complexity = dto.totalAmount > 50000 ? 'high' : dto.totalAmount > 25000 ? 'medium' : 'low';
    
    const baseWeeks = {
      low: { optimistic: 2, realistic: 3, pessimistic: 5 },
      medium: { optimistic: 4, realistic: 6, pessimistic: 10 },
      high: { optimistic: 8, realistic: 12, pessimistic: 18 }
    };

    return {
      timeline: {
        ...baseWeeks[complexity],
        complexity,
        phases: [
          { name: 'Planning & Permits', duration: 1, dependencies: [] },
          { name: 'Demolition', duration: 1, dependencies: ['Planning & Permits'] },
          { name: 'Rough Work', duration: 2, dependencies: ['Demolition'] },
          { name: 'Finish Work', duration: 2, dependencies: ['Rough Work'] },
          { name: 'Final Details', duration: 1, dependencies: ['Finish Work'] }
        ],
        riskFactors: [
          'Permit approval delays',
          'Material availability',
          'Weather conditions',
          'Change orders'
        ]
      }
    };
  }
}
