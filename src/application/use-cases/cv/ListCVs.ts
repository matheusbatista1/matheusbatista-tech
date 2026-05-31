import type { CVAsset } from "@/domain/entities/CVAsset";
import type { ICVAssetRepository } from "@/domain/repositories/ICVAssetRepository";

export class ListCVs {
  constructor(private readonly cvAssetRepo: ICVAssetRepository) {}

  async execute(): Promise<CVAsset[]> {
    return this.cvAssetRepo.list();
  }
}
