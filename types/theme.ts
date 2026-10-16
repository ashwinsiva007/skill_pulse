export type ThemeMode = "light" | "dark";

export type ThemeId =
  | "nordic-light"
  | "emerald-light"
  | "amber-light"
  | "obsidian-dark"
  | "emerald-dark"
  | "amethyst-dark";

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
  // ==========================
  // 3 LIGHT THEMES
  // ==========================
  {
    id: "nordic-light",
    name: "Nordic Frost",
    mode: "light",
    fontName: "Inter",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    description: "Crisp Scandinavian slate with cool indigo accents and crystal-clear contrast.",
    preview: {
      bg: "#f8fafc",
      card: "#ffffff",
      accent: "#4f46e5",
      text: "#0f172a",
    },
  },
  {
    id: "emerald-light",
    name: "Emerald Sage",
    mode: "light",
    fontName: "Plus Jakarta Sans",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    description: "Fresh botanical sage with forest green accents and modern geometric typography.",
    preview: {
      bg: "#f2f8f4",
      card: "#ffffff",
      accent: "#059669",
      text: "#0c2417",
    },
  },
  {
    id: "amber-light",
    name: "Executive Pearl",
    mode: "light",
    fontName: "Manrope",
    fontFamily: "'Manrope', sans-serif",
    description: "Warm ivory pearl with gold-bronze tones and sophisticated executive typography.",
    preview: {
      bg: "#fcfaf7",
      card: "#ffffff",
      accent: "#d97706",
      text: "#271e16",
    },
  },

  // ==========================
  // 3 DARK THEMES
  // ==========================
  {
    id: "obsidian-dark",
    name: "Obsidian Night",
    mode: "dark",
    fontName: "Inter",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    description: "Deep obsidian navy with electric indigo glow and high-tech clarity.",
    preview: {
      bg: "#090d16",
      card: "#0f1626",
      accent: "#6366f1",
      text: "#f8fafc",
    },
  },
  {
    id: "emerald-dark",
    name: "Midnight Pine",
    mode: "dark",
    fontName: "Outfit",
    fontFamily: "'Outfit', sans-serif",
    description: "Deep cyber-forest obsidian with luminous mint emerald accents and sleek curves.",
    preview: {
      bg: "#05140d",
      card: "#092217",
      accent: "#10b981",
      text: "#f0fdf4",
    },
  },
  {
    id: "amethyst-dark",
    name: "Cyberpunk Amethyst",
    mode: "dark",
    fontName: "Space Grotesk",
    fontFamily: "'Space Grotesk', sans-serif",
    description: "Velvety cosmic violet with neon purple accents and futuristic tech typography.",
    preview: {
      bg: "#0c0817",
      card: "#160f29",
      accent: "#a855f7",
      text: "#fdf4ff",
    },
  },
];
