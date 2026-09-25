/**
 * Checks that must pass before anything is recorded:
 * the built-in Retina screen exists, runs at 60Hz, is big enough for the desktop viewport,
 * and ffmpeg can actually capture it (which also proves Screen Recording permission).
 */

import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { FFMPEG, listScreens, grabFrame } from "./ffmpeg.js";

const DESKTOP = { width: 1440, height: 900 };

/** Read NSScreen facts through JXA - the only place that knows which screen is built-in */
function readDisplays() {
  const script = `
    ObjC.import("AppKit");
    const s = $.NSScreen.screens, out = [];
    for (let i = 0; i < s.count; i++) {
      const sc = s.objectAtIndex(i);
      out.push({
        name: ObjC.unwrap(sc.localizedName),
        width: sc.frame.size.width, height: sc.frame.size.height,
        x: sc.frame.origin.x, y: sc.frame.origin.y,
        scale: sc.backingScaleFactor, fps: Number(sc.maximumFramesPerSecond),
      });
    }
    JSON.stringify(out);`;
  return JSON.parse(String(execFileSync("osascript", ["-l", "JavaScript", "-e", script])));
}

/** A locked session hides every "Capture screen" from avfoundation */
export function isLocked() {
  const session = String(execFileSync("ioreg", ["-n", "Root", "-d1", "-a"]));
  return /CGSSessionScreenIsLocked<\/key>\s*<true\/>/.test(session);
}

/** Block until the Mac is unlocked, so a run survives Patrick stepping away and back */
export async function waitForUnlock() {
  if (!isLocked()) return;
  console.log("  The Mac is locked - waiting for it to be unlocked");
  while (isLocked()) await new Promise((r) => setTimeout(r, 5000));
  await new Promise((r) => setTimeout(r, 3000));
}

/**
 * @returns {Promise<{ display: object, screen: string, scale: number }>}
 */
export async function preflight() {
  if (!existsSync(FFMPEG)) throw new Error(`ffmpeg not found at ${FFMPEG} (set FFMPEG_BIN)`);

  await waitForUnlock();

  const display = readDisplays().find((d) => /built-in/i.test(d.name));
  if (!display) throw new Error("No built-in display found - is the lid closed?");
  if (display.fps < 60) throw new Error(`Built-in display runs at ${display.fps}Hz, need 60`);
  if (display.width < DESKTOP.width || display.height < DESKTOP.height) {
    throw new Error(
      `Built-in display looks like ${display.width}x${display.height}, need at least ` +
        `${DESKTOP.width}x${DESKTOP.height} (System Settings > Displays)`
    );
  }
  if (display.x !== 0 || display.y !== 0) {
    throw new Error("The built-in display must be the main display (menu bar on it)");
  }

  // avfoundation only names screens "Capture screen N", so identify the built-in one by the
  // pixel size of a real captured frame. That capture is also the permission probe.
  const expected = { width: display.width * display.scale, height: display.height * display.scale };
  const screens = listScreens();
  if (!screens.length) throw new Error("ffmpeg lists no capture screens");
  const matches = [];
  for (const s of screens) {
    let frame;
    try {
      frame = await grabFrame(s.index);
    } catch (e) {
      throw new Error(
        `Could not capture ${s.name}: ${e.message}\n` +
          "Grant Screen Recording to your terminal app (System Settings > Privacy & Security) and restart it"
      );
    }
    if (frame.width === expected.width && frame.height === expected.height) matches.push(s);
  }
  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one capture screen of ${expected.width}x${expected.height}, found ${matches.length}`
    );
  }

  console.log(
    `Preflight ok: ${display.name} ${display.width}x${display.height} @${display.scale}x ` +
      `${display.fps}Hz = ${matches[0].name} (avfoundation ${matches[0].index})`
  );
  console.log("Reminder: turn on Do Not Disturb and keep the mouse pointer off the top screen edge");
  return { display, screen: matches[0].name, scale: display.scale };
}
