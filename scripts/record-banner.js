#!/usr/bin/env node
/**
 * Record a banner HTML file as a video using Playwright.
 *
 * Usage:
 *   node scripts/record-banner.js <banner-dir> [output.mp4] [duration-seconds]
 *
 * Example:
 *   node scripts/record-banner.js public/movies/banner-sources/skcar/300x250 output.mp4 15
 *
 * The script reads the banner's CSS to determine dimensions,
 * opens it in a headless browser, hides all dev controls,
 * records for the specified duration, and converts to high-quality MP4.
 */

import { chromium } from "playwright";
import { readFileSync, existsSync, unlinkSync } from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";

const bannerDir = process.argv[2];
const outputPath = process.argv[3] || "banner-recording.mp4";
const duration = parseInt(process.argv[4] || "15", 10);

if (!bannerDir) {
  console.error(
    "Usage: node scripts/record-banner.js <banner-dir> [output.mp4] [duration]"
  );
  process.exit(1);
}

const absDir = resolve(bannerDir);
const indexPath = join(absDir, "index.html");
if (!existsSync(indexPath)) {
  console.error(`No index.html found in ${bannerDir}`);
  process.exit(1);
}

// CSS to hide ALL dev controls, debug tools, borders
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

// JS to neutralize click tags and prevent navigation
const NEUTRALIZE_LINKS_JS = `
  document.querySelectorAll('a').forEach(a => {
    a.removeAttribute('href');
    a.onclick = (e) => e.preventDefault();
  });
  window.open = () => {};
`;

// Parse banner dimensions from CSS or HTML
function parseDimensions(dir) {
  const cssPath = join(dir, "style.css");
  let width = 300,
    height = 250;

  if (existsSync(cssPath)) {
    const css = readFileSync(cssPath, "utf-8");
    const wMatch = css.match(/width:\s*(\d+)px/);
    const hMatch = css.match(/height:\s*(\d+)px/);
    if (wMatch) width = parseInt(wMatch[1]);
    if (hMatch) height = parseInt(hMatch[1]);
  }

  // Also check HTML for inline styles or CSS custom properties
  const html = readFileSync(join(dir, "index.html"), "utf-8");
  const cssVarW = html.match(/--width:\s*(\d+)px/);
  const cssVarH = html.match(/--height:\s*(\d+)px/);
  if (cssVarW) width = parseInt(cssVarW[1]);
  if (cssVarH) height = parseInt(cssVarH[1]);

  return { width, height };
}

const { width, height } = parseDimensions(absDir);
console.log(`Banner: ${width}x${height} | Duration: ${duration}s | Output: ${outputPath}`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width, height },
  recordVideo: {
    dir: "/tmp/banner-recordings/",
    size: { width, height },
  },
});

const page = await context.newPage();

// Inject CSS before page loads to hide controls immediately
await page.addStyleTag({ content: HIDE_CONTROLS_CSS });

await page.goto(`file://${absDir}/index.html`, { waitUntil: "load" });

// Neutralize click tags after load
await page.evaluate(NEUTRALIZE_LINKS_JS);

// Re-inject CSS after load in case page styles override
await page.addStyleTag({ content: HIDE_CONTROLS_CSS });

console.log(`Recording for ${duration}s...`);
await page.waitForTimeout(duration * 1000);

// Get video path before closing
const videoPath = await page.video().path();

await context.close();
await browser.close();

console.log(`WebM: ${videoPath}`);

// Convert to high-quality MP4 at 60fps
console.log(`Converting to MP4 (60fps, CRF 18)...`);
execSync(
  `ffmpeg -y -i "${videoPath}" -r 60 -c:v libx264 -preset slow -crf 18 -an "${resolve(outputPath)}"`,
  { stdio: "inherit" }
);

// Clean up WebM
try { unlinkSync(videoPath); } catch {}

console.log(`Done: ${outputPath}`);
