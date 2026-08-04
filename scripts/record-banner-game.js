#!/usr/bin/env node
/**
 * Record an INTERACTIVE banner as a video using Playwright with a scripted mouse.
 *
 * scripts/record-banner.js records passively for N seconds, which is correct for
 * linear timeline banners. The HEMA banners are games: nothing past the idle
 * attract loop happens unless a pointer plays them. This script drives the mouse
 * so the win and lose endings actually appear on camera.
 *
 * Usage:
 *   node scripts/record-banner-game.js <banner-dir> <driver> <outcome> [output.mp4] [max-seconds]
 *
 * Example:
 *   node scripts/record-banner-game.js app/banners/hema/hat-game hat-game win out.mp4 20
 *
 * Drivers: hat-game | bucket-game        Outcomes: win | lose
 */

import { chromium } from "playwright";
import { readFileSync, existsSync, unlinkSync, mkdirSync } from "fs";
import { join, resolve, dirname } from "path";
import { execSync } from "child_process";

const bannerDir = process.argv[2];
const driverName = process.argv[3];
const outcome = process.argv[4];
const outputPath = process.argv[5] || "banner-game-recording.mp4";
const maxSeconds = parseInt(process.argv[6] || "25", 10);

if (!bannerDir || !driverName || !outcome) {
  console.error(
    "Usage: node scripts/record-banner-game.js <banner-dir> <driver> <win|lose> [output.mp4] [max-seconds]"
  );
  process.exit(1);
}

if (outcome !== "win" && outcome !== "lose") {
  console.error(`Outcome must be "win" or "lose", got "${outcome}"`);
  process.exit(1);
}

const absDir = resolve(bannerDir);
if (!existsSync(join(absDir, "index.html"))) {
  console.error(`No index.html found in ${bannerDir}`);
  process.exit(1);
}

// Same control-hiding CSS as record-banner.js - old banners ship dev UI
const HIDE_CONTROLS_CSS = `
  #controls, #slider, #playBtn, #pauseBtn, #resumeBtn, #reverseBtn,
  .gs-dev-tools, [class*="GSDevTools"], [id*="GSDevTools"],
  .jquery-ui-slider, .ui-slider, .ui-widget,
  input[type="button"], input[type="range"],
  [id*="slider"], [id*="control"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
  body, .wrapper {
    border: none !important;
    outline: none !important;
  }
`;

const NEUTRALIZE_LINKS_JS = `
  document.querySelectorAll('a').forEach(a => {
    a.removeAttribute('href');
    a.onclick = (e) => e.preventDefault();
  });
  window.open = () => {};
`;

function parseDimensions(dir) {
  const css = existsSync(join(dir, "style.css"))
    ? readFileSync(join(dir, "style.css"), "utf-8")
    : "";
  const w = css.match(/width:\s*(\d+)px/);
  const h = css.match(/height:\s*(\d+)px/);
  return {
    width: w ? parseInt(w[1]) : 300,
    height: h ? parseInt(h[1]) : 250,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Poll a page predicate until it turns true or we run out of time.
 * Returns true if the condition was met.
 */
async function waitForState(page, fn, timeoutMs, intervalMs = 50) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await page.evaluate(fn)) return true;
    await sleep(intervalMs);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Drivers
// ---------------------------------------------------------------------------

/**
 * Santa hat game.
 *
 * The banner maps the pointer into its own hit-test space as
 *   cursorX = round(pageX - 442.6) + 238   ->   pageX = hatX + 204.6
 *   cursorY = round(pageY - 75)   + 25     ->   pageY = hatY + 50
 * (see index.js mousemove handler). Mirroring that formula makes the bot
 * hit-accurate by construction rather than by guesswork.
 */
async function hatGame(page, { width, height }) {
  const OFFSET_X = 204.6;
  const OFFSET_Y = 50;
  const clampX = (v) => Math.max(2, Math.min(width - 2, v));
  const clampY = (v) => Math.max(2, Math.min(height - 2, v));

  const hatPos = () => [window.hatPositionX, window.hatPositionY];

  // Let the attract loop play: floating circles, blinking, hat blows off,
  // "move your mouse" cursor hint.
  console.log("  attract loop...");
  await sleep(4500);

  // Entering the wrapper fires mouseenter: hints hide, santa slides out,
  // the hat scales up and the chase is on.
  await page.mouse.move(width / 2, height / 2);
  await sleep(300);

  console.log("  chasing the hat...");
  const chaseDeadline = Date.now() + 9000;
  let armed = false;

  while (Date.now() < chaseDeadline) {
    const [hx, hy] = await page.evaluate(hatPos);
    if (typeof hx === "number" && typeof hy === "number") {
      await page.mouse.move(clampX(hx + OFFSET_X), clampY(hy + OFFSET_Y));
    }

    const state = await page.evaluate(() => ({
      won: !!window.isWon,
      armed: !!window.timeout,
    }));

    if (outcome === "win" && state.won) {
      console.log("  won");
      break;
    }

    // For a loss we only need the game's internal timer armed (which happens on
    // the first proximity hit). Then we run away so `running` never converts
    // proximity into a win, and lost() fires 1s later.
    if (outcome === "lose" && state.armed) {
      armed = true;
      console.log("  armed, retreating");
      break;
    }

    await sleep(33);
  }

  if (outcome === "lose") {
    if (!armed) console.warn("  WARNING: never got close enough to arm the timer");
    // Retreat to the far corner from the hat and hold still.
    await page.mouse.move(width - 4, 4);
    const lostFired = await waitForState(page, () => !!window.endGame, 4000);
    if (!lostFired) console.warn("  WARNING: lose sequence never triggered");
    console.log("  holding for the lose sequence...");
    await sleep(8500);
  } else {
    if (!(await page.evaluate(() => !!window.isWon))) {
      console.warn("  WARNING: never won - clip will show the chase only");
    }
    console.log("  holding for the win screen...");
    await sleep(5500);
  }
}

/**
 * Catch-the-gift game.
 *
 * The bucket tracks `santaX = pageX - 484.4`. The gift falls y -300 -> 150 over
 * 2s and counts as caught within +/-30px while its y is between 50 and 90.
 */
async function bucketGame(page, { width, height }) {
  const OFFSET_X = 484.4;
  const clampX = (v) => Math.max(2, Math.min(width - 2, v));
  const midY = Math.round(height / 2);

  console.log("  attract loop...");
  await sleep(3000);

  const giftStartX = await page.evaluate(() => window.__banner.giftX());

  if (outcome === "lose") {
    // Enter at the opposite edge from the gift and never move toward it.
    const parkX = giftStartX < 0 ? width - 40 : 40;
    await page.mouse.move(parkX, midY);
    console.log("  parked away from the gift, letting it drop...");
    const ended = await waitForState(page, () => !!window.__banner.endGame, 6000);
    if (!ended) console.warn("  WARNING: lose sequence never triggered");
    console.log("  holding for the retry screen...");
    await sleep(6000);
    return;
  }

  // Entering starts the gift falling.
  await page.mouse.move(width / 2, midY);
  await sleep(150);

  console.log("  tracking the gift...");
  const deadline = Date.now() + 6000;
  while (Date.now() < deadline) {
    const s = await page.evaluate(() => ({
      x: window.__banner.giftX(),
      caught: window.__banner.isCatchedGift,
    }));
    if (s.caught) {
      console.log("  caught it");
      break;
    }
    await page.mouse.move(clampX(s.x + OFFSET_X), midY);
    await sleep(25);
  }

  if (!(await page.evaluate(() => window.__banner.isCatchedGift))) {
    console.warn("  WARNING: never caught the gift - clip will show a miss");
  }
  console.log("  holding for the win screen...");
  await sleep(5500);
}

const DRIVERS = { "hat-game": hatGame, "bucket-game": bucketGame };

const driver = DRIVERS[driverName];
if (!driver) {
  console.error(
    `Unknown driver "${driverName}". Available: ${Object.keys(DRIVERS).join(", ")}`
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------

const { width, height } = parseDimensions(absDir);
console.log(
  `Banner: ${width}x${height} | Driver: ${driverName} | Outcome: ${outcome} | Output: ${outputPath}`
);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width, height },
  recordVideo: { dir: "/tmp/banner-recordings/", size: { width, height } },
});

const page = await context.newPage();
page.on("pageerror", (err) => console.error(`  PAGE ERROR: ${err.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") console.error(`  CONSOLE ERROR: ${msg.text()}`);
});

await page.addStyleTag({ content: HIDE_CONTROLS_CSS }).catch(() => {});
await page.goto(`file://${absDir}/index.html`, { waitUntil: "load" });
await page.evaluate(NEUTRALIZE_LINKS_JS);
await page.addStyleTag({ content: HIDE_CONTROLS_CSS });

// Hard cap so a driver that never reaches its end state cannot hang the run
const timeout = sleep(maxSeconds * 1000).then(() => {
  console.warn(`  max duration ${maxSeconds}s reached`);
});
await Promise.race([driver(page, { width, height }), timeout]);

const videoPath = await page.video().path();
await context.close();
await browser.close();

mkdirSync(dirname(resolve(outputPath)), { recursive: true });

console.log("Converting to MP4 (60fps, CRF 18)...");
execSync(
  `ffmpeg -y -i "${videoPath}" -r 60 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -an "${resolve(outputPath)}"`,
  { stdio: "inherit" }
);

try {
  unlinkSync(videoPath);
} catch {}

console.log(`Done: ${outputPath}`);
