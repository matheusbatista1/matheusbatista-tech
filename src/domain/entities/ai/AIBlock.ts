export type AIBlock =
  | { type: "skills-chart"; groups: Array<{ label: string; value: number }> }
  | { type: "skill-chips"; names: string[] }
  | { type: "project"; id: string }
  | { type: "projects"; ids: string[] }
  | { type: "contact" }
  | { type: "stats"; items: Array<{ value: string; label: string }> }
  | {
      type: "timeline";
      items: Array<{ role: string; company: string; period: string; note?: string }>;
    }
  | { type: "text"; content: string };

export type AIBlockType = AIBlock["type"];

export interface ChatResponse {
  reply: string;
  blocks: AIBlock[];
}
