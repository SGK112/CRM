import axios from 'axios';
import { ChatMessage, ChatResponse } from '../ai.service';
import { ChatProvider, ProviderMetadata } from './base.provider';

export class AnthropicProvider implements ChatProvider {
  meta: ProviderMetadata;
  private apiKey?: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey;
    this.meta = {
      name: 'anthropic',
      displayName: 'Anthropic',
      model: model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620',
      enabled: !!apiKey,
      cost: { inputPer1K: 0.0008, outputPer1K: 0.0024 },
      qualityTier: 9.5,
    };
  }

  isEnabled() {
    return !!this.apiKey;
  }

  async chat(
    messages: ChatMessage[],
    opts: { temperature?: number; maxTokens?: number }
  ): Promise<ChatResponse> {
    if (!this.apiKey) throw new Error('Anthropic API key missing');
    const system = messages.find(m => m.role === 'system');
    const userAssistantSequence = messages.filter(m => m.role !== 'system');
    try {
      const resp = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.meta.model,
          system: system?.content,
          max_tokens: opts.maxTokens ?? 512,
          temperature: opts.temperature ?? 0.6,
          messages: userAssistantSequence.map(m => ({ role: m.role, content: m.content })),
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      );
      const text = resp.data.content?.[0]?.text || 'No reply.';
      return {
        reply: text,
        model: this.meta.model,
        usage: {
          inputTokens: resp.data.usage?.input_tokens,
          outputTokens: resp.data.usage?.output_tokens,
        },
        provider: this.meta.name,
      };
    } catch (e: any) {
      throw new Error('Anthropic chat error: ' + (e.response?.data?.error?.message || e.message));
    }
  }
}
