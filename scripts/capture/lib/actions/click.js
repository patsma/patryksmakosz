/** { "click": "nav a" } - move there, then click. A tap on touch devices */

import { centerOf, moveTo, needsString } from "./_pointer.js";

export const validate = needsString("click");

export async function run(ctx, sel) {
  if (ctx.touch) {
    const { x, y } = await centerOf(ctx.page, sel, ctx.timeout);
    return ctx.page.touchscreen.tap(x, y);
  }
  await moveTo(ctx, sel);
  await ctx.page.mouse.click(ctx.mouse.x, ctx.mouse.y, { delay: 80 });
  // Leave the page: a pointer resting on the clicked link keeps Chrome's URL bubble on screen
  await ctx.page.mouse.move(-10, -10);
  ctx.mouse = { x: 0, y: 0 };
}
