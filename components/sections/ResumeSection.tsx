"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FileText, Download, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured, createClient } from "@/lib/supabase";
import { siteConfig } from "@/lib/site.config";

export default function ResumeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchResumeUrl() {
      try {
        const res = await fetch("/api/upload");
        const data = await res.json();
        if (data.resume) {
          setResumeUrl(data.resume);
          return;
        }
      } catch {
        // Ignore
      }

      if (isSupabaseConfigured) {
        try {
          const supabase = createClient();
          const { data } = await supabase.storage
            .from("uploads")
            .list("resume", {
              limit: 1,
              sortBy: { column: "created_at", order: "desc" },
            });
          if (data && data.length > 0) {
            const { data: urlData } = supabase.storage
              .from("uploads")
              .getPublicUrl(`resume/${data[0].name}`);
            setResumeUrl(urlData.publicUrl);
          }
        } catch {
          // Storage not configured yet
        }
      }
    }
    fetchResumeUrl();
  }, []);

  function handleDownload() {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
      return;
    }
    setLoading(true);
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = siteConfig.profile.resumeDownloadFilename;
    link.click();
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <section
      id="resume"
      ref={sectionRef}
      className="py-24 px-6 md:px-12 lg:px-24 scroll-mt-20"
    >
      <div className="max-w-3xl mx-auto">
        <motion.h2
          className={cn("section-heading gradient-text mb-16")}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {siteConfig.resumeHeading}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-12 rounded-2xl text-center"
        >
          <div
            className={cn(
              "w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center",
              "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]"
            )}
          >
            <FileText className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
          <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
            {siteConfig.resumeDescription}
          </p>
          {!resumeUrl && !isSupabaseConfigured && (
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>Upload your resume PDF to <code className="text-xs bg-[var(--color-surface)] px-1.5 py-0.5 rounded">public/resume.pdf</code> or via Admin panel after Supabase setup</span>
            </div>
          )}
          <motion.button
            onClick={handleDownload}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold",
              "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]",
              "text-white transition-all duration-300",
              "hover:shadow-[0_0_30px_var(--color-glow)] hover:scale-105",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "animate-pulse-glow"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5" />
            {loading ? "Downloading..." : "Download Resume"}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
