import axios from 'axios';
import { ChatMessage, ChatResponse } from '../ai.service';
import { ChatProvider, ProviderMetadata } from './base.provider';

// XAI (Grok) provider
export class XAIProvider implements ChatProvider {
  meta: ProviderMetadata;
  private apiKey?: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey;
    this.meta = {
      name: 'xai',
      displayName: 'XAI Grok',
      model: model || process.env.XAI_MODEL || 'grok-beta',
      enabled: !!apiKey,
      cost: { inputPer1K: 0.0006, outputPer1K: 0.0012 },
      qualityTier: 8.8,
    };
  }

  isEnabled() {
    return !!this.apiKey;
  }

  async chat(
    messages: ChatMessage[],
    opts: { temperature?: number; maxTokens?: number }
  ): Promise<ChatResponse> {
    if (!this.apiKey) throw new Error('XAI API key missing');
    const system = messages.find(m => m.role === 'system');
    const rest = messages.filter(m => m.role !== 'system');
    try {
      const resp = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: this.meta.model,
          messages: [
            system ? { role: 'system', content: system.content } : undefined,
            ...rest,
          ].filter(Boolean),
          temperature: opts.temperature ?? 0.6,
          max_tokens: opts.maxTokens ?? 512,
        },
        { headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' } }
      );
      const text = resp.data?.choices?.[0]?.message?.content || 'No reply.';
      return {
        reply: text,
        model: this.meta.model,
        usage: {
          inputTokens: resp.data?.usage?.prompt_tokens,
          outputTokens: resp.data?.usage?.completion_tokens,
        },
        provider: this.meta.name,
      };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      const apiError = axios.isAxiosError(e) ? e.response?.data?.error?.message : errorMessage;
      throw new Error('XAI chat error: ' + (apiError || errorMessage));
    }
  }
}
