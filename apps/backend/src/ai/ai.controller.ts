import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AiService, ChatMessage } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface ChatRequestDto { messages: ChatMessage[] }

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private ai: AiService) {}

  @Post('chat')
  async chat(@Body() body: ChatRequestDto) {
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const reply = await this.ai.chat(messages);
    return reply;
  }

  @Get('status')
  status() {
    return this.ai.status();
  }
}
