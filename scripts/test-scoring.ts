import assert from "node:assert/strict";
import { calculateComparison, calculateMatchup, normalizeWeights } from "../lib/scoring.ts";

assert.deepEqual(normalizeWeights([{ participantA: 5, participantB: 5, weight: 1, confidence: 1 }, { participantA: 5, participantB: 5, weight: 3, confidence: 1 }]), [.25, .75]);
const decisive = calculateComparison([{ participantA: 10, participantB: 0, weight: 1, confidence: 1 }, { participantA: 0, participantB: 10, weight: 1, confidence: 1 }]);
assert.equal(decisive.totalA, decisive.totalB); assert.equal(decisive.winner, "draw");
const weighted = calculateComparison([{ participantA: 10, participantB: 0, weight: 3, confidence: .8 }, { participantA: 5, participantB: 5, weight: 1, confidence: .7 }]);
assert.equal(weighted.winner, "A"); assert.equal(weighted.totalA, .875); assert.equal(weighted.totalB, .125);
const roster = [
  { participantId: "a1", side: "A" as const, label: "A1" },
  { participantId: "a2", side: "A" as const, label: "A2" },
  { participantId: "b1", side: "B" as const, label: "B1" },
  { participantId: "b2", side: "B" as const, label: "B2" },
  { participantId: "b3", side: "B" as const, label: "B3" },
];
const matchup = calculateMatchup(roster, [
  { weight: 3, confidence: .9, scores: [{ participantId: "a1", value: 8 }, { participantId: "a2", value: 6 }, { participantId: "b1", value: 5 }, { participantId: "b2", value: 5 }, { participantId: "b3", value: 5 }] },
  { weight: 1, confidence: .8, scores: [{ participantId: "a1", value: 5 }, { participantId: "a2", value: 5 }, { participantId: "b1", value: 6 }, { participantId: "b2", value: 6 }, { participantId: "b3", value: 6 }] },
], "scaled");
assert.deepEqual(matchup.normalizedWeights, [.75, .25]);
assert.equal(matchup.sideAPercent, 65);
assert.equal(matchup.sideBPercent, 52.5);
assert.equal(matchup.winner, "A");
const indexMode = calculateMatchup(roster.slice(0, 4), [{ weight: 1, confidence: 1, scores: [{ participantId: "a1", value: 50 }, { participantId: "a2", value: 50 }, { participantId: "b1", value: 50 }, { participantId: "b2", value: 50 }] }], "index");
assert.equal(indexMode.sideAPercent, 50); assert.equal(indexMode.sideBPercent, 50); assert.equal(indexMode.winner, "draw");
console.log("scoring tests passed");
