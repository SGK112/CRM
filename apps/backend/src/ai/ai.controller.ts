import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AiService, ChatMessage, ChatOptions } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface ChatRequestDto {
  messages: ChatMessage[];
  strategy?: ChatOptions['strategy'];
  provider?: string;
  temperature?: number;
  maxTokens?: number;
}

@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  async chat(@Body() body: ChatRequestDto) {
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const { strategy, provider, temperature, maxTokens } = body;
    return this.ai.chat(messages, { strategy, provider, temperature, maxTokens });
  }

  @Post('demo-chat')
  async demoChat(@Body() body: ChatRequestDto) {
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const { strategy, provider, temperature, maxTokens } = body;

    // Add context about kitchen bidding for demo
    const contextualMessages = [
      {
        role: 'system' as const,
        content: `You are an AI assistant for a remodeling CRM. Help with kitchen remodeling business strategies. 
        Context: The user is asking about bidding more kitchens this month. Provide practical advice about:
        - Lead generation strategies
        - Competitive bidding approaches
        - Marketing tactics for kitchen remodeling
        - Client relationship management
        - Pricing strategies
        Be specific and actionable.`,
      },
      ...messages,
    ];

    return this.ai.chat(contextualMessages, { strategy, provider, temperature, maxTokens });
  }

  @Get('status')
  status() {
    return this.ai.status();
  }
}
