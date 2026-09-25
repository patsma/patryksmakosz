/**
 * Draft mode: headless Chrome, one context per device and a page per shot, Playwright's own video
 * recording (one video per page). The context keeps the HTTP cache between shots, like the final
 * browser does - a cold cache per shot re-downloads the site every time and gets rate-limited.
 * Nothing appears on screen, so it runs in the background while you work. Not frame-accurate -
 * it is for checking selectors, timing and framing before the final pass.
 * Each shot gives <out>/draft/<device>-<shot>.mp4 and a <device>-<shot>-sheet.png contact sheet.
 */

import { chromium } from "playwright";
import { mkdirSync, mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { shotSettings } from "./config.js";
import { installHideStyles, preparePage } from "./prepare-page.js";
import { runAction } from "./actions/index.js";
import { runFfmpeg, duration } from "./ffmpeg.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {{ list: object, settings: object, plan: { device: string, def: object, shots: object[] }[], outDir: string }} run
 * @returns {Promise<{ label: string, ok: boolean, error?: boolean }[]>}
 */
export async function recordDrafts({ list, settings, plan, outDir }) {
  const dir = join(outDir, "draft");
  mkdirSync(dir, { recursive: true });
  const videoDir = mkdtempSync(join(tmpdir(), "capture-draft-"));
  console.log(`Draft (headless, keep working): ${dir}`);

  const browser = await chromium.launch({ channel: settings.draft.channel || undefined, headless: true });
  const results = [];
  try {
    for (const { device, def, shots } of plan) {
      const context = await browser.newContext({
        ...def,
        reducedMotion: "no-preference",
        recordVideo: { dir: videoDir, size: def.viewport },
      });
      for (const shot of shots) {
        const label = `${device}-${shot.name}`;
        const started = Date.now();
        try {
          const outPath = await draftShot({ context, list, settings, def, shot, dir, videoDir, prefix: label });
          console.log(`  ok   ${label} (${((Date.now() - started) / 1000).toFixed(0)}s) -> ${outPath}`);
          results.push({ label, ok: true });
        } catch (e) {
          console.error(`  FAIL ${label}: ${e.message}`);
          results.push({ label, ok: false, error: true });
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
    rmSync(videoDir, { recursive: true, force: true });
  }
  return results;
}

async function draftShot({ context, list, settings, def, shot, dir, videoDir, prefix }) {
  const per = shotSettings(settings, shot, "draft");
  const page = await context.newPage();
  // The video starts with the page, so everything before the lead is trimmed off afterwards
  const videoStart = Date.now();
  page.setDefaultTimeout(settings.actionTimeout);

  let actionsStart = 0;
  let failure = null;
  try {
    await installHideStyles(page, list.hide);
    await preparePage(page, new URL(shot.path || "/", list.baseUrl).href, { warmup: per.warmup });
    actionsStart = Date.now() - videoStart;
    await sleep(per.lead);
    const ctx = {
      page, baseUrl: list.baseUrl, touch: !!def.hasTouch, outDir: dir, prefix,
      mouse: { x: 0, y: 0 }, timeout: settings.actionTimeout, settings,
    };
    for (const [i, action] of (shot.actions || []).entries()) await runAction(ctx, action, i);
    await sleep(per.tail);
  } catch (e) {
    failure = e;
    const still = join(dir, `${prefix}-failed.png`);
    await page.screenshot({ path: still }).then(() => (e.message += ` (page saved to ${still})`), () => {});
  }

  const webm = join(videoDir, `${prefix}.webm`);
  await page.close();
  await page.video().saveAs(webm);
  if (failure) throw failure;

  const outPath = join(dir, `${prefix}.mp4`);
  await encode(webm, outPath, actionsStart / 1000, settings.draft.maxWidth);
  await contactSheet(outPath, join(dir, `${prefix}-sheet.png`), settings.draft.sheetFrames, def.viewport);
  return outPath;
}

/** Playwright's webm to a small H.264 mp4, starting where the shot's lead starts */
function encode(webm, mp4, start, maxWidth) {
  return runFfmpeg([
    "-y", "-i", webm, "-ss", start.toFixed(2),
    "-vf", `scale=w='min(${maxWidth},iw)':h=-2`,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    mp4,
  ]);
}

/** Evenly spaced frames in one image: 3 across for landscape, one row for portrait */
function contactSheet(mp4, png, count, viewport) {
  const portrait = viewport.height > viewport.width;
  const cols = portrait ? count : 3;
  const rows = Math.ceil(count / cols);
  const rate = count / Math.max(duration(mp4), 0.1);
  return runFfmpeg([
    "-y", "-i", mp4,
    "-vf", `fps=${rate.toFixed(4)},scale=${portrait ? 240 : 480}:-2,tile=${cols}x${rows}:padding=4`,
    "-frames:v", "1", png,
  ]);
}
