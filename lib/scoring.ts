export type ScoreInput = { participantA: number; participantB: number; weight: number; confidence: number };
export type ScoreResult = { normalizedWeights: number[]; contributionsA: number[]; contributionsB: number[]; totalA: number; totalB: number; winner: "A" | "B" | "draw"; tieThreshold: number };
export type MatchupParticipant = { participantId: string; side: "A" | "B"; label: string };
export type MatchupMetricInput = { weight: number; confidence: number; scores: Array<{ participantId: string; value: number }> };
export type MatchupResult = { normalizedWeights: number[]; metricResults: Array<{ sideAPercent: number; sideBPercent: number; contributionA: number; contributionB: number; winner: "A" | "B" | "draw" }>; sideAPercent: number; sideBPercent: number; winner: "A" | "B" | "draw"; tieThreshold: number; scoreMode: "scaled" | "index" };

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

export function calculateMatchup(participants: MatchupParticipant[], inputs: MatchupMetricInput[], scoreMode: "scaled" | "index"): MatchupResult {
  const sideA = participants.filter((participant) => participant.side === "A"); const sideB = participants.filter((participant) => participant.side === "B"); if (!sideA.length || !sideB.length) throw new Error("A matchup needs at least one participant on each side.");
  const normalizedWeights = normalizeWeights(inputs.map((input) => ({ participantA: 0, participantB: 0, weight: input.weight, confidence: input.confidence })));
  const toPercent = (value: number) => scoreMode === "scaled" ? value * 10 : value;
  const metricResults = inputs.map((input, index) => { const values = new Map(input.scores.map((score) => [score.participantId, toPercent(score.value)])); const average = (group: MatchupParticipant[]) => group.reduce((sum, participant) => sum + (values.get(participant.participantId) ?? 0), 0) / group.length; const sideAPercent = average(sideA); const sideBPercent = average(sideB); const contributionA = normalizedWeights[index] * sideAPercent; const contributionB = normalizedWeights[index] * sideBPercent; const difference = sideAPercent - sideBPercent; return { sideAPercent, sideBPercent, contributionA, contributionB, winner: Math.abs(difference) < 0.5 ? "draw" as const : difference > 0 ? "A" as const : "B" as const }; });
  const sideAPercent = metricResults.reduce((sum, result) => sum + result.contributionA, 0); const sideBPercent = metricResults.reduce((sum, result) => sum + result.contributionB, 0); const difference = sideAPercent - sideBPercent; return { normalizedWeights, metricResults, sideAPercent, sideBPercent, winner: Math.abs(difference) < 0.5 ? "draw" : difference > 0 ? "A" : "B", tieThreshold: 0.5, scoreMode };
}
