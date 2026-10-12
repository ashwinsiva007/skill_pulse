"use client";

import React from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ProfileCompletionResult } from "@/lib/profile-completion";
import { CheckCircle2, Circle, Sparkles, ArrowRight, Info } from "lucide-react";

export interface CompletionBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ProfileCompletionResult;
}

export const CompletionBreakdownModal: React.FC<CompletionBreakdownModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const categories = Array.from(new Set(result.items.map((i) => i.category)));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile Completeness Criteria"
      description="Transparent evaluation score breakdown designed for students, graduates, and tech candidates."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Total Score Header */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Overall Completion Index</span>
            <span className="text-base font-bold text-indigo-400">
              {result.percentage}% ({result.totalPoints}/{result.maxPoints} pts)
            </span>
          </div>
          <Progress
            value={result.percentage}
            size="md"
            indicatorClassName="bg-gradient-to-r from-indigo-500 to-cyan-400"
          />
          <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-300">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Next Best Action:</strong> {result.nextBestAction}
            </span>
          </div>
        </div>

        {/* Categories breakdown */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {categories.map((cat) => {
            const catItems = result.items.filter((i) => i.category === cat);
            const catEarned = catItems.reduce((s, i) => s + i.points, 0);
            const catMax = catItems.reduce((s, i) => s + i.maxPoints, 0);

            return (
              <div
                key={cat}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200">{cat}</h4>
                  <Badge variant={catEarned === catMax ? "emerald" : "indigo"} size="sm">
                    {catEarned} / {catMax} pts
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs"
                    >
                      {item.isMet ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              item.isMet ? "text-slate-200 font-medium" : "text-slate-400"
                            }
                          >
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {item.points}/{item.maxPoints} pts
                          </span>
                        </div>
                        {!item.isMet && (
                          <p className="text-[11px] text-amber-300/80 mt-0.5 leading-snug">
                            Tip: {item.tip}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Link href="/onboarding" onClick={onClose}>
            <Button variant="primary" size="sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Launch Profile Wizard
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
};
