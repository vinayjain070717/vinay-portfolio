"use client";

import { useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";

const btnGradient =
  "px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-90 transition-opacity";

type PhotoItem = {
  id: string;
  url: string;
  name: string;
};

export default function ManagePhotosPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    toast.success("Photo upload UI ready (no actual upload for now)");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileSelect = () => {
    toast.success("Photo upload UI ready (no actual upload for now)");
  };

  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    toast.success("Photo removed");
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Manage Photos</h2>

      <div className="glass-card p-6 space-y-6">
        {/* Upload area */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Upload Photos
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
              isDragging
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                : "border-[var(--color-surface-lighter)] hover:border-[var(--color-primary)]/50"
            )}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-[var(--color-text-muted)]" />
            <p className="text-[var(--color-text-primary)] font-medium mb-1">
              Drag and drop photos here, or
            </p>
            <label className="inline-block mt-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className={btnGradient + " cursor-pointer inline-block"}>Browse</span>
            </label>
          </div>
        </div>

        {/* Photo grid */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Uploaded Photos
          </label>
          {photos.length === 0 ? (
            <div className="py-12 text-center rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]/50">
              <p className="text-[var(--color-text-muted)]">No photos uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]/50 group"
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
