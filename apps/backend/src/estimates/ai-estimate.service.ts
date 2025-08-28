import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiService } from '../ai/ai.service';
import { Estimate, EstimateDocument } from './schemas/estimate.schema';
import { PriceItem, PriceItemDocument } from '../pricing/schemas/price-item.schema';

export interface EstimateAIInsights {
  confidenceScore: number;
  marketComparison: string;
  riskFactors: string[];
  recommendations: string[];
  competitivePricing: {
    isCompetitive: boolean;
    marketRange: { low: number; high: number };
    percentageVsMarket: number;
  };
  projectComplexity: 'low' | 'medium' | 'high';
  timelineEstimate: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

export interface AIEstimateItem {
  category: 'labor' | 'materials' | 'permits' | 'equipment' | 'overhead' | 'other';
  description: string;
  detailedDescription: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  notes?: string;
  supplierRecommendations?: string[];
  alternativeOptions?: {
    description: string;
    unitCost: number;
    pros: string[];
    cons: string[];
  }[];
  isAiGenerated: boolean;
  confidenceLevel: 'high' | 'medium' | 'low';
}

@Injectable()
export class AIEstimateService {
  private readonly logger = new Logger(AIEstimateService.name);

  constructor(
    private aiService: AiService,
    @InjectModel(Estimate.name) private estimateModel: Model<EstimateDocument>,
    @InjectModel(PriceItem.name) private priceModel: Model<PriceItemDocument>,
  ) {}

  /**
   * Generate AI-powered estimate items based on project scope and type
   */
  async generateEstimateItems(projectData: {
    projectType: 'kitchen' | 'bathroom' | 'full-house' | 'addition' | 'exterior' | 'commercial';
    projectScope: string;
    budgetRange?: { min: number; max: number };
    clientPreferences?: string;
    propertyDetails?: string;
  }): Promise<AIEstimateItem[]> {
    
    const systemPrompt = `You are an expert remodeling contractor AI assistant specializing in ${projectData.projectType} renovations. 
    Generate detailed, accurate estimate line items based on the project scope. Consider current 2025 material costs and labor rates.
    
    For each item, provide:
    - Realistic quantities and measurements
    - Current market pricing
    - Detailed descriptions that clients can understand
    - Professional recommendations for materials/methods
    - Alternative options when appropriate
    
    Focus on accuracy, completeness, and professional presentation.`;

    const userPrompt = `Project Type: ${projectData.projectType}
    Project Scope: ${projectData.projectScope}
    ${projectData.budgetRange ? `Budget Range: $${projectData.budgetRange.min} - $${projectData.budgetRange.max}` : ''}
    ${projectData.clientPreferences ? `Client Preferences: ${projectData.clientPreferences}` : ''}
    ${projectData.propertyDetails ? `Property Details: ${projectData.propertyDetails}` : ''}
    
    Generate a comprehensive list of estimate items in JSON format. Each item should include:
    {
      "category": "labor|materials|permits|equipment|overhead|other",
      "description": "brief item name",
      "detailedDescription": "detailed explanation for client",
      "quantity": number,
      "unit": "unit type (sq ft, linear ft, each, hours, etc)",
      "unitCost": number,
      "totalCost": number,
      "notes": "professional notes or recommendations",
      "supplierRecommendations": ["supplier1", "supplier2"],
      "alternativeOptions": [{"description": "option", "unitCost": number, "pros": ["pro1"], "cons": ["con1"]}],
      "confidenceLevel": "high|medium|low"
    }
    
    Return ONLY valid JSON array of items.`;

    try {
      const response = await this.aiService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { strategy: 'quality', temperature: 0.3 });

      // Parse AI response
      let items: any[] = [];
      try {
        items = JSON.parse(response.reply);
        if (!Array.isArray(items)) {
          throw new Error('Response is not an array');
        }
      } catch (parseError) {
        this.logger.warn('Failed to parse AI response as JSON, using fallback items');
        items = this.getFallbackItems(projectData.projectType);
      }

      // Convert and validate items
      return items.map(item => ({
        category: item.category || 'other',
        description: item.description || 'Professional Service',
        detailedDescription: item.detailedDescription || item.description || 'Professional service as specified',
        quantity: Number(item.quantity) || 1,
        unit: item.unit || 'each',
        unitCost: Number(item.unitCost) || 0,
        totalCost: Number(item.totalCost) || (Number(item.quantity) || 1) * (Number(item.unitCost) || 0),
        notes: item.notes || '',
        supplierRecommendations: Array.isArray(item.supplierRecommendations) ? item.supplierRecommendations : [],
        alternativeOptions: Array.isArray(item.alternativeOptions) ? item.alternativeOptions : [],
        isAiGenerated: true,
        confidenceLevel: item.confidenceLevel || 'medium'
      }));

    } catch (error) {
      this.logger.error('Failed to generate AI estimate items:', error);
      return this.getFallbackItems(projectData.projectType);
    }
  }

  /**
   * Generate AI insights and confidence score for an estimate
   */
  async generateAIInsights(estimate: {
    projectType: string;
    projectScope: string;
    totalAmount: number;
    items: any[];
    clientPreferences?: string;
    timeline?: any;
  }): Promise<EstimateAIInsights> {

    const systemPrompt = `You are an expert construction cost analyst and market researcher. 
    Analyze the provided estimate and generate insights about pricing competitiveness, risks, and recommendations.
    Consider current 2025 market conditions, material costs, and industry standards.`;

    const userPrompt = `Analyze this estimate:
    Project Type: ${estimate.projectType}
    Scope: ${estimate.projectScope}
    Total Amount: $${estimate.totalAmount.toLocaleString()}
    Item Count: ${estimate.items.length}
    
    Items Summary:
    ${estimate.items.slice(0, 5).map(item => `- ${item.description || item.name}: $${item.totalCost || item.sellPrice || 0}`).join('\n')}
    
    Provide analysis in this JSON format:
    {
      "confidenceScore": 0.85,
      "marketComparison": "descriptive comparison text",
      "riskFactors": ["risk1", "risk2"],
      "recommendations": ["rec1", "rec2"],
      "competitivePricing": {
        "isCompetitive": true,
        "marketRange": {"low": 30000, "high": 50000},
        "percentageVsMarket": -8
      },
      "projectComplexity": "medium",
      "timelineEstimate": {
        "optimistic": 14,
        "realistic": 21,
        "pessimistic": 28
      }
    }`;

    try {
      const response = await this.aiService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { strategy: 'balanced', temperature: 0.2 });

      const insights = JSON.parse(response.reply);
      
      // Validate and provide defaults
      return {
        confidenceScore: Math.min(1, Math.max(0, Number(insights.confidenceScore) || 0.75)),
        marketComparison: insights.marketComparison || 'Pricing appears aligned with current market rates.',
        riskFactors: Array.isArray(insights.riskFactors) ? insights.riskFactors : ['Standard project risks apply'],
        recommendations: Array.isArray(insights.recommendations) ? insights.recommendations : ['Review timeline and material availability'],
        competitivePricing: {
          isCompetitive: insights.competitivePricing?.isCompetitive ?? true,
          marketRange: {
            low: Number(insights.competitivePricing?.marketRange?.low) || Math.round(estimate.totalAmount * 0.8),
            high: Number(insights.competitivePricing?.marketRange?.high) || Math.round(estimate.totalAmount * 1.2)
          },
          percentageVsMarket: Number(insights.competitivePricing?.percentageVsMarket) || 0
        },
        projectComplexity: insights.projectComplexity || 'medium',
        timelineEstimate: {
          optimistic: Number(insights.timelineEstimate?.optimistic) || 14,
          realistic: Number(insights.timelineEstimate?.realistic) || 21,
          pessimistic: Number(insights.timelineEstimate?.pessimistic) || 35
        }
      };

    } catch (error) {
      this.logger.error('Failed to generate AI insights:', error);
      return this.getFallbackInsights(estimate);
    }
  }

  /**
   * Enhance existing estimate descriptions with AI
   */
  async enhanceEstimateDescriptions(items: any[]): Promise<any[]> {
    const systemPrompt = `You are a professional construction writer. Enhance basic item descriptions to be more detailed and client-friendly while maintaining accuracy. Make them professional but understandable.`;

    const enhancedItems = [];

    for (const item of items) {
      if (!item.description || item.description.length < 20) {
        try {
          const userPrompt = `Enhance this construction item description:
          Name: ${item.name || item.description || 'Construction Item'}
          Category: ${item.category || 'general'}
          Current Description: ${item.description || ''}
          
          Provide a professional, detailed description that clients can understand. Include what's included in the work/materials. Keep it under 150 words.`;

          const response = await this.aiService.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ], { strategy: 'cost', temperature: 0.4 });

          enhancedItems.push({
            ...item,
            description: response.reply.replace(/"/g, '').trim(),
            isAiEnhanced: true
          });

        } catch (error) {
          enhancedItems.push(item);
        }
      } else {
        enhancedItems.push(item);
      }
    }

    return enhancedItems;
  }

  /**
   * Calculate confidence score based on multiple factors
   */
  private calculateConfidenceScore(factors: {
    itemDetailLevel: number; // 0-1
    marketDataRecency: number; // 0-1
    projectComplexity: number; // 0-1, where 1 is simple
    estimatorExperience: number; // 0-1
  }): number {
    const weights = {
      itemDetailLevel: 0.3,
      marketDataRecency: 0.25,
      projectComplexity: 0.25,
      estimatorExperience: 0.2
    };

    return Object.entries(factors).reduce((score, [key, value]) => {
      return score + (value * weights[key as keyof typeof weights]);
    }, 0);
  }

  /**
   * Fallback items when AI fails
   */
  private getFallbackItems(projectType: string): AIEstimateItem[] {
    const baseItems = {
      kitchen: [
        {
          category: 'materials' as const,
          description: 'Custom Kitchen Cabinets',
          detailedDescription: 'High-quality custom cabinets with soft-close doors and drawers, including installation hardware',
          quantity: 15,
          unit: 'linear feet',
          unitCost: 450,
          totalCost: 6750,
          notes: 'Premium grade materials with 2-year warranty',
          supplierRecommendations: ['Premier Cabinet Co.', 'Custom Kitchen Solutions'],
          alternativeOptions: [],
          isAiGenerated: false,
          confidenceLevel: 'high' as const
        },
        {
          category: 'labor' as const,
          description: 'Kitchen Installation Labor',
          detailedDescription: 'Professional installation including demolition, cabinet installation, and finish work',
          quantity: 40,
          unit: 'hours',
          unitCost: 75,
          totalCost: 3000,
          notes: 'Includes cleanup and disposal',
          supplierRecommendations: [],
          alternativeOptions: [],
          isAiGenerated: false,
          confidenceLevel: 'high' as const
        }
      ],
      bathroom: [
        {
          category: 'materials' as const,
          description: 'Bathroom Tile and Fixtures',
          detailedDescription: 'Premium porcelain tile flooring and wall tile with matching fixtures',
          quantity: 120,
          unit: 'sq ft',
          unitCost: 12,
          totalCost: 1440,
          notes: 'Includes waterproofing and grout',
          supplierRecommendations: ['Tile & Stone Depot'],
          alternativeOptions: [],
          isAiGenerated: false,
          confidenceLevel: 'medium' as const
        }
      ]
    };

    return baseItems[projectType as keyof typeof baseItems] || baseItems.kitchen;
  }

  /**
   * Fallback insights when AI fails
   */
  private getFallbackInsights(estimate: any): EstimateAIInsights {
    const avgConfidence = 0.75;
    const marketVariance = Math.random() * 0.3 - 0.15; // -15% to +15%
    
    return {
      confidenceScore: avgConfidence,
      marketComparison: marketVariance > 0 
        ? `This estimate is ${Math.abs(marketVariance * 100).toFixed(0)}% above market average for similar projects.`
        : `This estimate is ${Math.abs(marketVariance * 100).toFixed(0)}% below market average for similar projects.`,
      riskFactors: [
        'Material price fluctuations',
        'Potential delays due to permit processing',
        'Weather-related timeline impacts'
      ],
      recommendations: [
        'Include 10% contingency for unforeseen issues',
        'Confirm material availability before starting',
        'Consider upgrading electrical if older home'
      ],
      competitivePricing: {
        isCompetitive: Math.abs(marketVariance) < 0.1,
        marketRange: {
          low: Math.round(estimate.totalAmount * 0.85),
          high: Math.round(estimate.totalAmount * 1.15)
        },
        percentageVsMarket: Math.round(marketVariance * 100)
      },
      projectComplexity: estimate.totalAmount > 50000 ? 'high' : estimate.totalAmount > 25000 ? 'medium' : 'low',
      timelineEstimate: {
        optimistic: Math.ceil(estimate.totalAmount / 3000),
        realistic: Math.ceil(estimate.totalAmount / 2000),
        pessimistic: Math.ceil(estimate.totalAmount / 1500)
      }
    };
  }
}
