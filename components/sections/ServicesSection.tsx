"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Server, Plug, Cloud, Database, Zap, type LucideIcon } from "lucide-react";
import { servicesData } from "@/lib/data";
import { siteConfig } from "@/lib/site.config";

const iconMap: Record<string, LucideIcon> = { Server, Plug, Cloud, Database, Zap };

export default function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [services, setServices] = useState(servicesData.map((s, i) => ({ ...s, id: `fallback-${i}` })));

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((apiData) => {
        if (Array.isArray(apiData) && apiData.length > 0) setServices(apiData);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="services" className="py-24 px-4 relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="section-heading gradient-text text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {siteConfig.servicesHeading}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon_name] ?? Server;
            return (
              <motion.div
                key={service.title}
                className="glass-card p-8 text-center group hover:scale-105 transition-transform duration-300"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
