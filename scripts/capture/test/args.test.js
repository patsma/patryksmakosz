import { test } from "node:test";
import assert from "node:assert/strict";
import { parseArgs } from "../lib/args.js";

test("draft is the default mode", () => {
  assert.deepEqual(parseArgs(["list.json"]), {
    file: "list.json",
    mode: "draft",
    only: null,
    device: null,
    outDir: undefined,
    format: undefined,
    help: false,
  });
});

test("--final and every option, in any order", () => {
  const o = parseArgs(["--final", "--only", "menu", "list.json", "--device", "mobile", "--out", "/tmp/x", "--format", "h264-hq"]);
  assert.equal(o.mode, "final");
  assert.equal(o.file, "list.json");
  assert.equal(o.only, "menu");
  assert.equal(o.device, "mobile");
  assert.equal(o.outDir, "/tmp/x");
  assert.equal(o.format, "h264-hq");
});

test("--draft is accepted explicitly", () => {
  assert.equal(parseArgs(["--draft", "a.json"]).mode, "draft");
});

test("--help needs no file", () => {
  assert.equal(parseArgs(["--help"]).help, true);
});

test("errors: no file, unknown flag, missing value, two files", () => {
  assert.throws(() => parseArgs([]), /shot list/);
  assert.throws(() => parseArgs(["a.json", "--fast"]), /Unknown option "--fast"/);
  assert.throws(() => parseArgs(["a.json", "--only"]), /--only needs a value/);
  assert.throws(() => parseArgs(["a.json", "b.json"]), /one shot list/);
});
