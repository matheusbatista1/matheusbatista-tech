import type { CVAsset, NewCVAsset } from "@/domain/entities/CVAsset";
import type { Locale } from "@/domain/value-objects/Locale";

export interface ICVAssetRepository {
  list(): Promise<CVAsset[]>;
  getByLocale(locale: Locale): Promise<CVAsset | null>;
  upsert(asset: NewCVAsset): Promise<CVAsset>;
  delete(locale: Locale): Promise<void>;
}
