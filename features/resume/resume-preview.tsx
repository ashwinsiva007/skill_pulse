import React, { useState } from "react";
import { ResumeDraft, ResumeTemplate } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { ClassicTemplate } from "./templates/classic-template";
import { ModernTemplate } from "./templates/modern-template";
import { TechnicalTemplate } from "./templates/technical-template";
import {
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

export interface ResumePreviewProps {
  draft: ResumeDraft;
  onTemplateChange?: (template: ResumeTemplate) => void;
  className?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  draft,
  onTemplateChange,
  className = "",
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(90);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const currentTemplate = draft.template || "classic";

  const renderActiveTemplate = () => {
    switch (currentTemplate) {
      case "classic":
        return <ClassicTemplate content={draft.content} />;
      case "modern":
        return <ModernTemplate content={draft.content} />;
      case "technical":
        return <TechnicalTemplate content={draft.content} />;
      default:
        return <ClassicTemplate content={draft.content} />;
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Top Preview Controls Bar (Hidden during print) */}
      <div className="no-print p-3 rounded-t-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Template Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">
            Template:
          </span>
          <button
            type="button"
            onClick={() => onTemplateChange?.("classic")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTemplate === "classic"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-750"
            }`}
          >
            Classic
          </button>
          <button
            type="button"
            onClick={() => onTemplateChange?.("modern")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTemplate === "modern"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-750"
            }`}
          >
            Modern
          </button>
          <button
            type="button"
            onClick={() => onTemplateChange?.("technical")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTemplate === "technical"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-750"
            }`}
          >
            Technical
          </button>
        </div>

        {/* Zoom & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
              title="Zoom out"
              className="text-slate-400 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 w-9 text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(120, z + 10))}
              title="Zoom in"
              className="text-slate-400 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle fullscreen preview"
            className="hidden sm:inline-flex text-xs px-2"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>

          {/* PDF Export Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="text-xs shadow-sm shadow-indigo-950 font-medium"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Export / Print PDF
          </Button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div
        className={`flex-1 overflow-auto bg-slate-950/90 p-4 sm:p-6 flex justify-center items-start rounded-b-xl border-x border-b border-slate-800 ${
          isFullscreen ? "fixed inset-0 z-50 p-6 bg-slate-950 overflow-auto" : ""
        }`}
      >
        {isFullscreen && (
          <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(false)}
            >
              Close Fullscreen
            </Button>
          </div>
        )}

        {/* Scaled A4 Document Container */}
        <div
          id="resume-print-area"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease",
          }}
          className="resume-print-area w-full max-w-[210mm] transition-all"
        >
          {renderActiveTemplate()}
        </div>
      </div>
    </div>
  );
};
