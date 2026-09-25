/**
 * Get a page camera-ready: warm the cache so lazy media is already downloaded,
 * reload so scroll-triggered reveals play again on camera, hide banners and scrollbars.
 */

/**
 * Hide scrollbars and the shot list's selectors on every page load in this tab.
 * An init script, because a plain addStyleTag is lost on the reload below.
 * @param {import("playwright").Page} page
 * @param {string[]} [hide]
 */
export async function installHideStyles(page, hide = []) {
  const css = [
    "::-webkit-scrollbar { display: none !important; }",
    "html { scrollbar-width: none !important; }",
    ...hide.map((sel) => `${sel} { display: none !important; }`),
  ].join("\n");
  await page.addInitScript((css) => {
    const apply = () => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    };
    if (document.head) apply();
    else document.addEventListener("DOMContentLoaded", apply);
  }, css);
}

/**
 * @param {import("playwright").Page} page
 * @param {string} url
 * @param {{ warmup?: boolean }} [opts]
 */
export async function preparePage(page, url, opts = {}) {
  await load(page, url);
  if (opts.warmup !== false) {
    await warmUp(page);
    // Reload from a warm cache: images come from disk, but reveals are fresh again
    await page.reload({ waitUntil: "load" });
    await settle(page);
  }
}

/** @param {import("playwright").Page} page @param {string} url */
async function load(page, url) {
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await settle(page);
}

/** Fonts loaded, network quiet, one more beat for intro animations to land */
async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

/** Step to the bottom a screen at a time so every lazy image and video starts loading */
async function warmUp(page) {
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const el = document.scrollingElement;
    for (let y = 0; y < el.scrollHeight; y += innerHeight * 0.8) {
      window.scrollTo(0, y);
      await wait(200);
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
}
