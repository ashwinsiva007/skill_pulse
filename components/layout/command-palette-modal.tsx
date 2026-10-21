"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Sparkles,
  Compass,
  Briefcase,
  Bookmark,
  Kanban,
  FileText,
  User,
  History,
  Settings,
  ArrowRight,
  PlusCircle,
  X,
  Keyboard,
  Trophy,
} from "lucide-react";

interface PaletteItem {
  id: string;
  category: "Navigation" | "Quick Actions";
  title: string;
  description: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const COMMAND_ITEMS: PaletteItem[] = [
  {
    id: "nav-dashboard",
    category: "Navigation",
    title: "Dashboard Overview",
    description: "View skill readiness index, target role, and recent updates",
    route: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "nav-skills",
    category: "Navigation",
    title: "Skills Enhancer & Matrix",
    description: "Manage technical skills, view proficiency ratings and verified tags",
    route: "/skills",
    icon: Sparkles,
  },
  {
    id: "nav-pathway",
    category: "Navigation",
    title: "Career Pathway Explorer",
    description: "Analyze market readiness, role requirements, and learning steps",
    route: "/career-pathway",
    icon: Compass,
  },
  {
    id: "nav-opportunities",
    category: "Navigation",
    title: "Live Opportunities Feed",
    description: "Browse 100+ live verified tech internships and jobs across India",
    route: "/opportunities",
    icon: Briefcase,
    badge: "Live",
  },
  {
    id: "nav-hackathons",
    category: "Navigation",
    title: "Unstop Hackathons Hub",
    description: "Browse 50+ verified campus & corporate hackathons with direct Unstop links",
    route: "/hackathons",
    icon: Trophy,
    badge: "Unstop",
  },
  {
    id: "nav-saved",
    category: "Navigation",
    title: "Saved Bookmarks",
    description: "Quick access to your shortlisted internships and job postings",
    route: "/saved-opportunities",
    icon: Bookmark,
  },
  {
    id: "nav-tracker",
    category: "Navigation",
    title: "Application Pipeline Tracker",
    description: "Drag-and-drop Kanban board for active applications & interviews",
    route: "/tracker",
    icon: Kanban,
  },
  {
    id: "nav-resume",
    category: "Navigation",
    title: "ATS Resume Builder",
    description: "Generate and export ATS-optimized resumes with real-time scoring",
    route: "/resume",
    icon: FileText,
  },
  {
    id: "nav-onboarding",
    category: "Navigation",
    title: "Candidate Profile & Onboarding",
    description: "Update personal details, education, GitHub, and LinkedIn links",
    route: "/onboarding",
    icon: User,
  },
  {
    id: "nav-activity",
    category: "Navigation",
    title: "Activity Log",
    description: "Audit trail of your recent actions, applications, and skill updates",
    route: "/activity",
    icon: History,
  },
  {
    id: "nav-settings",
    category: "Navigation",
    title: "Settings & Cloud Sync",
    description: "Manage Firebase Cloud Firestore synchronization and local data",
    route: "/settings",
    icon: Settings,
  },
  {
    id: "action-new-skill",
    category: "Quick Actions",
    title: "Add New Skill to Matrix",
    description: "Record a new technology, library, or engineering capability",
    route: "/skills",
    icon: PlusCircle,
  },
  {
    id: "action-build-resume",
    category: "Quick Actions",
    title: "Build Tailored Resume",
    description: "Launch the ATS Resume Generator wizard for your target role",
    route: "/resume",
    icon: FileText,
  },
  {
    id: "action-track-app",
    category: "Quick Actions",
    title: "Track New Application",
    description: "Log an opportunity into your stage-by-stage pipeline",
    route: "/tracker",
    icon: Kanban,
  },
];

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items matching query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return COMMAND_ITEMS;
    const q = query.toLowerCase().trim();
    return COMMAND_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (item: PaletteItem) => {
    onClose();
    router.push(item.route);
  };

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
        );
      } else if (e.key === "Enter" && filteredItems.length > 0) {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose, router]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-700/90 bg-slate-900/95 shadow-2xl overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, tools, or quick actions..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-500 hover:text-slate-300 rounded"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800 rounded border border-slate-700 shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-1">
              <p className="font-semibold text-slate-400">No matching commands found</p>
              <p>Try searching for &quot;opportunities&quot;, &quot;resume&quot;, &quot;skills&quot;, or &quot;tracker&quot;</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-indigo-600/20 border border-indigo-500/40 text-slate-100"
                      : "text-slate-300 hover:bg-slate-800/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-indigo-500/30 text-indigo-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate text-slate-200">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? "text-indigo-400 translate-x-0.5" : "text-slate-600"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px]">
            <Keyboard className="w-3 h-3 text-slate-400" />
            <span>Cmd+K / Ctrl+K</span>
          </span>
        </div>
      </div>
    </div>
  );
};
