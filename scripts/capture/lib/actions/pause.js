/** { "pause": 2000 } - hold still for ms */

import { sleep } from "./_pointer.js";

export const validate = (ms) => (Number.isFinite(ms) && ms >= 0 ? null : "pause needs a number of ms");

export const run = (ctx, ms) => sleep(ms);
