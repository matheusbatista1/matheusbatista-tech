import { NextResponse } from "next/server";
import { auth } from "@/infrastructure/auth/auth";
import { prisma } from "@/infrastructure/db/prisma";

export const runtime = "nodejs";

const PER_GROUP_LIMIT = 6;

type Group = "project" | "skill" | "message" | "social" | "content";

interface SearchHit {
  id: string;
  group: Group;
  label: string;
  sublabel: string | null;
  href: string;
}

function containsCI(haystack: string | null | undefined, q: string): boolean {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(q);
}

function localizedHit(value: unknown, q: string): boolean {
  if (!value) return false;
  if (typeof value === "string") return containsCI(value, q);
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((v) =>
      typeof v === "string" ? containsCI(v, q) : localizedHit(v, q),
    );
  }
  return false;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(request.url);
  const raw = (url.searchParams.get("q") ?? "").trim();
  if (raw.length < 2) {
    return NextResponse.json({ groups: {} });
  }
  const q = raw.toLowerCase();

  // Parallel queries — keep payload small via select.
  const [projects, skills, messages, socials, siteContent] = await Promise.all([
    prisma.project.findMany({
      select: { id: true, slug: true, name: true, description: true, tags: true },
    }),
    prisma.skill.findMany({
      select: { id: true, key: true, name: true, category: true },
    }),
    prisma.contactMessage.findMany({
      select: {
        id: true,
        from: true,
        email: true,
        subject: true,
        body: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.socialLink.findMany({
      select: { id: true, name: true, url: true, handle: true },
    }),
    prisma.siteContent.findUnique({ where: { id: "singleton" } }),
  ]);

  const projectHits: SearchHit[] = projects
    .filter(
      (p) =>
        containsCI(p.name, q) ||
        p.tags.some((tag) => containsCI(tag, q)) ||
        localizedHit(p.description, q),
    )
    .slice(0, PER_GROUP_LIMIT)
    .map((p) => ({
      id: p.id,
      group: "project",
      label: p.name,
      sublabel: p.slug,
      href: "/admin/projects",
    }));

  const skillHits: SearchHit[] = skills
    .filter((s) => containsCI(s.name, q) || containsCI(s.key, q) || containsCI(s.category, q))
    .slice(0, PER_GROUP_LIMIT)
    .map((s) => ({
      id: s.id,
      group: "skill",
      label: s.name,
      sublabel: `${s.category} · ${s.key}`,
      href: "/admin/skills",
    }));

  const messageHits: SearchHit[] = messages
    .filter(
      (m) =>
        containsCI(m.from, q) ||
        containsCI(m.email, q) ||
        containsCI(m.subject, q) ||
        containsCI(m.body, q),
    )
    .slice(0, PER_GROUP_LIMIT)
    .map((m) => ({
      id: m.id,
      group: "message",
      label: m.subject ?? m.from,
      sublabel: m.from,
      href: `/admin/inbox?id=${m.id}`,
    }));

  const socialHits: SearchHit[] = socials
    .filter((s) => containsCI(s.name, q) || containsCI(s.handle, q) || containsCI(s.url, q))
    .slice(0, PER_GROUP_LIMIT)
    .map((s) => ({
      id: s.id,
      group: "social",
      label: s.name,
      sublabel: s.handle ?? s.url,
      href: "/admin/social",
    }));

  const contentHits: SearchHit[] = [];
  if (siteContent) {
    if (localizedHit(siteContent.hero, q)) {
      contentHits.push({
        id: "hero",
        group: "content",
        label: "Hero section",
        sublabel: "matches in greeting / subtitle / tagline",
        href: "/admin/hero",
      });
    }
    if (localizedHit(siteContent.about, q)) {
      contentHits.push({
        id: "about",
        group: "content",
        label: "About section",
        sublabel: "matches in label / body / currently / facts",
        href: "/admin/about",
      });
    }
  }

  return NextResponse.json({
    groups: {
      project: projectHits,
      skill: skillHits,
      message: messageHits,
      social: socialHits,
      content: contentHits,
    },
  });
}
