import axios from 'axios';
import { ChatMessage, ChatResponse } from '../ai.service';
import { ChatProvider, ProviderMetadata } from './base.provider';

export class GeminiProvider implements ChatProvider {
  meta: ProviderMetadata;
  private apiKey?: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey;
    this.meta = {
      name: 'gemini',
      displayName: 'Google Gemini',
      model: model || process.env.GEMINI_MODEL || 'gemini-1.5-pro',
      enabled: !!apiKey,
      cost: { inputPer1K: 0.00035, outputPer1K: 0.0007 },
      qualityTier: 8.5,
    };
  }

  isEnabled() {
    return !!this.apiKey;
  }

  async chat(
    messages: ChatMessage[],
    opts: { temperature?: number; maxTokens?: number }
  ): Promise<ChatResponse> {
    if (!this.apiKey) {
      const lastUser = [...messages].reverse().find(m => m.role === 'user');
      return {
        reply: `Gemini disabled. You said: "${lastUser?.content?.slice(0, 120)}"`,
        model: this.meta.model,
        provider: this.meta.name,
      } as ChatResponse;
    }
    const system = messages.find(m => m.role === 'system');
    const rest = messages.filter(m => m.role !== 'system');
    try {
      const resp = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.meta.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text:
                    (system ? system.content + '\n' : '') +
                    rest.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n'),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: opts.temperature ?? 0.6,
            maxOutputTokens: opts.maxTokens ?? 512,
          },
        }
      );
      const candidate = resp.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply.';
      return {
        reply: candidate,
        model: this.meta.model,
        usage: { inputTokens: undefined, outputTokens: undefined },
        provider: this.meta.name,
      } as ChatResponse;
    } catch (e: any) {
      throw new Error('Gemini chat error: ' + (e.response?.data?.error?.message || e.message));
    }
  }
}
