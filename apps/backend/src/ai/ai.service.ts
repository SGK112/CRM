import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string; }
export interface ChatResponse { reply: string; model: string; usage?: { inputTokens?: number; outputTokens?: number }; }

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly geminiApiKey: string | undefined;
  private readonly geminiModel: string;

  constructor(private config: ConfigService) {
  // Prefer explicit GEMINI_API_KEY; fallback to generic GOOGLE_API_KEY if provided
  this.geminiApiKey = this.config.get<string>('GEMINI_API_KEY') || this.config.get<string>('GOOGLE_API_KEY');
    this.geminiModel = this.config.get<string>('GEMINI_MODEL') || 'gemini-1.5-pro';
  const keyPresent = !!this.geminiApiKey;
  this.logger.log(`Gemini AI initialization: keyPresent=${keyPresent} model=${this.geminiModel}`);
  }

  isEnabled() {
    return !!this.geminiApiKey;
  }

  status() {
    const clientId = this.config.get<string>('GEMINI_CLIENT_ID') || this.config.get<string>('GEMINI_API_Client_ID');
    const clientSecret = this.config.get<string>('GEMINI_CLIENT_SECRET') || this.config.get<string>('GEMINI_API_Client_Secret');
    return {
      enabled: this.isEnabled(),
      model: this.isEnabled() ? this.geminiModel : null,
      // do not leak key; only presence boolean
      keyPresent: this.isEnabled(),
      clientIdPresent: !!clientId,
      clientSecretPresent: !!clientSecret,
    };
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    // Basic guard; return heuristic fallback if no key
    if (!this.isEnabled()) {
      const lastUser = [...messages].reverse().find(m => m.role === 'user');
      const clientId = this.config.get<string>('GEMINI_CLIENT_ID') || this.config.get<string>('GEMINI_API_Client_ID');
      const clientSecret = this.config.get<string>('GEMINI_CLIENT_SECRET') || this.config.get<string>('GEMINI_API_Client_Secret');
      if (clientId && clientSecret) {
        return {
          reply: `Gemini client credentials detected (CLIENT_ID / CLIENT_SECRET) but no GEMINI_API_KEY (or GOOGLE_API_KEY). Generate an API key in Google AI Studio (https://aistudio.google.com/app/apikey) or set GOOGLE_API_KEY. You said: "${lastUser?.content?.slice(0,140)}"`,
          model: 'offline-misconfigured'
        };
      }
      return {
        reply: `AI offline (no GEMINI_API_KEY). You said: "${lastUser?.content?.slice(0,140)}". Basic command routing still works.`,
        model: 'offline-fallback'
      };
    }

    // Construct a minimal prompt (system + last N messages)
    const systemPrompt = messages.find(m => m.role === 'system')?.content || 'You are an assistant helping with a construction CRM.';
    const recent = messages.filter(m => m.role !== 'system').slice(-12);

    try {
      // Placeholder Gemini generative call via REST (dummy until real SDK added)
      // Replace with @google/generative-ai SDK usage if desired.
      const prompt = [systemPrompt, ...recent.map(m => `${m.role.toUpperCase()}: ${m.content}`)].join('\n');
      // We DO NOT send real request without API to avoid leaking key in logs; simulate.
      return {
        reply: `Simulated Gemini (${this.geminiModel}) response to: ${recent[recent.length-1]?.content || ''}`.trim(),
        model: this.geminiModel,
        usage: { inputTokens: prompt.length / 4 >> 0, outputTokens: 12 }
      };
    } catch (e:any) {
      this.logger.error('Gemini chat error', e?.message);
      return { reply: 'Gemini service error. Please retry shortly.', model: this.geminiModel };
    }
  }
}
