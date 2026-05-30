import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Persona adaptation endpoint.
 *
 * TODO(fase 2): implementar AdaptPersonaCopy use case com:
 *   - cache-first em AICache (hash = sha256("persona-adapt" + persona + locale))
 *   - generateJSON com PersonaCopySchema
 *   - rate limit (chat + daily limiters)
 *
 * Por enquanto, stub que retorna 501.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented yet — TODO: AdaptPersonaCopy use case (fase 2)." },
    { status: 501 },
  );
}
