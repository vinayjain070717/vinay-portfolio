"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { experienceData } from "@/lib/data";
import { siteConfig } from "@/lib/site.config";
import { MapPin } from "lucide-react";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Present";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function extractTechTags(description: string): string[] {
  const matches = description.matchAll(/\(([^)]+)\)/g);
  const tags = new Set<string>();
  for (const match of matches) {
    const inner = match[1];
    inner
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => tags.add(t));
  }
  return Array.from(tags);
}

function renderDescription(description: string): React.ReactNode[] {
  const parts = description.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-[var(--color-text-primary)]">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const entryVariants = {
  hiddenLeft: { opacity: 0, x: -60 },
  hiddenRight: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const [experience, setExperience] = useState(experienceData.map((e, i) => ({ ...e, id: `fallback-${i}` })));

  useEffect(() => {
    fetch("/api/experience")
      .then((res) => res.json())
      .then((apiData) => {
        if (Array.isArray(apiData) && apiData.length > 0) setExperience(apiData);
      })
      .catch(() => {});
  }, []);

  const sortedExperience = [...experience].sort(
    (a, b) => a.display_order - b.display_order
  );

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="py-24 px-6 md:px-12 lg:px-24 scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className={cn("section-heading gradient-text mb-16")}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {siteConfig.experienceHeading}
        </motion.h2>

        <div className="relative">
          {/* Timeline line */}
          <motion.div
            className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 rounded-full origin-top"
            style={{
              background: `linear-gradient(to bottom, var(--color-primary), var(--color-accent))`,
              boxShadow: `0 0 20px var(--color-glow), 0 0 40px rgba(99, 102, 241, 0.2)`,
            }}
            initial={{ scaleY: 0 }}
            animate={
              isInView
                ? {
                    scaleY: 1,
                    transition: {
                      duration: 1.2,
                      ease: [0.25, 0.46, 0.45, 0.94] as const,
                    },
                  }
                : {}
            }
          />

          <div className="space-y-12">
            {sortedExperience.map((exp, index) => {
              const isLeft = index % 2 === 0;
              const techTags = extractTechTags(exp.description);

              return (
                <motion.div
                  key={`${exp.company}-${exp.start_date}`}
                  className={cn(
                    "relative flex items-center",
                    isLeft ? "flex-row" : "flex-row-reverse",
                    "flex-col lg:flex-row"
                  )}
                  initial={isLeft ? "hiddenLeft" : "hiddenRight"}
                  animate={isInView ? "visible" : isLeft ? "hiddenLeft" : "hiddenRight"}
                  variants={entryVariants}
                  transition={{ delay: index * 0.15 }}
                >
                  {/* Spacer for alternating layout - hidden on mobile */}
                  <div
                    className={cn(
                      "hidden lg:block flex-1",
                      isLeft ? "order-2" : "order-1"
                    )}
                  />

                  {/* Card */}
                  <div
                    className={cn(
                      "w-full lg:w-[calc(50%-2rem)] glass-card p-6 rounded-2xl",
                      isLeft ? "lg:pr-12 order-1" : "lg:pl-12 order-2"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {exp.company}
                      </h3>
                      {exp.is_current && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="text-[var(--color-accent)] font-semibold mb-3">
                      {exp.role}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-secondary)] mb-4">
                      <span>
                        {formatDate(exp.start_date)} —{" "}
                        {exp.is_current ? "Present" : formatDate(exp.end_date)}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {exp.location}
                        </span>
                      )}
                    </div>

                    <div className="text-[var(--color-text-secondary)] text-sm leading-relaxed whitespace-pre-line mb-4">
                      {renderDescription(exp.description)}
                    </div>

                    {techTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {techTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] border border-[var(--color-glass-border)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full z-10",
                      "bg-[var(--color-primary)] border-2 border-[var(--color-surface)]",
                      "animate-pulse-glow"
                    )}
                    style={{
                      boxShadow: `0 0 12px var(--color-glow), 0 0 24px rgba(99, 102, 241, 0.3)`,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
