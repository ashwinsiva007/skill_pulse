/**
 * Action-Problem-Tech-Impact (STAR-aligned) Bullet Point Builder & Helpers
 * Helps users articulate their experience without inventing metrics or qualifications.
 */

export interface ActionVerbGroup {
  category: string;
  verbs: string[];
}

export const ACTION_VERB_GROUPS: ActionVerbGroup[] = [
  {
    category: "Development & Engineering",
    verbs: [
      "Architected",
      "Built",
      "Engineered",
      "Developed",
      "Implemented",
      "Constructed",
      "Programmed",
      "Designed",
      "Deployed",
      "Integrated",
    ],
  },
  {
    category: "Optimization & Performance",
    verbs: [
      "Optimized",
      "Accelerated",
      "Streamlined",
      "Enhanced",
      "Refactored",
      "Reduced",
      "Scaled",
      "Automated",
      "Standardized",
      "Consolidated",
    ],
  },
  {
    category: "Analysis & Problem Solving",
    verbs: [
      "Analyzed",
      "Investigated",
      "Evaluated",
      "Diagnosed",
      "Benchmarked",
      "Formulated",
      "Identified",
      "Synthesized",
      "Audited",
      "Modeled",
    ],
  },
  {
    category: "Collaboration & Leadership",
    verbs: [
      "Collaborated with",
      "Mentored",
      "Led",
      "Co-authored",
      "Organized",
      "Facilitated",
      "Authored",
      "Presented",
      "Coordinated",
      "Spearheaded",
    ],
  },
];

export interface BulletFormulaInput {
  actionVerb: string;
  actionDone: string;
  problemAddressed?: string;
  toolsUsed: string[];
  measurableResult?: string;
}

/**
 * Builds a bullet point following the Action + Problem + Tools + Result framework.
 * If measurable result is omitted, places a visible placeholder rather than hallucinating.
 */
export function buildStarBullet(input: BulletFormulaInput): string {
  const { actionVerb, actionDone, problemAddressed, toolsUsed, measurableResult } = input;

  let bullet = `${actionVerb} ${actionDone.trim()}`;

  if (problemAddressed && problemAddressed.trim().length > 0) {
    bullet += ` to address ${problemAddressed.trim().replace(/^to address\s+/i, "")}`;
  }

  if (toolsUsed && toolsUsed.length > 0) {
    const techList = toolsUsed.filter(Boolean).join(", ");
    if (techList) {
      bullet += ` using ${techList}`;
    }
  }

  if (measurableResult && measurableResult.trim().length > 0) {
    bullet += `, achieving ${measurableResult.trim().replace(/^achieving\s+/i, "")}.`;
  } else {
    bullet += `, resulting in [Measurable impact: e.g. reduced latency by X% / served Y users].`;
  }

  // Ensure ends with a period
  if (!bullet.endsWith(".")) {
    bullet += ".";
  }

  return bullet;
}
