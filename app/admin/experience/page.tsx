"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Experience } from "@/lib/types";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";

async function fetchExperiences(): Promise<Experience[]> {
  const res = await fetch("/api/experience");
  if (!res.ok) throw new Error("Failed to fetch experience");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState({
    company: "",
    role: "",
    description: "",
    start_date: "",
    end_date: "",
    is_current: false,
    location: "",
  });

  useEffect(() => {
    fetchExperiences()
      .then(setExperiences)
      .catch(() => toast.error("Failed to load experience"))
      .finally(() => setLoading(false));
  }, []);

  const refetch = () => {
    fetchExperiences()
      .then(setExperiences)
      .catch(() => toast.error("Failed to refresh experience"));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      company: "",
      role: "",
      description: "",
      start_date: "",
      end_date: "",
      is_current: false,
      location: "",
    });
    setModalOpen(true);
  };

  const openEdit = (e: Experience) => {
    setEditing(e);
    setForm({
      company: e.company,
      role: e.role,
      description: e.description,
      start_date: e.start_date,
      end_date: e.end_date ?? "",
      is_current: e.is_current,
      location: e.location,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    const payload = {
      company: form.company,
      role: form.role,
      description: form.description,
      start_date: form.start_date,
      end_date: form.is_current ? null : form.end_date || null,
      is_current: form.is_current,
      company_logo_url: null as string | null,
      location: form.location,
    };
    try {
      if (editing) {
        const res = await fetch("/api/experience", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Update failed");
        toast.success("Experience updated");
      } else {
        const res = await fetch("/api/experience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, display_order: experiences.length + 1 }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Add failed");
        toast.success("Experience added");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save experience");
    }
  };

  const handleDelete = async (e: Experience) => {
    try {
      const res = await fetch(`/api/experience?id=${encodeURIComponent(e.id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      setDeleteTarget(null);
      toast.success("Experience deleted");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete experience");
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Manage Experience
          </h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        </div>

        <div className="space-y-4">
          {experiences.map((e) => (
            <div
              key={e.id}
              className="glass-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">
                  {e.role} at {e.company}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {e.start_date} – {e.is_current ? "Present" : e.end_date ?? "—"}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">{e.location}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(e)}
                  className="p-2 rounded-lg hover:bg-[var(--color-surface-lighter)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(e)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-[var(--color-text-secondary)] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
              {editing ? "Edit Experience" : "Add Experience"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Company
                </label>
                <input
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  className={inputClass}
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Role
                </label>
                <input
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className={inputClass}
                  placeholder="Job title"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={cn(inputClass, "min-h-[120px] resize-y")}
                  placeholder="Job description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    className={inputClass}
                    disabled={form.is_current}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={form.is_current}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_current: e.target.checked }))
                  }
                  className="rounded border-[var(--color-surface-lighter)]"
                />
                <label
                  htmlFor="is_current"
                  className="text-sm text-[var(--color-text-secondary)]"
                >
                  Current role
                </label>
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Location
                </label>
                <input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className={inputClass}
                  placeholder="City or Remote"
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
              Delete Experience
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Are you sure you want to delete &quot;{deleteTarget.role} at{" "}
              {deleteTarget.company}&quot;?
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
