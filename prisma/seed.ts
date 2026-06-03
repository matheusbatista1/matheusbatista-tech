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
        languages: "PT · EN · ES",
      },
      settings: {
        defaultLang: "en",
        defaultTheme: "dark",
      },
    },
    update: {},
  });

  // ─── Projects ────────────────────────────────────────────────────────────
  // Latest portfolio entries. The `update` payload below only touches descriptive
  // fields — images/coverImageUrl/order are admin-controlled and never overwritten
  // by re-running the seed, so uploaded gallery and manual reordering are preserved.
  const projects = [
    {
      slug: "zig-fun",
      name: "Zig.fun · 99food integration",
      url: "zig.fun",
      liveUrl: "https://zig.fun/",
      pill: "FLAGSHIP",
      tags: [
        "Node.js",
        "TypeScript",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "BullMQ",
        "Docker",
        "GitLab",
      ],
      order: 1,
      employerName: "Cubos Tecnologia",
      employerUrl: "https://cubos.io/",
      clientName: "Zig",
      clientUrl: "https://zig.fun/",
      description: {
        pt: "Zig é uma funtech global de pagamentos cashless, ticketing e gestão de consumo presente em eventos como o GP do Brasil de F1, Rock in Rio, Lollapalooza e Tomorrowland. Atuo como Software Engineer terceirizado pela Cubos, responsável pela integração completa (front e back) entre o gestor de pedidos da Zig e a 99food, permitindo manipular o ciclo inteiro de pedidos da 99food dentro do sistema; a stack é Node.js, TypeScript e SDKGEN sobre PostgreSQL 14, MongoDB 6.1, Redis 5.3.2 e BullMQ, com i18next para mensageria multi-idioma. A arquitetura segue Clean Architecture validada por dependency-cruiser e é coberta por testes automatizados, com fluxo de entrega em ClickUp, GitLab e Docker. O resultado é operar um canal de delivery completo dentro de um produto usado em F1, Tomorrowland e grandes venues globais sem fricção para o operador.",
        en: "Zig is a global funtech powering cashless payments, ticketing and consumption management at venues and large events such as the F1 Brazilian GP, Rock in Rio, Lollapalooza and Tomorrowland. I work as a Software Engineer contracted through Cubos, owning the full-stack integration between Zig's order manager and 99food so the entire 99food order lifecycle can be operated from inside the system; the stack is Node.js, TypeScript and SDKGEN on top of PostgreSQL 14, MongoDB 6.1, Redis 5.3.2 and BullMQ, with i18next for multi-language messaging. The codebase follows Clean Architecture enforced by dependency-cruiser and is covered by automated tests, with delivery running on ClickUp, GitLab and Docker. The outcome is operating a major delivery channel end-to-end inside a product that runs F1, Tomorrowland and other global venues without operator friction.",
        es: "Zig es una funtech global de pagos cashless, ticketing y gestión de consumo presente en eventos como el GP de Brasil de F1, Rock in Rio, Lollapalooza y Tomorrowland. Actúo como Software Engineer subcontratado por Cubos, responsable de la integración completa (front y back) entre el gestor de pedidos de Zig y 99food, permitiendo manipular todo el ciclo de pedidos de 99food desde el sistema; la stack es Node.js, TypeScript y SDKGEN sobre PostgreSQL 14, MongoDB 6.1, Redis 5.3.2 y BullMQ, con i18next para mensajería multi-idioma. La arquitectura sigue Clean Architecture validada por dependency-cruiser y está cubierta por tests automatizados, con flujo de entrega en ClickUp, GitLab y Docker. El resultado es operar un canal de delivery completo dentro de un producto utilizado en F1, Tomorrowland y grandes venues globales sin fricción para el operador.",
      },
    },
    {
      slug: "linked-pay",
      name: "Linked Pay",
      url: "linkedtech.com.br",
      liveUrl: "https://www.linkedtech.com.br/",
      pill: "FLAGSHIP",
      tags: [
        ".NET",
        "C#",
        "SQL Server",
        "CouchDB",
        "PouchDB",
        "Docker",
        "Azure DevOps",
        "REST APIs",
      ],
      order: 2,
      employerName: "Linked Tech",
      employerUrl: "https://www.linkedtech.com.br/",
      clientName: null,
      clientUrl: null,
      description: {
        pt: "Linked Pay é o PDV da Linked Tech que roda direto em maquininhas Android, integrado a Bcodex e Entrepay para captura e liquidação de pagamentos. Atuei como Tech Lead do back-end em .NET, modelando a sincronização offline-first com CouchDB/PouchDB contra um SQL Server central, autenticação JWT, storage em Azure Blob e pipelines de CI/CD no Azure DevOps. Tomei decisões de regras de negócio e layout junto ao produto, mantive a documentação técnica no Notion e as collections de API no Apidog, e fui ponto de contato diário do time de front. O resultado foi um PDV resiliente que continua operando em bares e restaurantes mesmo sem conexão e sincroniza sem perda quando a rede volta.",
        en: "Linked Pay is Linked Tech's POS that runs directly on Android smart-POS terminals, integrated with Bcodex and Entrepay for payment capture and settlement. I led the .NET back-end, designing an offline-first sync between CouchDB/PouchDB on the device and a central SQL Server, plus JWT auth, Azure Blob storage and CI/CD pipelines on Azure DevOps. I owned business-rule and layout decisions with product, kept technical docs in Notion and API collections in Apidog under SOLID principles, and acted as the daily point of contact for the front-end team. The result is a resilient POS that keeps running on the floor with no connectivity and reconciles cleanly once the network is back.",
        es: "Linked Pay es el PDV de Linked Tech que corre directo en terminales Android smart-POS, integrado con Bcodex y Entrepay para captura y liquidación de pagos. Lideré el back-end en .NET, diseñando la sincronización offline-first entre CouchDB/PouchDB en el dispositivo y un SQL Server central, además de autenticación JWT, almacenamiento en Azure Blob y pipelines de CI/CD en Azure DevOps. Tomé decisiones de reglas de negocio y de layout junto al producto, mantuve la documentación técnica en Notion y las colecciones de API en Apidog bajo principios SOLID, y fui el contacto diario del equipo de front. El resultado es un PDV resiliente que sigue operando en bares y restaurantes incluso sin conexión y sincroniza sin pérdida cuando la red vuelve.",
      },
    },
    {
      slug: "linked-gourmet",
      name: "Linked Gourmet",
      url: "linkedtech.com.br",
      liveUrl: "https://www.linkedtech.com.br/",
      pill: "PRODUCTION",
      tags: [
        ".NET",
        "C#",
        "Entity Framework",
        "Dapper",
        "SQL Server",
        "Angular",
        "Service Bus",
        "Azure DevOps",
      ],
      order: 3,
      employerName: "Linked Tech",
      employerUrl: "https://www.linkedtech.com.br/",
      clientName: null,
      clientUrl: null,
      description: {
        pt: "Linked Gourmet é uma plataforma de PDV e ERP para bares e restaurantes, atendendo cerca de mil clientes com automação comercial, gestão de estoque, BI, KDS e integrações de delivery. Atuei como Backend Developer na sustentação e modernização do sistema legado, conduzindo a migração do .NET Framework 4.5/4.6 para .NET Core 8.0 e mantendo a stack em C#, ASP.NET, Entity Framework, Dapper, SQL Server e SQLite, com front em Angular e Knockout.js. Também fiz manutenção do serviço SOAP de emissão de nota fiscal junto à SEFAZ e evoluí APIs REST com autenticação JWT e Service Bus, seguindo princípios SOLID. Esteira de Azure DevOps com Git, Docker e CI/CD para entregar correções e melhorias em produção sem interromper a operação dos restaurantes.",
        en: "Linked Gourmet is a POS and ERP platform for bars and restaurants serving around a thousand customers, with commercial automation, inventory, BI, KDS and delivery integrations. I worked as a Backend Developer maintaining and modernizing the legacy system, leading the migration from .NET Framework 4.5/4.6 to .NET Core 8.0 while keeping the stack on C#, ASP.NET, Entity Framework, Dapper, SQL Server and SQLite, with Angular and Knockout.js on the front. I also maintained the SOAP service that issues fiscal invoices through SEFAZ and evolved REST APIs with JWT auth and Service Bus following SOLID principles. Delivery ran through Azure DevOps with Git, Docker and CI/CD, shipping fixes and improvements to production without disrupting restaurant operations.",
        es: "Linked Gourmet es una plataforma de PDV y ERP para bares y restaurantes que atiende a cerca de mil clientes, con automatización comercial, gestión de stock, BI, KDS e integraciones de delivery. Trabajé como Backend Developer en el mantenimiento y modernización del sistema legado, conduciendo la migración de .NET Framework 4.5/4.6 a .NET Core 8.0 y manteniendo el stack en C#, ASP.NET, Entity Framework, Dapper, SQL Server y SQLite, con Angular y Knockout.js en el front. También mantuve el servicio SOAP de emisión de factura fiscal junto a la SEFAZ y evolucioné APIs REST con autenticación JWT y Service Bus siguiendo principios SOLID. La entrega corrió en Azure DevOps con Git, Docker y CI/CD, llevando correcciones y mejoras a producción sin interrumpir la operación de los restaurantes.",
      },
    },
    {
      slug: "financas-360",
      name: "Finanças 360",
      url: "f360.com.br",
      liveUrl: "https://f360.com.br/",
      pill: "INTEGRATION",
      tags: [".NET", "C#", "REST APIs", "MongoDB", "RabbitMQ", "Docker", "Studio 3T", "Jira"],
      order: 4,
      employerName: "F360",
      employerUrl: "https://f360.com.br/",
      clientName: null,
      clientUrl: null,
      description: {
        pt: "Plataforma B2B de gestão financeira e vendas usada por grandes redes de franquias para conciliar valores entre PDVs e adquirentes financeiros (Cielo, Stone, Rede, entre outras). Atuei na squad de Integrações como Full Stack Developer, investigando e resolvendo bugs em integrações financeiras críticas, desenvolvendo e mantendo APIs REST em .NET, modelando e otimizando consultas em MongoDB (Studio 3T) e implementando fluxos assíncronos com RabbitMQ em ambiente conteinerizado com Docker. O trabalho exigia ler dados de produção para diagnosticar divergências reais entre PDV e adquirente — fui reconhecido pela curva de aprendizado rápida ao assumir o stack e entregar correções em integrações já em produção.",
        en: "B2B financial management and sales platform used by large franchise networks to reconcile transactions between POS systems and payment acquirers (Cielo, Stone, Rede, and others). I worked on the Integrations squad as a Full Stack Developer, investigating and fixing bugs in critical financial integrations, building and maintaining REST APIs in .NET, modeling and tuning MongoDB queries via Studio 3T, and implementing async flows with RabbitMQ on a Docker-based stack. The work required reading production data to diagnose real discrepancies between POS and acquirer — I was singled out for picking up the stack quickly and shipping fixes to integrations already running in production.",
        es: "Plataforma B2B de gestión financiera y ventas utilizada por grandes redes de franquicias para conciliar valores entre PDVs y adquirentes financieros (Cielo, Stone, Rede, entre otros). Trabajé en el squad de Integraciones como Full Stack Developer, investigando y resolviendo bugs en integraciones financieras críticas, desarrollando y manteniendo APIs REST en .NET, modelando y optimizando consultas en MongoDB (Studio 3T) e implementando flujos asíncronos con RabbitMQ sobre un stack en Docker. El trabajo exigía leer datos de producción para diagnosticar divergencias reales entre PDV y adquirente — fui reconocido por la rápida curva de aprendizaje al asumir el stack y entregar correcciones en integraciones que ya estaban en producción.",
      },
    },
    {
      slug: "quipu",
      name: "Quipu",
      url: "quipu.app",
      liveUrl: "https://quipu.app/",
      pill: "AI",
      tags: [
        "Next.js",
        "Node.js",
        "Fastify",
        "PostgreSQL",
        "Google Drive API",
        "Gemini",
        "TypeScript",
        "Claude Code",
      ],
      order: 5,
      employerName: "Cubos Tecnologia",
      employerUrl: "https://cubos.io/",
      clientName: "Quipu",
      clientUrl: "https://quipu.app/",
      description: {
        pt: "Quipu é uma plataforma de inteligência de vendas que captura e analisa conversas comerciais em reuniões, WhatsApp e ligações para alimentar o CRM e treinar times de vendas. Como engenheiro terceirizado pela Cubos Tecnologia, fui responsável pela integração com o Google Drive: o Quipu autentica na conta do cliente, localiza transcrições geradas pelo Gemini em chamadas do Google Meet e ingere esse conteúdo para que os pipelines internos produzam resumos e relatórios próprios. A stack foi Next.js no front, Fastify e Node.js sobre PostgreSQL no back, com tarefas geridas no ClickUp e fluxo de desenvolvimento apoiado por Claude Code, MCP, Skills e agentes para automação de etapas repetitivas.",
        en: "Quipu is a sales intelligence platform that captures and analyzes commercial conversations from meetings, WhatsApp, and phone calls to feed the CRM and coach sales teams. As an engineer contracted through Cubos Tecnologia, I owned the Google Drive integration: Quipu authenticates against the client's account, locates Gemini-generated transcripts from Google Meet calls, and ingests that content so the internal pipelines can produce Quipu's own summaries and reports. The stack was Next.js on the front, Fastify and Node.js on top of PostgreSQL on the back, with tasks tracked in ClickUp and a development workflow supported by Claude Code, MCP, Skills, and agents for automating repetitive steps.",
        es: "Quipu es una plataforma de inteligencia de ventas que captura y analiza conversaciones comerciales en reuniones, WhatsApp y llamadas para alimentar el CRM y entrenar equipos de ventas. Como ingeniero contratado a través de Cubos Tecnologia, fui responsable de la integración con Google Drive: Quipu se autentica en la cuenta del cliente, localiza las transcripciones generadas por Gemini en las llamadas de Google Meet e ingiere ese contenido para que los pipelines internos produzcan los resúmenes y reportes propios de Quipu. El stack fue Next.js en el front, Fastify y Node.js sobre PostgreSQL en el back, con tareas gestionadas en ClickUp y un flujo de desarrollo apoyado por Claude Code, MCP, Skills y agentes para automatizar pasos repetitivos.",
      },
    },
    {
      slug: "dietbox",
      name: "Dietbox",
      url: "dietbox.me",
      liveUrl: "https://dietbox.me/pt-BR",
      pill: "CASE_STUDY",
      tags: [".NET", "C#", "Entity Framework", "Dapper", "MySQL", "Docker", "Swagger", "REST APIs"],
      order: 6,
      employerName: "Cubos Tecnologia",
      employerUrl: "https://cubos.io/",
      clientName: "Dietbox",
      clientUrl: "https://dietbox.me/pt-BR",
      description: {
        pt: "Dietbox é uma plataforma SaaS brasileira usada por nutricionistas para gerir pacientes, planos alimentares calculados, avaliações antropométricas, agenda e teleconsulta. Entrei pela Cubos Tecnologia para resolver bugs no core do produto e acabei conduzindo a migração completa da stack de .NET 6 para .NET 8, ajustando Entity Framework, Dapper e a integração com MySQL ao longo do caminho. Foi uma passagem curta, mas com impacto técnico relevante: o backend ficou alinhado com a versão LTS atual do runtime, destravando ganhos de performance e suporte de longo prazo sem regressões para os nutricionistas em produção.",
        en: "Dietbox is a Brazilian SaaS platform used by nutritionists to manage patients, calculated meal plans, anthropometric assessments, scheduling and telehealth. I joined through Cubos Tecnologia to fix bugs in the product core and ended up leading the full migration of the stack from .NET 6 to .NET 8, adjusting Entity Framework, Dapper and the MySQL integration along the way. A short engagement with meaningful technical impact: the backend was brought in line with the current LTS runtime, unlocking performance gains and long-term support without regressions for nutritionists in production.",
        es: "Dietbox es una plataforma SaaS brasileña que usan nutricionistas para gestionar pacientes, planes alimentares calculados, evaluaciones antropométricas, agenda y teleconsulta. Entré por Cubos Tecnologia para resolver bugs en el core del producto y terminé conduciendo la migración completa del stack de .NET 6 a .NET 8, ajustando Entity Framework, Dapper y la integración con MySQL en el proceso. Fue un paso breve pero con impacto técnico relevante: el backend quedó alineado con la versión LTS actual del runtime, desbloqueando ganancias de rendimiento y soporte a largo plazo sin regresiones para los nutricionistas en producción.",
      },
    },
    {
      slug: "vtex-marketplaces",
      name: "VTEX × Marketplaces",
      url: "vtex.com",
      liveUrl: "https://www.vtex.com/pt-br/",
      pill: "INTEGRATION",
      tags: [
        ".NET Core",
        "C#",
        "Vue.js",
        "REST APIs",
        "Marketplace APIs",
        "Mercado Livre",
        "Amazon",
        "Jira",
      ],
      order: 7,
      employerName: "Cubos Tecnologia",
      employerUrl: "https://cubos.io/",
      clientName: "VTEX",
      clientUrl: "https://www.vtex.com/pt-br/",
      description: {
        pt: "A VTEX é uma plataforma de commerce enterprise que conecta varejistas a marketplaces externos como Mercado Livre e Amazon, sincronizando catálogo, estoque e pedidos em tempo real. Atuei como backend terceirizado pela Cubos resolvendo bugs nos serviços de integração em .NET Core / C# responsáveis por esses fluxos, com painel administrativo em Vue.js e gestão de tarefas no Jira. O trabalho manteve a publicação de catálogo, a atualização de estoque e a ingestão de pedidos confiáveis para sellers operando em escala dentro da VTEX.",
        en: "VTEX is an enterprise commerce platform that connects retailers to external marketplaces such as Mercado Livre and Amazon, syncing catalog, inventory and orders in real time. As an outsourced backend engineer via Cubos, I triaged and fixed bugs in the .NET Core / C# integration services responsible for these flows, with a Vue.js admin surface and Jira-driven workflow. The work kept catalog publishing, stock updates and order ingestion reliable for sellers operating at scale on the VTEX platform.",
        es: "VTEX es una plataforma de comercio enterprise que conecta a retailers con marketplaces externos como Mercado Libre y Amazon, sincronizando catálogo, inventario y pedidos en tiempo real. Trabajé como backend tercerizado por Cubos resolviendo bugs en los servicios de integración en .NET Core / C# responsables de esos flujos, con panel administrativo en Vue.js y gestión de tareas vía Jira. El trabajo mantuvo la publicación de catálogo, la actualización de stock y la ingestión de pedidos confiables para sellers operando a escala dentro de VTEX.",
      },
    },
    {
      slug: "technico",
      name: "Technico",
      url: "technico.com.br",
      liveUrl: "https://technico.com.br/",
      pill: "CASE_STUDY",
      tags: ["Node.js", "TypeScript", "React", "MySQL", "REST APIs", "Blip", "WhatsApp", "GitHub"],
      order: 8,
      employerName: "Cubos Tecnologia",
      employerUrl: "https://cubos.io/",
      clientName: "Technico",
      clientUrl: "https://technico.com.br/",
      description: {
        pt: "Technico é uma concessionária de máquinas pesadas (CASE/Dynapac) no Nordeste brasileiro, atendendo construção, agronegócio e mineração desde 1983. Entrei via Cubos Tecnologia para uma passagem curta com um objetivo claro: finalizar a feature de Pesquisa de Avaliação. Analisei o projeto existente, decompus o escopo em tarefas e entreguei o back-end completo em Node.js + TypeScript sobre MySQL, incluindo a integração com a Blip para disparo das pesquisas via WhatsApp. Entrega cirúrgica — um módulo a menos no roadmap do time interno.",
        en: "Technico is a Brazilian heavy-equipment dealer (CASE/Dynapac) operating across the Northeast since 1983, serving construction, agribusiness and mining. I came in through Cubos Tecnologia for a short, surgical engagement with one mandate: ship the Evaluation Survey feature. I audited the existing codebase, scoped the work into concrete tasks, and delivered the full back-end in Node.js + TypeScript over MySQL, including a Blip integration to dispatch the surveys through WhatsApp. Clean handoff — one full module off the internal team's roadmap.",
        es: "Technico es una concesionaria brasileña de maquinaria pesada (CASE/Dynapac) que opera en el Nordeste desde 1983, atendiendo construcción, agronegocio y minería. Entré a través de Cubos Tecnologia para una colaboración corta con un objetivo claro: cerrar la feature de Encuesta de Evaluación. Analicé el proyecto existente, desglosé el alcance en tareas concretas y entregué el back-end completo en Node.js + TypeScript sobre MySQL, incluyendo la integración con Blip para disparar las encuestas vía WhatsApp. Entrega quirúrgica — un módulo menos en el roadmap del equipo interno.",
      },
    },
    {
      slug: "doutores-da-web",
      name: "Doutores da Web",
      url: "doutoresdaweb.com.br",
      liveUrl: "https://www.doutoresdaweb.com.br/",
      pill: "PRODUCTION",
      tags: ["HTML5", "CSS3", "JavaScript", "jQuery", "PHP", "MySQL", "Bootstrap", "Bitbucket"],
      order: 9,
      employerName: "Grupo Ideal Trends",
      employerUrl: "https://www.doutoresdaweb.com.br/",
      clientName: "Doutores da Web",
      clientUrl: "https://www.doutoresdaweb.com.br/",
      description: {
        pt: "Doutores da Web é a agência de marketing digital do Grupo Ideal Trends, focada em posicionamento orgânico (MPI) e em construir centenas de sites para clientes finais — em grande parte e-commerces. Como Frontend Developer, entreguei dezenas desses sites em HTML5, CSS3, JavaScript, jQuery, PHP, MySQL e Bootstrap, com foco obsessivo em SEO técnico, performance e responsividade, trabalhando lado a lado do time de marketing em rotinas Scrum/Kanban com Bitbucket e Runrun.it. O resultado consistente foi aumento de tráfego orgânico, redução do tempo de carregamento e melhoria de ranqueamento no Google para a carteira de clientes que mantive.",
        en: "Doutores da Web is the digital marketing agency inside Grupo Ideal Trends, focused on organic search positioning (MPI) and shipping hundreds of client websites — mostly e-commerce. As a Frontend Developer I delivered dozens of those sites in HTML5, CSS3, JavaScript, jQuery, PHP, MySQL and Bootstrap, with an obsessive focus on technical SEO, performance and responsiveness, working side-by-side with the marketing team on a Scrum/Kanban cadence backed by Bitbucket and Runrun.it. The consistent outcome was higher organic traffic, lower load times and better Google rankings across the client portfolio I maintained.",
        es: "Doutores da Web es la agencia de marketing digital del Grupo Ideal Trends, enfocada en posicionamiento orgánico (MPI) y en construir cientos de sitios para clientes finales — en su mayoría e-commerces. Como Frontend Developer entregué decenas de esos sitios en HTML5, CSS3, JavaScript, jQuery, PHP, MySQL y Bootstrap, con foco obsesivo en SEO técnico, performance y responsividad, trabajando codo a codo con el equipo de marketing en rutinas Scrum/Kanban con Bitbucket y Runrun.it. El resultado consistente fue aumento de tráfico orgánico, reducción del tiempo de carga y mejora del ranking en Google para la cartera de clientes que mantuve.",
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
        employerName: p.employerName,
        employerUrl: p.employerUrl,
        clientName: p.clientName,
        clientUrl: p.clientUrl,
        images: [],
        deployed: true,
        visible: true,
      },
      // Only descriptive fields are re-synced. images/coverImageUrl/order are
      // admin-controlled (gallery uploads + manual reorder) and must NOT be
      // overwritten by re-seeding.
      update: {
        name: p.name,
        url: p.url,
        liveUrl: p.liveUrl,
        pill: p.pill,
        tags: p.tags,
        description: p.description,
        employerName: p.employerName,
        employerUrl: p.employerUrl,
        clientName: p.clientName,
        clientUrl: p.clientUrl,
        deployed: true,
        visible: true,
      },
    });
  }

  // Clean up stale slugs from earlier seed iterations. deleteMany never errors
  // when the row is absent, so this stays idempotent for fresh databases.
  await prisma.project.deleteMany({
    where: {
      slug: { in: ["linked-erp-pdv", "b2b-financial-reconciliation", "ai-transcription-platform"] },
    },
  });

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

  // SocialLink nao tem campo unique, entao so seed se nao houver nenhum
  // registro ainda (evita sobrescrever edicoes do admin em re-deploys).
  const existingSocials = await prisma.socialLink.count();
  if (existingSocials === 0) {
    for (const s of socials) {
      await prisma.socialLink.create({ data: s });
    }
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
