import { z } from "zod";

export const DraftReplySchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(4000),
});

export type DraftReplySchemaType = z.infer<typeof DraftReplySchema>;
