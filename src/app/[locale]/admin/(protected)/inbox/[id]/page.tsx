import { redirect } from "next/navigation";

interface InboxItemPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function InboxItemPage({ params }: InboxItemPageProps) {
  const { locale, id } = await params;
  redirect(`/${locale}/admin/inbox?id=${encodeURIComponent(id)}`);
}
