import type { CVAsset, NewCVAsset } from "@/domain/entities/CVAsset";
import type { ICVAssetRepository } from "@/domain/repositories/ICVAssetRepository";
import type { Locale } from "@/domain/value-objects/Locale";
import { prisma } from "../db/prisma";

function toCVAsset(row: {
  id: string;
  locale: string;
  url: string;
  filename: string;
  sizeBytes: number;
  createdAt: Date;
}): CVAsset {
  return {
    id: row.id,
    locale: row.locale as Locale,
    url: row.url,
    filename: row.filename,
    sizeBytes: row.sizeBytes,
    createdAt: row.createdAt,
  };
}

export class PrismaCVAssetRepository implements ICVAssetRepository {
  async list(): Promise<CVAsset[]> {
    const rows = await prisma.cVAsset.findMany({ orderBy: { locale: "asc" } });
    return rows.map(toCVAsset);
  }

  async getByLocale(locale: Locale): Promise<CVAsset | null> {
    const row = await prisma.cVAsset.findUnique({ where: { locale } });
    return row ? toCVAsset(row) : null;
  }

  async upsert(asset: NewCVAsset): Promise<CVAsset> {
    const row = await prisma.cVAsset.upsert({
      where: { locale: asset.locale },
      create: {
        locale: asset.locale,
        url: asset.url,
        filename: asset.filename,
        sizeBytes: asset.sizeBytes,
      },
      update: {
        url: asset.url,
        filename: asset.filename,
        sizeBytes: asset.sizeBytes,
      },
    });
    return toCVAsset(row);
  }

  async delete(locale: Locale): Promise<void> {
    await prisma.cVAsset.delete({ where: { locale } });
  }
}
