/**
 * Shot list actions. Each action is an object with one key, e.g. { "scroll": { "to": "bottom" } }.
 * Motion is eased and paced in real time, because the screen recorder films whatever happens.
 */

import { join } from "path";

const FRAME_MS = 1000 / 60;
const easeInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @typedef {{ page: import("playwright").Page, baseUrl: string, isMobile: boolean,
 *   outDir: string, prefix: string, mouse: { x: number, y: number } }} Ctx
 */

/** @param {Ctx} ctx @param {object} action */
export async function runAction(ctx, action) {
  const [name, arg] = Object.entries(action)[0] || [];
  const fn = ACTIONS[name];
  if (!fn) throw new Error(`Unknown action "${name}"`);
  await fn(ctx, arg);
}

const ACTIONS = {
  goto: (ctx, path) => ctx.page.goto(new URL(path, ctx.baseUrl).href, { waitUntil: "load" }),
  pause: (ctx, ms) => sleep(ms),
  waitFor: (ctx, sel) => ctx.page.waitForSelector(sel, { state: "visible", timeout: 15000 }),
  scroll,
  move: (ctx, arg) => moveTo(ctx, arg.to, arg.duration),
  hover: async (ctx, sel) => {
    if (ctx.isMobile) return console.warn(`  hover "${sel}" skipped on mobile`);
    await moveTo(ctx, sel);
  },
  click: async (ctx, sel) => {
    if (ctx.isMobile) {
      const { x, y } = await centerOf(ctx.page, sel);
      return ctx.page.touchscreen.tap(x, y);
    }
    await moveTo(ctx, sel);
    await ctx.page.mouse.click(ctx.mouse.x, ctx.mouse.y, { delay: 80 });
    // Leave the page: a pointer resting on the clicked link keeps Chrome's URL bubble on screen
    await ctx.page.mouse.move(-10, -10);
    ctx.mouse = { x: 0, y: 0 };
  },
  screenshot: (ctx, name) =>
    ctx.page.screenshot({ path: join(ctx.outDir, `${ctx.prefix}-${name}.png`) }),
};

/**
 * { to: "bottom" | "top" | selector | number, speed: px/s, method: "auto" | "wheel" | "raf" }
 * wheel = real wheel input, which smooth-scroll libraries (Lenis) need to react to.
 * raf = window.scrollTo on every animation frame, frame-locked and smoothest on native scroll.
 * auto picks wheel when Lenis is on the page, raf otherwise.
 */
async function scroll(ctx, arg) {
  const { page } = ctx;
  const speed = arg.speed || 600;
  const target = await page.evaluate((to) => {
    const max = document.scrollingElement.scrollHeight - innerHeight;
    if (to === "bottom") return max;
    if (to === "top") return 0;
    if (typeof to === "number") return Math.min(to, max);
    const el = document.querySelector(to);
    if (!el) throw new Error(`scroll target "${to}" not found`);
    return Math.min(el.getBoundingClientRect().top + scrollY, max);
  }, arg.to);
  const from = await page.evaluate(() => scrollY);
  const distance = target - from;
  if (Math.abs(distance) < 1) return;
  const duration = (Math.abs(distance) / speed) * 1000;

  let method = arg.method || "auto";
  if (method === "auto") {
    method = (await page.evaluate(() => document.documentElement.classList.contains("lenis")))
      ? "wheel"
      : "raf";
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

/** Put the virtual pointer mid-viewport once, so wheel events land on the page */
async function ensureMouse(ctx) {
  if (ctx.mouse.x || ctx.mouse.y) return;
  const vp = ctx.page.viewportSize();
  ctx.mouse.x = vp.width / 2;
  ctx.mouse.y = vp.height / 2;
  await ctx.page.mouse.move(ctx.mouse.x, ctx.mouse.y);
}

async function centerOf(page, sel) {
  const box = await page.locator(sel).first().boundingBox();
  const vp = page.viewportSize();
  if (!box || box.y + box.height < 0 || box.y > vp.height) {
    throw new Error(`"${sel}" is not in the viewport - scroll to it first`);
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Eased pointer path from the current position to a selector or [x, y] */
async function moveTo(ctx, to, duration = 700) {
  await ensureMouse(ctx);
  const end = Array.isArray(to) ? { x: to[0], y: to[1] } : await centerOf(ctx.page, to);
  const start = { ...ctx.mouse };
  const t0 = Date.now();
  for (;;) {
    const t = Math.min((Date.now() - t0) / duration, 1);
    const e = easeInOut(t);
    ctx.mouse.x = start.x + (end.x - start.x) * e;
    ctx.mouse.y = start.y + (end.y - start.y) * e;
    await ctx.page.mouse.move(ctx.mouse.x, ctx.mouse.y);
    if (t === 1) return;
    await sleep(FRAME_MS);
  }
}
