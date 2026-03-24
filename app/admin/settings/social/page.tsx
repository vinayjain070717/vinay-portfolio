"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";
import type { SocialLink } from "@/lib/types";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";
const btnGradient =
  "px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-90 transition-opacity";

const ICON_OPTIONS = ["Linkedin", "Github", "Code2", "Mail", "Twitter", "Globe", "ExternalLink"];

async function fetchSocialLinks(): Promise<SocialLink[]> {
  const res = await fetch("/api/social-links");
  if (!res.ok) throw new Error("Failed to fetch social links");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function SocialLinksPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({
    platform_name: "",
    url: "",
    icon_name: "Linkedin",
  });

  useEffect(() => {
    fetchSocialLinks()
      .then(setLinks)
      .catch(() => toast.error("Failed to load social links"))
      .finally(() => setLoading(false));
  }, []);

  const refetch = () => {
    fetchSocialLinks()
      .then(setLinks)
      .catch(() => toast.error("Failed to refresh social links"));
  };

  const toggleVisibility = async (link: SocialLink) => {
    try {
      const res = await fetch("/api/social-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: link.id, is_visible: !link.is_visible }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed");
      toast.success(link.is_visible ? "Link hidden" : "Link visible");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update visibility");
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const res = await fetch(`/api/social-links?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      setEditingId(null);
      toast.success("Link removed");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete link");
    }
  };

  const startEdit = (id: string) => setEditingId(id);
  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (link: SocialLink) => {
    try {
      const res = await fetch("/api/social-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: link.id,
          platform_name: link.platform_name,
          url: link.url,
          icon_name: link.icon_name,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed");
      setEditingId(null);
      toast.success("Link updated");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update link");
    }
  };

  const addLink = async () => {
    if (!newLink.platform_name.trim() || !newLink.url.trim()) {
      toast.error("Platform name and URL are required");
      return;
    }
    try {
      const res = await fetch("/api/social-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLink,
          display_order: links.length + 1,
          is_visible: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Add failed");
      setNewLink({ platform_name: "", url: "", icon_name: "Linkedin" });
      setShowAddForm(false);
      toast.success("Link added");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add link");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Social Links</h2>

      <div className="glass-card p-6 space-y-4">
        <ul className="space-y-3">
          {links.map((link) => (
            <li
              key={link.id}
              className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]/50"
            >
              {editingId === link.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={link.platform_name}
                    onChange={(e) =>
                      setLinks((prev) =>
                        prev.map((l) =>
                          l.id === link.id ? { ...l, platform_name: e.target.value } : l
                        )
                      )
                    }
                    className={inputClass}
                    placeholder="Platform name"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      setLinks((prev) =>
                        prev.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l))
                      )
                    }
                    className={inputClass}
                    placeholder="URL"
                  />
                  <select
                    value={link.icon_name}
                    onChange={(e) =>
                      setLinks((prev) =>
                        prev.map((l) => (l.id === link.id ? { ...l, icon_name: e.target.value } : l))
                      )
                    }
                    className={inputClass}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[var(--color-surface-light)]">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(link)}
                      className={btnGradient}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-lg bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] text-[var(--color-text-primary)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex-1 font-medium text-[var(--color-text-primary)]">
                    {link.platform_name}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)] truncate max-w-[180px]">
                    {link.url}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleVisibility(link)}
                    className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]/30"
                  >
                    {link.is_visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(link.id)}
                    className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]/30"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLink(link.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {showAddForm ? (
          <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]/50 space-y-3">
            <input
              type="text"
              value={newLink.platform_name}
              onChange={(e) => setNewLink((p) => ({ ...p, platform_name: e.target.value }))}
              className={inputClass}
              placeholder="Platform name"
            />
            <input
              type="url"
              value={newLink.url}
              onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))}
              className={inputClass}
              placeholder="URL"
            />
            <select
              value={newLink.icon_name}
              onChange={(e) => setNewLink((p) => ({ ...p, icon_name: e.target.value }))}
              className={inputClass}
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[var(--color-surface-light)]">
                  {opt}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={addLink} className={btnGradient}>
                Add Link
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[var(--color-surface-lighter)]",
              "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/50"
            )}
          >
            <Plus className="h-5 w-5" />
            Add new link
          </button>
        )}

        <button type="button" onClick={refetch} className={btnGradient}>
          Refresh
        </button>
      </div>
    </div>
  );
}
