import type { LocalizedText } from "../value-objects/LocalizedText";

export interface AboutContent {
  label: LocalizedText;
  body: LocalizedText;
  currently: LocalizedText;
  role: string;
  location: string;
  years: string;
  languages?: string;
}
