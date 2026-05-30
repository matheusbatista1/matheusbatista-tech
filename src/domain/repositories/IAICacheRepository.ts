export interface AICacheEntry {
  hash: string;
  kind: string;
  locale: string;
  persona: string | null;
  prompt: string;
  response: unknown;
  tokensIn?: number;
  tokensOut?: number;
  hits: number;
  createdAt: Date;
  expiresAt: Date | null;
}

export interface NewAICacheEntry {
  hash: string;
  kind: string;
  locale: string;
  persona?: string | null;
  prompt: string;
  response: unknown;
  tokensIn?: number;
  tokensOut?: number;
  expiresAt?: Date | null;
}

export interface IAICacheRepository {
  findByHash(hash: string): Promise<AICacheEntry | null>;
  save(entry: NewAICacheEntry): Promise<void>;
  incrementHits(hash: string): Promise<void>;
  purgeExpired(): Promise<number>;
}
