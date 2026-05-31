import { google } from "@ai-sdk/google";
import { streamText, generateObject } from "ai";
import type {
  GenerateJSONOptions,
  IAIProvider,
  StreamTextOptions,
  StreamTextResult,
} from "@/application/ports/IAIProvider";

const DEFAULT_MODEL = "gemini-2.5-flash";

export class GeminiProvider implements IAIProvider {
  async generateJSON<T>({
    prompt,
    schema,
    model = DEFAULT_MODEL,
    maxTokens,
  }: GenerateJSONOptions<T>): Promise<T> {
    const { object } = await generateObject({
      model: google(model),
      prompt,
      schema,
      ...(maxTokens ? { maxOutputTokens: maxTokens } : {}),
    });
    return object;
  }

  streamText({ messages, system, model = DEFAULT_MODEL }: StreamTextOptions): StreamTextResult {
    const result = streamText({
      model: google(model),
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return {
      toDataStreamResponse: () => result.toDataStreamResponse(),
    };
  }
}
