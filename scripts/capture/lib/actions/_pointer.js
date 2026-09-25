/**
 * Shared pointer and timing helpers for actions. The underscore prefix means "not an action",
 * so index.js does not register this file.
 * Motion is eased and paced in real time, because the final recorder films whatever happens.
 */

export const FRAME_MS = 1000 / 60;
export const easeInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Validation helper: a non-empty string (a selector or a path) */
export const needsString = (name) => (arg) =>
  typeof arg === "string" && arg.trim() ? null : `${name} needs a selector string`;

/** Put the virtual pointer mid-viewport once, so wheel events land on the page */
export async function ensureMouse(ctx) {
  if (ctx.mouse.x || ctx.mouse.y) return;
  const vp = ctx.page.viewportSize();
  ctx.mouse.x = vp.width / 2;
  ctx.mouse.y = vp.height / 2;
  await ctx.page.mouse.move(ctx.mouse.x, ctx.mouse.y);
}

/** Centre of the first match, which has to be in the viewport already */
export async function centerOf(page, sel, timeout) {
  const box = await page
    .locator(sel)
    .first()
    .boundingBox({ timeout })
    .catch(() => {
      throw new Error("not found");
    });
  const vp = page.viewportSize();
  if (!box || box.y + box.height < 0 || box.y > vp.height) {
    throw new Error("not in the viewport - scroll to it first");
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Eased pointer path from the current position to a selector or [x, y] */
export async function moveTo(ctx, to, duration = 700) {
  await ensureMouse(ctx);
  const end = Array.isArray(to) ? { x: to[0], y: to[1] } : await centerOf(ctx.page, to, ctx.timeout);
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
