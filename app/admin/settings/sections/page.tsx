"use client";

import { useState, useEffect } from "react";
import { GripVertical, Eye, EyeOff, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";
const btnGradient =
  "px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-90 transition-opacity";

type SectionItem = {
  id: string;
  section_key: string;
  label: string;
  display_order: number;
  is_visible: boolean;
};

const DEFAULT_SECTIONS: SectionItem[] = [
  { id: "1", section_key: "hero", label: "Hero", display_order: 1, is_visible: true },
  { id: "2", section_key: "about", label: "About", display_order: 2, is_visible: true },
  { id: "3", section_key: "services", label: "Services", display_order: 3, is_visible: true },
  { id: "4", section_key: "skills", label: "Skills", display_order: 4, is_visible: true },
  { id: "5", section_key: "experience", label: "Experience", display_order: 5, is_visible: true },
  { id: "6", section_key: "education", label: "Education", display_order: 6, is_visible: true },
  { id: "7", section_key: "projects", label: "Projects", display_order: 7, is_visible: true },
  { id: "8", section_key: "certificates", label: "Certificates", display_order: 8, is_visible: true },
  { id: "9", section_key: "coding-stats", label: "Coding Stats", display_order: 9, is_visible: true },
  { id: "10", section_key: "journey", label: "Journey", display_order: 10, is_visible: true },
  { id: "11", section_key: "resume", label: "Resume", display_order: 11, is_visible: true },
  { id: "12", section_key: "contact", label: "Contact", display_order: 12, is_visible: true },
];

export default function SectionsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<SectionItem[]>(DEFAULT_SECTIONS);

  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch("/api/sections");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to fetch");
        if (data.sections?.length) {
          setSections(data.sections);
        }
      } catch {
        toast.error("Failed to load sections");
      } finally {
        setLoading(false);
      }
    }
    fetchSections();
  }, []);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...sections];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSections(
      next.map((s, i) => ({ ...s, display_order: i + 1 }))
    );
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const next = [...sections];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setSections(
      next.map((s, i) => ({ ...s, display_order: i + 1 }))
    );
  };

  const toggleVisibility = (index: number) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, is_visible: !s.is_visible } : s))
    );
  };

  async function handleSave() {
    setSaving(true);
    try {
      const items = sections.map((s, i) => ({
        id: s.id,
        section_key: s.section_key,
        label: s.label,
        display_order: i + 1,
        is_visible: s.is_visible,
      }));
      const res = await fetch("/api/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sections", items }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
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
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Section Manager</h2>

      <div className="glass-card p-6">
        <ul className="space-y-2">
          {sections.map((section, index) => (
            <li
              key={section.section_key}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]/50"
            >
              <GripVertical className="h-5 w-5 text-[var(--color-text-muted)] shrink-0" />
              <span className="flex-1 font-medium text-[var(--color-text-primary)]">
                {section.label}
              </span>
              <span className="text-sm text-[var(--color-text-muted)] w-8">
                #{section.display_order}
              </span>
              <button
                type="button"
                onClick={() => toggleVisibility(index)}
                className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]/30 hover:text-[var(--color-text-primary)]"
                aria-label={section.is_visible ? "Hide section" : "Show section"}
              >
                {section.is_visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className={cn(
                    "p-2 rounded-lg",
                    index === 0
                      ? "text-[var(--color-text-muted)] cursor-not-allowed"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]/30"
                  )}
                  aria-label="Move up"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === sections.length - 1}
                  className={cn(
                    "p-2 rounded-lg",
                    index === sections.length - 1
                      ? "text-[var(--color-text-muted)] cursor-not-allowed"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]/30"
                  )}
                  aria-label="Move down"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button type="button" onClick={handleSave} className={cn(btnGradient, "mt-6")}>
          Save
        </button>
      </div>
    </div>
  );
}
