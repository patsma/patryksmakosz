/**
 * Thin helpers around the ffmpeg / ffprobe binaries shared by the capture modules.
 */

import { spawn, execFileSync } from "child_process";

export const FFMPEG = process.env.FFMPEG_BIN || "/opt/homebrew/bin/ffmpeg";
export const FFPROBE = process.env.FFPROBE_BIN || "/opt/homebrew/bin/ffprobe";

/**
 * Run ffmpeg to completion and resolve with its stdout (Buffer) and stderr (string).
 * Rejects on a non-zero exit with the tail of stderr in the message.
 * @param {string[]} args
 * @returns {Promise<{ stdout: Buffer, stderr: string }>}
 */
export function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG, ["-hide_banner", ...args]);
    const out = [];
    let err = "";
    proc.stdout.on("data", (d) => out.push(d));
    proc.stderr.on("data", (d) => (err += d));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) return resolve({ stdout: Buffer.concat(out), stderr: err });
      reject(new Error(`ffmpeg exited ${code}: ${err.trim().split("\n").slice(-4).join(" | ")}`));
    });
  });
}

/**
 * List avfoundation screen devices as { index, name }.
 * @returns {{ index: number, name: string }[]}
 */
export function listScreens() {
  let text = "";
  try {
    execFileSync(FFMPEG, ["-hide_banner", "-f", "avfoundation", "-list_devices", "true", "-i", ""], {
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    // ffmpeg always exits non-zero here - the device list is on stderr
    text = String(e.stderr || "");
  }
  return [...text.matchAll(/\[(\d+)\] (Capture screen \d+)/g)].map((m) => ({
    index: Number(m[1]),
    name: m[2],
  }));
}

/**
 * avfoundation input spec for a screen. Takes the name ("Capture screen 0") and looks the index
 * up every time: plugging or unplugging a camera (an iPhone via Continuity) renumbers every device.
 * @param {number|string} screen index, or name
 */
export function screenInput(screen) {
  if (typeof screen === "number") return `${screen}:none`;
  const found = listScreens().find((s) => s.name === screen);
  if (!found) throw new Error(`"${screen}" is no longer in the avfoundation device list`);
  return `${found.index}:none`;
}

/**
 * Grab one frame of an avfoundation screen as raw RGB.
 * @param {number|string} screen index, or name
 * @returns {Promise<{ width: number, height: number, rgb: Buffer }>}
 */
export async function grabFrame(screen) {
  const { stdout, stderr } = await runFfmpeg([
    "-f", "avfoundation", "-capture_cursor", "0", "-framerate", "60",
    "-i", screenInput(screen),
    // Skip the first frames - avfoundation can hand back a stale buffer on open
    "-vf", "select=gte(n\\,5)", "-frames:v", "1",
    "-pix_fmt", "rgb24", "-f", "rawvideo", "pipe:1",
  ]);
  const size = stderr.match(/Stream #0:0.*?, (\d+)x(\d+)/);
  if (!size) throw new Error(`Could not read frame size of ${screen}`);
  return { width: Number(size[1]), height: Number(size[2]), rgb: stdout };
}

/**
 * Read stream facts from a finished file.
 * @param {string} file
 * @returns {{ codec: string, profile: string, width: number, height: number, rate: string, frames: number }}
 */
export function probe(file) {
  const json = execFileSync(FFPROBE, [
    "-v", "error", "-select_streams", "v:0", "-count_frames",
    "-show_entries", "stream=codec_name,profile,width,height,r_frame_rate,nb_read_frames",
    "-of", "json", file,
  ]);
  const s = JSON.parse(String(json)).streams[0];
  return {
    codec: s.codec_name,
    profile: s.profile,
    width: s.width,
    height: s.height,
    rate: s.r_frame_rate,
    frames: Number(s.nb_read_frames),
  };
}
