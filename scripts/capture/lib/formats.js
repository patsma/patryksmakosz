/**
 * Final output formats: a name maps to a file extension and the ffmpeg encode args.
 * Add a format by adding an entry, then pick it with "final": { "format": "<name>" } or --format.
 */

const BT709 = ["-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"];

export const FORMATS = {
  // Resolve master: ProRes 422 HQ, 10-bit 4:2:2
  "prores-hq": {
    ext: ".mov",
    args: ["-c:v", "prores_ks", "-profile:v", "3", "-vendor", "apl0", "-pix_fmt", "yuv422p10le", ...BT709],
  },
  // Quick sharing: near-lossless H.264 that plays anywhere
  "h264-hq": {
    ext: ".mp4",
    args: ["-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-movflags", "+faststart", ...BT709],
  },
};

/** @param {string} name */
export function getFormat(name) {
  const format = FORMATS[name];
  if (!format) throw new Error(`Unknown format "${name}" - one of: ${Object.keys(FORMATS).join(", ")}`);
  return format;
}
