"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Code2,
  Twitter,
  Globe,
  ExternalLink,
  LucideIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Toaster, toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site.config";
import { generateVCard, downloadVCard } from "@/lib/utils";

const DEFAULT_URL = "https://vinayjain.vercel.app";

const ICON_MAP: Record<string, LucideIcon> = {
  Linkedin,
  Github,
  Code2,
  Mail,
  Twitter,
  Globe,
  ExternalLink,
};

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [portfolioUrl, setPortfolioUrl] = useState(DEFAULT_URL);
  const [socialLinks, setSocialLinks] = useState<
    { platform_name: string; url: string; icon_name: string; is_visible?: boolean }[]
  >([]);

  useEffect(() => {
    setPortfolioUrl(window.location.origin);
  }, []);

  useEffect(() => {
    async function fetchSocialLinks() {
      try {
        const res = await fetch("/api/social-links");
        const data = await res.json();
        if (Array.isArray(data)) {
          setSocialLinks(
            data.filter((l: { is_visible?: boolean }) => l.is_visible !== false)
          );
        }
      } catch {
        // Fallback to siteConfig profile links if API fails
        const p = siteConfig.profile;
        const fallback: { platform_name: string; url: string; icon_name: string }[] = [];
        if (p.linkedinUrl) fallback.push({ platform_name: "LinkedIn", url: p.linkedinUrl, icon_name: "Linkedin" });
        if (p.githubUrl) fallback.push({ platform_name: "GitHub", url: p.githubUrl, icon_name: "Github" });
        if (p.hackerrankUrl) fallback.push({ platform_name: "HackerRank", url: p.hackerrankUrl, icon_name: "Code2" });
        setSocialLinks(fallback);
      }
    }
    fetchSocialLinks();
  }, []);

  function handleSaveContact() {
    const p = siteConfig.profile;
    const vcard = generateVCard({
      full_name: p.fullName,
      title: p.title,
      email: p.email,
      phone: p.phone,
      location: p.location,
      linkedin_url: p.linkedinUrl,
      github_url: p.githubUrl,
      website_url: portfolioUrl,
    });
    downloadVCard(vcard, p.fullName.replace(/\s+/g, "_"));
    toast.success("Contact saved to your device!");
  }

  const infoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-24 px-6 md:px-12 lg:px-24 scroll-mt-20"
    >
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-surface-light)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-glass-border)",
          },
        }}
      />
      <div className="max-w-2xl mx-auto">
        <motion.h2
          className={cn("section-heading gradient-text mb-16")}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {siteConfig.contactHeading}
        </motion.h2>

        <motion.div
          custom={0}
          variants={infoVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="glass-card p-8 rounded-2xl"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-[var(--color-primary)]" />
              <a
                href={`mailto:${siteConfig.profile.email}`}
                className="text-[var(--color-text-primary)] hover:text-[var(--color-primary-light)] transition-colors"
              >
                {siteConfig.profile.email}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-[var(--color-primary)]" />
              <a
                href={`tel:${siteConfig.profile.phone.replace(/\s/g, "")}`}
                className="text-[var(--color-text-primary)] hover:text-[var(--color-primary-light)] transition-colors"
              >
                {siteConfig.profile.phone}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
              <span className="text-[var(--color-text-primary)]">
                {siteConfig.profile.location}
              </span>
            </div>

            <div className="flex gap-4 pt-4">
              {socialLinks.map((link) => {
                const Icon = ICON_MAP[link.icon_name] ?? ExternalLink;
                return (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-primary)]/20 transition-colors"
                    aria-label={link.platform_name}
                  >
                    <Icon className="w-5 h-5 text-[var(--color-text-primary)]" />
                  </a>
                );
              })}
            </div>

            {(siteConfig.showQRCode || siteConfig.showSaveContact) && (
              <div className="pt-6 border-t border-[var(--color-glass-border)]">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {siteConfig.showQRCode && (
                    <div className="p-4 rounded-xl bg-white">
                      <QRCodeSVG
                        value={portfolioUrl}
                        size={120}
                        level="M"
                        includeMargin={false}
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    {siteConfig.showQRCode && (
                      <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                        Scan to visit my portfolio
                      </p>
                    )}
                    {siteConfig.showSaveContact && (
                      <motion.button
                        onClick={handleSaveContact}
                        className={cn(
                          "px-6 py-3 rounded-xl font-semibold",
                          "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]",
                          "text-white transition-all duration-300",
                          "hover:shadow-[0_0_20px_var(--color-glow)]"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Save Contact
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
