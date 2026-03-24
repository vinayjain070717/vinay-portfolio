"use client";

import { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Skill } from "@/lib/types";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";

const CATEGORIES = ["Programming", "Databases", "DevOps & Tools"];

async function fetchSkills(): Promise<Skill[]> {
  const res = await fetch("/api/skills");
  if (!res.ok) throw new Error("Failed to fetch skills");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "Programming",
    proficiency: 80,
    icon_name: "",
  });

  const categories = useMemo(() => {
    const cats = new Set(skills.map((s) => s.category));
    return ["all", ...Array.from(cats)];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (categoryFilter === "all") return skills;
    return skills.filter((s) => s.category === categoryFilter);
  }, [skills, categoryFilter]);

  useEffect(() => {
    fetchSkills()
      .then(setSkills)
      .catch(() => toast.error("Failed to load skills"))
      .finally(() => setLoading(false));
  }, []);

  const refetch = () => {
    fetchSkills()
      .then(setSkills)
      .catch(() => toast.error("Failed to refresh skills"));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      category: "Programming",
      proficiency: 80,
      icon_name: "",
    });
    setModalOpen(true);
  };

  const openEdit = (s: Skill) => {
    setEditing(s);
    setForm({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
      icon_name: s.icon_name ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = {
      name: form.name,
      category: form.category,
      proficiency: form.proficiency,
      icon_name: form.icon_name || null,
    };
    try {
      if (editing) {
        const res = await fetch("/api/skills", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Update failed");
        toast.success("Skill updated");
      } else {
        const res = await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, display_order: skills.length + 1 }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Add failed");
        toast.success("Skill added");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save skill");
    }
  };

  const handleDelete = async (s: Skill) => {
    try {
      const res = await fetch(`/api/skills?id=${encodeURIComponent(s.id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      setDeleteTarget(null);
      toast.success("Skill deleted");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete skill");
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
    <div className="min-h-screen bg-[var(--color-surface)] p-6">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Manage Skills
          </h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                categoryFilter === cat
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]"
              )}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((s) => (
            <div
              key={s.id}
              className="glass-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)]">
                    {s.name}
                  </h3>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {s.category}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-lighter)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-[var(--color-text-secondary)] hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="w-full h-2 bg-[var(--color-surface-lighter)] rounded-full overflow-hidden">
                <div
                  className="h-full skill-bar rounded-full"
                  style={{ width: `${s.proficiency}%` }}
                />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {s.proficiency}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
              {editing ? "Edit Skill" : "Add Skill"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Skill name"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className={inputClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[var(--color-surface)]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Proficiency: {form.proficiency}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.proficiency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, proficiency: Number(e.target.value) }))
                  }
                  className="w-full h-2 bg-[var(--color-surface-lighter)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Icon Name
                </label>
                <input
                  value={form.icon_name}
                  onChange={(e) => setForm((f) => ({ ...f, icon_name: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g. java, docker"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[var(--color-surface-lighter)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-light)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90"
              >
                {editing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-2 text-[var(--color-text-primary)]">
              Delete Skill
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Are you sure you want to delete &quot;{deleteTarget.name}&quot;?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-[var(--color-surface-lighter)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-light)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
