"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  Award,
  Rocket,
  Trophy,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { journeyData } from "@/lib/data";
import { siteConfig } from "@/lib/site.config";

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  Briefcase,
  Award,
  Rocket,
  Trophy,
};

const eventTypeColors: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  education: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/40",
    text: "text-blue-400",
  },
  career: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
  },
  achievement: {
    bg: "bg-amber-500/20",
    border: "border-amber-500/40",
    text: "text-amber-400",
  },
  personal: {
    bg: "bg-violet-500/20",
    border: "border-violet-500/40",
    text: "text-violet-400",
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

export default function JourneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [journey, setJourney] = useState(journeyData.map((j, i) => ({ ...j, id: `fallback-${i}` })));

  useEffect(() => {
    fetch("/api/journey")
      .then((res) => res.json())
      .then((apiData) => {
        if (Array.isArray(apiData) && apiData.length > 0) setJourney(apiData);
      })
      .catch(() => {});
  }, []);

  const sortedJourney = [...journey].sort(
    (a, b) => a.display_order - b.display_order
  );

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="py-24 px-6 md:px-12 lg:px-24 scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className={cn("section-heading gradient-text mb-16")}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {siteConfig.journeyHeading}
        </motion.h2>

        {/* Desktop: Horizontal scrollable timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Gradient connecting line */}
            <div
              className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 rounded-full"
              style={{
                background: `linear-gradient(90deg, var(--color-primary), var(--color-accent))`,
                boxShadow: "0 0 20px var(--color-glow)",
              }}
            />
            <motion.div
              className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full"
              style={{
                background: `linear-gradient(90deg, var(--color-primary), var(--color-accent))`,
              }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={
                isInView
                  ? {
                      scaleX: 1,
                      transition: {
                        duration: 1.2,
                        ease: [0.25, 0.46, 0.45, 0.94] as const,
                      },
                    }
                  : {}
              }
            />

            <div className="relative flex gap-8 overflow-x-auto pb-8 scrollbar-thin">
              {sortedJourney.map((event, index) => {
                const Icon =
                  iconMap[event.icon_name ?? "Briefcase"] ?? Briefcase;
                const colors =
                  eventTypeColors[event.event_type] ?? eventTypeColors.career;

                return (
                  <motion.div
                    key={`${event.title}-${event.display_order}`}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="flex-shrink-0 w-72"
                  >
                    <div
                      className={cn(
                        "glass-card p-6 rounded-2xl border-2 transition-all duration-300",
                        "hover:-translate-y-1 hover:shadow-xl",
                        colors.border
                      )}
                    >
                      <div
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                          colors.bg,
                          colors.text
                        )}
                      >
                        <Icon className="w-7 h-7" strokeWidth={2} />
                      </div>
                      <p
                        className={cn(
                          "text-sm font-semibold mb-2",
                          colors.text
                        )}
                      >
                        {formatDate(event.date)}
                      </p>
                      <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="lg:hidden">
          <div className="relative pl-8">
            {/* Vertical gradient line */}
            <div
              className="absolute left-3 top-0 bottom-0 w-0.5 rounded-full"
              style={{
                background: `linear-gradient(to bottom, var(--color-primary), var(--color-accent))`,
                boxShadow: "0 0 15px var(--color-glow)",
              }}
            />
            <motion.div
              className="absolute left-3 top-0 w-0.5 rounded-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent)]"
              initial={{ scaleY: 0, originY: 0 }}
              animate={
                isInView
                  ? {
                      scaleY: 1,
                      transition: {
                        duration: 1,
                        ease: [0.25, 0.46, 0.45, 0.94] as const,
                      },
                    }
                  : {}
              }
            />

            <div className="space-y-8">
              {sortedJourney.map((event, index) => {
                const Icon =
                  iconMap[event.icon_name ?? "Briefcase"] ?? Briefcase;
                const colors =
                  eventTypeColors[event.event_type] ?? eventTypeColors.career;

                return (
                  <motion.div
                    key={`${event.title}-${event.display_order}-mobile`}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="relative"
                  >
                    <div
                      className={cn(
                        "absolute left-0 w-6 h-6 rounded-full -translate-x-[2.125rem] top-6",
                        "bg-[var(--color-primary)] border-2 border-[var(--color-surface)]",
                        "animate-pulse-glow"
                      )}
                      style={{
                        boxShadow: "0 0 12px var(--color-glow)",
                      }}
                    />
                    <div
                      className={cn(
                        "glass-card p-6 rounded-2xl border-2 ml-2",
                        "transition-all duration-300",
                        colors.border
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                          colors.bg,
                          colors.text
                        )}
                      >
                        <Icon className="w-6 h-6" strokeWidth={2} />
                      </div>
                      <p
                        className={cn(
                          "text-sm font-semibold mb-1",
                          colors.text
                        )}
                      >
                        {formatDate(event.date)}
                      </p>
                      <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
