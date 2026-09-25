/** { "screenshot": "hero" } - a PNG still next to the clip, <device>-<shot>-<name>.png */

import { join } from "path";

export const validate = (name) =>
  typeof name === "string" && /^[a-z0-9-]+$/.test(name) ? null : "screenshot needs a kebab-case name";

export const run = (ctx, name) => ctx.page.screenshot({ path: join(ctx.outDir, `${ctx.prefix}-${name}.png`) });
