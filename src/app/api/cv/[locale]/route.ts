import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { container } from "@/infrastructure/container";
import { isLocale } from "@/domain/value-objects/Locale";

export const runtime = "nodejs";

function extractRawIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cf = request.headers.get("cf-connecting-ip");
  return forwarded?.split(",")[0]?.trim() ?? realIp ?? cf ?? "unknown";
}

function hashIp(raw: string): string {
  const salt = process.env.ANALYTICS_SALT ?? "";
  return createHash("sha256").update(`${raw}|${salt}`).digest("hex").slice(0, 32);
}

export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  const cvs = await container.useCases.listCVs.execute();
  const asset = cvs.find((cv) => cv.locale === rawLocale);

  if (!asset) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  const rawIp = extractRawIp(request);
  const ipHash = hashIp(rawIp);
  const userAgent = request.headers.get("user-agent");
  const referrer = request.headers.get("referer");

  try {
    await container.useCases.logCVDownload.execute({
      locale: rawLocale,
      cvAssetId: asset.id,
      ipHash,
      userAgent,
      referrer,
    });
  } catch (err) {
    console.warn("[api/cv] failed to log download", err);
  }

  // Stream the file back with an attachment disposition so the browser
  // downloads it instead of opening the PDF in a new tab. Redirecting to the
  // Blob URL would lose the download hint (cross-origin), so we proxy it here.
  const fileRes = await fetch(asset.url);
  if (!fileRes.ok || !fileRes.body) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  const filename = asset.filename?.trim() || `cv-${rawLocale}.pdf`;
  const asciiName = filename.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
  const headers = new Headers({
    "Content-Type": fileRes.headers.get("content-type") ?? "application/pdf",
    "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    "Cache-Control": "private, no-store",
  });
  const contentLength = fileRes.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new NextResponse(fileRes.body, { status: 200, headers });
}
