"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  GraduationCap,
  Zap,
  Award,
  Server,
  Map,
  FileText,
  Image,
  User,
  Palette,
  LayoutList,
  Navigation,
  Sparkles,
  PanelBottom,
  Link as LinkIcon,
  Search,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site.config";

const mainNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Experience", href: "/admin/experience", icon: Briefcase },
  { label: "Education", href: "/admin/education", icon: GraduationCap },
  { label: "Skills", href: "/admin/skills", icon: Zap },
  { label: "Certificates", href: "/admin/certificates", icon: Award },
  { label: "Services", href: "/admin/services", icon: Server },
  { label: "Journey", href: "/admin/journey", icon: Map },
  { label: "Resume", href: "/admin/resume", icon: FileText },
  { label: "Photos", href: "/admin/photos", icon: Image },
];

const settingsNavItems = [
  { label: "Profile", href: "/admin/settings/profile", icon: User },
  { label: "Theme", href: "/admin/settings/theme", icon: Palette },
  { label: "Sections", href: "/admin/settings/sections", icon: LayoutList },
  { label: "Navigation", href: "/admin/settings/navigation", icon: Navigation },
  { label: "Hero", href: "/admin/settings/hero", icon: Sparkles },
  { label: "Footer", href: "/admin/settings/footer", icon: PanelBottom },
  { label: "Social Links", href: "/admin/settings/social", icon: LinkIcon },
  { label: "SEO", href: "/admin/settings/seo", icon: Search },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthChecked(true);
      return;
    }

    async function checkAuth() {
      if (!isSupabaseConfigured) {
        setAuthChecked(true);
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin/login");
        return;
      }
      setAuthChecked(true);
    }

    checkAuth();
  }, [isLoginPage, router]);

  async function handleLogout() {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/admin/login");
    router.refresh();
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-10 w-10 text-[var(--color-primary)]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-[var(--color-text-secondary)]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  const pageTitle =
    mainNavItems.find((item) => item.href === pathname)?.label ||
    settingsNavItems.find((item) => item.href === pathname)?.label ||
    "Admin";

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64",
          "bg-[var(--color-surface-light)] border-r border-[var(--color-surface-lighter)]/30",
          "transform transition-transform duration-300 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[var(--color-surface-lighter)]/30">
            <span className="text-xl font-bold gradient-text">{siteConfig.adminBranding}</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {mainNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]/30 hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-[var(--color-surface-lighter)]/30">
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Settings
              </p>
              {settingsNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[var(--color-primary)] text-white"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]/30 hover:text-[var(--color-text-primary)]"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom actions */}
          <div className="p-3 border-t border-[var(--color-surface-lighter)]/30 space-y-1">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]/30 hover:text-[var(--color-text-primary)] transition-colors"
            >
              <ExternalLink className="h-5 w-5 shrink-0" />
              Back to Site
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4 bg-[var(--color-surface)]/80 backdrop-blur-sm border-b border-[var(--color-surface-lighter)]/30">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-lighter)]/30 hover:text-[var(--color-text-primary)]"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {pageTitle}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
