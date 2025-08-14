import { Body, Controller, Get, Post, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { VoiceAgentService } from './voice-agent.service';

interface OutboundCallDto { to: string; agentId?: string; }

@Controller('voice-agent')
export class VoiceAgentController {
  constructor(private voiceAgent: VoiceAgentService) {}

  @Post('outbound')
  async createOutbound(@Body() body: OutboundCallDto) {
    if (!body.to) throw new HttpException('Destination number required', HttpStatus.BAD_REQUEST);
    return this.voiceAgent.initiateOutboundCall(body.to, body.agentId);
  }

  @Post('webhook')
  async inboundWebhook(@Res() res: Response) {
    const twiml = this.voiceAgent.generateInboundTwiML();
    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  }

  @Get('status')
  health() {
    return { ok: true, feature: 'voice-agent' };
  }
}
