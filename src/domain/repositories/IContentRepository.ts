import type { HeroContent } from "../entities/HeroContent";
import type { AboutContent } from "../entities/AboutContent";

export interface SiteSettings {
  defaultLang: string;
  defaultTheme: string;
}

export interface SiteContent {
  hero: HeroContent;
  about: AboutContent;
  settings: SiteSettings;
}

export interface IContentRepository {
  get(): Promise<SiteContent | null>;
  updateHero(hero: HeroContent): Promise<void>;
  updateAbout(about: AboutContent): Promise<void>;
  updateSettings(settings: SiteSettings): Promise<void>;
}
