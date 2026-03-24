"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useMotionValue, useTransform } from "framer-motion";
import {
  Github,
  Linkedin,
  Code2,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Terminal,
  ChevronRight,
  Sparkles,
} from "lucide-react";
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

const statIcons = [Briefcase, Code2, Award, GraduationCap];

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
      width={280}
      height={280}
      className="w-full h-full object-cover"
      onError={() => setImgError(true)}
      priority
    />
  );
}

function TypewriterLine({ text, delay }: { text: string; delay: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, 25);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span>
      {displayed}
      {!done && <span className="cursor-blink ml-0.5" />}
    </span>
  );
}

function FloatingParticle({ delay, x, y, size, dur }: { delay: number; x: number; y: number; size: number; dur: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-[var(--color-primary)]/20"
      style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.2, 0.6, 0.2],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: dur,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [particles, setParticles] = useState<{ delay: number; x: number; y: number; size: number; dur: number }[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 12 }, (_, i) => ({
        delay: i * 0.3,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 4 + Math.random() * 8,
        dur: 4 + Math.random() * 2,
      }))
    );
  }, []);

  useEffect(() => {
    fetch("/api/social-links")
      .then((res) => res.json())
      .then((apiData) => {
        if (Array.isArray(apiData) && apiData.length > 0) setSocialLinks(apiData);
      })
      .catch(() => {});
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const gradientX = useTransform(mouseX, [0, 1200], [0, 100]);
  const gradientY = useTransform(mouseY, [0, 800], [0, 100]);

  const headingInView = useInView(headingRef, { once: true, amount: 0.5 });
  const photoInView = useInView(photoRef, { once: true, amount: 0.3 });
  const terminalInView = useInView(terminalRef, { once: true, amount: 0.2 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const socialInView = useInView(socialRef, { once: true, amount: 0.5 });

  const terminalLines = [
    { prefix: "const", keyword: " developer", operator: " = ", value: `"${siteConfig.profile.fullName}";` },
    { prefix: "const", keyword: " role", operator: " = ", value: `"${siteConfig.profile.title}";` },
    { prefix: "const", keyword: " location", operator: " = ", value: `"${siteConfig.profile.location}";` },
    { prefix: "const", keyword: " passion", operator: " = ", value: '"Building scalable backends";' },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 px-6 md:px-12 lg:px-24 bg-[var(--color-surface)] overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background floating particles */}
      {particles.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* Subtle radial gradient that follows mouse */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${gradientX}% ${gradientY}%, var(--color-primary)/0.08, transparent 60%)`,
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section heading with sparkle */}
        <motion.div
          ref={headingRef}
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-6">
            <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
            <span className="text-sm font-medium text-[var(--color-primary)]">
              Get to know me
            </span>
          </div>
          <h2 className="section-heading gradient-text">
            {siteConfig.aboutHeading}
          </h2>
        </motion.div>

        {/* Main content: Photo + Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
          {/* Photo with hexagonal clip + orbit rings */}
          <motion.div
            ref={photoRef}
            className="lg:col-span-5 flex justify-center"
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={photoInView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.8, rotate: -5 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative">
              {/* Orbit rings */}
              <motion.div
                className="absolute -inset-6 rounded-full border border-[var(--color-primary)]/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--color-primary)] glow" />
              </motion.div>
              <motion.div
                className="absolute -inset-12 rounded-full border border-[var(--color-accent)]/10"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[var(--color-accent)]" />
              </motion.div>

              {/* Photo container with gradient border */}
              <div className="relative w-64 h-64 md:w-72 md:h-72">
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)] p-[2px]"
                  style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                >
                  <div
                    className="w-full h-full bg-[var(--color-surface)] overflow-hidden flex items-center justify-center"
                    style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                  >
                    <ProfilePhoto />
                  </div>
                </div>

                {/* Status badge */}
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-sm"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-medium text-green-400">
                    Available for hire
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Terminal-style bio */}
          <motion.div
            ref={terminalRef}
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 60 }}
            animate={terminalInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="rounded-xl border border-[var(--color-glass-border)] overflow-hidden bg-[var(--color-surface-light)]/60 backdrop-blur-sm">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-surface)]/80 border-b border-[var(--color-glass-border)]">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="ml-2 text-xs text-[var(--color-text-muted)] font-mono flex items-center gap-1.5">
                  <Terminal className="h-3 w-3" /> about-vinay.ts
                </span>
              </div>

              {/* Terminal body */}
              <div className="p-5 md:p-6 font-mono text-sm space-y-3">
                {terminalLines.map((line, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-wrap gap-x-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={terminalInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
                  >
                    <span className="text-[var(--color-primary)]">{line.prefix}</span>
                    <span className="text-[var(--color-accent)]">{line.keyword}</span>
                    <span className="text-[var(--color-text-muted)]">{line.operator}</span>
                    <span className="text-green-400">{line.value}</span>
                  </motion.div>
                ))}

                <motion.div
                  className="h-px bg-[var(--color-glass-border)] my-4"
                  initial={{ scaleX: 0 }}
                  animate={terminalInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                />

                {/* Bio as comment block */}
                <motion.div
                  className="text-[var(--color-text-muted)] space-y-1"
                  initial={{ opacity: 0 }}
                  animate={terminalInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <p className="text-[var(--color-text-muted)]">
                    <span className="text-[var(--color-text-muted)]/60">{"/**"}</span>
                  </p>
                  {siteConfig.profile.bio
                    .split(". ")
                    .filter(Boolean)
                    .map((sentence, i) => (
                      <p key={i} className="text-[var(--color-text-secondary)] pl-1">
                        <span className="text-[var(--color-text-muted)]/60">{" * "}</span>
                        {sentence.trim()}
                        {!sentence.endsWith(".") && "."}
                      </p>
                    ))}
                  <p className="text-[var(--color-text-muted)]/60">{" */"}</p>
                </motion.div>

                {/* Location line */}
                <motion.div
                  className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--color-glass-border)]"
                  initial={{ opacity: 0 }}
                  animate={terminalInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                >
                  <ChevronRight className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">~</span>
                  <span className="text-[var(--color-text-secondary)]">
                    <MapPin className="inline h-3 w-3 mr-1" />
                    {siteConfig.profile.location}
                  </span>
                  <span className="text-[var(--color-text-muted)]">|</span>
                  <span className="text-[var(--color-text-secondary)]">
                    <Mail className="inline h-3 w-3 mr-1" />
                    {siteConfig.profile.email}
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats counters - Cards with icons and glowing borders */}
        <motion.div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {siteConfig.aboutStats.map((stat, i) => {
            const StatIcon = statIcons[i % statIcons.length];
            return (
              <motion.div
                key={stat.label}
                className={cn(
                  "relative group p-6 rounded-xl text-center overflow-hidden",
                  "bg-[var(--color-surface-light)]/50 backdrop-blur-sm",
                  "border border-[var(--color-glass-border)]",
                  "hover:border-[var(--color-primary)]/30 transition-all duration-500"
                )}
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                whileHover={{ y: -4 }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5" />

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 mb-3">
                    <StatIcon className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
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
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Social links - Pill style with hover fill */}
        <motion.div
          ref={socialRef}
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={socialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          {socialLinks
            .filter((link) => link.is_visible)
            .sort((a, b) => a.display_order - b.display_order)
            .map((link, i) => {
              const Icon = iconMap[link.icon_name];
              if (!Icon) return null;
              return (
                <motion.a
                  key={link.platform_name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "relative flex items-center gap-2 px-6 py-3 rounded-xl overflow-hidden",
                    "bg-[var(--color-surface-light)]/50 backdrop-blur-sm",
                    "border border-[var(--color-glass-border)]",
                    "text-[var(--color-text-secondary)]",
                    "hover:text-white hover:border-[var(--color-primary)]/40",
                    "transition-all duration-300 group"
                  )}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={socialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  aria-label={link.platform_name}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Icon size={20} className="relative z-10" />
                  <span className="font-medium relative z-10">{link.platform_name}</span>
                </motion.a>
              );
            })}
        </motion.div>
      </div>
    </section>
  );
}
