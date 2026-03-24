"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Star, GitBranch, Github, Award, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site.config";

function AnimatedCounter({
  value,
  isInView,
  suffix = "",
}: {
  value: number;
  isInView: boolean;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, isInView]);

  return (
    <span>
      {count}+{suffix}
    </span>
  );
}

export default function CodingStatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      id="coding-stats"
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
          {siteConfig.codingStatsHeading}
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GitHub Stats */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-light)] flex items-center justify-center">
                <Github className="w-6 h-6 text-[var(--color-text-primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                GitHub Stats
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)]/50">
                <div className="flex items-center gap-3">
                  <GitBranch className="w-6 h-6 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Repositories
                  </span>
                </div>
                <span className="text-2xl font-bold gradient-text">
                  <AnimatedCounter value={siteConfig.codingStats.github.repos} isInView={isInView} />
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)]/50">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                  <span className="text-[var(--color-text-secondary)]">
                    Stars
                  </span>
                </div>
                <span className="text-2xl font-bold gradient-text">
                  <AnimatedCounter value={siteConfig.codingStats.github.stars} isInView={isInView} />
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)]/50">
                <div className="flex items-center gap-3">
                  <Code2 className="w-6 h-6 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Languages
                  </span>
                </div>
                <span className="text-2xl font-bold gradient-text">
                  <AnimatedCounter value={siteConfig.codingStats.github.languages} isInView={isInView} />
                </span>
              </div>
            </div>
          </motion.div>

          {/* HackerRank Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-8 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                HackerRank Stats
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  {siteConfig.codingStats.hackerrank.goldBadges} Gold Badges
                </p>
                <div className="flex gap-2">
                  {Array.from({ length: siteConfig.codingStats.hackerrank.goldBadges }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={
                        isInView
                          ? { opacity: 1, scale: 1 }
                          : { opacity: 0, scale: 0.5 }
                      }
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30"
                    >
                      <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)]/50">
                <span className="text-[var(--color-text-secondary)]">
                  Verified Certificates
                </span>
                <span className="text-2xl font-bold gradient-text">
                  <AnimatedCounter
                    value={siteConfig.codingStats.hackerrank.certificates}
                    isInView={isInView}
                  />
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
