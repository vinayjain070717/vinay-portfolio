"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Award, BadgeCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Certificate } from "@/lib/types";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";

async function fetchCertificates(): Promise<Certificate[]> {
  const res = await fetch("/api/certificates");
  if (!res.ok) throw new Error("Failed to fetch certificates");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"badge" | "certificate">("badge");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [form, setForm] = useState({
    title: "",
    issuer: "",
    type: "badge" as "badge" | "certificate",
    star_rating: 5,
    description: "",
    credential_url: "",
  });

  const filtered = certificates.filter((c) => c.type === tab);

  useEffect(() => {
    fetchCertificates()
      .then(setCertificates)
      .catch(() => toast.error("Failed to load certificates"))
      .finally(() => setLoading(false));
  }, []);

  const refetch = () => {
    fetchCertificates()
      .then(setCertificates)
      .catch(() => toast.error("Failed to refresh certificates"));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      title: "",
      issuer: "",
      type: tab,
      star_rating: 5,
      description: "",
      credential_url: "",
    });
    setModalOpen(true);
  };

  const openEdit = (c: Certificate) => {
    setEditing(c);
    setForm({
      title: c.title,
      issuer: c.issuer,
      type: c.type,
      star_rating: c.star_rating ?? 0,
      description: c.description ?? "",
      credential_url: c.credential_url ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const payload = {
      title: form.title,
      issuer: form.issuer,
      type: form.type,
      star_rating: form.type === "badge" ? form.star_rating : undefined,
      description: form.description || null,
      credential_url: form.credential_url || null,
      issue_date: null as string | null,
      badge_image_url: null as string | null,
      display_order: certificates.length + 1,
    };
    try {
      if (editing) {
        const res = await fetch("/api/certificates", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing.id,
            ...payload,
            star_rating: form.type === "badge" ? form.star_rating : undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Update failed");
        toast.success("Updated");
      } else {
        const res = await fetch("/api/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            star_rating: form.type === "badge" ? form.star_rating : undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Add failed");
        toast.success("Added");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save certificate");
    }
  };

  const handleDelete = async (c: Certificate) => {
    try {
      const res = await fetch(`/api/certificates?id=${encodeURIComponent(c.id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      setDeleteTarget(null);
      toast.success("Deleted");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete certificate");
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
            Manage Certificates & Badges
          </h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("badge")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === "badge"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]"
            )}
          >
            <BadgeCheck className="w-4 h-4" />
            Badges
          </button>
          <button
            onClick={() => setTab("certificate")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === "certificate"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]"
            )}
          >
            <Award className="w-4 h-4" />
            Certificates
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="glass-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)]">
                    {c.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {c.issuer}
                  </p>
                  {c.type === "badge" && c.star_rating != null && (
                    <p className="text-xs text-amber-400 mt-1">
                      {"★".repeat(c.star_rating)}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-lighter)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-[var(--color-text-secondary)] hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {c.description && (
                <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                  {c.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
              {editing ? "Edit" : "Add"} {form.type === "badge" ? "Badge" : "Certificate"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                  placeholder="Title"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Issuer
                </label>
                <input
                  value={form.issuer}
                  onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g. HackerRank"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as "badge" | "certificate",
                    }))
                  }
                  className={inputClass}
                >
                  <option value="badge" className="bg-[var(--color-surface)]">
                    Badge
                  </option>
                  <option value="certificate" className="bg-[var(--color-surface)]">
                    Certificate
                  </option>
                </select>
              </div>
              {form.type === "badge" && (
                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                    Star Rating
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={form.star_rating}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        star_rating: Math.min(5, Math.max(1, Number(e.target.value))),
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Description
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g. 5 Star Gold Badge"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Credential URL
                </label>
                <input
                  value={form.credential_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, credential_url: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="https://..."
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
              Delete
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Are you sure you want to delete &quot;{deleteTarget.title}&quot;?
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
