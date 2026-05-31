"use client";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string; message?: string };
      if (data?.error) message = data.error;
      else if (data?.message) message = data.message;
    } catch {
      try {
        const text = await res.text();
        if (text) message = text;
      } catch {
        // ignore
      }
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export interface ImproveCopyInput {
  text: string;
  tone?: string;
  locale: string;
}

export interface ImproveCopyResult {
  improved: string;
  notes?: string;
}

export async function improveCopy(input: ImproveCopyInput): Promise<ImproveCopyResult> {
  return postJson<ImproveCopyResult>("/api/ai/improve", input);
}

export interface SummarizeInput {
  text: string;
  maxWords?: number;
  locale: string;
}

export interface SummarizeResult {
  summary: string;
}

export async function summarize(input: SummarizeInput): Promise<SummarizeResult> {
  return postJson<SummarizeResult>("/api/ai/summarize", input);
}

export interface TranslateInput {
  text: string;
  from?: string;
  targets: string[];
}

export interface TranslateResult {
  translated: Record<string, string>;
}

export async function translate(input: TranslateInput): Promise<TranslateResult> {
  return postJson<TranslateResult>("/api/ai/translate", input);
}

export interface GenerateProjectDescriptionInput {
  name: string;
  tags: string[];
  url?: string;
  hint?: string;
}

export interface GenerateProjectDescriptionResult {
  description: { en: string; pt: string; es: string };
  tagline?: string;
}

export async function generateProjectDescription(
  input: GenerateProjectDescriptionInput,
): Promise<GenerateProjectDescriptionResult> {
  return postJson<GenerateProjectDescriptionResult>("/api/ai/project-description", input);
}

export interface SuggestProjectTagsInput {
  name: string;
  description: string;
}

export interface SuggestProjectTagsResult {
  tags: string[];
}

export async function suggestProjectTags(
  input: SuggestProjectTagsInput,
): Promise<SuggestProjectTagsResult> {
  return postJson<SuggestProjectTagsResult>("/api/ai/project-tags", input);
}

export interface DraftReplyInput {
  messageId: string;
  tone?: string;
}

export interface DraftReplyResult {
  subject: string;
  body: string;
}

export async function draftReply(input: DraftReplyInput): Promise<DraftReplyResult> {
  return postJson<DraftReplyResult>("/api/ai/draft-reply", input);
}
