import { z } from "zod";

export const IMPROVE_COPY_TONES = ["professional", "casual", "concise"] as const;
export type ImproveCopyTone = (typeof IMPROVE_COPY_TONES)[number];

export const ImproveCopyInputSchema = z.object({
  text: z.string().min(1).max(5000),
  tone: z.enum(IMPROVE_COPY_TONES).optional(),
  locale: z.enum(["en", "pt", "es"]),
});

export type ImproveCopyInputSchemaType = z.infer<typeof ImproveCopyInputSchema>;

export const ImproveCopyOutputSchema = z.object({
  improved: z.string(),
  notes: z.string().optional(),
});

export type ImproveCopyOutputSchemaType = z.infer<typeof ImproveCopyOutputSchema>;
