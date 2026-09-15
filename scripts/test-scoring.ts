import assert from "node:assert/strict";
import { calculateComparison, normalizeWeights } from "../lib/scoring.ts";

assert.deepEqual(normalizeWeights([{ participantA: 5, participantB: 5, weight: 1, confidence: 1 }, { participantA: 5, participantB: 5, weight: 3, confidence: 1 }]), [.25, .75]);
const decisive = calculateComparison([{ participantA: 10, participantB: 0, weight: 1, confidence: 1 }, { participantA: 0, participantB: 10, weight: 1, confidence: 1 }]);
assert.equal(decisive.totalA, decisive.totalB); assert.equal(decisive.winner, "draw");
const weighted = calculateComparison([{ participantA: 10, participantB: 0, weight: 3, confidence: .8 }, { participantA: 5, participantB: 5, weight: 1, confidence: .7 }]);
assert.equal(weighted.winner, "A"); assert.equal(weighted.totalA, .875); assert.equal(weighted.totalB, .125);
console.log("scoring tests passed");
