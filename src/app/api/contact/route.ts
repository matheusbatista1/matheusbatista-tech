import { NextResponse } from "next/server";
import { z } from "zod";
import { container } from "@/infrastructure/container";
import { isPrismaTransientError } from "@/application/lib/retry";

export const maxDuration = 30;

const contactSchema = z.object({
  from: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const message = await container.useCases.sendContactMessage.execute(parsed.data);
    return NextResponse.json({ id: message.id }, { status: 201 });
  } catch (error) {
    console.error("contact route error", error);
    if (isPrismaTransientError(error)) {
      return NextResponse.json(
        { error: "database_unavailable", retryable: true },
        { status: 503, headers: { "Retry-After": "2" } },
      );
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
