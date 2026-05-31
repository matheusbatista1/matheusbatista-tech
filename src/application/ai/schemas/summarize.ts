import { z } from "zod";

export const SummarizeInputSchema = z.object({
  text: z.string().min(1).max(10000),
  maxWords: z.number().int().positive().max(500).optional(),
  locale: z.enum(["en", "pt", "es"]),
});

export type SummarizeInputSchemaType = z.infer<typeof SummarizeInputSchema>;

export const SummarizeOutputSchema = z.object({
  summary: z.string(),
});

export type SummarizeOutputSchemaType = z.infer<typeof SummarizeOutputSchema>;
