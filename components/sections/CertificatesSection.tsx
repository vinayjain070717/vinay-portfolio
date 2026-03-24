"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { certificatesData } from "@/lib/data";
import { siteConfig } from "@/lib/site.config";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "w-5 h-5 transition-colors",
            i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-600"
          )}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function getBadgeBorderClass(rating: number) {
  if (rating >= 5) return "border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.2)]";
  if (rating >= 3) return "border-slate-400/50 shadow-[0_0_20px_rgba(148,163,184,0.2)]";
  return "border-slate-600/30";
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

export default function CertificatesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [certificates, setCertificates] = useState(certificatesData.map((c, i) => ({ ...c, id: `fallback-${i}` })));

  useEffect(() => {
    fetch("/api/certificates")
      .then((res) => res.json())
      .then((apiData) => {
        if (Array.isArray(apiData) && apiData.length > 0) setCertificates(apiData);
      })
      .catch(() => {});
  }, []);

  const badges = certificates
    .filter((c) => c.type === "badge")
    .sort((a, b) => a.display_order - b.display_order);

  const certsOnly = certificates
    .filter((c) => c.type === "certificate")
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <section
      id="certificates"
      ref={sectionRef}
      className="py-24 px-6 md:px-12 lg:px-24 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className={cn("section-heading gradient-text mb-16")}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {siteConfig.certificatesHeading}
        </motion.h2>

        {/* Badges */}
        <div className="mb-20">
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-8">
            Badges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge, index) => (
              <motion.a
                key={`${badge.title}-${badge.display_order}`}
                href={badge.credential_url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className={cn(
                  "glass-card p-6 rounded-2xl border-2 transition-all duration-300",
                  "hover:-translate-y-1 hover:shadow-xl",
                  "group",
                  getBadgeBorderClass(badge.star_rating ?? 0)
                )}
                style={{
                  boxShadow: (badge.star_rating ?? 0) >= 5
                    ? "0 0 30px rgba(251,191,36,0.15)"
                    : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors">
                    {badge.title}
                  </h4>
                  <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] flex-shrink-0" />
                </div>
                {badge.star_rating != null && (
                  <div className="mb-3">
                    <StarRating rating={badge.star_rating} />
                  </div>
                )}
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {badge.description}
                </p>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-8">
            Skill Certificates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certsOnly.map((cert, index) => (
              <motion.a
                key={`${cert.title}-${cert.display_order}`}
                href={cert.credential_url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                custom={index + badges.length}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className={cn(
                  "glass-card p-6 rounded-2xl transition-all duration-300",
                  "hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-glow)]/20",
                  "group"
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Verified
                  </span>
                </div>
                <h4 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors mb-1">
                  {cert.title}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {cert.issuer}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
