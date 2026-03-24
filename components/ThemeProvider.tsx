"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase";
import { DEFAULT_CONFIG, getConfigValue } from "@/lib/config";
import type { ConfigMap, SiteSection } from "@/lib/types";

interface ThemeContextValue {
  config: ConfigMap;
  sections: SiteSection[];
  theme: "dark" | "light";
  toggleTheme: () => void;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  config: DEFAULT_CONFIG,
  sections: [],
  theme: "dark",
  toggleTheme: () => {},
  ready: false,
});

export const useTheme = () => useContext(ThemeContext);

const DEFAULT_SECTIONS: SiteSection[] = [
  { id: "1", section_key: "hero", label: "Hero", display_order: 1, is_visible: true },
  { id: "2", section_key: "about", label: "About", display_order: 2, is_visible: true },
  { id: "3", section_key: "services", label: "Services", display_order: 3, is_visible: true },
  { id: "4", section_key: "skills", label: "Skills", display_order: 4, is_visible: true },
  { id: "5", section_key: "experience", label: "Experience", display_order: 5, is_visible: true },
  { id: "6", section_key: "education", label: "Education", display_order: 6, is_visible: true },
  { id: "7", section_key: "projects", label: "Projects", display_order: 7, is_visible: true },
  { id: "8", section_key: "certificates", label: "Certificates", display_order: 8, is_visible: true },
  { id: "9", section_key: "coding-stats", label: "Coding Stats", display_order: 9, is_visible: true },
  { id: "10", section_key: "journey", label: "Journey", display_order: 10, is_visible: true },
  { id: "11", section_key: "resume", label: "Resume", display_order: 11, is_visible: true },
  { id: "12", section_key: "contact", label: "Contact", display_order: 12, is_visible: true },
];

function applyThemeVars(config: ConfigMap) {
  const root = document.documentElement;
  const primary = getConfigValue(config, "primary_color");
  const accent = getConfigValue(config, "accent_color");

  if (primary) {
    root.style.setProperty("--color-primary", primary);
    root.style.setProperty("--color-primary-light", lightenColor(primary, 20));
    root.style.setProperty("--color-primary-dark", darkenColor(primary, 15));
    root.style.setProperty("--color-glow", `${primary}66`);
  }
  if (accent) {
    root.style.setProperty("--color-accent", accent);
    root.style.setProperty("--color-accent-light", lightenColor(accent, 15));
    root.style.setProperty("--color-accent-dark", darkenColor(accent, 15));
  }

  const fontHeading = getConfigValue(config, "font_heading");
  const fontBody = getConfigValue(config, "font_body");
  if (fontHeading) root.style.setProperty("--font-heading", fontHeading);
  if (fontBody) root.style.setProperty("--font-body", fontBody);
}

function hexToHSL(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function lightenColor(hex: string, percent: number): string {
  try {
    const [h, s, l] = hexToHSL(hex);
    return hslToHex(h, s, Math.min(100, l + percent));
  } catch {
    return hex;
  }
}

function darkenColor(hex: string, percent: number): string {
  try {
    const [h, s, l] = hexToHSL(hex);
    return hslToHex(h, s, Math.max(0, l - percent));
  } catch {
    return hex;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfigMap>(DEFAULT_CONFIG);
  const [sections, setSections] = useState<SiteSection[]>(DEFAULT_SECTIONS);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.className = saved;
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      applyThemeVars(DEFAULT_CONFIG);
      setReady(true);
      return;
    }

    async function fetchConfig() {
      try {
        const supabase = createClient();
        const { data: configRows } = await supabase
          .from("site_config")
          .select("config_key, config_value");
        if (configRows && configRows.length > 0) {
          const map: ConfigMap = { ...DEFAULT_CONFIG };
          for (const row of configRows) {
            map[row.config_key] = row.config_value;
          }
          setConfig(map);
          applyThemeVars(map);

          const defaultTheme = map.default_theme;
          if (
            !localStorage.getItem("theme") &&
            (defaultTheme === "dark" || defaultTheme === "light")
          ) {
            setTheme(defaultTheme);
            document.documentElement.className = defaultTheme;
          }
        } else {
          applyThemeVars(DEFAULT_CONFIG);
        }
      } catch {
        applyThemeVars(DEFAULT_CONFIG);
      }

      try {
        const supabase = createClient();
        const { data: sectionRows } = await supabase
          .from("site_sections")
          .select("*")
          .order("display_order");
        if (sectionRows && sectionRows.length > 0) {
          setSections(sectionRows);
        }
      } catch {
        // Use defaults
      }

      setReady(true);
    }

    fetchConfig();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.className = next;
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ config, sections, theme, toggleTheme, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}
