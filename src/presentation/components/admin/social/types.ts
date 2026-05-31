export interface SocialActionResult {
  ok?: boolean;
  id?: string;
  error?: string;
}

export interface SocialPayload {
  name: string;
  network: SocialNetwork;
  url: string;
  handle: string | null;
  iconKey: SocialIconKey;
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
  "X",
  "Instagram",
  "YouTube",
  "Email",
  "Behance",
  "Dribbble",
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
  X: "x",
  Instagram: "instagram",
  YouTube: "youtube",
  Email: "mail",
  Behance: "behance",
  Dribbble: "dribbble",
  Other: "web",
};

export const ICON_TO_NETWORK: Record<SocialIconKey, SocialNetwork> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  youtube: "YouTube",
  mail: "Email",
  behance: "Behance",
  dribbble: "Dribbble",
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
