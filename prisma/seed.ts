import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ─── Site Content (singleton) ────────────────────────────────────────────
  await prisma.siteContent.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      hero: {
        greetHello: "hello",
        greetIm: "I'm",
        firstName: "MATHEUS",
        lastName: "BATISTA",
        subtitle: {
          en: "a fullstack engineer based in Brazil",
          pt: "um engenheiro de software baseado no Brasil",
          es: "un ingeniero de software basado en Brasil",
        },
        availabilityPre: "Available for",
        availabilityA: "roles",
        availabilityB: "projects.",
        available: true,
        tagline: {
          en: "Backend-focused — .NET, Node.js, APIs, integrations, scalable systems.",
          pt: "Foco em backend — .NET, Node.js, APIs, integrações, sistemas escaláveis.",
          es: "Enfoque backend — .NET, Node.js, APIs, integraciones, sistemas escalables.",
        },
      },
      about: {
        label: { en: "ABOUT ME", pt: "SOBRE MIM", es: "SOBRE MÍ" },
        body: {
          en: "Software engineer with experience building scalable systems. Backend-first with .NET, integrations, and evolving production applications. I've worked across ERPs, POS, marketplace integrations, and AI-driven platforms — which gave me a practical sense of how technology impacts the business.",
          pt: "Engenheiro de Software com experiência em sistemas escaláveis, atuando principalmente com back-end em .NET, integrações e evolução de aplicações em produção. Já trabalhei em sistemas ERP e PDV, plataformas com IA e integrações com marketplaces — o que me deu uma visão prática de como a tecnologia impacta o negócio.",
          es: "Ingeniero de Software con experiencia en sistemas escalables, con foco en back-end en .NET, integraciones y evolución de aplicaciones en producción. He trabajado en ERPs, PDVs, plataformas con IA e integraciones con marketplaces — lo que me dio una visión práctica de cómo la tecnología impacta el negocio.",
        },
        currently: {
          en: "Currently a Software Engineer at Cubos Tecnologia, modernizing systems, building integrations, and shipping AI-powered features.",
          pt: "Atualmente, Engenheiro de Software na Cubos Tecnologia — modernizando sistemas, construindo integrações e entregando funcionalidades com IA.",
          es: "Actualmente, Ingeniero de Software en Cubos Tecnologia — modernizando sistemas, construyendo integraciones y entregando funcionalidades con IA.",
        },
        role: "Software Engineer",
        location: "Jandira, São Paulo, BR",
        years: "2+ years",
      },
      settings: {
        defaultLang: "en",
        defaultTheme: "dark",
      },
    },
    update: {},
  });

  // ─── Projects ────────────────────────────────────────────────────────────
  const projects = [
    {
      slug: "linked-pay",
      name: "Linked Pay",
      url: "linkedtech.com.br/linked-pay",
      liveUrl: null,
      pill: "FLAGSHIP",
      tags: [".NET", "C#", "REST APIs", "JWT"],
      order: 1,
      description: {
        en: "Backend for a POS / payment-terminal solution presented at AutoCom 2025 alongside Entrepay. Led API architecture, JWT auth, and the integration layer between PDV and acquirer.",
        pt: "Backend para uma solução de PDV / terminal de pagamento apresentada na AutoCom 2025 junto da Entrepay. Liderei a arquitetura de APIs, autenticação JWT e a camada de integração entre PDV e adquirente.",
        es: "Backend para una solución de POS / terminal de pago presentada en AutoCom 2025 junto a Entrepay. Lideré la arquitectura de APIs, autenticación JWT y la capa de integración entre PDV y adquirente.",
      },
    },
    {
      slug: "linked-erp-pdv",
      name: "Linked ERP & PDV",
      url: "linkedtech.com.br",
      liveUrl: null,
      pill: "PRODUCTION",
      tags: [".NET", "Entity Framework", "Dapper", "SQL Server", "Angular"],
      order: 2,
      description: {
        en: "ERP + POS system for medium and large retailers. Worked on performance, REST APIs for e-commerce/mobile, query optimization, and authentication.",
        pt: "Sistema ERP + PDV para varejistas médios e grandes. Atuei em performance, APIs REST para e-commerce/mobile, otimização de queries e autenticação.",
        es: "Sistema ERP + POS para minoristas medianos y grandes. Trabajé en rendimiento, APIs REST para e-commerce/mobile, optimización de queries y autenticación.",
      },
    },
    {
      slug: "vtex-marketplaces",
      name: "VTEX × Marketplaces",
      url: "cubos.io/integrations",
      liveUrl: null,
      pill: "INTEGRATION",
      tags: [".NET", "Vue.js", "MongoDB", "REST APIs"],
      order: 3,
      description: {
        en: "Integration layer between a VTEX e-commerce and Amazon + Mercado Livre. Synced catalog, inventory and orders. Built in .NET with Vue.js admin surfaces.",
        pt: "Camada de integração entre um e-commerce VTEX e Amazon + Mercado Livre. Sincronização de catálogo, estoque e pedidos. Construído em .NET com interfaces admin em Vue.js.",
        es: "Capa de integración entre un e-commerce VTEX y Amazon + Mercado Libre. Sincronización de catálogo, inventario y pedidos. Construido en .NET con interfaces admin en Vue.js.",
      },
    },
    {
      slug: "b2b-financial-reconciliation",
      name: "B2B Financial Reconciliation",
      url: "f360.com.br",
      liveUrl: null,
      pill: "CASE_STUDY",
      tags: [".NET", "MongoDB", "RabbitMQ", "Docker"],
      order: 4,
      description: {
        en: "B2B platform conciliating values between PDVs and payment acquirers for large franchise networks. Critical financial integrations with high reliability requirements.",
        pt: "Plataforma B2B conciliando valores entre PDVs e adquirentes de pagamento para grandes redes de franquias. Integrações financeiras críticas com altos requisitos de confiabilidade.",
        es: "Plataforma B2B conciliando valores entre PDVs y adquirentes de pago para grandes redes de franquicias. Integraciones financieras críticas con altos requisitos de confiabilidad.",
      },
    },
    {
      slug: "ai-transcription-platform",
      name: "AI Transcription Platform",
      url: "cubos.io/ai-suite",
      liveUrl: null,
      pill: "AI",
      tags: ["Node.js", "TypeScript", "Prisma", "Google APIs"],
      order: 5,
      description: {
        en: "Integrated Google Drive with an AI-powered platform for transcript processing. Designed the ingestion + storage pipeline and the upload UX.",
        pt: "Integração do Google Drive com uma plataforma de IA para processamento de transcrições. Projetei o pipeline de ingestão + armazenamento e a UX de upload.",
        es: "Integración de Google Drive con una plataforma de IA para procesamiento de transcripciones. Diseñé el pipeline de ingestión + almacenamiento y la UX de subida.",
      },
    },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name: p.name,
        url: p.url,
        liveUrl: p.liveUrl,
        pill: p.pill,
        tags: p.tags,
        order: p.order,
        description: p.description,
        images: [],
        deployed: false,
        visible: true,
      },
      update: {},
    });
  }

  // ─── Skills ──────────────────────────────────────────────────────────────
  const skills = [
    // frontend
    { key: "ng", name: "Angular", category: "frontend", color: "#dd0031", order: 1 },
    { key: "vue", name: "Vue.js", category: "frontend", color: "#42b883", order: 2 },
    { key: "next", name: "Next.js", category: "frontend", color: "#000000", order: 3 },
    { key: "ts-fe", name: "TypeScript", category: "frontend", color: "#3178c6", order: 4 },
    { key: "html", name: "HTML5", category: "frontend", color: "#e34f26", order: 5 },
    { key: "css", name: "CSS3", category: "frontend", color: "#1572b6", order: 6 },
    // backend
    { key: "csharp", name: "C#", category: "backend", color: "#6b1f8a", order: 1 },
    { key: "dotnet", name: ".NET", category: "backend", color: "#512bd4", order: 2 },
    { key: "dotnet-core", name: ".NET Core", category: "backend", color: "#512bd4", order: 3 },
    { key: "node", name: "Node.js", category: "backend", color: "#3c873a", order: 4 },
    { key: "aspnet", name: "ASP.NET", category: "backend", color: "#5c2d91", order: 5 },
    { key: "ts-be", name: "TypeScript (Backend)", category: "backend", color: "#3178c6", order: 6 },
    // database
    { key: "sqlserver", name: "SQL Server", category: "database", color: "#a91d22", order: 1 },
    { key: "postgres", name: "PostgreSQL", category: "database", color: "#336791", order: 2 },
    { key: "mysql", name: "MySQL", category: "database", color: "#4479a1", order: 3 },
    { key: "mongo", name: "MongoDB", category: "database", color: "#47a248", order: 4 },
    { key: "couch", name: "CouchDB", category: "database", color: "#e42528", order: 5 },
    { key: "sqlite", name: "SQLite", category: "database", color: "#003b57", order: 6 },
    // devops
    { key: "docker", name: "Docker", category: "devops", color: "#2496ed", order: 1 },
    { key: "azure-devops", name: "Azure DevOps", category: "devops", color: "#0078d4", order: 2 },
    { key: "github", name: "GitHub", category: "devops", color: "#181717", order: 3 },
    { key: "gitlab", name: "GitLab", category: "devops", color: "#fc6d26", order: 4 },
    { key: "rabbitmq", name: "RabbitMQ", category: "devops", color: "#ff6600", order: 5 },
    { key: "servicebus", name: "Service Bus", category: "devops", color: "#0078d4", order: 6 },
    { key: "kafka", name: "Kafka", category: "devops", color: "#231f20", order: 7 },
    { key: "cicd", name: "CI/CD", category: "devops", color: "#1f1f24", order: 8 },
    // tools
    { key: "copilot", name: "GitHub Copilot", category: "tools", color: "#1f1f24", order: 1 },
    { key: "claude-code", name: "Claude Code", category: "tools", color: "#d97757", order: 2 },
    { key: "postman", name: "Postman", category: "tools", color: "#ff6c37", order: 3 },
    { key: "swagger", name: "Swagger", category: "tools", color: "#85ea2d", order: 4 },
    { key: "figma", name: "Figma", category: "tools", color: "#1e1e1e", order: 5 },
    { key: "jira", name: "Jira", category: "tools", color: "#0052cc", order: 6 },
    { key: "notion", name: "Notion", category: "tools", color: "#000000", order: 7 },
    { key: "clickup", name: "ClickUp", category: "tools", color: "#7b68ee", order: 8 },
  ];

  for (const s of skills) {
    await prisma.skill.upsert({
      where: { key: s.key },
      create: s,
      update: {},
    });
  }

  // ─── Social Links ────────────────────────────────────────────────────────
  const socials = [
    {
      name: "GitHub",
      url: "https://github.com/matheusbatista1",
      handle: "github.com/matheusbatista1",
      visible: true,
      order: 1,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/matheusbatista1998/",
      handle: "linkedin.com/in/matheusbatista1998",
      visible: true,
      order: 2,
    },
    {
      name: "Email",
      url: "mailto:matheus.sbatista@outlook.com",
      handle: "matheus.sbatista@outlook.com",
      visible: true,
      order: 3,
    },
  ];

  // SocialLink nao tem unique. Limpar e recriar.
  await prisma.socialLink.deleteMany();
  for (const s of socials) {
    await prisma.socialLink.create({ data: s });
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
