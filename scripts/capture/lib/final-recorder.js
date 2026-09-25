/**
 * Final mode: real headed Chrome in macOS fullscreen, filmed by ffmpeg from the built-in screen.
 * Every shot is recorded first (raw H.264 kept), then Chrome closes, "Screen is free" is printed
 * and the queue is encoded. Screen time is only the shots, and the encode can never drop capture frames.
 */

import { mkdirSync, unlinkSync } from "fs";
import { join } from "path";
import { shotSettings } from "./config.js";
import { getFormat } from "./formats.js";
import { preflight, waitForUnlock } from "./preflight.js";
import { openBrowser, measureViewport, parkPointer, bringForward } from "./browser.js";
import { installHideStyles, preparePage } from "./prepare-page.js";
import { runAction } from "./actions/index.js";
import * as recorder from "./screen-recorder.js";
import { finish } from "./finish.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {{ list: object, settings: object, plan: { device: string, def: object, shots: object[] }[], outDir: string }} run
 * @returns {Promise<{ label: string, ok: boolean, error?: boolean }[]>}
 */
export async function recordFinal({ list, settings, plan, outDir }) {
  const { screen, display } = await preflight();
  mkdirSync(join(outDir, "raw"), { recursive: true });
  console.log(`Output: ${outDir}\nHands off the Mac - starting in 3s`);
  await sleep(3000);

  const ext = getFormat(settings.final.format).ext;
  const queue = [];
  const results = [];
  for (const { device, def, shots } of plan) {
    parkPointer(display);
    const { browser, page } = await openBrowser(def);
    page.setDefaultTimeout(settings.actionTimeout);
    await installHideStyles(page, list.hide);
    try {
      for (const shot of shots) {
        const prefix = `${device}-${shot.name}`;
        console.log(`\n> ${prefix}`);
        const args = { page, list, settings, def, shot, screen, display, outDir, prefix };
        try {
          const rect = await captureShot(args).catch(async (e) => {
            // Another app or a lock took the screen: get Chrome back and try the shot once more
            console.log(`  ${e.message.split(" (screen saved")[0]} - retrying once`);
            await waitForUnlock();
            await bringForward(browser);
            return captureShot(args);
          });
          queue.push({ label: prefix, rect, rawPath: rawPathOf(outDir, prefix), outPath: join(outDir, prefix + ext) });
          console.log("  captured");
        } catch (e) {
          console.error(`  FAILED: ${e.message}`);
          results.push({ label: prefix, ok: false, error: true });
        }
      }
    } finally {
      await browser.close();
    }
  }

  console.log(`\nScreen is free - encoding ${queue.length} clip(s) to ${settings.final.format}`);
  for (const [i, job] of queue.entries()) {
    console.log(`[${i + 1}/${queue.length}] ${job.label}`);
    try {
      const r = await finish(job.rawPath, job.outPath, job.rect, {
        format: settings.final.format,
        hitches: settings.hitches,
      });
      unlinkSync(job.rawPath);
      console.log(`  ${r.ok ? "ok" : "WARN"} ${r.frames} frames, ${r.hitches} hitches -> ${r.outPath}`);
      if (r.hitches) console.log(`  Repeated frames mid-motion at ${r.at.slice(0, 12).join("s, ")}s`);
      if (!r.ok) console.log(`  Over ${settings.hitches.maxShare * 100}% of frames hitched - scrub those points first`);
      results.push({ label: job.label, ok: r.ok });
    } catch (e) {
      console.error(`  FAILED to encode (raw kept at ${job.rawPath}): ${e.message}`);
      results.push({ label: job.label, ok: false, error: true });
    }
  }
  return results;
}

const rawPathOf = (outDir, prefix) => join(outDir, "raw", `${prefix}.mov`);

/** Record one shot to raw H.264 and return the crop rect; throws on any failure */
async function captureShot({ page, list, settings, def, shot, screen, display, outDir, prefix }) {
  const per = shotSettings(settings, shot, "final");
  const debugPath = join(outDir, "raw", `${prefix}-screen.png`);
  await waitForUnlock();

  await preparePage(page, new URL(shot.path || "/", list.baseUrl).href, { warmup: per.warmup });
  parkPointer(display);
  const rect = await measureViewport(page, screen, debugPath);

  const { bitrate, codec } = settings.final;
  const handle = await recorder.start(screen, rawPathOf(outDir, prefix), { bitrate, codec });
  try {
    await sleep(per.lead);
    const ctx = {
      page, baseUrl: list.baseUrl, touch: !!def.hasTouch, outDir, prefix,
      mouse: { x: 0, y: 0 }, timeout: settings.actionTimeout, settings,
    };
    for (const [i, action] of (shot.actions || []).entries()) await runAction(ctx, action, i);
    await sleep(per.tail);
  } finally {
    await recorder.stop(handle);
  }

  // Measure again: if anything took over the screen mid-shot, the viewport is gone or moved
  const after = await measureViewport(page, screen, debugPath).catch(() => null);
  if (!after || after.x !== rect.x || after.y !== rect.y) {
    throw new Error("Screen changed during the shot (Space switch, window on top?) - re-run it");
  }
  return rect;
}
