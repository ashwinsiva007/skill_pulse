"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { profileRepo } from "@/lib/repositories";
import { CandidateProfile } from "@/types/profile";
import {
  Sparkles,
  LayoutDashboard,
  User,
  FileText,
  Cpu,
  Milestone,
  Briefcase,
  Bookmark,
  Kanban,
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "ATS Resume Builder",
    href: "/resume",
    icon: FileText,
    badge: "ATS Engine",
  },
  {
    label: "Skills Enhancer",
    href: "/skills",
    icon: Cpu,
    badge: "Roadmaps",
  },
  {
    label: "Live Opportunities",
    href: "/opportunities",
    icon: Briefcase,
    badge: "Live Feed",
  },
  {
    label: "Saved Opportunities",
    href: "/saved-opportunities",
    icon: Bookmark,
  },
  {
    label: "Career Roadmap",
    href: "/roadmap",
    icon: Milestone,
  },
  {
    label: "Application Tracker",
    href: "/tracker",
    icon: Kanban,
    badge: "Kanban",
  },
  {
    label: "Profile Wizard",
    href: "/onboarding",
    icon: Sparkles,
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: User,
  },
  {
    label: "Settings & Storage",
    href: "/settings",
    icon: Settings,
  },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard & User DB",
    href: "/",
    icon: LayoutDashboard,
    badge: "Users DB",
  },
  {
    label: "Job Openings Monitor",
    href: "/opportunities",
    icon: Briefcase,
    badge: "Live QA",
  },
  {
    label: "Settings & Storage",
    href: "/settings",
    icon: Settings,
    badge: "Firebase",
  },
];

import { useAuth } from "@/lib/firebase/auth-context";

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { user, profile: authProfile, isAdmin } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile);
    } else {
      profileRepo.getProfile().then(setProfile).catch(console.error);
    }
  }, [authProfile]);

  const isMasterAdmin = isAdmin || user?.email === "admin@gmail.com";
  const navItemsToDisplay = isMasterAdmin ? ADMIN_NAV_ITEMS : NAV_ITEMS;
  const displayName = isMasterAdmin ? "Administrator" : (profile?.name?.trim() || user?.displayName || "My Workspace");
  const initials = isMasterAdmin ? "AD" : (displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SP");
  const displayRole = isMasterAdmin ? "Super Admin" : (profile?.targetRole || "Software Developer");


  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0b101c] border-r border-slate-800/80 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-18" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/70">
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden group focus-visible:outline-none"
            onClick={onCloseMobile}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/30 dark:bg-indigo-600/20 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0 shadow-sm shadow-indigo-950/20">
              <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  SkillPulse
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
                    Pro
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  AI Career & Skill Platform
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className={cn("px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400", isCollapsed && "text-center")}>
            {isCollapsed ? "•••" : isMasterAdmin ? "Master Admin Console" : "Platform Navigation"}
          </div>

          {navItemsToDisplay.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative border",
                  isActive
                    ? "sidebar-link-active bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs dark:bg-indigo-600/15 dark:border-indigo-500/30 dark:text-indigo-300"
                    : "border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-100/90 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-300"
                  )}
                />

                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full truncate">
                    <span className={cn("truncate font-semibold", isActive ? "text-indigo-950 dark:text-white" : "text-slate-800 dark:text-slate-300")}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={cn(
                        "sidebar-badge text-[10px] font-medium px-1.5 py-0.5 rounded-full border transition-colors",
                        isActive
                          ? "bg-indigo-100/90 text-indigo-900 border-indigo-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50"
                          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsed active indicator bar */}
                {isCollapsed && isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Dynamic Candidate Footer Badge */}
        {!isCollapsed ? (
          <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="overflow-hidden leading-tight">
                <p className="font-semibold text-slate-900 dark:text-slate-200 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {isMasterAdmin ? "Administrator Portal" : "Candidate Workspace"}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span className="truncate">{displayRole}</span>
              <span className={cn("font-medium flex items-center gap-1", isMasterAdmin ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                <span className={cn("w-1.5 h-1.5 rounded-full", isMasterAdmin ? "bg-amber-500 dark:bg-amber-400" : "bg-emerald-600 dark:bg-emerald-400")} />
                {isMasterAdmin ? "Master Admin" : user ? "Cloud Synced" : "Local Mode"}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 flex justify-center border-t border-slate-800/70">
            <div
              title={displayName}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-sm"
            >
              {initials}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
