import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Semantic search endpoint.
 *
 * TODO(fase 2): implementar SemanticSearchProjects use case com:
 *   - cache-first em AICache (hash = sha256("semantic-search" + locale + query))
 *   - generateJSON com SearchRankedSchema
 *   - rate limit (chat + daily limiters)
 *
 * Por enquanto, stub que retorna 501.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented yet — TODO: SemanticSearchProjects use case (fase 2)." },
    { status: 501 },
  );
}
