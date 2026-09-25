/**
 * { "scroll": { "to": "bottom" | "top" | selector | px, "speed": px/s, "method": "auto" | "wheel" | "raf" } }
 * speed and method default to "scroll" in capture.config.json.
 * wheel = real wheel input, which smooth-scroll libraries (Lenis) need to react to.
 * raf = window.scrollTo on every animation frame, frame-locked and smoothest on native scroll.
 * auto picks wheel when Lenis is on the page, raf otherwise.
 */

import { FRAME_MS, easeInOut, sleep, ensureMouse } from "./_pointer.js";

const METHODS = ["auto", "wheel", "raf"];

export function validate(arg) {
  const to = arg?.to;
  if (!(Number.isFinite(to) || (typeof to === "string" && to))) {
    return 'scroll needs "to": "bottom", "top", a selector or a px number';
  }
  if (arg.speed !== undefined && !(arg.speed > 0)) return 'scroll "speed" must be a positive px/s';
  if (arg.method !== undefined && !METHODS.includes(arg.method)) {
    return `scroll "method" must be one of ${METHODS.join(", ")}`;
  }
  return null;
}

export async function run(ctx, arg) {
  const { page } = ctx;
  const defaults = ctx.settings?.scroll || {};
  const speed = arg.speed || defaults.speed || 600;
  const target = await page.evaluate((to) => {
    const max = document.scrollingElement.scrollHeight - innerHeight;
    if (to === "bottom") return max;
    if (to === "top") return 0;
    if (typeof to === "number") return Math.min(to, max);
    const el = document.querySelector(to);
    if (!el) return null;
    return Math.min(el.getBoundingClientRect().top + scrollY, max);
  }, arg.to);
  if (target === null) throw new Error("target not found");
  const from = await page.evaluate(() => scrollY);
  const distance = target - from;
  if (Math.abs(distance) < 1) return;
  const duration = (Math.abs(distance) / speed) * 1000;

  let method = arg.method || defaults.method || "auto";
  if (method === "auto") {
    const lenis = await page.evaluate(() => document.documentElement.classList.contains("lenis"));
    method = lenis ? "wheel" : "raf";
  }

  // As the page moves under the pointer it lands on links, and Chrome shows its URL bubble in
  // the corner of the viewport. Links ignore the pointer for the length of the scroll.
  await page.evaluate(() => {
    const style = document.createElement("style");
    style.id = "__capture_nolinks__";
    style.textContent = "a { pointer-events: none !important; }";
    document.head.appendChild(style);
  });
  try {
    await driveScroll(ctx, { from, distance, duration, method });
  } finally {
    await page.evaluate(() => document.getElementById("__capture_nolinks__")?.remove()).catch(() => {});
  }
}

async function driveScroll(ctx, { from, distance, duration, method }) {
  const { page } = ctx;
  if (method === "raf") {
    await page.evaluate(
      ({ from, distance, duration }) =>
        new Promise((resolve) => {
          const ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
          const t0 = performance.now();
          const step = (now) => {
            const t = Math.min((now - t0) / duration, 1);
            window.scrollTo({ top: from + distance * ease(t), behavior: "instant" });
            t < 1 ? requestAnimationFrame(step) : resolve();
          };
          requestAnimationFrame(step);
        }),
      { from, distance, duration }
    );
  } else {
    await ensureMouse(ctx);
    const t0 = Date.now();
    let sent = 0;
    while (sent !== distance) {
      const t = Math.min((Date.now() - t0) / duration, 1);
      const want = t < 1 ? Math.round(distance * easeInOut(t)) : distance;
      if (want !== sent) await page.mouse.wheel(0, want - sent);
      sent = want;
      await sleep(FRAME_MS);
    }
  }
  await waitForScrollStop(page);
}

/** Smooth-scroll libraries keep easing after the input ends - wait for scrollY to hold still */
async function waitForScrollStop(page) {
  let last = -1;
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => scrollY);
    if (y === last) return;
    last = y;
    await sleep(150);
  }
}
