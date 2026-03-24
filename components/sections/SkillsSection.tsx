"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { skillsData } from "@/lib/data";
import { siteConfig } from "@/lib/site.config";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1 * i,
    },
  }),
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

type SkillItem = (typeof skillsData)[number] & { id?: string };

function SkillCard({
  skill,
  index,
  isInView,
}: {
  skill: SkillItem;
  index: number;
  isInView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      setTransform({ rotateX, rotateY });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTransform({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      className="glass-card p-6 rounded-2xl overflow-hidden"
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-xl text-[var(--color-text-primary)]">
          {skill.name}
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] border border-[var(--color-glass-border)]">
          {skill.category}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-secondary)]">Proficiency</span>
          <span className="font-semibold text-[var(--color-accent)]">
            {skill.proficiency}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--color-surface-light)] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, var(--color-primary), var(--color-accent))`,
            }}
            initial={{ width: 0 }}
            animate={{ width: isInView ? `${skill.proficiency}%` : 0 }}
            transition={{
              duration: 1.5,
              ease: [0.25, 0.46, 0.45, 0.94] as const,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function SkillsSection() {
  const [skills, setSkills] = useState<SkillItem[]>(skillsData.map((s, i) => ({ ...s, id: `fallback-${i}` })));
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => res.json())
      .then((apiData) => {
        if (Array.isArray(apiData) && apiData.length > 0) setSkills(apiData);
      })
      .catch(() => {});
  }, []);

  const filteredSkills =
    activeCategory === "All"
      ? [...skills].sort((a, b) => a.display_order - b.display_order)
      : skills
          .filter((s) => s.category === activeCategory)
          .sort((a, b) => a.display_order - b.display_order);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="py-24 px-6 md:px-12 lg:px-24 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className={cn("section-heading gradient-text mb-4")}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {siteConfig.skillsHeading}
        </motion.h2>

        <motion.div
          className="flex flex-wrap gap-2 mb-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {(siteConfig.skillCategories as string[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300",
                activeCategory === cat
                  ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-lg"
                  : "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-glass-border)]"
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {filteredSkills.map((skill, index) => (
            <SkillCard
              key={`${skill.name}-${skill.category}`}
              skill={skill}
              index={index}
              isInView={isInView}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
