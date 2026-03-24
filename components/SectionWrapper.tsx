"use client";

import { useTheme } from "./ThemeProvider";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import EducationSection from "@/components/sections/EducationSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import CertificatesSection from "@/components/sections/CertificatesSection";
import ServicesSection from "@/components/sections/ServicesSection";
import CodingStatsSection from "@/components/sections/CodingStatsSection";
import JourneySection from "@/components/sections/JourneySection";
import ResumeSection from "@/components/sections/ResumeSection";
import ContactSection from "@/components/sections/ContactSection";
import type { ComponentType } from "react";

const SECTION_MAP: Record<string, ComponentType> = {
  hero: HeroSection,
  about: AboutSection,
  services: ServicesSection,
  skills: SkillsSection,
  experience: ExperienceSection,
  education: EducationSection,
  projects: ProjectsSection,
  certificates: CertificatesSection,
  "coding-stats": CodingStatsSection,
  journey: JourneySection,
  resume: ResumeSection,
  contact: ContactSection,
};

export default function SectionWrapper() {
  const { sections } = useTheme();

  const visibleSections = sections
    .filter((s) => s.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <>
      {visibleSections.map((section) => {
        const Component = SECTION_MAP[section.section_key];
        if (!Component) return null;
        return <Component key={section.section_key} />;
      })}
    </>
  );
}
