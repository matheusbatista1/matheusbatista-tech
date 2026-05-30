/**
 * Snapshot do CMS enviado aos prompts da IA.
 * Equivalente ao buildContext() do design original (ai.jsx).
 */
export interface PromptContext {
  name: string;
  subtitle: string;
  tagline: string;
  about: string;
  currently: string;
  role: string;
  location: string;
  years: string;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    tags: string[];
    pill: string | null;
    deployed: boolean;
  }>;
  skills: Record<string, string[]>;
  social: Array<{ name: string; handle: string | null; url: string }>;
}

export interface PersonaCopyOverride {
  tagline: string;
  about: string;
  projects: Array<{ id: string; description: string }>;
}
