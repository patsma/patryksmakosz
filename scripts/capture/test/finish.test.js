import { test } from "node:test";
import assert from "node:assert/strict";
import { findHitches } from "../lib/finish.js";

const T = { still: 0.02, moving: 0.3 };

test("one repeated frame between motion is a hitch, timed by frame", () => {
  // diffs[i] is frame i+1 against frame i, so a repeat at index 3 is frame 4
  assert.deepEqual(findHitches([1, 1, 1, 0, 1, 1], T), ["0.07"]);
});

test("two repeats in a row count as two", () => {
  assert.deepEqual(findHitches([1, 1, 0, 0, 1], T).length, 2);
});

test("three or more repeats are stillness, not a hitch", () => {
  assert.deepEqual(findHitches([1, 0, 0, 0, 1], T), []);
});

test("a repeat next to slow motion is not counted", () => {
  assert.deepEqual(findHitches([0.1, 0, 0.1], T), []);
});

test("a repeat at either end is not counted", () => {
  assert.deepEqual(findHitches([0, 1, 1, 0], T), []);
});

test("thresholds come from the caller", () => {
  assert.deepEqual(findHitches([0.2, 0, 0.2], { still: 0.02, moving: 0.1 }).length, 1);
});
