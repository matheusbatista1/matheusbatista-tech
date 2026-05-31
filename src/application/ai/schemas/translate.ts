import { z } from "zod";

export const TranslateOutputSchema = z.object({
  translated: z.object({
    en: z.string().optional(),
    pt: z.string().optional(),
    es: z.string().optional(),
  }),
});

export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;
