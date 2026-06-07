import { z } from "zod";

export const ProjectDescriptionSchema = z.object({
  description: z.object({
    en: z.string().min(1).max(600),
    pt: z.string().min(1).max(600),
    es: z.string().min(1).max(600),
  }),
  tagline: z.string().max(120).optional(),
});

export type ProjectDescriptionSchemaType = z.infer<typeof ProjectDescriptionSchema>;
