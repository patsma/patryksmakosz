/**
 * Final pass two: crop the raw screen recording to the viewport, force 60fps CFR,
 * encode the output format (ProRes 422 HQ by default), then look for dropped frames in the motion.
 */

import { runFfmpeg, probe } from "./ffmpeg.js";
import { getFormat } from "./formats.js";

/**
 * @param {string} rawPath H.264 screen recording
 * @param {string} outPath destination, extension from the format
 * @param {{ x: number, y: number, width: number, height: number }} rect crop in physical px
 * @param {{ format: string, hitches: { still: number, moving: number, maxShare: number } }} opts
 * @returns {Promise<{ outPath: string, frames: number, hitches: number, at: string[], ok: boolean }>}
 */
export async function finish(rawPath, outPath, rect, opts) {
  await runFfmpeg([
    "-y", "-i", rawPath,
    "-vf", `crop=${rect.width}:${rect.height}:${rect.x}:${rect.y}`,
    "-r", "60", "-fps_mode", "cfr",
    ...getFormat(opts.format).args,
    outPath,
  ]);
  return { outPath, ...(await checkFrames(outPath, opts.hitches)) };
}

/**
 * Diff every frame against the one before and count hitches.
 * @param {string} file
 * @param {{ still: number, moving: number, maxShare: number }} thresholds
 */
export async function checkFrames(file, thresholds) {
  const { frames } = probe(file);
  const { stderr } = await runFfmpeg([
    "-i", file,
    "-vf", "tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG",
    "-f", "null", "-",
  ]);
  const diffs = [...stderr.matchAll(/YAVG=([\d.]+)/g)].map((m) => Number(m[1]));
  const at = findHitches(diffs, thresholds);
  return { frames, hitches: at.length, at, ok: at.length <= frames * thresholds.maxShare };
}

/**
 * A hitch is one or two repeated frames with clear motion on both sides - what a dropped frame
 * looks like. A longer run of repeats is stillness (a pause, the page at rest) and is not counted.
 * @param {number[]} diffs mean luma difference, diffs[i] = frame i+1 against frame i
 * @param {{ still: number, moving: number }} t under still is a repeat, over moving is clear motion
 * @returns {string[]} seconds of each repeated frame at 60fps
 */
export function findHitches(diffs, { still, moving }) {
  const at = [];
  for (let i = 1; i < diffs.length - 1; i++) {
    if (diffs[i] >= still) continue;
    let j = i;
    while (j < diffs.length && diffs[j] < still) j++;
    if (j - i <= 2 && diffs[i - 1] >= moving && j < diffs.length && diffs[j] >= moving) {
      for (let k = i; k < j; k++) at.push(((k + 1) / 60).toFixed(2));
    }
    i = j - 1;
  }
  return at;
}
