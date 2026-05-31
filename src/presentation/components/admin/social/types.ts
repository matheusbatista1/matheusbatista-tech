export interface SocialActionResult {
  ok?: boolean;
  id?: string;
  error?: string;
}

export interface SocialPayload {
  network: SocialNetwork;
  url: string;
  handle: string | null;
  visible: boolean;
}

export interface SocialActions {
  create: (payload: SocialPayload) => Promise<SocialActionResult>;
  update: (id: string, payload: SocialPayload) => Promise<SocialActionResult>;
  delete: (id: string) => Promise<SocialActionResult>;
  reorder: (orderedIds: string[]) => Promise<SocialActionResult>;
  toggleVisible: (id: string, visible: boolean) => Promise<SocialActionResult>;
}

export const SOCIAL_NETWORKS = [
  "GitHub",
  "LinkedIn",
  "Behance",
  "Email",
  "X",
  "Instagram",
  "Dribbble",
  "YouTube",
  "Other",
] as const;

export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

export const SOCIAL_ICON_KEYS = [
  "github",
  "linkedin",
  "x",
  "instagram",
  "youtube",
  "mail",
  "behance",
  "dribbble",
  "web",
] as const;

export type SocialIconKey = (typeof SOCIAL_ICON_KEYS)[number];

export const NETWORK_TO_ICON: Record<SocialNetwork, SocialIconKey> = {
  GitHub: "github",
  LinkedIn: "linkedin",
  Behance: "behance",
  Email: "mail",
  X: "x",
  Instagram: "instagram",
  Dribbble: "dribbble",
  YouTube: "youtube",
  Other: "web",
};

export const ICON_TO_NETWORK: Record<SocialIconKey, SocialNetwork> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  behance: "Behance",
  mail: "Email",
  x: "X",
  instagram: "Instagram",
  dribbble: "Dribbble",
  youtube: "YouTube",
  web: "Other",
};

export function inferNetwork(name: string, iconKey: string | null): SocialNetwork {
  if (iconKey && iconKey in ICON_TO_NETWORK) {
    return ICON_TO_NETWORK[iconKey as SocialIconKey];
  }
  const lowered = name.trim().toLowerCase();
  for (const network of SOCIAL_NETWORKS) {
    if (network.toLowerCase() === lowered) return network;
  }
  return "Other";
}
