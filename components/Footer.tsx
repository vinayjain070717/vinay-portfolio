"use client";

import { useState, useEffect } from "react";
import { Github, Linkedin, Code2, Mail, Heart } from "lucide-react";
import { siteConfig } from "@/lib/site.config";
import { socialLinksData } from "@/lib/data";
import type { SocialLink } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Linkedin,
  Github,
  Code2,
  Mail,
};

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    socialLinksData.map((item, idx) => ({ ...item, id: `fallback-${idx}` }))
  );

  useEffect(() => {
    fetch("/api/social-links")
      .then((res) => res.json())
      .then((apiData) => {
        if (Array.isArray(apiData) && apiData.length > 0) setSocialLinks(apiData);
      })
      .catch(() => {});
  }, []);

  const visibleLinks = socialLinks
    .filter((link) => link.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <footer className="py-12 px-4 border-t border-[var(--color-glass-border)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-lg font-bold gradient-text mb-1">
              {siteConfig.profile.fullName}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {siteConfig.footerTagline}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {visibleLinks.map((link) => {
              const Icon = iconMap[link.icon_name];
              if (!Icon) return null;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-white/5 transition-all"
                  aria-label={link.platform_name}
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-glass-border)] text-center">
          <p className="text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1 flex-wrap">
            {siteConfig.footerCopyright}
            {siteConfig.footerShowMadeWith && (
              <>
                {" "}
                Made with
                <Heart size={12} className="text-red-500 fill-red-500" />
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
