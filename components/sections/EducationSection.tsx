"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { educationData } from "@/lib/data";
import { siteConfig } from "@/lib/site.config";

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function EducationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [education, setEducation] = useState(educationData.map((e, i) => ({ ...e, id: `fallback-${i}` })));

  useEffect(() => {
    fetch("/api/education")
      .then((res) => res.json())
      .then((apiData) => {
        if (Array.isArray(apiData) && apiData.length > 0) setEducation(apiData);
      })
      .catch(() => {});
  }, []);

  const sortedEducation = [...education].sort(
    (a, b) => a.display_order - b.display_order
  );

  return (
    <section
      id="education"
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className={cn("section-heading gradient-text mb-16")}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        >
          {siteConfig.educationHeading}
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-1">
          {sortedEducation.map((edu, index) => (
            <motion.div
              key={`${edu.institution}-${edu.display_order}`}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className={cn(
                "glass-card p-6 md:p-8 rounded-2xl",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
              )}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-2xl",
                    "flex items-center justify-center",
                    "bg-gradient-to-br from-primary to-accent",
                    "shadow-lg shadow-primary/20"
                  )}
                >
                  <GraduationCap className="w-8 h-8 text-white" strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-text-primary mb-1">
                    {edu.institution}
                  </h3>
                  <p className="text-text-secondary font-medium mb-2">
                    {edu.degree} — {edu.field_of_study}
                  </p>
                  <p className="text-text-muted text-sm mb-3">
                    {edu.start_year} — {edu.end_year}
                  </p>

                  {edu.description && (
                    <span
                      className={cn(
                        "inline-flex px-3 py-1 rounded-full text-xs font-semibold",
                        "bg-primary/20 text-primary-light",
                        "border border-primary/30"
                      )}
                    >
                      {edu.description}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
