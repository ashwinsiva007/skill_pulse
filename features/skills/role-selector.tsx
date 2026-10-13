import React from "react";
import { CareerRoleDefinition } from "@/lib/career-catalogue/career-catalogue";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Compass, ChevronDown } from "lucide-react";

export interface RoleSelectorProps {
  roles: CareerRoleDefinition[];
  selectedRole: CareerRoleDefinition;
  onSelectRole: (role: CareerRoleDefinition) => void;
  className?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  roles,
  selectedRole,
  onSelectRole,
  className = "",
}) => {
  return (
    <div className={`p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Target Career Role
            </span>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {selectedRole.title}
              <Badge variant="indigo" size="sm">
                {selectedRole.domain}
              </Badge>
            </h2>
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="relative min-w-[240px]">
          <select
            value={selectedRole.id}
            onChange={(e) => {
              const found = roles.find((r) => r.id === e.target.value);
              if (found) onSelectRole(found);
            }}
            aria-label="Select target career role"
            className="w-full appearance-none px-3.5 py-2.5 pr-9 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.domain})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Role Overview */}
      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <p className="text-slate-300 leading-relaxed max-w-3xl">
          {selectedRole.overview}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400 text-[11px]">Seniority:</span>
          <span className="font-semibold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
            {selectedRole.typicalSeniority}
          </span>
        </div>
      </div>

      {/* Quick Switch Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Briefcase className="w-3 h-3" /> Quick Switch:
        </span>
        {roles.map((r) => {
          const isSelected = r.id === selectedRole.id;
          return (
            <button
              key={r.id}
              onClick={() => onSelectRole(r)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {r.title}
            </button>
          );
        })}
      </div>
    </div>
  );
};
