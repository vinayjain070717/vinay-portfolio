"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Zap,
  Award,
  Briefcase,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site.config";

const statsConfig = [
  {
    label: "Total Projects",
    icon: FolderKanban,
    href: "/admin/projects",
    apiPath: "/api/projects",
  },
  {
    label: "Total Skills",
    icon: Zap,
    href: "/admin/skills",
    apiPath: "/api/skills",
  },
  {
    label: "Certificates",
    icon: Award,
    href: "/admin/certificates",
    apiPath: "/api/certificates",
  },
  {
    label: "Experience",
    icon: Briefcase,
    href: "/admin/experience",
    apiPath: "/api/experience",
  },
];

const quickActions = [
  { label: "Add Project", href: "/admin/projects/new", icon: Plus },
  { label: "Add Skill", href: "/admin/skills/new", icon: Plus },
  { label: "Add Certificate", href: "/admin/certificates/new", icon: Plus },
  { label: "Add Experience", href: "/admin/experience/new", icon: Plus },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const results = await Promise.all(
          statsConfig.map(async (s) => {
            const res = await fetch(s.apiPath);
            const data = await res.json();
            const count = Array.isArray(data) ? data.length : 0;
            return { key: s.label, count };
          })
        );
        const map: Record<string, number> = {};
        results.forEach((r) => (map[r.key] = r.count));
        setStats(map);
      } catch {
        setStats({});
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Dashboard
        </h2>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Welcome back to {siteConfig.siteName}. Here&apos;s an overview of your portfolio.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : (
          statsConfig.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "glass-card p-6 rounded-xl",
                stat.href && "hover:border-[var(--color-primary)]/30 transition-colors"
              )}
            >
              {stat.href ? (
                <Link href={stat.href} className="block">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-[var(--color-surface-lighter)]/30">
                      <stat.icon className="h-6 w-6 text-[var(--color-primary)]" />
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-[var(--color-text-primary)]">
                    {stats[stat.label] ?? 0}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {stat.label}
                  </p>
                </Link>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-[var(--color-surface-lighter)]/30">
                      <stat.icon className="h-6 w-6 text-[var(--color-primary)]" />
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-[var(--color-text-primary)]">
                    {stats[stat.label] ?? 0}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {stat.label}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg",
                "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]",
                "text-white font-medium text-sm",
                "hover:opacity-90 transition-opacity"
              )}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
