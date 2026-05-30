export const PERSONA_IDS = ["default", "recruiter", "techlead", "cto", "designer"] as const;
export type PersonaId = (typeof PERSONA_IDS)[number];

export const DEFAULT_PERSONA: PersonaId = "default";

export interface Persona {
  id: PersonaId;
  label: string;
  hint: string;
}

export function isPersonaId(value: unknown): value is PersonaId {
  return typeof value === "string" && (PERSONA_IDS as readonly string[]).includes(value);
}
