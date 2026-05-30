import type { LocalizedText } from "../value-objects/LocalizedText";

export interface HeroContent {
  greetHello: string;
  greetIm: string;
  firstName: string;
  lastName: string;
  subtitle: LocalizedText;
  availabilityPre: string;
  availabilityA: string;
  availabilityB: string;
  available: boolean;
  tagline: LocalizedText;
}
