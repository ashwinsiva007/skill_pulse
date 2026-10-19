"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeId, ThemeConfig, THEMES_LIST, ThemeMode } from "@/types/theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  themeConfig: ThemeConfig;
  mode: ThemeMode;
  themes: ThemeConfig[];
}

const STORAGE_KEY = "skillpulse_active_theme";
const DEFAULT_THEME: ThemeId = "obsidian-dark";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setActiveThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // Read saved theme from localStorage on initial client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as string | null;
      if (saved && THEMES_LIST.some((t) => t.id === saved)) {
        setActiveThemeState(saved as ThemeId);
        applyThemeToDOM(saved as ThemeId);
      } else {
        const migrated: ThemeId =
          saved === "amber-light" ? "emerald-light" :
          saved === "emerald-dark" ? "obsidian-dark" : DEFAULT_THEME;
        setActiveThemeState(migrated);
        applyThemeToDOM(migrated);
      }
    } catch {
      applyThemeToDOM(DEFAULT_THEME);
    }
    setMounted(true);
  }, []);

  const applyThemeToDOM = (themeId: ThemeId) => {
    const config = THEMES_LIST.find((t) => t.id === themeId) || THEMES_LIST[2];
    const root = document.documentElement;

    root.setAttribute("data-theme", config.id);
    root.setAttribute("data-mode", config.mode);
    root.style.setProperty("--theme-font", config.fontFamily);

    if (config.mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  };

  const setTheme = (newTheme: ThemeId) => {
    setActiveThemeState(newTheme);
    applyThemeToDOM(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // storage unavailable
    }
  };

  const currentConfig = THEMES_LIST.find((t) => t.id === theme) || THEMES_LIST[2];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themeConfig: currentConfig,
        mode: currentConfig.mode,
        themes: THEMES_LIST,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
