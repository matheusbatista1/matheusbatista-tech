import type { Locale } from "@/domain/value-objects/Locale";
import type { PromptContext } from "@/domain/entities/ai/PromptContext";

export type DraftReplyTone = "friendly" | "professional" | "brief";

const TONE_HINTS: Record<DraftReplyTone, string> = {
  friendly: "warm, personable, conversational",
  professional: "polite, formal, courteous",
  brief: "concise, direct, no fluff",
};

const LANG_LABEL: Record<Locale, string> = {
  en: "English",
  pt: "Brazilian Portuguese",
  es: "Spanish",
};

export interface DraftReplyPromptInput {
  context: PromptContext;
  locale: Locale;
  tone: DraftReplyTone;
  message: {
    from: string;
    subject: string | null;
    body: string;
  };
}

export function buildDraftReplyPrompt({
  context,
  locale,
  tone,
  message,
}: DraftReplyPromptInput): string {
  const toneHint = TONE_HINTS[tone];
  const langLabel = LANG_LABEL[locale];

  return [
    `You are drafting an email reply on behalf of ${context.name}, a software engineer.`,
    `Tone: "${tone}" — ${toneHint}.`,
    `Return ONLY the reply body text, no subject line, in the same language as the original message (default ${langLabel}).`,
    `Sign with the first name only. Do not invent meetings, prices, or commitments.`,
    `If the incoming message asks for something specific, address it directly using ONLY the facts below.`,
    ``,
    `AUTHOR FACTS (JSON):`,
    JSON.stringify({
      name: context.name,
      role: context.role,
      tagline: context.tagline,
      about: context.about,
      currently: context.currently,
    }),
    ``,
    `INCOMING MESSAGE:`,
    `From: ${message.from}`,
    `Subject: ${message.subject ?? "(no subject)"}`,
    `Body:`,
    message.body,
    ``,
    `Return COMPACT JSON only:`,
    `{"body":"<the reply body>"}`,
    `Keep the body under 1500 chars. No subject field.`,
  ].join("\n");
}
