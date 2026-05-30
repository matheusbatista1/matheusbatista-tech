import type { z } from "zod";
import type { ChatMessage } from "@/domain/entities/ai/ChatMessage";

export interface GenerateJSONOptions<T> {
  prompt: string;
  schema: z.ZodSchema<T>;
  model?: string;
}

export interface StreamTextOptions {
  messages: ChatMessage[];
  system?: string;
  model?: string;
}

export interface StreamTextResult {
  toDataStreamResponse(): Response;
}

export interface IAIProvider {
  generateJSON<T>(opts: GenerateJSONOptions<T>): Promise<T>;
  streamText(opts: StreamTextOptions): StreamTextResult;
}
