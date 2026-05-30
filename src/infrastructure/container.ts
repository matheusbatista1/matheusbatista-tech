/**
 * Composition root.
 *
 * Único lugar onde implementações concretas (Prisma, GeminiProvider, Upstash...)
 * são instanciadas e ligadas aos use cases. Route handlers importam daqui.
 */

import { PrismaProjectRepository } from "./repositories/PrismaProjectRepository";
import { PrismaSkillRepository } from "./repositories/PrismaSkillRepository";
import { PrismaSocialLinkRepository } from "./repositories/PrismaSocialLinkRepository";
import { PrismaContentRepository } from "./repositories/PrismaContentRepository";
import { PrismaMessageRepository } from "./repositories/PrismaMessageRepository";
import { PrismaAICacheRepository } from "./repositories/PrismaAICacheRepository";
import { GeminiProvider } from "./ai/GeminiProvider";
import { UpstashRateLimiter } from "./ratelimit/UpstashRateLimiter";

import { ListProjects } from "@/application/use-cases/projects/ListProjects";
import { GetProjectById } from "@/application/use-cases/projects/GetProjectById";
import { CreateProject } from "@/application/use-cases/projects/CreateProject";
import { UpdateProject } from "@/application/use-cases/projects/UpdateProject";
import { DeleteProject } from "@/application/use-cases/projects/DeleteProject";
import { ListSkills } from "@/application/use-cases/skills/ListSkills";
import { GetSkillById } from "@/application/use-cases/skills/GetSkillById";
import { CreateSkill } from "@/application/use-cases/skills/CreateSkill";
import { UpdateSkill } from "@/application/use-cases/skills/UpdateSkill";
import { DeleteSkill } from "@/application/use-cases/skills/DeleteSkill";
import { GroupSkillsByCategory } from "@/application/use-cases/skills/GroupSkillsByCategory";
import { SendContactMessage } from "@/application/use-cases/messages/SendContactMessage";
import { ListMessages } from "@/application/use-cases/messages/ListMessages";
import { GetSiteContent } from "@/application/use-cases/content/GetSiteContent";
import { UpdateHeroContent } from "@/application/use-cases/content/UpdateHeroContent";
import { UpdateAboutContent } from "@/application/use-cases/content/UpdateAboutContent";
import { UpdateSiteSettings } from "@/application/use-cases/content/UpdateSiteSettings";
import { ListSocialLinks } from "@/application/use-cases/social/ListSocialLinks";
import { ListAllSocialLinks } from "@/application/use-cases/social/ListAllSocialLinks";
import { GetSocialLinkById } from "@/application/use-cases/social/GetSocialLinkById";
import { CreateSocialLink } from "@/application/use-cases/social/CreateSocialLink";
import { UpdateSocialLink } from "@/application/use-cases/social/UpdateSocialLink";
import { DeleteSocialLink } from "@/application/use-cases/social/DeleteSocialLink";
import { BuildPromptContext } from "@/application/use-cases/ai/BuildPromptContext";
import { ChatWithAssistant } from "@/application/use-cases/ai/ChatWithAssistant";
import { AdaptPersonaCopy } from "@/application/use-cases/ai/AdaptPersonaCopy";
import { SemanticSearchProjects } from "@/application/use-cases/ai/SemanticSearchProjects";

// ─── Repositories ────────────────────────────────────────────────────────────
const projectRepo = new PrismaProjectRepository();
const skillRepo = new PrismaSkillRepository();
const socialRepo = new PrismaSocialLinkRepository();
const contentRepo = new PrismaContentRepository();
const messageRepo = new PrismaMessageRepository();
const aiCacheRepo = new PrismaAICacheRepository();

// ─── External services ───────────────────────────────────────────────────────
const aiProvider = new GeminiProvider();

// Rate limiters: 10 msgs/min e 100/dia por IP (recomendados no plano)
const chatLimiter = new UpstashRateLimiter({
  limit: 10,
  window: "1 m",
  prefix: "rl:ai:chat",
});

const dailyLimiter = new UpstashRateLimiter({
  limit: 100,
  window: "1 d",
  prefix: "rl:ai:daily",
});

// ─── Use cases ───────────────────────────────────────────────────────────────
const buildPromptContext = new BuildPromptContext(contentRepo, projectRepo, skillRepo, socialRepo);

export const container = {
  // Repositories (raramente expor — preferir use cases)
  repositories: {
    project: projectRepo,
    skill: skillRepo,
    social: socialRepo,
    content: contentRepo,
    message: messageRepo,
    aiCache: aiCacheRepo,
  },

  // External services
  ai: {
    provider: aiProvider,
    rateLimits: { chat: chatLimiter, daily: dailyLimiter },
  },

  // Use cases
  useCases: {
    listProjects: new ListProjects(projectRepo),
    getProjectById: new GetProjectById(projectRepo),
    createProject: new CreateProject(projectRepo),
    updateProject: new UpdateProject(projectRepo),
    deleteProject: new DeleteProject(projectRepo),
    listSkills: new ListSkills(skillRepo),
    getSkillById: new GetSkillById(skillRepo),
    createSkill: new CreateSkill(skillRepo),
    updateSkill: new UpdateSkill(skillRepo),
    deleteSkill: new DeleteSkill(skillRepo),
    groupSkillsByCategory: new GroupSkillsByCategory(skillRepo),
    sendContactMessage: new SendContactMessage(messageRepo),
    listMessages: new ListMessages(messageRepo),
    getSiteContent: new GetSiteContent(contentRepo),
    updateHeroContent: new UpdateHeroContent(contentRepo),
    updateAboutContent: new UpdateAboutContent(contentRepo),
    updateSiteSettings: new UpdateSiteSettings(contentRepo),
    listSocialLinks: new ListSocialLinks(socialRepo),
    listAllSocialLinks: new ListAllSocialLinks(socialRepo),
    getSocialLinkById: new GetSocialLinkById(socialRepo),
    createSocialLink: new CreateSocialLink(socialRepo),
    updateSocialLink: new UpdateSocialLink(socialRepo),
    deleteSocialLink: new DeleteSocialLink(socialRepo),
    buildPromptContext,
    chatWithAssistant: new ChatWithAssistant(aiProvider, buildPromptContext, aiCacheRepo),
    adaptPersonaCopy: new AdaptPersonaCopy(aiProvider, buildPromptContext, aiCacheRepo),
    semanticSearchProjects: new SemanticSearchProjects(aiProvider, buildPromptContext, aiCacheRepo),
  },
};

export type Container = typeof container;
