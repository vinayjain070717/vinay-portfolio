/**
 * CENTRAL SITE CONFIGURATION
 *
 * This is the single source of truth for all configurable values.
 * Edit this file to customize your portfolio without touching component code.
 *
 * When Supabase is connected, values from the site_config DB table
 * override matching keys via ThemeProvider at runtime.
 */

export const siteConfig = {
  // ─── Site Identity ──────────────────────────────────────────
  siteName: "VJ",
  siteUrl: "https://vinayjain.vercel.app",
  siteLanguage: "en",

  // ─── SEO / Metadata ────────────────────────────────────────
  siteTitle: "Vinay Jain | Java Backend Developer Portfolio",
  siteDescription:
    "Portfolio of Vinay Jain — Java Backend Developer specializing in Spring Boot, Microservices, Kafka, Docker, Kubernetes, and Cloud Technologies.",
  siteKeywords: [
    "Vinay Jain",
    "Java Backend Developer",
    "Spring Boot",
    "Microservices",
    "Kafka",
    "Docker",
    "Kubernetes",
    "Portfolio",
  ],
  siteAuthor: "Vinay Jain",
  ogImageUrl: "",

  // ─── Theme Defaults ────────────────────────────────────────
  primaryColor: "#6366f1",
  accentColor: "#06b6d4",
  fontHeading: "Inter",
  fontBody: "Inter",
  defaultTheme: "dark" as "dark" | "light",
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap",

  // ─── Profile ───────────────────────────────────────────────
  profile: {
    fullName: "Vinay Jain",
    title: "Java Backend Developer",
    tagline:
      "5+ yrs | Java • Spring Boot • Microservices • Kafka • Docker • Kubernetes",
    bio: `Backend Engineer with 5+ years of experience building high-scale telecom and retail systems. I specialize in taking legacy, business-critical platforms and transforming them into cloud-native, event-driven microservices that are easier to evolve, monitor, and scale.

At Amdocs, I've worked across three major projects — AT&T OPENET Charging (processing ~3M+ billing records via Kafka Streams), Metro-X environment management platform, and LESOG legacy-to-microservices migration on Azure.

My toolbox includes Java, Spring Boot, Spring Cloud, Microservices, Kafka, Kafka Streams, KSQL, Docker, Kubernetes, SQL/NoSQL, CI/CD, and UNIX. I care about clean architecture, observability, and owning services from design to production.`,
    email: "vinayomjain@gmail.com",
    phone: "+91 7999512904",
    location: "Pune, Maharashtra, India",
    linkedinUrl: "https://linkedin.com/in/vinayjain703",
    githubUrl: "https://github.com/vinayjain070717",
    hackerrankUrl: "https://hackerrank.com/profile/monu94259",
    githubAvatarUrl: "https://github.com/vinayjain070717.png",
    resumeDownloadFilename: "Vinay_Jain_Resume.pdf",
  },

  // ─── Hero Section ──────────────────────────────────────────
  heroTitle: "Hi, I'm Vinay Jain",
  heroSubtitle: "Java Backend Developer | Building High-Scale Microservices",
  heroCTAs: [
    { label: "View My Work", href: "#projects" },
    { label: "Get In Touch", href: "#contact" },
  ],
  heroBackgroundStyle: "particles" as "particles" | "gradient" | "minimal",
  showScrollIndicator: true,

  // ─── Section Headings ──────────────────────────────────────
  aboutHeading: "About Me",
  skillsHeading: "My Skills",
  experienceHeading: "Work Experience",
  educationHeading: "Education",
  projectsHeading: "My Projects",
  certificatesHeading: "Certificates & Badges",
  servicesHeading: "What I Offer",
  codingStatsHeading: "Coding Stats",
  journeyHeading: "My Journey",
  resumeHeading: "My Resume",
  resumeDescription:
    "Download my latest resume to learn more about my experience and qualifications.",
  contactHeading: "Get In Touch",

  // ─── About Section Stats ───────────────────────────────────
  aboutStats: [
    { value: 5, suffix: "+", label: "Years Experience" },
    { value: 16, suffix: "+", label: "Projects" },
    { value: 4, suffix: "", label: "Companies" },
    { value: 9, suffix: "", label: "Badges" },
  ],

  // ─── Coding Stats ─────────────────────────────────────────
  codingStats: {
    github: { repos: 16, stars: 14, languages: 6 },
    hackerrank: { goldBadges: 5, certificates: 8 },
  },

  // ─── Skill Categories ─────────────────────────────────────
  skillCategories: ["All", "Programming", "Databases", "DevOps & Tools"],

  // ─── Navigation ────────────────────────────────────────────
  navItems: [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Certificates", href: "#certificates" },
    { label: "Journey", href: "#journey" },
    { label: "Contact", href: "#contact" },
  ],
  showAdminLink: true,

  // ─── Footer ────────────────────────────────────────────────
  footerTagline: "Let's build something amazing together.",
  footerCopyright: "© 2026 Vinay Jain. All rights reserved.",
  footerShowMadeWith: true,

  // ─── Visitor Counter ───────────────────────────────────────
  visitorCounter: {
    initialCount: 1247,
    suffix: "developers have visited",
  },
  showVisitorCounter: true,

  // ─── Contact Section Feature Toggles ───────────────────────
  showQRCode: true,
  showSaveContact: true,

  // ─── Admin Panel ───────────────────────────────────────────
  adminBranding: "VJ Admin",
};
