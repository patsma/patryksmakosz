/** { "hover": ".card" } - eased pointer path to the element. Skipped on touch devices */

import { moveTo, needsString } from "./_pointer.js";

export const validate = needsString("hover");

export async function run(ctx, sel) {
  if (ctx.touch) return console.warn(`  hover "${sel}" skipped on a touch device`);
  await moveTo(ctx, sel);
}
