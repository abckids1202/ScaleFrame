export type ScoreInput = { participantA: number; participantB: number; weight: number; confidence: number };
export type ScoreResult = { normalizedWeights: number[]; contributionsA: number[]; contributionsB: number[]; totalA: number; totalB: number; winner: "A" | "B" | "draw"; tieThreshold: number };

export function normalizeWeights(inputs: ScoreInput[]) {
  const total = inputs.reduce((sum, item) => sum + item.weight, 0);
  if (!Number.isFinite(total) || total <= 0) throw new Error("At least one positive metric weight is required.");
  return inputs.map((item) => item.weight / total);
}

export function calculateComparison(inputs: ScoreInput[]): ScoreResult {
  const normalizedWeights = normalizeWeights(inputs);
  const contributionsA = inputs.map((item, index) => normalizedWeights[index] * (item.participantA / 10));
  const contributionsB = inputs.map((item, index) => normalizedWeights[index] * (item.participantB / 10));
  const totalA = contributionsA.reduce((sum, value) => sum + value, 0); const totalB = contributionsB.reduce((sum, value) => sum + value, 0); const difference = totalA - totalB; const tieThreshold = 0.005;
  return { normalizedWeights, contributionsA, contributionsB, totalA, totalB, winner: Math.abs(difference) < tieThreshold ? "draw" : difference > 0 ? "A" : "B", tieThreshold };
}
