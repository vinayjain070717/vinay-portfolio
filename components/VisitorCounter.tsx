"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Eye } from "lucide-react";
import { siteConfig } from "@/lib/site.config";

export default function VisitorCounter() {
  const [count, setCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    const stored = localStorage.getItem("visitor_count");
    const hasVisited = sessionStorage.getItem("has_visited");
    let current = stored ? parseInt(stored, 10) : siteConfig.visitorCounter.initialCount;

    if (!hasVisited) {
      current += 1;
      sessionStorage.setItem("has_visited", "true");
    }

    localStorage.setItem("visitor_count", current.toString());
    setCount(current);
  }, []);

  useEffect(() => {
    if (!isInView || count === 0) return;
    let start = 0;
    const duration = 2000;
    const stepTime = Math.max(Math.floor(duration / count), 1);
    const increment = Math.ceil(count / (duration / 16));

    const timer = setInterval(() => {
      start += increment;
      if (start >= count) {
        setDisplayCount(count);
        clearInterval(timer);
      } else {
        setDisplayCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, count]);

  return (
    <motion.div
      ref={ref}
      className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      <Eye size={14} />
      <span>
        <span className="text-[var(--color-primary)] font-semibold">
          {displayCount.toLocaleString()}
        </span>{" "}
        {siteConfig.visitorCounter.suffix}
      </span>
    </motion.div>
  );
}
