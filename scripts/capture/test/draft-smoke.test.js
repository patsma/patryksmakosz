/**
 * End to end, headless: the fixture recorded in draft mode, then a shot list with a broken
 * selector. Takes under a minute. The final mode needs the screen, so it stays a manual check (README).
 */

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const cli = here("../capture-site.js");
const fixture = here("../fixture/fixture.json");

const temps = [];
after(() => temps.forEach((d) => rmSync(d, { recursive: true, force: true })));
const tempDir = () => temps[temps.push(mkdtempSync(join(tmpdir(), "capture-smoke-"))) - 1];

function capture(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", timeout: 180000 });
}

function draftDir(out, id) {
  const [date] = readdirSync(join(out, id));
  return join(out, id, date, "draft");
}

test("draft: the fixture gives an mp4 and a contact sheet per shot", () => {
  const out = tempDir();
  const run = capture([fixture, "--device", "desktop", "--out", out]);
  assert.equal(run.status, 0, run.stdout + run.stderr);
  const dir = draftDir(out, "fixture");
  for (const shot of ["idle", "scroll", "hover"]) {
    for (const file of [`desktop-${shot}.mp4`, `desktop-${shot}-sheet.png`]) {
      assert.ok(existsSync(join(dir, file)) && statSync(join(dir, file)).size > 1000, `${file} missing or empty`);
    }
  }
  assert.ok(existsSync(join(dir, "desktop-hover-card.png")), "screenshot action wrote nothing");
});

test("draft: a broken selector fails with the shot, action and selector", () => {
  const out = tempDir();
  const list = join(out, "broken.json");
  writeFileSync(
    list,
    JSON.stringify({
      id: "broken",
      baseUrl: pathToFileURL(here("../fixture/")).href,
      shots: [{ name: "menu", path: "index.html", actions: [{ pause: 100 }, { click: "#nope" }] }],
    })
  );
  const run = capture([list, "--out", out]);
  assert.equal(run.status, 1);
  assert.match(run.stderr, /desktop-menu: action 2 click "#nope": not found/);
  assert.ok(existsSync(join(draftDir(out, "broken"), "desktop-menu-failed.png")));
});

test("a bad shot list is rejected before anything records", () => {
  const out = tempDir();
  const list = join(out, "typo.json");
  writeFileSync(list, JSON.stringify({ id: "typo", baseUrl: "https://example.com/", shots: [{ name: "a", actions: [{ hovr: "a" }] }] }));
  const run = capture([list, "--out", out]);
  assert.equal(run.status, 1);
  assert.match(run.stderr, /shots\[0\]\.actions\[0\]: unknown action "hovr"/);
  assert.deepEqual(readdirSync(out), ["typo.json"]);
});
