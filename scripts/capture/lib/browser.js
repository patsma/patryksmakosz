/**
 * Real headed Chrome on the built-in screen, one browser per device,
 * plus calibration: where the page viewport actually sits on screen in physical px.
 */

import { chromium } from "playwright";
import { execFileSync } from "child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { grabFrame, runFfmpeg, screenInput } from "./ffmpeg.js";

const MARKER_ID = "__capture_marker__";

/**
 * Park the real pointer at the middle of the right edge. In macOS fullscreen a pointer near the
 * top edge slides the menu bar and Chrome's toolbar down over the page, even with nobody touching it.
 * Warping posts no mouse event, so the page never sees a hover from it.
 * @param {{ width: number, height: number }} display looks-like size of the built-in screen
 */
export function parkPointer(display) {
  const x = display.width - 1;
  const y = Math.round(display.height / 2);
  execFileSync("osascript", [
    "-l", "JavaScript", "-e",
    `ObjC.import("CoreGraphics"); $.CGWarpMouseCursorPosition($.CGPointMake(${x}, ${y}))`,
  ]);
}

/**
 * Launch Chrome on the built-in screen and put its window into macOS fullscreen over CDP.
 * --kiosk and --start-fullscreen are both ignored under Playwright, the CDP window state is not.
 * @param {object} device Playwright context options from capture.config.json "devices"
 * @returns {Promise<{ browser: import("playwright").BrowserContext, page: import("playwright").Page }>}
 */
export async function openBrowser(device) {
  // A throwaway profile seeded with "Always Show Toolbar in Full Screen" off, which a fresh
  // profile has on - otherwise the tab strip and address bar sit over the top of the page
  const profile = mkdtempSync(join(tmpdir(), "capture-chrome-"));
  mkdirSync(join(profile, "Default"));
  writeFileSync(
    join(profile, "Default", "Preferences"),
    JSON.stringify({ browser: { show_fullscreen_toolbar: false }, translate: { enabled: false } })
  );
  const browser = await chromium.launchPersistentContext(profile, {
    channel: "chrome",
    headless: false,
    // --no-sandbox is what Playwright adds by default, and Chrome shows a warning bar for it
    ignoreDefaultArgs: ["--enable-automation", "--no-sandbox"],
    // Translate pops a bubble on foreign-language pages that drags the toolbar down with it
    args: ["--window-position=0,0", "--hide-scrollbars", "--disable-infobars", "--disable-features=Translate"],
    reducedMotion: "no-preference",
    ...device,
  });
  browser.profile = profile;
  const page = browser.pages()[0] || (await browser.newPage());
  await page.bringToFront();
  const cdp = await browser.newCDPSession(page);
  const { windowId } = await cdp.send("Browser.getWindowForTarget");
  await cdp.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "fullscreen" } });
  // Let the macOS fullscreen Space animation finish before anything is measured
  await page.waitForTimeout(1500);
  return { browser, page };
}

/**
 * Bring the capture Chrome back to the front after another app (an iTerm tab finishing, a dialog)
 * took over. Found by its throwaway profile path, so a personal Chrome window is never touched.
 * @param {import("playwright").BrowserContext} browser
 */
export async function bringForward(browser) {
  const ps = String(execFileSync("ps", ["-axo", "pid=,command="]));
  const line = ps
    .split("\n")
    .find((l) => l.includes(`--user-data-dir=${browser.profile}`) && !l.includes("--type="));
  if (!line) throw new Error("Capture Chrome process not found");
  const pid = parseInt(line, 10);
  execFileSync("osascript", [
    "-e",
    `tell application "System Events" to set frontmost of (first process whose unix id is ${pid}) to true`,
  ]);
  await new Promise((r) => setTimeout(r, 1200));
}

/**
 * Paint the viewport solid magenta, grab a real screen frame and find the magenta box.
 * That box is the crop rect - no guessing about window chrome, fullscreen or emulation.
 * @param {import("playwright").Page} page
 * @param {string} screen avfoundation screen name
 * @param {string} [debugPath] on failure, a PNG of the screen is written here
 * @returns {Promise<{ x: number, y: number, width: number, height: number }>}
 */
export async function measureViewport(page, screen, debugPath) {
  try {
    return await findMarker(page, screen);
  } catch (e) {
    if (debugPath) {
      await runFfmpeg([
        "-y", "-f", "avfoundation", "-capture_cursor", "1", "-framerate", "60", "-i", screenInput(screen),
        "-vf", "select=gte(n\\,5),scale=1440:-1", "-frames:v", "1", debugPath,
      ]).catch(() => {});
      e.message += ` (screen saved to ${debugPath})`;
    }
    throw e;
  }
}

async function findMarker(page, screen) {
  await page.evaluate((id) => {
    const el = document.createElement("div");
    el.id = id;
    el.style.cssText =
      "position:fixed;inset:0;background:#ff00ff;z-index:2147483647;pointer-events:none";
    document.documentElement.appendChild(el);
  }, MARKER_ID);
  await page.waitForTimeout(400);
  const frame = await grabFrame(screen);
  await page.evaluate((id) => document.getElementById(id)?.remove(), MARKER_ID);

  const { width, height, rgb } = frame;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      if (rgb[i] > 220 && rgb[i + 1] < 40 && rgb[i + 2] > 220) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) {
    throw new Error("Viewport marker not visible on screen - Chrome is not on the built-in display, or is covered");
  }

  const vp = page.viewportSize();
  const dpr = await page.evaluate(() => window.devicePixelRatio);
  const box = { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
  return snapRect(box, { width: vp.width * dpr, height: vp.height * dpr });
}

/**
 * Turn the measured magenta box into the crop rect. macOS draws a 1px black hairline over the top
 * row of a fullscreen window, so a few px short is expected. Snap to even sizes (ProRes 422 needs
 * them) by trimming from the top/left. Anything further off means something is over the page.
 * @param {{ x: number, y: number, width: number, height: number }} box measured, physical px
 * @param {{ width: number, height: number }} want viewport size in physical px
 */
export function snapRect(box, want) {
  const rect = { ...box };
  if (rect.width % 2) (rect.x += 1), (rect.width -= 1);
  if (rect.height % 2) (rect.y += 1), (rect.height -= 1);
  const short = { w: want.width - rect.width, h: want.height - rect.height };
  if (short.w < 0 || short.w > 4 || short.h < 0 || short.h > 4) {
    throw new Error(
      `Viewport measured ${rect.width}x${rect.height} at ${rect.x},${rect.y}, expected ` +
        `${want.width}x${want.height} - is the screen scaled to look like 1440x900?`
    );
  }
  return rect;
}
