import { z } from "zod";

export const SearchRankedSchema = z.object({
  ranked: z.array(z.object({ id: z.string(), reason: z.string() })),
});

export type SearchRankedSchemaType = z.infer<typeof SearchRankedSchema>;
