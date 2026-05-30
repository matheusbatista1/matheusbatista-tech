import { z } from "zod";

export const PersonaCopySchema = z.object({
  tagline: z.string(),
  about: z.string(),
  projects: z.array(z.object({ id: z.string(), description: z.string() })),
});

export type PersonaCopySchemaType = z.infer<typeof PersonaCopySchema>;
