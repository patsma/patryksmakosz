#!/usr/bin/env node
/**
 * Record portfolio clips of a live site from a shot list, one ProRes 422 HQ 60fps .mov per shot.
 *
 * Usage:
 *   node scripts/capture/capture-site.js scripts/capture/shots/<id>.json [--only <shot>] [--device desktop|mobile]
 *
 * Output: ~/Movies/portfolio-captures/<id>/<YYYY-MM-DD>/<device>-<shot>.mov
 * The Mac must be left alone while it runs - the whole built-in screen is being filmed.
 * See scripts/capture/README.md.
 */

import { readFileSync, mkdirSync, unlinkSync } from "fs";
import { homedir } from "os";
import { join, dirname, resolve } from "path";
import { pathToFileURL } from "url";
import { preflight, waitForUnlock } from "./lib/preflight.js";
import { openBrowser, measureViewport, parkPointer, bringForward, DEVICES } from "./lib/browser.js";
import { installHideStyles, preparePage } from "./lib/prepare-page.js";
import { runAction } from "./lib/actions.js";
import * as recorder from "./lib/screen-recorder.js";
import { finish } from "./lib/finish.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
  const opts = { file: null, only: null, device: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--only") opts.only = argv[++i];
    else if (argv[i] === "--device") opts.device = argv[++i];
    else opts.file = argv[i];
  }
  if (!opts.file) {
    console.error("Usage: node scripts/capture/capture-site.js <shots.json> [--only <shot>] [--device desktop|mobile]");
    process.exit(1);
  }
  if (opts.device && !DEVICES[opts.device]) throw new Error(`Unknown device "${opts.device}"`);
  return opts;
}

function loadShotList(file) {
  const list = JSON.parse(readFileSync(file, "utf8"));
  if (!/^[a-z0-9-]+$/.test(list.id || "")) throw new Error("Shot list needs a kebab-case \"id\"");
  if (!list.baseUrl) throw new Error("Shot list needs a \"baseUrl\"");
  if (!Array.isArray(list.shots) || !list.shots.length) throw new Error("Shot list has no \"shots\"");
  // A relative baseUrl points at local files next to the shot list (the fixture)
  if (list.baseUrl.startsWith(".")) list.baseUrl = pathToFileURL(resolve(dirname(file), list.baseUrl)).href + "/";
  return { devices: ["desktop"], hide: [], ...list };
}

/** Record one shot; throws on any failure so the caller can log it and move on */
async function captureShot({ page, list, shot, device, screen, display, outDir }) {
  const prefix = `${device}-${shot.name}`;
  const rawPath = join(outDir, "raw", `${prefix}.mov`);
  const outPath = join(outDir, `${prefix}.mov`);
  const debugPath = join(outDir, "raw", `${prefix}-screen.png`);
  await waitForUnlock();

  await preparePage(page, new URL(shot.path || "/", list.baseUrl).href, { warmup: shot.warmup });
  parkPointer(display);
  const rect = await measureViewport(page, screen, debugPath);

  const handle = await recorder.start(screen, rawPath);
  try {
    await sleep(shot.lead ?? 500);
    const ctx = { page, baseUrl: list.baseUrl, isMobile: device === "mobile", outDir, prefix, mouse: { x: 0, y: 0 } };
    for (const action of shot.actions || []) await runAction(ctx, action);
    await sleep(shot.tail ?? 800);
  } finally {
    await recorder.stop(handle);
  }

  // Measure again: if anything took over the screen mid-shot, the viewport is gone or moved
  const after = await measureViewport(page, screen, debugPath).catch(() => null);
  if (!after || after.x !== rect.x || after.y !== rect.y) {
    throw new Error("Screen changed during the shot (Space switch, window on top?) - re-run it");
  }

  const result = await finish(rawPath, outPath, rect);
  unlinkSync(rawPath);
  return result;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const list = loadShotList(opts.file);
  const { screen, display } = await preflight();

  const date = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
  const outDir = join(homedir(), "Movies", "portfolio-captures", list.id, date);
  mkdirSync(join(outDir, "raw"), { recursive: true });
  console.log(`Output: ${outDir}\nHands off the Mac - starting in 3s`);
  await sleep(3000);

  const results = [];
  const devices = opts.device ? [opts.device] : list.devices;
  for (const device of devices) {
    const shots = list.shots.filter(
      (s) => (s.devices || list.devices).includes(device) && (!opts.only || s.name === opts.only)
    );
    if (!shots.length) continue;

    parkPointer(display);
    const { browser, page } = await openBrowser(device);
    await installHideStyles(page, list.hide);
    try {
      for (const shot of shots) {
        const label = `${device}-${shot.name}`;
        console.log(`\n> ${label}`);
        try {
          const args = { page, list, shot, device, screen, display, outDir };
          const r = await captureShot(args).catch(async (e) => {
            // Another app or a lock took the screen: get Chrome back and try the shot once more
            console.log(`  ${e.message.split(" (screen saved")[0]} - retrying once`);
            await waitForUnlock();
            await bringForward(browser);
            return captureShot(args);
          });
          console.log(`  ${r.ok ? "ok" : "WARN"} ${r.frames} frames, ${r.hitches} hitches -> ${r.outPath}`);
          if (r.hitches) console.log(`  Repeated frames mid-motion at ${r.at.slice(0, 12).join("s, ")}s`);
          if (!r.ok) console.log("  Over 1% of frames hitched - scrub those points before using the clip");
          results.push({ label, ok: r.ok });
        } catch (e) {
          console.error(`  FAILED: ${e.message}`);
          results.push({ label, ok: false, error: true });
        }
      }
    } finally {
      await browser.close();
    }
  }

  const failed = results.filter((r) => r.error);
  console.log(`\nDone: ${results.length - failed.length}/${results.length} shots recorded in ${outDir}`);
  if (!results.length) console.log("No shots matched --only / --device");
  process.exitCode = failed.length || !results.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
