"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { siteConfig } from "@/lib/site.config";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";
const btnGradient =
  "px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-90 transition-opacity";

export default function SeoSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteTitle, setSiteTitle] = useState(siteConfig.siteTitle);
  const [metaDescription, setMetaDescription] = useState(siteConfig.siteDescription);
  const [ogImageUrl, setOgImageUrl] = useState(siteConfig.ogImageUrl ?? "");

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/config");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to fetch");
        const cfg = data as Record<string, string>;
        if (cfg.site_title) setSiteTitle(cfg.site_title);
        if (cfg.meta_description) setMetaDescription(cfg.meta_description);
        if (cfg.og_image_url !== undefined) setOgImageUrl(cfg.og_image_url);
      } catch {
        toast.error("Failed to load config");
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const updates = [
        { key: "site_title", value: siteTitle },
        { key: "meta_description", value: metaDescription },
        { key: "og_image_url", value: ogImageUrl },
      ];
      for (const { key, value } of updates) {
        const res = await fetch("/api/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Failed to save");
        }
      }
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">SEO Settings</h2>

      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Site Title
          </label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className={inputClass}
            placeholder="Vinay Jain | Software Developer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Meta Description
          </label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className={cn(inputClass, "min-h-[100px] resize-y")}
            placeholder="Brief description for search engines"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            OG Image URL
          </label>
          <input
            type="url"
            value={ogImageUrl}
            onChange={(e) => setOgImageUrl(e.target.value)}
            className={inputClass}
            placeholder="https://example.com/og-image.jpg"
          />
        </div>

        <button type="button" onClick={handleSave} disabled={saving} className={cn(btnGradient, "flex items-center gap-2")}>
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
