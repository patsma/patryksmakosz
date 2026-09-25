/**
 * Full-screen recording of one avfoundation screen with hardware H.264.
 * The base M1 has no ProRes engine, so this is pass one; finish.js crops and makes ProRes.
 */

import { spawn } from "child_process";
import { FFMPEG, screenInput } from "./ffmpeg.js";

const START_TIMEOUT_MS = 10000;
const STOP_TIMEOUT_MS = 15000;

/**
 * Start recording. Resolves once ffmpeg reports its first encoded frames,
 * so the caller knows the capture is really running before it drives the page.
 * @param {string} screen avfoundation screen name, e.g. "Capture screen 0"
 * @param {string} rawPath output .mov
 * @param {{ bitrate?: string, codec?: string }} [opts]
 * @returns {Promise<{ proc: import("child_process").ChildProcess, rawPath: string, log: () => string }>}
 */
export function start(screen, rawPath, opts = {}) {
  const bitrate = opts.bitrate || "80M";
  const codec = opts.codec || "h264_videotoolbox";
  const proc = spawn(FFMPEG, [
    "-hide_banner", "-y",
    "-f", "avfoundation", "-capture_cursor", "0", "-framerate", "60",
    "-i", screenInput(screen),
    "-c:v", codec, "-b:v", bitrate, "-maxrate", bitrate, "-realtime", "1",
    "-pix_fmt", "yuv420p", "-fps_mode", "passthrough",
    rawPath,
  ], { stdio: ["pipe", "ignore", "pipe"] });

  let log = "";
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error(`Recorder did not start within ${START_TIMEOUT_MS}ms: ${log.slice(-300)}`));
    }, START_TIMEOUT_MS);
    proc.stderr.on("data", (d) => {
      log += d;
      if (/frame=\s*[1-9]/.test(String(d))) {
        clearTimeout(timer);
        resolve({ proc, rawPath, log: () => log });
      }
    });
    proc.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Recorder exited early (${code}): ${log.slice(-300)}`));
    });
  });
}

/**
 * Stop cleanly with "q" so the .mov gets its index; SIGKILL if ffmpeg hangs.
 * @param {{ proc: import("child_process").ChildProcess, rawPath: string, log: () => string }} handle
 * @returns {Promise<string>} rawPath
 */
export function stop(handle) {
  const { proc, rawPath } = handle;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => proc.kill("SIGKILL"), STOP_TIMEOUT_MS);
    proc.removeAllListeners("exit");
    proc.on("exit", (code, signal) => {
      clearTimeout(timer);
      if (code === 0 || code === 255) return resolve(rawPath);
      reject(new Error(`Recorder stopped with ${code ?? signal}: ${handle.log().slice(-300)}`));
    });
    proc.stdin.write("q");
    proc.stdin.end();
  });
}
