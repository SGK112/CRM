import { ChatMessage, ChatResponse } from '../ai.service';

export interface ProviderMetadata {
  name: string;
  displayName: string;
  model: string;
  enabled: boolean;
  cost?: { inputPer1K: number; outputPer1K: number }; // Approx costs (USD)
  qualityTier?: number; // Higher = better heuristic
}

export interface ChatProvider {
  meta: ProviderMetadata;
  isEnabled(): boolean;
  chat(messages: ChatMessage[], opts: { temperature?: number; maxTokens?: number }): Promise<ChatResponse>;
}
