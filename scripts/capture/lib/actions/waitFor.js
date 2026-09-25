/** { "waitFor": ".loaded" } - wait until the element is visible (15s) */

import { needsString } from "./_pointer.js";

export const validate = needsString("waitFor");

export const run = (ctx, sel) =>
  ctx.page.waitForSelector(sel, { state: "visible", timeout: 15000 }).catch(() => {
    throw new Error("not visible within 15s");
  });
