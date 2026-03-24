"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";
const btnGradient =
  "px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-90 transition-opacity";

type NavItem = {
  id: string;
  label: string;
  section_key: string;
  display_order: number;
  is_visible: boolean;
};

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "1", label: "About", section_key: "about", display_order: 1, is_visible: true },
  { id: "2", label: "Skills", section_key: "skills", display_order: 2, is_visible: true },
  { id: "3", label: "Experience", section_key: "experience", display_order: 3, is_visible: true },
  { id: "4", label: "Projects", section_key: "projects", display_order: 4, is_visible: true },
  { id: "5", label: "Certificates", section_key: "certificates", display_order: 5, is_visible: true },
  { id: "6", label: "Journey", section_key: "journey", display_order: 6, is_visible: true },
  { id: "7", label: "Contact", section_key: "contact", display_order: 7, is_visible: true },
];

export default function NavigationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<NavItem[]>(DEFAULT_NAV_ITEMS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  useEffect(() => {
    async function fetchNavItems() {
      try {
        const res = await fetch("/api/sections");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to fetch");
        if (data.navItems?.length) {
          setItems(data.navItems);
        }
      } catch {
        toast.error("Failed to load navigation");
      } finally {
        setLoading(false);
      }
    }
    fetchNavItems();
  }, []);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next.map((item, i) => ({ ...item, display_order: i + 1 })));
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setItems(next.map((item, i) => ({ ...item, display_order: i + 1 })));
  };

  const toggleVisibility = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, is_visible: !item.is_visible } : item))
    );
  };

  const startEdit = (id: string, label: string) => {
    setEditingId(id);
    setEditLabel(label);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === editingId ? { ...item, label: editLabel } : item
      )
    );
    setEditingId(null);
    setEditLabel("");
    toast.success("Nav item updated");
  };

  async function handleSave() {
    setSaving(true);
    try {
      const payload = items.map((item, i) => ({
        id: item.id,
        label: item.label,
        section_key: item.section_key,
        display_order: i + 1,
        is_visible: item.is_visible,
      }));
      const res = await fetch("/api/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "nav_items", items: payload }),
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
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Navigation Menu</h2>

      <div className="glass-card p-6">
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]/50"
            >
              {editingId === item.id ? (
                <>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className={cn(inputClass, "flex-1")}
                  />
                  <button type="button" onClick={saveEdit} className={btnGradient}>
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditLabel("");
                    }}
                    className="px-4 py-2 rounded-lg bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] text-[var(--color-text-primary)]"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium text-[var(--color-text-primary)]">
                    {item.label}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {item.section_key}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)] w-6">
                    #{item.display_order}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleVisibility(index)}
                    className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]/30"
                  >
                    {item.is_visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(item.id, item.label)}
                    className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]/30"
                  >
                    Edit
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
                    >
                      <ChevronUp className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === items.length - 1}
                      className={cn(
                        "p-2 rounded-lg",
                        index === items.length - 1
                          ? "text-[var(--color-text-muted)] cursor-not-allowed"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]/30"
                      )}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        <button type="button" onClick={handleSave} disabled={saving} className={cn(btnGradient, "mt-6 flex items-center gap-2")}>
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
