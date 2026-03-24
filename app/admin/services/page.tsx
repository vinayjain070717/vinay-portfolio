"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";
import type { Service } from "@/lib/types";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";
const btnGradient =
  "px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-90 transition-opacity";

const ICON_OPTIONS = [
  "Server",
  "Plug",
  "Cloud",
  "Database",
  "Code",
  "Shield",
  "Smartphone",
  "Globe",
];

async function fetchServices(): Promise<Service[]> {
  const res = await fetch("/api/services");
  if (!res.ok) throw new Error("Failed to fetch services");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function ManageServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon_name: "Server",
  });

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  const refetch = () => {
    fetchServices()
      .then(setServices)
      .catch(() => toast.error("Failed to refresh services"));
  };

  const openAdd = () => {
    setForm({ title: "", description: "", icon_name: "Server" });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setForm({
      title: s.title,
      description: s.description,
      icon_name: s.icon_name,
    });
    setEditingId(s.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      icon_name: form.icon_name,
    };
    try {
      if (editingId) {
        const res = await fetch("/api/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Update failed");
        toast.success("Service updated");
      } else {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, display_order: services.length + 1 }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Add failed");
        toast.success("Service added");
      }
      closeModal();
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save service");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/services?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      setDeleteConfirmId(null);
      toast.success("Service deleted");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete service");
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
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Manage Services</h2>
        <button type="button" onClick={openAdd} className={btnGradient}>
          <Plus className="h-5 w-5 inline mr-2" />
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="glass-card p-6 flex flex-col"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
                {service.description}
              </p>
              <span className="inline-block mt-2 text-xs text-[var(--color-text-muted)]">
                Icon: {service.icon_name}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => openEdit(service)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)]/50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              {deleteConfirmId === service.id ? (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-3 py-2 rounded-lg bg-[var(--color-surface-light)] text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(service.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="glass-card p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {editingId ? "Edit Service" : "Add Service"}
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
