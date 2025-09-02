import axios from 'axios';
import { ChatMessage, ChatResponse } from '../ai.service';
import { ChatProvider, ProviderMetadata } from './base.provider';

export class OpenAIProvider implements ChatProvider {
  meta: ProviderMetadata;
  private apiKey?: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey;
    this.meta = {
      name: 'openai',
      displayName: 'OpenAI',
      model: model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      enabled: !!apiKey,
      cost: { inputPer1K: 0.0005, outputPer1K: 0.0015 },
      qualityTier: 9,
    };
  }

  isEnabled() {
    return !!this.apiKey;
  }

  async chat(
    messages: ChatMessage[],
    opts: { temperature?: number; maxTokens?: number }
  ): Promise<ChatResponse> {
    if (!this.apiKey) throw new Error('OpenAI API key missing');
    const system = messages.find(m => m.role === 'system');
    const rest = messages.filter(m => m.role !== 'system');
    try {
      const resp = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.meta.model,
          messages: [
            system ? { role: 'system', content: system.content } : undefined,
            ...rest.map(m => ({ role: m.role, content: m.content })),
          ].filter(Boolean),
          temperature: opts.temperature ?? 0.6,
          max_tokens: opts.maxTokens ?? 512,
        },
        { headers: { Authorization: `Bearer ${this.apiKey}` } }
      );
      const choice = resp.data.choices?.[0]?.message?.content || 'No reply produced.';
      return {
        reply: choice,
        model: this.meta.model,
        usage: {
          inputTokens: resp.data.usage?.prompt_tokens,
          outputTokens: resp.data.usage?.completion_tokens,
        },
        provider: this.meta.name,
      };
    } catch (e: any) {
      throw new Error('OpenAI chat error: ' + (e.response?.data?.error?.message || e.message));
    }
  }
}
