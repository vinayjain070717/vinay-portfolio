"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, Download, FileText, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";

const btnGradient =
  "px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-90 transition-opacity";

export default function ManageResumePage() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const checkResume = useCallback(async () => {
    try {
      const res = await fetch("/api/upload");
      const data = await res.json();
      if (data.resume) {
        setResumeUrl(data.resume);
        setFileName("resume.pdf");
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    checkResume();
  }, [checkResume]);

  async function uploadFile(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "resume");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setResumeUrl(data.url);
        setFileName(file.name);
        toast.success("Resume uploaded successfully!");
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
    if (file) uploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDownload = () => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    } else {
      toast.error("No resume uploaded yet");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
        Manage Resume
      </h2>

      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]/50">
          {resumeUrl ? (
            <CheckCircle className="h-8 w-8 text-green-400" />
          ) : (
            <FileText className="h-8 w-8 text-[var(--color-primary)]" />
          )}
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">
              Current status:{" "}
              {resumeUrl
                ? `Resume uploaded (${fileName || "resume.pdf"})`
                : "No resume uploaded"}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {resumeUrl
                ? "Your resume is ready for download on the portfolio."
                : "Upload a PDF to get started."}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Upload Resume (PDF)
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
              isDragging
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                : "border-[var(--color-surface-lighter)] hover:border-[var(--color-primary)]/50"
            )}
          >
            {uploading ? (
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-[var(--color-primary)] animate-spin" />
            ) : (
              <Upload className="h-12 w-12 mx-auto mb-4 text-[var(--color-text-muted)]" />
            )}
            <p className="text-[var(--color-text-primary)] font-medium mb-1">
              {uploading
                ? "Uploading..."
                : "Drag and drop your PDF here, or"}
            </p>
            {!uploading && (
              <label className="inline-block mt-2">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
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

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!resumeUrl}
            className={cn(btnGradient, !resumeUrl && "opacity-50 cursor-not-allowed")}
          >
            <Download className="h-5 w-5 inline mr-2" />
            Download Current Resume
          </button>
        </div>
      </div>
    </div>
  );
}
