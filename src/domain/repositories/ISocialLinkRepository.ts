import type { SocialLink } from "../entities/SocialLink";

export interface SocialLinkInput {
  name: string;
  url: string;
  handle: string | null;
  visible: boolean;
  order: number;
}

export interface ISocialLinkRepository {
  list(opts?: { visibleOnly?: boolean }): Promise<SocialLink[]>;
  findById(id: string): Promise<SocialLink | null>;
  create(input: SocialLinkInput): Promise<SocialLink>;
  update(id: string, input: SocialLinkInput): Promise<SocialLink>;
  delete(id: string): Promise<void>;
}
