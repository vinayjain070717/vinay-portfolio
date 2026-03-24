"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";
const btnGradient =
  "px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-90 transition-opacity";

const BACKGROUND_STYLES = ["particles", "gradient", "minimal"] as const;

export default function HeroSettingsPage() {
  const [heroTitle, setHeroTitle] = useState("Hi, I'm Vinay Jain");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Software Developer | Building Scalable Microservices"
  );
  const [ctaText, setCtaText] = useState("View My Work");
  const [ctaUrl, setCtaUrl] = useState("#projects");
  const [backgroundStyle, setBackgroundStyle] = useState<typeof BACKGROUND_STYLES[number]>("particles");

  const handleSave = () => {
    toast.success("Hero settings saved");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Hero Settings</h2>

      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Hero Title
          </label>
          <input
            type="text"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className={inputClass}
            placeholder="Hi, I'm Vinay Jain"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Hero Subtitle
          </label>
          <input
            type="text"
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className={inputClass}
            placeholder="Software Developer | Building Scalable Microservices"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            CTA Button Text
          </label>
          <input
            type="text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className={inputClass}
            placeholder="View My Work"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            CTA Button URL
          </label>
          <input
            type="text"
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            className={inputClass}
            placeholder="#projects"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Background Style
          </label>
          <select
            value={backgroundStyle}
            onChange={(e) => setBackgroundStyle(e.target.value as typeof BACKGROUND_STYLES[number])}
            className={inputClass}
          >
            {BACKGROUND_STYLES.map((s) => (
              <option key={s} value={s} className="bg-[var(--color-surface-light)]">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={handleSave} className={cn(btnGradient, "flex items-center gap-2")}>
          Save
        </button>
      </div>
    </div>
  );
}
