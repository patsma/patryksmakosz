#!/usr/bin/env node
/**
 * Record portfolio clips of a live site from a shot list.
 *
 * Usage:
 *   node scripts/capture/capture-site.js scripts/capture/shots/<id>.json            # draft, headless
 *   node scripts/capture/capture-site.js scripts/capture/shots/<id>.json --final    # screen capture, ProRes
 *
 * Draft: <outDir>/<id>/<YYYY-MM-DD>/draft/<device>-<shot>.mp4 + -sheet.png, runs in the background.
 * Final: <outDir>/<id>/<YYYY-MM-DD>/<device>-<shot>.mov, films the whole built-in screen.
 * Defaults live in capture.config.json. See scripts/capture/README.md.
 */

import { join } from "path";
import { parseArgs, USAGE } from "./lib/args.js";
import { loadConfig, resolveSettings } from "./lib/config.js";
import { readShotList, validateShotList, selectShots } from "./lib/shot-list.js";
import { actions } from "./lib/actions/index.js";
import { FORMATS } from "./lib/formats.js";
import { checkFfmpeg } from "./lib/ffmpeg.js";
import { recordDrafts } from "./lib/draft-recorder.js";
import { recordFinal } from "./lib/final-recorder.js";

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`${e.message}\n\n${USAGE}`);
    return 1;
  }
  if (opts.help) return console.log(USAGE), 0;

  const list = readShotList(opts.file);
  const settings = resolveSettings(loadConfig(), list, opts);
  const errors = validateShotList(list, { devices: Object.keys(settings.devices), actions });
  if (opts.device && !settings.devices[opts.device]) errors.push(`--device: unknown device "${opts.device}"`);
  if (!FORMATS[settings.final.format]) errors.push(`final.format: unknown format "${settings.final.format}"`);
  if (errors.length) {
    console.error(`${opts.file} has ${errors.length} problem(s), nothing was recorded:\n  ${errors.join("\n  ")}`);
    return 1;
  }

  const devices = opts.device ? [opts.device] : list.devices;
  const plan = devices
    .map((device) => ({ device, def: settings.devices[device], shots: selectShots(list, device, opts.only) }))
    .filter((p) => p.shots.length);
  if (!plan.length) {
    console.error("No shots matched --only / --device");
    return 1;
  }

  checkFfmpeg();
  const date = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
  const outDir = join(settings.outDir, list.id, date);
  const record = opts.mode === "final" ? recordFinal : recordDrafts;
  const results = await record({ list, settings, plan, outDir });

  const failed = results.filter((r) => r.error);
  console.log(`\nDone (${opts.mode}): ${results.length - failed.length}/${results.length} shots in ${outDir}`);
  return failed.length ? 1 : 0;
}

main().then(
  (code) => (process.exitCode = code),
  (e) => {
    console.error(e.message);
    process.exitCode = 1;
  }
);
