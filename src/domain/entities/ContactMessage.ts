export interface ContactMessage {
  id: string;
  from: string;
  email: string;
  subject: string | null;
  body: string;
  read: boolean;
  archived: boolean;
  createdAt: Date;
}

export interface NewContactMessage {
  from: string;
  email: string;
  subject?: string;
  body: string;
}
