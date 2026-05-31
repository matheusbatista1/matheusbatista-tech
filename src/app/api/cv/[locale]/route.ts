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

  return NextResponse.redirect(asset.url, 302);
}
