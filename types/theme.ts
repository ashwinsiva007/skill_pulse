export type ThemeMode = "light" | "dark";

export type ThemeId = "light" | "dark";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  mode: ThemeMode;
  fontName: string;
  fontFamily: string;
  description: string;
  preview: {
    bg: string;
    card: string;
    accent: string;
    text: string;
  };
}

export const THEMES_LIST: ThemeConfig[] = [
  {
    id: "light",
    name: "Light Mode",
    mode: "light",
    fontName: "Inter",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    description: "Crisp Scandinavian high-contrast light theme with rich slate typography and pure white cards.",
    preview: {
      bg: "#f8fafc",
      card: "#ffffff",
      accent: "#4f46e5",
      text: "#0f172a",
    },
  },
  {
    id: "dark",
    name: "Dark Mode",
    mode: "dark",
    fontName: "Inter",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    description: "Deep obsidian dark theme with electric indigo accents and high-tech clarity.",
    preview: {
      bg: "#090d16",
      card: "#0f1626",
      accent: "#6366f1",
      text: "#f8fafc",
    },
  },
];


