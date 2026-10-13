import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Search, Sparkles } from "lucide-react";
import { ResumeContent, JobDescriptionAnalysis } from "@/types/resume";
import { analyzeJobDescription } from "@/lib/resume/ats-analyzer";

export interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: ResumeContent;
  savedJobDescription?: string;
  onSaveJobDescription: (jobDesc: string) => void;
}

export const JobDescriptionModal: React.FC<JobDescriptionModalProps> = ({
  isOpen,
  onClose,
  currentContent,
  savedJobDescription = "",
  onSaveJobDescription,
}) => {
  const [jobText, setJobText] = useState(savedJobDescription);
  const [analysis, setAnalysis] = useState<JobDescriptionAnalysis | null>(() =>
    savedJobDescription ? analyzeJobDescription(savedJobDescription, currentContent) : null
  );

  const handleAnalyze = () => {
    if (jobText.trim()) {
      const result = analyzeJobDescription(jobText, currentContent);
      setAnalysis(result);
    } else {
      setAnalysis(null);
    }
  };

  const handleSave = () => {
    onSaveJobDescription(jobText);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Target Job Description & ATS Keyword Matcher"
      description="Paste an actual job posting to inspect vocabulary alignment and keyword gaps."
      maxWidth="lg"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Important Disclaimer Banner */}
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 text-xs text-amber-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-200">No Guarantees Disclaimer</span>
            <p className="leading-relaxed">
              This analyzer provides heuristic keyword suggestions to help format your resume for Applicant Tracking Systems. It does <strong>not</strong> guarantee ATS passes, recruiter interviews, or employment selection. Always represent your qualifications truthfully.
            </p>
          </div>
        </div>

        {/* Text Input Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Paste Job Description / Requirements
          </label>
          <textarea
            rows={6}
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste target job posting responsibilities and requirements here..."
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-[11px] text-slate-400">
              {jobText.split(/\s+/).filter(Boolean).length} words entered
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={!jobText.trim()}
            >
              <Search className="w-3.5 h-3.5 mr-1" />
              Analyze Keywords
            </Button>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4 pt-3 border-t border-slate-800">
            {/* Score Metric */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Keyword Alignment Heuristic</span>
                <span className="text-2xl font-bold text-white">{analysis.matchScore}%</span>
              </div>
              <Badge
                variant={
                  analysis.matchScore >= 80
                    ? "emerald"
                    : analysis.matchScore >= 50
                    ? "indigo"
                    : "amber"
                }
                size="md"
              >
                {analysis.matchScore >= 80
                  ? "Strong Alignment"
                  : analysis.matchScore >= 50
                  ? "Moderate Alignment"
                  : "Keyword Gap Detected"}
              </Badge>
            </div>

            {/* Matched Keywords */}
            <div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Matched in your Resume ({analysis.matchedKeywords.length})
              </span>
              {analysis.matchedKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matchedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 text-xs rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No prominent matching keywords found.</p>
              )}
            </div>

            {/* Missing Keywords */}
            <div>
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Mentioned in Job but Missing from Resume ({analysis.missingKeywords.length})
              </span>
              {analysis.missingKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 text-xs rounded bg-amber-950/40 text-amber-300 border border-amber-800/50"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-400 italic">All prominent keywords found in resume!</p>
              )}
            </div>

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Actionable Recommendations
                </span>
                <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4 leading-relaxed">
                  {analysis.suggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={handleSave}>
            Save Job Description with Draft
          </Button>
        </div>
      </div>
    </Modal>
  );
};
