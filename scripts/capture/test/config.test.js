import { test } from "node:test";
import assert from "node:assert/strict";
import { homedir } from "os";
import { merge, resolveSettings, shotSettings, loadConfig } from "../lib/config.js";

test("merge: later layers win, objects deep-merge, arrays replace, undefined is skipped", () => {
  const out = merge(
    { a: 1, nested: { x: 1, y: 2 }, list: [1, 2] },
    { a: 2, nested: { y: 3 }, list: [9] },
    { a: undefined, nested: { z: 4 } }
  );
  assert.deepEqual(out, { a: 2, nested: { x: 1, y: 3, z: 4 }, list: [9] });
});

test("merge does not mutate its inputs", () => {
  const base = { nested: { x: 1 } };
  merge(base, { nested: { x: 2 } });
  assert.equal(base.nested.x, 1);
});

test("resolveSettings: config < shot list settings < CLI", () => {
  const config = { outDir: "/a", lead: 500, final: { format: "prores-hq", bitrate: "80M" } };
  const list = { settings: { lead: 900, final: { bitrate: "60M" } } };
  const cli = { outDir: "/cli", format: "h264-hq" };
  const s = resolveSettings(config, list, cli);
  assert.equal(s.outDir, "/cli");
  assert.equal(s.lead, 900);
  assert.equal(s.final.bitrate, "60M");
  assert.equal(s.final.format, "h264-hq");
});

test("resolveSettings: a device added in shot list settings joins the config ones", () => {
  const config = { devices: { desktop: { viewport: { width: 1440, height: 900 } } } };
  const list = { settings: { devices: { tablet: { viewport: { width: 820, height: 1180 } } } } };
  const s = resolveSettings(config, list, {});
  assert.deepEqual(Object.keys(s.devices).sort(), ["desktop", "tablet"]);
});

test("shotSettings: per-shot fields beat settings, warm-up follows the mode", () => {
  const settings = { lead: 500, tail: 800, draft: { warmup: false }, final: { warmup: true } };
  assert.deepEqual(shotSettings(settings, {}, "draft"), { lead: 500, tail: 800, warmup: false });
  assert.deepEqual(shotSettings(settings, {}, "final"), { lead: 500, tail: 800, warmup: true });
  assert.deepEqual(shotSettings(settings, { lead: 0, warmup: true }, "draft"), {
    lead: 0,
    tail: 800,
    warmup: true,
  });
});

test("loadConfig expands ~ in outDir", () => {
  const c = loadConfig();
  assert.ok(c.outDir.startsWith(homedir()), c.outDir);
  assert.ok(c.devices.desktop && c.devices.mobile);
});
