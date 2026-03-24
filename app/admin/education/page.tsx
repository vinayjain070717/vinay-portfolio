"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";
import type { Education } from "@/lib/types";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";
const btnGradient =
  "px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-90 transition-opacity";

async function fetchEducation(): Promise<Education[]> {
  const res = await fetch("/api/education");
  if (!res.ok) throw new Error("Failed to fetch education");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function ManageEducationPage() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    start_year: new Date().getFullYear(),
    end_year: new Date().getFullYear(),
    description: "",
  });

  useEffect(() => {
    fetchEducation()
      .then(setItems)
      .catch(() => toast.error("Failed to load education"))
      .finally(() => setLoading(false));
  }, []);

  const refetch = () => {
    fetchEducation()
      .then(setItems)
      .catch(() => toast.error("Failed to refresh education"));
  };

  const openAdd = () => {
    const year = new Date().getFullYear();
    setForm({
      institution: "",
      degree: "",
      field_of_study: "",
      start_year: year - 4,
      end_year: year,
      description: "",
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (e: Education) => {
    setForm({
      institution: e.institution,
      degree: e.degree,
      field_of_study: e.field_of_study,
      start_year: e.start_year,
      end_year: e.end_year,
      description: e.description ?? "",
    });
    setEditingId(e.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.institution.trim() || !form.degree.trim() || !form.field_of_study.trim()) {
      toast.error("Institution, degree, and field of study are required");
      return;
    }
    if (form.start_year > form.end_year) {
      toast.error("Start year must be before end year");
      return;
    }
    const payload = {
      institution: form.institution,
      degree: form.degree,
      field_of_study: form.field_of_study,
      start_year: form.start_year,
      end_year: form.end_year,
      description: form.description || null,
    };
    try {
      if (editingId) {
        const res = await fetch("/api/education", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Update failed");
        toast.success("Education updated");
      } else {
        const res = await fetch("/api/education", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, display_order: items.length + 1 }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Add failed");
        toast.success("Education added");
      }
      closeModal();
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save education");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/education?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      toast.success("Education deleted");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete education");
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
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Manage Education</h2>
        <button type="button" onClick={openAdd} className={btnGradient}>
          <Plus className="h-5 w-5 inline mr-2" />
          Add Education
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="glass-card p-6">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">
              {item.institution}
            </h3>
            <p className="text-sm text-[var(--color-accent)]">
              {item.degree} in {item.field_of_study}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {item.start_year} – {item.end_year}
            </p>
            {item.description && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-2">{item.description}</p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => openEdit(item)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)]/50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="glass-card p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {editingId ? "Edit Education" : "Add Education"}
            </h3>
            <input
              type="text"
              value={form.institution}
              onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))}
              className={inputClass}
              placeholder="Institution"
            />
            <input
              type="text"
              value={form.degree}
              onChange={(e) => setForm((p) => ({ ...p, degree: e.target.value }))}
              className={inputClass}
              placeholder="Degree"
            />
            <input
              type="text"
              value={form.field_of_study}
              onChange={(e) => setForm((p) => ({ ...p, field_of_study: e.target.value }))}
              className={inputClass}
              placeholder="Field of study"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                  Start Year
                </label>
                <input
                  type="number"
                  value={form.start_year}
                  onChange={(e) => setForm((p) => ({ ...p, start_year: parseInt(e.target.value) || 0 }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                  End Year
                </label>
                <input
                  type="number"
                  value={form.end_year}
                  onChange={(e) => setForm((p) => ({ ...p, end_year: parseInt(e.target.value) || 0 }))}
                  className={inputClass}
                />
              </div>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className={cn(inputClass, "min-h-[80px] resize-y")}
              placeholder="Description (e.g. CGPA)"
              rows={3}
            />
            <div className="flex gap-2">
              <button type="button" onClick={handleSubmit} className={btnGradient}>
                {editingId ? "Update" : "Add"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
