"use client";

import React, { useState } from "react";
import { ResumeDraft, ResumeTemplate } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { ClassicTemplate } from "./templates/classic-template";
import { ModernTemplate } from "./templates/modern-template";
import { TechnicalTemplate } from "./templates/technical-template";
import {
  exportResumeToPlainText,
  exportResumeToMarkdown,
  downloadFile,
} from "@/lib/resume/ats-exporter";
import {
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileDown,
  Copy,
  Check,
  Code2,
  FileText,
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
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyText = async () => {
    try {
      const text = exportResumeToPlainText(draft);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy resume text:", err);
    }
  };

  const handleDownloadTxt = () => {
    const text = exportResumeToPlainText(draft);
    const safeTitle = (draft.title || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
    downloadFile(`${safeTitle}_ATS.txt`, text, "text/plain");
    setDownloadSuccess("ATS Plain Text (.txt) downloaded!");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadMd = () => {
    const md = exportResumeToMarkdown(draft);
    const safeTitle = (draft.title || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
    downloadFile(`${safeTitle}.md`, md, "text/markdown");
    setDownloadSuccess("Markdown (.md) downloaded!");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(draft.content, null, 2);
    const safeTitle = (draft.title || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
    downloadFile(`${safeTitle}.json`, jsonStr, "application/json");
    setDownloadSuccess("JSON Resume format downloaded!");
    setTimeout(() => setDownloadSuccess(null), 3000);
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
      <div className="no-print p-3 rounded-t-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
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
            Classic ATS
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

        {/* Download & Export Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Zoom Controls */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 mr-1">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
              title="Zoom out"
              className="text-slate-400 hover:text-white"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono text-slate-300 w-8 text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(120, z + 10))}
              title="Zoom in"
              className="text-slate-400 hover:text-white"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Copy Clean Plain Text */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="text-xs h-8 px-2.5"
            title="Copy ATS clean plain text to clipboard for job applications"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy ATS Text
              </>
            )}
          </Button>

          {/* Download Plain Text File */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTxt}
            className="text-xs h-8 px-2.5"
            title="Download clean .txt file formatted for ATS parsers (Workday, Greenhouse, etc.)"
          >
            <FileText className="w-3.5 h-3.5 mr-1 text-amber-400" />
            ATS .TXT
          </Button>

          {/* Download Markdown */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadMd}
            className="text-xs h-8 px-2 hidden sm:inline-flex"
            title="Download Markdown (.md)"
          >
            <Code2 className="w-3.5 h-3.5 mr-1 text-cyan-400" />
            .MD
          </Button>

          {/* Download JSON */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJson}
            className="text-xs h-8 px-2 hidden md:inline-flex"
            title="Export JSON resume data"
          >
            <FileDown className="w-3.5 h-3.5 mr-1 text-indigo-400" />
            JSON
          </Button>

          {/* PDF Export Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="text-xs h-8 px-3 font-semibold shadow-xs"
            title="Save as PDF or Print"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Download PDF
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle fullscreen preview"
            className="text-xs h-8 px-1.5 hidden sm:inline-flex"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Success notification banner if downloaded */}
      {downloadSuccess && (
        <div className="no-print bg-emerald-950/80 border-x border-b border-emerald-800/60 px-4 py-1.5 text-[11px] text-emerald-300 flex items-center justify-between">
          <span>✓ {downloadSuccess}</span>
          <button onClick={() => setDownloadSuccess(null)} className="text-emerald-400 hover:text-white font-bold ml-2">
            ×
          </button>
        </div>
      )}

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
              Download PDF
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
