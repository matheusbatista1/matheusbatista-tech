import { NextResponse } from "next/server";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { getHashedIp } from "@/presentation/lib/ip";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_SCOPES = new Set(["project", "og", "misc"] as const);
type Scope = "project" | "og" | "misc";

function sanitizeFilename(name: string): string {
  const trimmed = name.trim().toLowerCase();
  const dot = trimmed.lastIndexOf(".");
  const stem = (dot > 0 ? trimmed.slice(0, dot) : trimmed)
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const ext = dot > 0 ? trimmed.slice(dot).replace(/[^.a-z0-9]/g, "") : "";
  return (stem || "image") + ext;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const ip = getHashedIp(request);
  const rate = await container.ai.rateLimits.chat.limit(`admin-upload:${ip}`);
  if (!rate.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: rate.reset },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const file = form.get("file");
  const scopeRaw = (form.get("scope") as string) ?? "project";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  const scope: Scope = ALLOWED_SCOPES.has(scopeRaw as Scope) ? (scopeRaw as Scope) : "project";

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 413 });
  }

  try {
    const result = await container.useCases.uploadAsset.execute({
      scope,
      pathname: sanitizeFilename(file.name || "image"),
      body: file,
      contentType: file.type,
      actorEmail: session.user.email,
      ip,
    });
    return NextResponse.json({ url: result.url, pathname: result.pathname });
  } catch (error) {
    console.error("admin/upload route error", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
