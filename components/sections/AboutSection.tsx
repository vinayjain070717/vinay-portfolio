"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Github, Linkedin, Code2, Mail } from "lucide-react";
import Image from "next/image";
import { siteConfig } from "@/lib/site.config";
import { cn } from "@/lib/utils";
import type { SocialLink } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Github,
  Linkedin,
  Code2,
  Mail,
};

function AnimatedCounter({
  end,
  suffix = "",
  duration = 2,
  inView,
}: {
  end: number;
  suffix?: string;
  duration?: number;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, inView]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

function ProfilePhoto() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function checkLocalPhoto() {
      try {
        const res = await fetch("/api/upload");
        const data = await res.json();
        if (data.profilePhoto) {
          setPhotoUrl(data.profilePhoto);
          return;
        }
      } catch {
        // Ignore
      }
      setPhotoUrl(siteConfig.profile.githubAvatarUrl);
    }
    checkLocalPhoto();
  }, []);

  if (!photoUrl || imgError) {
    return (
      <span className="text-5xl font-bold text-white/90 tracking-wider">
        VJ
      </span>
    );
  }

  return (
    <Image
      src={photoUrl}
      alt={siteConfig.profile.fullName}
      width={256}
      height={256}
      className="w-full h-full object-cover rounded-full"
      onError={() => setImgError(true)}
      priority
    />
  );
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch("/api/social-links")
      .then((res) => res.json())
      .then((apiData) => {
        if (Array.isArray(apiData) && apiData.length > 0) setSocialLinks(apiData);
      })
      .catch(() => {});
  }, []);

  const headingInView = useInView(headingRef, { once: true, amount: 0.5 });
  const photoInView = useInView(photoRef, { once: true, amount: 0.3 });
  const bioInView = useInView(bioRef, { once: true, amount: 0.2 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const socialInView = useInView(socialRef, { once: true, amount: 0.5 });

  const bioWords = siteConfig.profile.bio.split(" ");

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 px-6 md:px-12 lg:px-24 bg-[var(--color-surface)]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <motion.h2
          ref={headingRef}
          className={cn("section-heading gradient-text mb-16 text-center")}
          initial={{ opacity: 0, y: 30 }}
          animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          {siteConfig.aboutHeading}
        </motion.h2>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Profile photo placeholder */}
          <motion.div
            ref={photoRef}
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: -80 }}
            animate={photoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -80 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <div
              className={cn(
                "relative w-64 h-64 rounded-full",
                "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]",
                "flex items-center justify-center overflow-hidden",
                "animate-pulse-glow",
                "gradient-border p-1"
              )}
            >
              <ProfilePhoto />
            </div>
          </motion.div>

          {/* Right: Bio text with staggered word reveal */}
          <motion.div
            ref={bioRef}
            className="flex flex-col gap-6"
            initial="hidden"
            animate={bioInView ? "visible" : "hidden"}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.03,
                  delayChildren: 0.1,
                },
              },
              hidden: {},
            }}
          >
            <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
              {bioWords.map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.25em]"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {word}
                </motion.span>
              ))}
            </p>
          </motion.div>
        </div>

        {/* Stats counters row */}
        <motion.div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {siteConfig.aboutStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className={cn(
                "glass-card p-6 rounded-xl text-center",
                "border border-[var(--color-glass-border)]"
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                statsInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.9 }
              }
              transition={{ duration: 0.5, delay: 0.1 * i }}
            >
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  inView={statsInView}
                  duration={1.5}
                />
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social links row */}
        <motion.div
          ref={socialRef}
          className="flex flex-wrap justify-center gap-6 mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={socialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          {socialLinks
            .filter((link) => link.is_visible)
            .sort((a, b) => a.display_order - b.display_order)
            .map((link) => {
              const Icon = iconMap[link.icon_name];
              if (!Icon) return null;
              return (
                <motion.a
                  key={link.platform_name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-xl",
                    "glass border border-[var(--color-glass-border)]",
                    "text-[var(--color-text-secondary)]",
                    "hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30",
                    "transition-colors duration-300"
                  )}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={link.platform_name}
                >
                  <Icon size={22} />
                  <span className="font-medium">{link.platform_name}</span>
                </motion.a>
              );
            })}
        </motion.div>
      </div>
    </section>
  );
}
