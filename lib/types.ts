export interface Profile {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  avatar_url: string | null;
  resume_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  hackerrank_url: string | null;
  leetcode_url: string | null;
  website_url: string | null;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  icon_name: string | null;
  display_order: number;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  company_logo_url: string | null;
  location: string;
  display_order: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number;
  end_year: number;
  description: string | null;
  logo_url: string | null;
  display_order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  thumbnail_url: string | null;
  display_order: number;
  is_featured: boolean;
  media?: ProjectMedia[];
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  display_order: number;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  credential_url: string | null;
  badge_image_url: string | null;
  description: string | null;
  display_order: number;
  type: "badge" | "certificate";
  star_rating?: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  display_order: number;
}

export interface JourneyEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  event_type: "education" | "career" | "achievement" | "personal";
  icon_name: string | null;
  display_order: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface SocialLink {
  id: string;
  platform_name: string;
  url: string;
  icon_name: string;
  display_order: number;
  is_visible: boolean;
}

export interface SiteConfig {
  id: string;
  config_key: string;
  config_value: string;
  config_type: "string" | "color" | "boolean" | "json";
}

export interface SiteSection {
  id: string;
  section_key: string;
  label: string;
  display_order: number;
  is_visible: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  section_key: string;
  display_order: number;
  is_visible: boolean;
}

export interface PageView {
  id: string;
  page_path: string;
  visitor_id: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface VisitorCount {
  id: string;
  total_count: number;
}

export interface GithubStats {
  totalRepos: number;
  totalStars: number;
  topLanguages: { name: string; count: number }[];
  recentActivity: { repo: string; message: string; date: string }[];
}

export type ConfigMap = Record<string, string>;
