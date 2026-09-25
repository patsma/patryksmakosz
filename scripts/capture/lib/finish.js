/**
 * Pass two: crop the raw screen recording to the viewport, force 60fps CFR,
 * encode ProRes 422 HQ for Resolve, then look for dropped frames in the motion.
 */

import { runFfmpeg, probe } from "./ffmpeg.js";

// Mean luma difference between frames: under STILL is a repeat, over MOVING is clear motion
const STILL = 0.02;
const MOVING = 0.3;
const MAX_HITCH_SHARE = 0.01;

/**
 * @param {string} rawPath H.264 screen recording
 * @param {string} outPath .mov destination
 * @param {{ x: number, y: number, width: number, height: number }} rect crop in physical px
 * @returns {Promise<{ outPath: string, frames: number, hitches: number, at: string[], ok: boolean }>}
 */
export async function finish(rawPath, outPath, rect) {
  await runFfmpeg([
    "-y", "-i", rawPath,
    "-vf", `crop=${rect.width}:${rect.height}:${rect.x}:${rect.y}`,
    "-r", "60", "-fps_mode", "cfr",
    "-c:v", "prores_ks", "-profile:v", "3", "-vendor", "apl0",
    "-pix_fmt", "yuv422p10le",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    outPath,
  ]);
  return { outPath, ...(await checkFrames(outPath)) };
}

/**
 * Diff every frame against the one before and count hitches: one or two repeated frames with
 * clear motion on both sides. That is what a dropped frame looks like. A long run of repeats is
 * stillness (a pause, or the page at rest) and is not counted.
 * @param {string} file
 */
export async function checkFrames(file) {
  const { frames } = probe(file);
  const { stderr } = await runFfmpeg([
    "-i", file,
    "-vf", "tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG",
    "-f", "null", "-",
  ]);
  const d = [...stderr.matchAll(/YAVG=([\d.]+)/g)].map((m) => Number(m[1]));
  const at = [];
  for (let i = 1; i < d.length - 1; i++) {
    if (d[i] >= STILL) continue;
    let j = i;
    while (j < d.length && d[j] < STILL) j++;
    if (j - i <= 2 && d[i - 1] >= MOVING && j < d.length && d[j] >= MOVING) {
      for (let k = i; k < j; k++) at.push(((k + 1) / 60).toFixed(2));
    }
    i = j - 1;
  }
  const ok = at.length <= frames * MAX_HITCH_SHARE;
  return { frames, hitches: at.length, at, ok };
}
