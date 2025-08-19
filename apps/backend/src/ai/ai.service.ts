import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatProvider } from './providers/base.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GeminiProvider } from './providers/gemini.provider';

export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string; }
export interface ChatResponse { reply: string; model: string; provider?: string; usage?: { inputTokens?: number; outputTokens?: number }; fallbackTried?: string[]; errorChain?: { provider: string; error: string }[]; cacheHit?: boolean; }
export interface ChatOptions { strategy?: 'cost' | 'quality' | 'balanced' | 'specific'; provider?: string; temperature?: number; maxTokens?: number; }
interface CacheEntry { response: ChatResponse; expires: number; }

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private providers: ChatProvider[] = [];
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 30000;

  constructor(private config: ConfigService) { this.bootstrapProviders(); }

  private bootstrapProviders() {
    this.providers = [
      new GeminiProvider(this.config.get<string>('GEMINI_API_KEY') || this.config.get<string>('GOOGLE_API_KEY'), this.config.get<string>('GEMINI_MODEL')),
      new OpenAIProvider(this.config.get<string>('OPENAI_API_KEY'), this.config.get<string>('OPENAI_MODEL')),
      new AnthropicProvider(this.config.get<string>('ANTHROPIC_API_KEY'), this.config.get<string>('ANTHROPIC_MODEL')),
    ];
    this.logger.log('AI providers: ' + this.providers.map(p=> `${p.meta.name}:${p.isEnabled()?'on':'off'}`).join(', '));
  }

  status() { return { providers: this.providers.map(p=> ({ name: p.meta.name, displayName: p.meta.displayName, model: p.meta.model, enabled: p.isEnabled(), cost: p.meta.cost, qualityTier: p.meta.qualityTier })) }; }

  private buildCacheKey(messages: ChatMessage[], opts: ChatOptions) {
    const lastUser = [...messages].reverse().find(m=> m.role==='user');
    const system = messages.find(m=> m.role==='system');
    return JSON.stringify({ s: system?.content?.slice(0,120), u: lastUser?.content?.slice(0,400), strat: opts.strategy, prov: opts.provider, temp: opts.temperature });
  }
  private getEnabledProviders() { return this.providers.filter(p=> p.isEnabled()); }
  private orderProviders(strategy: ChatOptions['strategy'], explicit?: string): ChatProvider[] {
    const enabled = this.getEnabledProviders();
    if (explicit) return enabled.filter(p=> p.meta.name === explicit);
    switch (strategy) {
      case 'cost': return enabled.sort((a,b)=> (a.meta.cost!.inputPer1K + a.meta.cost!.outputPer1K) - (b.meta.cost!.inputPer1K + b.meta.cost!.outputPer1K));
      case 'quality': return enabled.sort((a,b)=> (b.meta.qualityTier! - a.meta.qualityTier!));
      case 'balanced': {
        const byQ = [...enabled].sort((a,b)=> (b.meta.qualityTier! - a.meta.qualityTier!));
        const slice = byQ.slice(0, Math.max(1, Math.ceil(byQ.length/2)));
        return slice.sort((a,b)=> (a.meta.cost!.inputPer1K + a.meta.cost!.outputPer1K) - (b.meta.cost!.inputPer1K + b.meta.cost!.outputPer1K));
      }
      default: return enabled;
    }
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    const strategy = options.strategy || (options.provider ? 'specific' : 'balanced');
    const candidates = this.orderProviders(strategy, options.provider);
    if (!candidates.length) {
      const lastUser = [...messages].reverse().find(m=> m.role==='user');
      return { reply: `AI disabled (no providers configured). You said: "${lastUser?.content?.slice(0,140)}"`, model: 'offline', provider: 'none' };
    }
    const cacheKey = this.buildCacheKey(messages, { strategy, provider: options.provider, temperature: options.temperature });
    const cached = this.cache.get(cacheKey); if (cached && cached.expires > Date.now()) return { ...cached.response, cacheHit: true };
    const errors: { provider: string; error: string }[] = [];
    for (const p of candidates) {
      try {
        const start = Date.now();
        const resp = await p.chat(messages, { temperature: options.temperature, maxTokens: options.maxTokens });
        const out: ChatResponse = { ...resp, fallbackTried: errors.map(e=> e.provider), provider: p.meta.name };
        this.cache.set(cacheKey, { response: out, expires: Date.now() + this.CACHE_TTL_MS });
        const elapsed = Date.now() - start; if (elapsed > 4000) this.logger.warn(`Provider ${p.meta.name} slow: ${elapsed}ms`);
        return out;
      } catch (e:any) {
        errors.push({ provider: p.meta.name, error: e.message || 'error' });
        this.logger.warn(`Provider ${p.meta.name} failed: ${e.message}`);
      }
    }
    return { reply: 'All AI providers failed. Try again later.', model: 'unavailable', provider: 'none', errorChain: errors };
  }
}
