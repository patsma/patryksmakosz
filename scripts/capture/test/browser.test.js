import { test } from "node:test";
import assert from "node:assert/strict";
import { snapRect } from "../lib/browser.js";

const want = { width: 2880, height: 1800 };

test("the macOS hairline: odd height is trimmed from the top to an even size", () => {
  assert.deepEqual(snapRect({ x: 0, y: 1, width: 2880, height: 1799 }, want), {
    x: 0,
    y: 2,
    width: 2880,
    height: 1798,
  });
});

test("odd width is trimmed from the left", () => {
  assert.deepEqual(snapRect({ x: 0, y: 0, width: 2879, height: 1800 }, want), {
    x: 1,
    y: 0,
    width: 2878,
    height: 1800,
  });
});

test("does not mutate the measured rect", () => {
  const rect = { x: 0, y: 1, width: 2880, height: 1799 };
  snapRect(rect, want);
  assert.equal(rect.height, 1799);
});

test("far too small means something is over the page", () => {
  assert.throws(() => snapRect({ x: 0, y: 176, width: 2880, height: 1624 }, want), /at 0,176/);
});

test("bigger than the viewport is wrong too", () => {
  assert.throws(() => snapRect({ x: 0, y: 0, width: 2882, height: 1800 }, want), /expected 2880x1800/);
});
