// Weights from PRD §13.
export const SCORE_WEIGHTS = {
  researchRelevance: 0.3,
  consequence: 0.2,
  novelty: 0.15,
  evidenceQuality: 0.15,
  originalReporting: 0.1,
  intellectualGenerativity: 0.1,
} as const;

export function weightedTotal(scores: Record<keyof typeof SCORE_WEIGHTS, number>): number {
  const total = (Object.keys(SCORE_WEIGHTS) as (keyof typeof SCORE_WEIGHTS)[]).reduce(
    (sum, key) => sum + scores[key] * SCORE_WEIGHTS[key],
    0
  );
  return Math.round(total);
}
