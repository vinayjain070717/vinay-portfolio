"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";

const btnGradient =
  "px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-90 transition-opacity";

type PhotoItem = {
  url: string;
  name: string;
  type: "profile" | "general";
};

export default function ManagePhotosPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch("/api/upload");
      const data = await res.json();
      const items: PhotoItem[] = [];
      if (data.profilePhoto) {
        items.push({
          url: data.profilePhoto,
          name: "Profile Photo",
          type: "profile",
        });
      }
      setPhotos(items);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  async function uploadFile(file: File, type: "profile-photo" | "general") {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success(
          type === "profile-photo"
            ? "Profile photo uploaded! It will appear in the About section."
            : "Photo uploaded!"
        );
        fetchPhotos();
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file, "profile-photo");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, "profile-photo");
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
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
        Manage Photos
      </h2>

      {/* Profile Photo Upload */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Profile Photo
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          This photo appears in the About Me section of your portfolio.
        </p>

        {photos.find((p) => p.type === "profile") && (
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]/50">
            <img
              src={photos.find((p) => p.type === "profile")!.url}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-[var(--color-primary)]"
            />
            <div>
              <p className="text-[var(--color-text-primary)] font-medium">
                Current Profile Photo
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Upload a new photo below to replace it.
              </p>
            </div>
          </div>
        )}

        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "border-2 border-dashed rounded-lg p-10 text-center transition-colors",
            isDragging
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "border-[var(--color-surface-lighter)] hover:border-[var(--color-primary)]/50"
          )}
        >
          {uploading ? (
            <Loader2 className="h-10 w-10 mx-auto mb-3 text-[var(--color-primary)] animate-spin" />
          ) : (
            <Upload className="h-10 w-10 mx-auto mb-3 text-[var(--color-text-muted)]" />
          )}
          <p className="text-[var(--color-text-primary)] font-medium mb-1">
            {uploading ? "Uploading..." : "Drag and drop your profile photo, or"}
          </p>
          {!uploading && (
            <label className="inline-block mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className={btnGradient + " cursor-pointer inline-block"}>
                Browse
              </span>
            </label>
          )}
        </div>
      </div>

      {/* All Photos Grid */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Uploaded Photos
        </h3>
        {photos.length === 0 ? (
          <div className="py-12 text-center rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]/50">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 text-[var(--color-text-muted)]" />
            <p className="text-[var(--color-text-muted)]">
              No photos uploaded yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.url}
                className="relative aspect-square rounded-lg overflow-hidden bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]/50 group"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/60 text-xs text-white truncate">
                  {photo.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
