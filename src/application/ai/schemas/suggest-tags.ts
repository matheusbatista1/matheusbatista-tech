import { z } from "zod";

export const SuggestTagsSchema = z.object({
  tags: z.array(z.string().min(1).max(30)).min(3).max(6),
});

export type SuggestTagsSchemaType = z.infer<typeof SuggestTagsSchema>;
