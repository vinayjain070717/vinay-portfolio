"use client";

import { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Star, StarOff, Loader2, Upload, X, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";

function sanitizeForMatch(str: string): string {
  return str.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/_+/g, "_");
}

function getMediaForProject(projectMedia: string[], projectTitle: string): string[] {
  const prefix = sanitizeForMatch(projectTitle);
  if (!prefix) return [];
  return projectMedia.filter((url) => {
    const filename = url.split("/").pop()?.split("?")[0] || "";
    return filename.startsWith(prefix);
  });
}

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const [projectMediaUrls, setProjectMediaUrls] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    long_description: "",
    tech_stack: "",
    github_url: "",
    live_url: "",
    is_featured: false,
  });

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  const refetch = () => {
    fetchProjects()
      .then(setProjects)
      .catch(() => toast.error("Failed to refresh projects"));
  };

  const fetchProjectMedia = useCallback(async () => {
    const res = await fetch("/api/upload");
    const data = await res.json();
    return (data.projectMedia ?? []) as string[];
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      long_description: "",
      tech_stack: "",
      github_url: "",
      live_url: "",
      is_featured: false,
    });
    setMediaUrls([]);
    setModalOpen(true);
    fetchProjectMedia().then(setProjectMediaUrls);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      long_description: p.long_description ?? "",
      tech_stack: (p.tech_stack ?? []).join(", "),
      github_url: p.github_url ?? "",
      live_url: p.live_url ?? "",
      is_featured: p.is_featured,
    });
    setModalOpen(true);
    fetchProjectMedia().then((media) => {
      setProjectMediaUrls(media);
      setMediaUrls(getMediaForProject(media, p.title));
    });
  };

  const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !form.title.trim()) {
      toast.error("Enter project title first before uploading media");
      return;
    }
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", "project-media");
        fd.append("projectTitle", form.title.trim());
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        const url = data.url || data.path;
        if (url) setMediaUrls((prev) => [...prev, url]);
      }
      toast.success("Media uploaded");
      const media = await fetchProjectMedia();
      setProjectMediaUrls(media);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveMedia = async (url: string) => {
    try {
      const res = await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setMediaUrls((prev) => prev.filter((u) => u !== url));
      setProjectMediaUrls((prev) => prev.filter((u) => u !== url));
      toast.success("Media removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    }
  };

  const handleSave = async () => {
    const tech = form.tech_stack
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      long_description: form.long_description || null,
      tech_stack: tech,
      github_url: form.github_url || null,
      live_url: form.live_url || null,
      is_featured: form.is_featured,
    };
    try {
      if (editing) {
        const res = await fetch("/api/projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Update failed");
        toast.success("Project updated");
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, display_order: projects.length + 1 }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Add failed");
        toast.success("Project added");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save project");
    }
  };

  const handleDelete = async (p: Project) => {
    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(p.id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      setDeleteTarget(null);
      toast.success("Project deleted");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  const toggleFeatured = async (p: Project) => {
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, is_featured: !p.is_featured }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed");
      toast.success(p.is_featured ? "Removed from featured" : "Added to featured");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update featured");
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Manage Projects
          </h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-surface-lighter)]">
                  <th className="text-left py-4 px-4 text-[var(--color-text-secondary)] font-medium">
                    Title
                  </th>
                  <th className="text-left py-4 px-4 text-[var(--color-text-secondary)] font-medium">
                    Tech Stack
                  </th>
                  <th className="text-left py-4 px-4 text-[var(--color-text-secondary)] font-medium">
                    Featured
                  </th>
                  <th className="text-right py-4 px-4 text-[var(--color-text-secondary)] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[var(--color-surface-lighter)]/50 hover:bg-[var(--color-surface-light)]/30"
                  >
                    <td className="py-4 px-4 text-[var(--color-text-primary)] font-medium">
                      {p.title}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(p.tech_stack ?? []).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] text-xs"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleFeatured(p)}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-lighter)] transition-colors"
                        title={p.is_featured ? "Remove from featured" : "Add to featured"}
                      >
                        {p.is_featured ? (
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ) : (
                          <StarOff className="w-4 h-4 text-[var(--color-text-muted)]" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg hover:bg-[var(--color-surface-lighter)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-[var(--color-text-secondary)] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
              {editing ? "Edit Project" : "Add Project"}
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
                  placeholder="Project title"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Description
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass}
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Long Description
                </label>
                <textarea
                  value={form.long_description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, long_description: e.target.value }))
                  }
                  className={cn(inputClass, "min-h-[100px] resize-y")}
                  placeholder="Detailed description"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Tech Stack (comma-separated)
                </label>
                <input
                  value={form.tech_stack}
                  onChange={(e) => setForm((f) => ({ ...f, tech_stack: e.target.value }))}
                  className={inputClass}
                  placeholder="Java, Spring Boot, React"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  GitHub URL
                </label>
                <input
                  value={form.github_url}
                  onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
                  className={inputClass}
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  Live URL
                </label>
                <input
                  value={form.live_url}
                  onChange={(e) => setForm((f) => ({ ...f, live_url: e.target.value }))}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_featured: e.target.checked }))
                  }
                  className="rounded border-[var(--color-surface-lighter)]"
                />
                <label
                  htmlFor="is_featured"
                  className="text-sm text-[var(--color-text-secondary)]"
                >
                  Featured
                </label>
              </div>

              {/* Media section */}
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                  Media (images/videos)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {mediaUrls.map((url) => {
                    const isVideo = /\.(mp4|webm|mov)$/i.test(url);
                    return (
                      <div
                        key={url}
                        className="relative group w-20 h-20 rounded-lg overflow-hidden bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)]"
                      >
                        {isVideo ? (
                          <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface-light)]">
                            <Play className="w-8 h-8 text-[var(--color-primary)]" />
                          </div>
                        ) : (
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(url)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleUploadMedia}
                    disabled={uploading || !form.title.trim()}
                    className="hidden"
                  />
                  <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/30 transition-colors text-sm">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload Media"}
                  </span>
                </label>
                {!form.title.trim() && (
                  <p className="text-xs text-amber-500 mt-1">
                    Enter project title first to upload media
                  </p>
                )}
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
              Delete Project
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
