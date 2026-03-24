"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { siteConfig } from "@/lib/site.config";
import { cn } from "@/lib/utils";
import { Loader2, Upload, Camera } from "lucide-react";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";

function getDefaultForm() {
  const p = siteConfig.profile;
  return {
    id: null as string | null,
    full_name: p.fullName,
    title: p.title,
    bio: p.bio,
    email: p.email,
    phone: p.phone,
    location: p.location,
    linkedin_url: p.linkedinUrl ?? "",
    github_url: p.githubUrl ?? "",
    hackerrank_url: p.hackerrankUrl ?? "",
    leetcode_url: "",
    website_url: "",
  };
}

export default function AdminProfileSettingsPage() {
  const [form, setForm] = useState(getDefaultForm);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => {
        setForm({
          id: data.id ?? null,
          full_name: data.full_name ?? siteConfig.profile.fullName,
          title: data.title ?? siteConfig.profile.title,
          bio: data.bio ?? siteConfig.profile.bio,
          email: data.email ?? siteConfig.profile.email,
          phone: data.phone ?? siteConfig.profile.phone,
          location: data.location ?? siteConfig.profile.location,
          linkedin_url: data.linkedin_url ?? siteConfig.profile.linkedinUrl ?? "",
          github_url: data.github_url ?? siteConfig.profile.githubUrl ?? "",
          hackerrank_url: data.hackerrank_url ?? siteConfig.profile.hackerrankUrl ?? "",
          leetcode_url: data.leetcode_url ?? "",
          website_url: data.website_url ?? "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));

    fetch("/api/upload")
      .then((r) => r.json())
      .then((d) => { if (d.profilePhoto) setPhotoUrl(d.profilePhoto); })
      .catch(() => {});
  }, []);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "profile-photo");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setPhotoUrl(data.url);
        toast.success("Profile photo updated!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setPhotoUploading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...payload } = form;
      const body = id ? { id, ...payload } : payload;
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed");
      toast.success("Profile saved successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-8">
          Profile Settings
        </h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Photo */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Profile Photo
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center border-2 border-[var(--color-primary)]">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">VJ</span>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  {photoUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </label>
              </div>
              <div>
                <p className="text-[var(--color-text-primary)] font-medium">
                  {photoUrl ? "Change Photo" : "Upload Photo"}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Click the photo or drag an image. This appears in the About section.
                </p>
                <label className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
                  <Upload className="h-4 w-4" />
                  Browse
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Basic Info
            </h2>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                Full Name
              </label>
              <input
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className={inputClass}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputClass}
                placeholder="e.g. Software Developer"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className={cn(inputClass, "min-h-[120px] resize-y")}
                placeholder="About you"
              />
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Contact
            </h2>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputClass}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                Location
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className={inputClass}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Social & Links
            </h2>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                LinkedIn URL
              </label>
              <input
                value={form.linkedin_url}
                onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
                className={inputClass}
                placeholder="https://linkedin.com/in/..."
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
                HackerRank URL
              </label>
              <input
                value={form.hackerrank_url}
                onChange={(e) => setForm((f) => ({ ...f, hackerrank_url: e.target.value }))}
                className={inputClass}
                placeholder="https://hackerrank.com/..."
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                LeetCode URL
              </label>
              <input
                value={form.leetcode_url}
                onChange={(e) => setForm((f) => ({ ...f, leetcode_url: e.target.value }))}
                className={inputClass}
                placeholder="https://leetcode.com/..."
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                Website URL
              </label>
              <input
                value={form.website_url}
                onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
