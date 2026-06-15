import { z } from "zod";

export const AIBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("skills-chart"),
    groups: z.array(z.object({ label: z.string(), value: z.number() })),
  }),
  z.object({
    type: z.literal("skill-chips"),
    names: z.array(z.string()),
  }),
  z.object({
    type: z.literal("project"),
    id: z.string(),
  }),
  z.object({
    type: z.literal("projects"),
    ids: z.array(z.string()),
  }),
  z.object({
    type: z.literal("contact"),
  }),
  z.object({
    type: z.literal("stats"),
    items: z.array(z.object({ value: z.string(), label: z.string() })),
  }),
  z.object({
    type: z.literal("timeline"),
    items: z.array(
      z.object({
        role: z.string(),
        company: z.string(),
        period: z.string(),
        note: z.string().optional(),
      }),
    ),
  }),
  z.object({
    type: z.literal("text"),
    content: z.string(),
  }),
]);

export const ChatResponseSchema = z.object({
  reply: z.string().max(700),
  blocks: z.array(AIBlockSchema).max(1),
  suggestions: z.array(z.string().max(120)).max(4),
});

export type ChatResponseSchemaType = z.infer<typeof ChatResponseSchema>;
