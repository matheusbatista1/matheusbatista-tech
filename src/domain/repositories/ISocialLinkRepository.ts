import type { SocialLink } from "../entities/SocialLink";

export interface ISocialLinkRepository {
  list(opts?: { visibleOnly?: boolean }): Promise<SocialLink[]>;
}
