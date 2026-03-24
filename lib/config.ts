import type { ConfigMap } from "./types";

export const DEFAULT_CONFIG: ConfigMap = {
  primary_color: "#6366f1",
  accent_color: "#06b6d4",
  font_heading: "Inter",
  font_body: "Inter",
  default_theme: "dark",
  hero_title: "Hi, I'm Vinay Jain",
  hero_subtitle: "Software Developer | Building Scalable Microservices",
  hero_cta_text: "View My Work",
  hero_cta_url: "#projects",
  hero_background_style: "particles",
  footer_text: "Let's build something amazing together.",
  footer_copyright: "© 2026 Vinay Jain. All rights reserved.",
  site_title: "Vinay Jain | Software Developer Portfolio",
  meta_description:
    "Portfolio of Vinay Jain — Software Developer specializing in Java, Spring Boot, Microservices, Node.js, and Cloud Technologies.",
  og_image_url: "",
};

export function getConfigValue(configs: ConfigMap, key: string): string {
  return configs[key] ?? DEFAULT_CONFIG[key] ?? "";
}
