export interface SocialLink {
  id: string;
  name: string;
  url: string;
  handle: string | null;
  iconKey: string | null;
  visible: boolean;
  order: number;
}
