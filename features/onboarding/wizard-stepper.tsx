import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface WizardStepDef {
  id: number;
  key: string;
  title: string;
  shortLabel: string;
}

export const WIZARD_STEPS: WizardStepDef[] = [
  { id: 1, key: "personal", title: "Personal Details", shortLabel: "Details" },
  { id: 2, key: "education", title: "Education", shortLabel: "Education" },
  { id: 3, key: "skills", title: "Skills & Evidence", shortLabel: "Skills" },
  { id: 4, key: "preferences", title: "Career Goals", shortLabel: "Goals" },
  { id: 5, key: "projects", title: "Projects", shortLabel: "Projects" },
  { id: 6, key: "experience", title: "Experience & Awards", shortLabel: "Experience" },
  { id: 7, key: "review", title: "Review & Finalize", shortLabel: "Review" },
];

export interface WizardStepperProps {
  currentStep: number;
  completedSteps: number[];
  onSelectStep: (step: number) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
  currentStep,
  completedSteps,
  onSelectStep,
}) => {
  return (
    <div className="w-full py-2">
      {/* Stepper for Tablet / Desktop */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0" />

        {WIZARD_STEPS.map((step) => {
          const isCurrent = currentStep === step.id;
          const isDone = completedSteps.includes(step.id);

          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className="flex flex-col items-center group focus-visible:outline-none z-10 transition-transform active:scale-95"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border",
                  isDone
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-950"
                    : isCurrent
                    ? "bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-500/20 shadow-md"
                    : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
                )}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-[11px] mt-1.5 font-medium transition-colors max-w-[80px] text-center truncate",
                  isCurrent
                    ? "text-indigo-400 font-semibold"
                    : isDone
                    ? "text-slate-200"
                    : "text-slate-400 group-hover:text-slate-300"
                )}
              >
                {step.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Compact Stepper for Mobile */}
      <div className="sm:hidden flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
            Step {currentStep} of {WIZARD_STEPS.length}
          </span>
          <h4 className="text-xs font-semibold text-white">
            {WIZARD_STEPS[currentStep - 1]?.title}
          </h4>
        </div>
        <div className="flex gap-1">
          {WIZARD_STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectStep(s.id)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                s.id === currentStep
                  ? "bg-indigo-500"
                  : completedSteps.includes(s.id)
                  ? "bg-emerald-500"
                  : "bg-slate-700"
              )}
              aria-label={`Jump to step ${s.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
