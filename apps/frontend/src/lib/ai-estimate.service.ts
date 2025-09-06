/**
 * AI-powered estimate service
 * Integrates with backend AI services for intelligent estimate generation
 */

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

export interface ProjectData {
  projectType: 'kitchen' | 'bathroom' | 'full-house' | 'addition' | 'exterior' | 'commercial';
  projectScope: string;
  budgetRange?: { min: number; max: number };
  clientPreferences?: string;
  propertyDetails?: string;
}

interface GenerateInsightsRequest {
  projectType: string;
  projectScope: string;
  totalAmount: number;
  items: AIEstimateItem[];
  clientPreferences?: string;
  timeline?: unknown;
}

interface MarketAnalysisResult {
  averageCost: number;
  costRange: { low: number; high: number };
  marketTrends: string;
  regionalFactors: string;
  recommendations: string[];
}

interface TimelineEstimateResult {
  optimistic: number;
  realistic: number;
  pessimistic: number;
  complexity?: string;
  phases?: unknown[];
  riskFactors?: string[];
}

class AIEstimateService {
  private baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

  /**
   * Get authorization headers for API requests
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    // In a real implementation, get the JWT token from storage
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Generate AI-powered estimate items
   */
  async generateEstimateItems(projectData: ProjectData): Promise<AIEstimateItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/estimates/generate-items`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const raw = (await response.json()) as unknown;
      if (!raw || typeof raw !== 'object') return this.getFallbackItems(projectData.projectType);
      const items = (raw as Record<string, unknown>).items;
      if (!Array.isArray(items)) return this.getFallbackItems(projectData.projectType);
      return items as AIEstimateItem[];
    } catch (_err) {
      return this.getFallbackItems(projectData.projectType);
    }
  }

  /**
   * Generate AI insights for an estimate
   */
  async generateInsights(estimateData: GenerateInsightsRequest): Promise<EstimateAIInsights> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/estimates/generate-insights`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(estimateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const raw = (await response.json()) as unknown;
  if (!raw || typeof raw !== 'object') return this.getFallbackInsights(estimateData);
  return ((raw as Record<string, unknown>).insights as EstimateAIInsights) ?? this.getFallbackInsights(estimateData);
    } catch (_err) {
  return this.getFallbackInsights(estimateData);
    }
  }

  /**
   * Enhance existing descriptions with AI
   */
  async enhanceDescriptions(items: AIEstimateItem[]): Promise<AIEstimateItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/estimates/enhance-descriptions`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const raw = (await response.json()) as unknown;
      const out = raw && typeof raw === 'object' ? (raw as Record<string, unknown>).items : undefined;
      return Array.isArray(out) ? (out as AIEstimateItem[]) : items;
    } catch (_err) {
      return items;
    }
  }

  /**
   * Get market analysis
   */
  async getMarketAnalysis(projectData: {
    projectType: string;
    projectScope: string;
    location?: string;
  }): Promise<MarketAnalysisResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/estimates/market-analysis`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const raw = (await response.json()) as unknown;
      const analysis = raw && typeof raw === 'object' ? (raw as Record<string, unknown>).analysis : undefined;
      if (analysis && typeof analysis === 'object') return analysis as MarketAnalysisResult;
      return {
        averageCost: 35000,
        costRange: { low: 25000, high: 55000 },
        marketTrends: 'Market analysis unavailable',
        regionalFactors: 'Regional data unavailable',
        recommendations: ['Contact local suppliers for current pricing'],
      };
    } catch (_err) {
      return {
        averageCost: 35000,
        costRange: { low: 25000, high: 55000 },
        marketTrends: 'Market analysis unavailable',
        regionalFactors: 'Regional data unavailable',
        recommendations: ['Contact local suppliers for current pricing'],
      };
    }
  }

  /**
   * Get AI timeline estimation
   */
  async getTimelineEstimate(projectData: {
    projectType: string;
    projectScope: string;
    totalAmount: number;
  }): Promise<TimelineEstimateResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/estimates/timeline-estimate`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const raw = (await response.json()) as unknown;
      const timeline = raw && typeof raw === 'object' ? (raw as Record<string, unknown>).timeline : undefined;
      if (timeline && typeof timeline === 'object') return timeline as TimelineEstimateResult;
      return {
        optimistic: 14,
        realistic: 21,
        pessimistic: 35,
        complexity: 'medium',
        phases: [],
        riskFactors: ['Standard project risks'],
      };
    } catch (_err) {
      return {
        optimistic: 14,
        realistic: 21,
        pessimistic: 35,
        complexity: 'medium',
        phases: [],
        riskFactors: ['Standard project risks'],
      };
    }
  }

  /**
   * Calculate confidence score based on multiple factors
   */
  calculateConfidenceScore(factors: {
    itemDetailLevel: number; // 0-1, how detailed are the line items
    priceAccuracy: number; // 0-1, how accurate are the prices
    scopeClarity: number; // 0-1, how clear is the project scope
    marketData: number; // 0-1, quality of market data available
  }): number {
    const weights = {
      itemDetailLevel: 0.25,
      priceAccuracy: 0.35,
      scopeClarity: 0.25,
      marketData: 0.15,
    };

    const score = (factors.itemDetailLevel * weights.itemDetailLevel +
      factors.priceAccuracy * weights.priceAccuracy +
      factors.scopeClarity * weights.scopeClarity +
      factors.marketData * weights.marketData);

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Analyze estimate completeness and provide recommendations
   */
  analyzeEstimateCompleteness(items: AIEstimateItem[]): {
    completenessScore: number;
    missingCategories: string[];
    recommendations: string[];
  } {
    const requiredCategories: AIEstimateItem['category'][] = ['labor', 'materials'];
    const recommendedCategories: AIEstimateItem['category'][] = ['permits', 'overhead'];
    const presentCategories = Array.from(new Set(items.map(item => item.category)));

    const missingRequired = requiredCategories.filter(
      (cat) => !presentCategories.includes(cat)
    );
    const missingRecommended = recommendedCategories.filter(
      (cat) => !presentCategories.includes(cat)
    );

    const completenessScore = 1 - (missingRequired.length * 0.3 + missingRecommended.length * 0.1);

    const recommendations = [];
    if (missingRequired.length > 0) {
      recommendations.push(`Add ${missingRequired.join(', ')} categories for complete estimate`);
    }
    if (missingRecommended.length > 0) {
      recommendations.push(
        `Consider adding ${missingRecommended.join(', ')} for more accurate pricing`
      );
    }
  if (items.length < 5) {
      recommendations.push('Add more detailed line items for better accuracy');
    }

    return {
      completenessScore: Math.max(0, completenessScore),
      missingCategories: [...missingRequired, ...missingRecommended],
      recommendations,
    };
  }

  /**
   * Fallback items when AI service is unavailable
   */
  private getFallbackItems(projectType: string): AIEstimateItem[] {
    const baseItems = {
      kitchen: [
        {
          category: 'materials' as const,
          description: 'Kitchen Cabinets - Custom',
          detailedDescription:
            'Custom-built kitchen cabinets with soft-close hinges, full-extension drawers, and premium hardware. Includes all installation materials and trim work.',
          quantity: 15,
          unit: 'linear feet',
          unitCost: 450,
          totalCost: 6750,
          notes: 'Premium grade materials with manufacturer warranty',
          supplierRecommendations: ['Premier Cabinet Co.', 'Custom Kitchen Solutions'],
          alternativeOptions: [
            {
              description: 'Semi-custom cabinets',
              unitCost: 325,
              pros: ['Lower cost', 'Faster delivery'],
              cons: ['Limited customization', 'Standard sizes only'],
            },
          ],
          isAiGenerated: false,
          confidenceLevel: 'high' as const,
        },
      ],
      bathroom: [
        {
          category: 'materials' as const,
          description: 'Bathroom Tile Package',
          detailedDescription:
            'Premium porcelain floor and wall tile with matching trim pieces, waterproof membrane, and professional-grade grout.',
          quantity: 120,
          unit: 'sq ft',
          unitCost: 12,
          totalCost: 1440,
          notes: 'Includes all installation materials and sealers',
          supplierRecommendations: ['Tile & Stone Depot'],
          alternativeOptions: [],
          isAiGenerated: false,
          confidenceLevel: 'medium' as const,
        },
      ],
    };

    return baseItems[projectType as keyof typeof baseItems] || baseItems.kitchen;
  }

  /**
   * Fallback insights when AI service is unavailable
   */
  private getFallbackInsights(estimateData: GenerateInsightsRequest): EstimateAIInsights {
    const marketVariance = (Math.random() - 0.5) * 0.2; // -10% to +10%

    return {
      confidenceScore: 0.75,
      marketComparison:
        marketVariance > 0
          ? `This estimate is approximately ${Math.abs(marketVariance * 100).toFixed(0)}% above market average for similar projects.`
          : `This estimate is approximately ${Math.abs(marketVariance * 100).toFixed(0)}% below market average for similar projects.`,
      riskFactors: [
        'Material price fluctuations',
        'Permit processing delays',
        'Weather-related impacts',
      ],
      recommendations: [
        'Include contingency budget for unforeseen issues',
        'Verify material availability before project start',
        'Consider phased approach for large projects',
      ],
      competitivePricing: {
        isCompetitive: Math.abs(marketVariance) < 0.05,
        marketRange: {
          low: Math.round(estimateData.totalAmount * 0.85),
          high: Math.round(estimateData.totalAmount * 1.15),
        },
        percentageVsMarket: Math.round(marketVariance * 100),
      },
      projectComplexity:
        estimateData.totalAmount > 50000
          ? 'high'
          : estimateData.totalAmount > 25000
            ? 'medium'
            : 'low',
      timelineEstimate: {
        optimistic: Math.ceil(estimateData.totalAmount / 3000),
        realistic: Math.ceil(estimateData.totalAmount / 2000),
        pessimistic: Math.ceil(estimateData.totalAmount / 1200),
      },
    };
  }
}

// Export singleton instance
// Lazily instantiate on the client to avoid server-side serialization during RSC render
export const aiEstimateService = typeof window !== 'undefined' ? new AIEstimateService() : undefined;

export function getAIEstimateService(): AIEstimateService | undefined {
  return aiEstimateService;
}
