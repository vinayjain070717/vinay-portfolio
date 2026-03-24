"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";

const inputClass =
  "w-full bg-[var(--color-surface-light)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none";
const btnGradient =
  "px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:opacity-90 transition-opacity";

export default function FooterSettingsPage() {
  const [footerText, setFooterText] = useState("");
  const [copyrightText, setCopyrightText] = useState(
    "© 2026 Vinay Jain. All rights reserved."
  );

  const handleSave = () => {
    toast.success("Footer settings saved");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Footer Settings</h2>

      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Footer Text
          </label>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className={inputClass}
            placeholder="Optional footer message or tagline"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Copyright Text
          </label>
          <input
            type="text"
            value={copyrightText}
            onChange={(e) => setCopyrightText(e.target.value)}
            className={inputClass}
            placeholder="© 2026 Vinay Jain. All rights reserved."
          />
        </div>

        <button type="button" onClick={handleSave} className={cn(btnGradient, "flex items-center gap-2")}>
          Save
        </button>
      </div>
    </div>
  );
}
