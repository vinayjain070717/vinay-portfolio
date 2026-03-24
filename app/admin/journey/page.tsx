"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";
import type { JourneyEvent } from "@/lib/types";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";
const btnGradient =
  "px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-90 transition-opacity";

const EVENT_TYPES = ["education", "career", "achievement", "personal"] as const;
const ICON_OPTIONS = ["GraduationCap", "Briefcase", "Award", "Rocket", "Trophy", "Star"];

async function fetchJourney(): Promise<JourneyEvent[]> {
  const res = await fetch("/api/journey");
  if (!res.ok) throw new Error("Failed to fetch journey");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function ManageJourneyPage() {
  const [items, setItems] = useState<JourneyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    event_type: "career" as typeof EVENT_TYPES[number],
    icon_name: "Briefcase",
  });

  useEffect(() => {
    fetchJourney()
      .then(setItems)
      .catch(() => toast.error("Failed to load journey"))
      .finally(() => setLoading(false));
  }, []);

  const refetch = () => {
    fetchJourney()
      .then(setItems)
      .catch(() => toast.error("Failed to refresh journey"));
  };

  const openAdd = () => {
    setForm({
      title: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      event_type: "career",
      icon_name: "Briefcase",
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (j: JourneyEvent) => {
    setForm({
      title: j.title,
      description: j.description,
      date: j.date,
      event_type: j.event_type,
      icon_name: j.icon_name ?? "Briefcase",
    });
    setEditingId(j.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.date) {
      toast.error("Title, description, and date are required");
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      date: form.date,
      event_type: form.event_type,
      icon_name: form.icon_name,
    };
    try {
      if (editingId) {
        const res = await fetch("/api/journey", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Update failed");
        toast.success("Journey event updated");
      } else {
        const res = await fetch("/api/journey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, display_order: items.length + 1 }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Add failed");
        toast.success("Journey event added");
      }
      closeModal();
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save journey event");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/journey?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      toast.success("Journey event deleted");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete journey event");
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
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Manage Journey</h2>
        <button type="button" onClick={openAdd} className={btnGradient}>
          <Plus className="h-5 w-5 inline mr-2" />
          Add Event
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="glass-card p-4 flex items-center gap-4"
          >
            <span className="text-sm text-[var(--color-text-muted)] w-8">#{index + 1}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] truncate">
                {item.description}
              </p>
              <span className="text-xs text-[var(--color-text-muted)]">
                {item.date} • {item.event_type}
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openEdit(item)}
                className="p-2 rounded-lg bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)]/50"
              >
                <Pencil className="h-4 w-4" />
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
              {editingId ? "Edit Journey Event" : "Add Journey Event"}
            </h3>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
              placeholder="Title"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className={cn(inputClass, "min-h-[80px] resize-y")}
              placeholder="Description"
              rows={3}
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className={inputClass}
            />
            <select
              value={form.event_type}
              onChange={(e) =>
                setForm((p) => ({ ...p, event_type: e.target.value as typeof EVENT_TYPES[number] }))
              }
              className={inputClass}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t} className="bg-[var(--color-surface-light)]">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={form.icon_name}
              onChange={(e) => setForm((p) => ({ ...p, icon_name: e.target.value }))}
              className={inputClass}
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[var(--color-surface-light)]">
                  {opt}
                </option>
              ))}
            </select>
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
