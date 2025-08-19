import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AiService, ChatMessage, ChatOptions } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface ChatRequestDto { messages: ChatMessage[]; strategy?: ChatOptions['strategy']; provider?: string; temperature?: number; maxTokens?: number; }

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private ai: AiService) {}

  @Post('chat')
  async chat(@Body() body: ChatRequestDto) {
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const { strategy, provider, temperature, maxTokens } = body;
    return this.ai.chat(messages, { strategy, provider, temperature, maxTokens });
  }

  @Get('status')
  status() {
    return this.ai.status();
  }
}
