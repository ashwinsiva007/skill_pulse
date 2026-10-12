import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "indigo" | "cyan" | "emerald" | "amber" | "rose" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border-slate-700/60",
    indigo: "bg-indigo-950/70 text-indigo-300 border-indigo-800/60",
    cyan: "bg-cyan-950/70 text-cyan-300 border-cyan-800/60",
    emerald: "bg-emerald-950/70 text-emerald-300 border-emerald-800/60",
    amber: "bg-amber-950/70 text-amber-300 border-amber-800/60",
    rose: "bg-rose-950/70 text-rose-300 border-rose-800/60",
    neutral: "bg-slate-900 text-slate-400 border-slate-800",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
