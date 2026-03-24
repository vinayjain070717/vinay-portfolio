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

const FONTS = ["Inter", "Space Grotesk", "Poppins", "Roboto"] as const;

export default function ThemeSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(siteConfig.primaryColor);
  const [accentColor, setAccentColor] = useState(siteConfig.accentColor);
  const [headingFont, setHeadingFont] = useState<typeof FONTS[number]>(siteConfig.fontHeading as typeof FONTS[number]);
  const [bodyFont, setBodyFont] = useState<typeof FONTS[number]>(siteConfig.fontBody as typeof FONTS[number]);
  const [defaultTheme, setDefaultTheme] = useState<"dark" | "light">(siteConfig.defaultTheme);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/config");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to fetch");
        const cfg = data as Record<string, string>;
        if (cfg.primary_color) setPrimaryColor(cfg.primary_color);
        if (cfg.accent_color) setAccentColor(cfg.accent_color);
        if (cfg.font_heading && FONTS.includes(cfg.font_heading as typeof FONTS[number])) setHeadingFont(cfg.font_heading as typeof FONTS[number]);
        if (cfg.font_body && FONTS.includes(cfg.font_body as typeof FONTS[number])) setBodyFont(cfg.font_body as typeof FONTS[number]);
        if (cfg.default_theme === "dark" || cfg.default_theme === "light") setDefaultTheme(cfg.default_theme);
      } catch {
        toast.error("Failed to load config");
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handlePrimaryHexChange = (hex: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hex) || hex === "#") setPrimaryColor(hex || "#000000");
  };

  const handleAccentHexChange = (hex: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hex) || hex === "#") setAccentColor(hex || "#000000");
  };

  async function handleSave() {
    setSaving(true);
    try {
      const updates = [
        { key: "primary_color", value: primaryColor },
        { key: "accent_color", value: accentColor },
        { key: "font_heading", value: headingFont },
        { key: "font_body", value: bodyFont },
        { key: "default_theme", value: defaultTheme },
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
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Theme Settings</h2>

      <div className="glass-card p-6 space-y-6">
        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Primary Color
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-14 h-10 rounded-lg cursor-pointer border border-[var(--color-surface-lighter)] bg-transparent"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => handlePrimaryHexChange(e.target.value)}
              className={cn(inputClass, "flex-1 font-mono")}
            />
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Accent Color
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-14 h-10 rounded-lg cursor-pointer border border-[var(--color-surface-lighter)] bg-transparent"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => handleAccentHexChange(e.target.value)}
              className={cn(inputClass, "flex-1 font-mono")}
            />
          </div>
        </div>

        {/* Fonts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Heading Font
            </label>
            <select
              value={headingFont}
              onChange={(e) => setHeadingFont(e.target.value as typeof FONTS[number])}
              className={inputClass}
            >
              {FONTS.map((f) => (
                <option key={f} value={f} className="bg-[var(--color-surface-light)]">
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Body Font
            </label>
            <select
              value={bodyFont}
              onChange={(e) => setBodyFont(e.target.value as typeof FONTS[number])}
              className={inputClass}
            >
              {FONTS.map((f) => (
                <option key={f} value={f} className="bg-[var(--color-surface-light)]">
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Default Theme */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Default Theme
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDefaultTheme("dark")}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                defaultTheme === "dark"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-surface-lighter)]"
              )}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setDefaultTheme("light")}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                defaultTheme === "light"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-surface-lighter)]"
              )}
            >
              Light
            </button>
          </div>
        </div>

        {/* Live Preview Swatch */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Live Preview
          </label>
          <div className="flex gap-4 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]">
            <div
              className="w-16 h-16 rounded-lg border-2 border-white/20"
              style={{ backgroundColor: primaryColor }}
            />
            <div
              className="w-16 h-16 rounded-lg border-2 border-white/20"
              style={{ backgroundColor: accentColor }}
            />
            <div
              className="flex-1 h-16 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
              }}
            />
          </div>
        </div>

        <button type="button" onClick={handleSave} disabled={saving} className={cn(btnGradient, "flex items-center gap-2")}>
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
