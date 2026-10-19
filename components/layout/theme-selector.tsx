"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "@/lib/theme/theme-context";
import { ThemeId, ThemeConfig } from "@/types/theme";
import { Palette, Check, Sun, Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const ThemeSelector: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = false,
  className,
}) => {
  const { theme, setTheme, themeConfig, mode, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const lightThemes = themes.filter((t) => t.mode === "light");
  const darkThemes = themes.filter((t) => t.mode === "dark");

  const handleSelectTheme = (themeId: ThemeId) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select theme appearance"
        title={`Current Theme: ${themeConfig.name} (${themeConfig.fontName} typography)`}
        className={cn(
          "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
          mode === "dark"
            ? "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600"
            : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 shadow-xs"
        )}
      >
        <span
          className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20 shrink-0"
          style={{ backgroundColor: themeConfig.preview.accent }}
        />
        {mode === "dark" ? (
          <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        )}
        {!compact && (
          <div className="flex items-center gap-1.5 text-left">
            <span className="font-semibold truncate max-w-[110px]">{themeConfig.name}</span>
            <span className="text-[10px] opacity-75 font-mono hidden xl:inline">
              ({themeConfig.fontName})
            </span>
          </div>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-80 rounded-2xl p-3 shadow-2xl z-50 border space-y-3 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md",
            mode === "dark"
              ? "bg-[#0f172a]/95 border-slate-700 text-slate-100 shadow-black/60"
              : "bg-white/98 border-slate-200 text-slate-800 shadow-slate-300/60"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1 pb-2 border-b border-inherit/20">
            <div className="flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Theme & Typography (4 Themes)
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-semibold border border-indigo-500/20">
              2 Light · 2 Dark
            </span>
          </div>

          {/* Section: 2 Light Themes */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold text-amber-500">
              <Sun className="w-3 h-3" />
              <span>Light Modes (2 Themes)</span>
            </div>
            <div className="space-y-1">
              {lightThemes.map((t) => (
                <ThemeOptionItem
                  key={t.id}
                  config={t}
                  isActive={theme === t.id}
                  onClick={() => handleSelectTheme(t.id)}
                />
              ))}
            </div>
          </div>

          {/* Section: 2 Dark Themes */}
          <div className="space-y-1.5 pt-2 border-t border-inherit/20">
            <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold text-indigo-400">
              <Moon className="w-3 h-3" />
              <span>Dark Modes (2 Themes)</span>
            </div>
            <div className="space-y-1">
              {darkThemes.map((t) => (
                <ThemeOptionItem
                  key={t.id}
                  config={t}
                  isActive={theme === t.id}
                  onClick={() => handleSelectTheme(t.id)}
                />
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-inherit/20 px-1 text-[10px] opacity-70 flex items-center justify-between">
            <span>✨ Unique font & colors per theme</span>
            <span className="font-mono">High Contrast</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface ThemeOptionItemProps {
  config: ThemeConfig;
  isActive: boolean;
  onClick: () => void;
}

const ThemeOptionItem: React.FC<ThemeOptionItemProps> = ({ config, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-2 rounded-xl text-left transition-all border text-xs group",
        isActive
          ? "bg-indigo-500/15 border-indigo-500/40 text-current shadow-xs"
          : "border-transparent hover:bg-slate-500/10 hover:border-slate-500/20"
      )}
    >
      <div className="flex items-center gap-2.5">
        {/* Visual 3-swatch preview pill */}
        <div className="flex items-center -space-x-1 shrink-0 p-0.5 rounded-full border border-slate-500/20 bg-slate-500/5">
          <span
            className="w-3.5 h-3.5 rounded-full ring-1 ring-black/20"
            style={{ backgroundColor: config.preview.bg }}
            title="Background"
          />
          <span
            className="w-3.5 h-3.5 rounded-full ring-1 ring-black/20"
            style={{ backgroundColor: config.preview.card }}
            title="Surface"
          />
          <span
            className="w-3.5 h-3.5 rounded-full ring-1 ring-black/20"
            style={{ backgroundColor: config.preview.accent }}
            title="Accent"
          />
        </div>

        <div className="overflow-hidden leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold truncate">{config.name}</span>
            <span
              className="text-[9px] px-1 py-0.2 rounded font-mono font-medium border"
              style={{
                borderColor: config.preview.accent + "50",
                color: config.preview.accent,
              }}
            >
              {config.fontName}
            </span>
          </div>
          <p className="text-[10px] opacity-70 truncate max-w-[170px] mt-0.5">
            {config.description}
          </p>
        </div>
      </div>

      {isActive && (
        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      )}
    </button>
  );
};
