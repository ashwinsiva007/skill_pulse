import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check } from "lucide-react";
import { ACTION_VERB_GROUPS, buildStarBullet } from "@/lib/resume/bullet-helper";

export interface BulletHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBullet: (bullet: string) => void;
  contextTitle?: string;
}

export const BulletHelperModal: React.FC<BulletHelperModalProps> = ({
  isOpen,
  onClose,
  onApplyBullet,
  contextTitle = "Project / Experience",
}) => {
  const [selectedVerb, setSelectedVerb] = useState("Architected");
  const [actionDone, setActionDone] = useState("");
  const [problemAddressed, setProblemAddressed] = useState("");
  const [toolsInput, setToolsInput] = useState("");
  const [measurableResult, setMeasurableResult] = useState("");
  const [usePlaceholderResult, setUsePlaceholderResult] = useState(false);

  const toolsArray = toolsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const previewBullet = actionDone.trim()
    ? buildStarBullet({
        actionVerb: selectedVerb,
        actionDone,
        problemAddressed: problemAddressed.trim() || undefined,
        toolsUsed: toolsArray,
        measurableResult: usePlaceholderResult
          ? undefined
          : measurableResult.trim() || undefined,
      })
    : "Enter an action above to preview your structured bullet point.";

  const handleApply = () => {
    if (actionDone.trim()) {
      onApplyBullet(previewBullet);
      onClose();
      // Reset form
      setActionDone("");
      setProblemAddressed("");
      setToolsInput("");
      setMeasurableResult("");
      setUsePlaceholderResult(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bullet Point Builder"
      description={`Structure bullet points for "${contextTitle}" using the Action + Problem + Tools + Impact framework.`}
      maxWidth="lg"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Info Banner */}
        <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            High-impact resumes clearly convey <strong>what you built</strong>, <strong>why it mattered</strong>, and <strong>the verifiable outcome</strong>. If you lack exact figures, use a bracketed placeholder rather than inventing metrics.
          </p>
        </div>

        {/* 1. Action Verb Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            1. Strong Action Verb
          </label>
          <div className="space-y-2">
            {ACTION_VERB_GROUPS.map((group) => (
              <div key={group.category} className="space-y-1">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  {group.category}
                </span>
                <div className="flex flex-wrap gap-1">
                  {group.verbs.map((verb) => (
                    <button
                      key={verb}
                      type="button"
                      onClick={() => setSelectedVerb(verb)}
                      className={`text-xs px-2.5 py-1 rounded transition-colors ${
                        selectedVerb === verb
                          ? "bg-indigo-600 text-white font-medium shadow-xs"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {verb}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Action performed */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            2. Action Performed <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={actionDone}
            onChange={(e) => setActionDone(e.target.value)}
            placeholder="e.g. automated embedding indexing pipeline and data ingestion jobs"
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* 3. Problem addressed */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            3. Problem Addressed <span className="text-slate-500 font-normal">(Optional context)</span>
          </label>
          <input
            type="text"
            value={problemAddressed}
            onChange={(e) => setProblemAddressed(e.target.value)}
            placeholder="e.g. high latency during concurrent vector similarity queries"
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* 4. Tools or technologies used */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            4. Tools / Technologies Used <span className="text-slate-500 font-normal">(Comma separated)</span>
          </label>
          <input
            type="text"
            value={toolsInput}
            onChange={(e) => setToolsInput(e.target.value)}
            placeholder="e.g. Python, FastAPI, Pinecone, PyTest"
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* 5. Actual result or impact */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            5. Actual Result or Impact
          </label>
          {!usePlaceholderResult ? (
            <input
              type="text"
              value={measurableResult}
              onChange={(e) => setMeasurableResult(e.target.value)}
              placeholder="e.g. 28% query speedup and zero downtime across 10,000 requests"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-800/40 text-[11px] text-amber-300">
              Will insert placeholder: <code>[Measurable impact: e.g. reduced latency by X% / served Y users]</code> for you to fill when measured.
            </div>
          )}

          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={usePlaceholderResult}
              onChange={(e) => setUsePlaceholderResult(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>I do not have final metrics yet — insert an editable placeholder</span>
          </label>
        </div>

        {/* Live Preview Box */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Generated Bullet Preview
            </span>
            <Badge variant="indigo" size="sm">
              STAR Compliant
            </Badge>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
            &ldquo;{previewBullet}&rdquo;
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleApply}
            disabled={!actionDone.trim()}
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Apply to Resume
          </Button>
        </div>
      </div>
    </Modal>
  );
};
