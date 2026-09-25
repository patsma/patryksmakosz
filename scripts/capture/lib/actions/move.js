/** { "move": { "to": [200, 300], "duration": 700 } } - eased pointer path; "to" is a selector or [x, y] */

import { moveTo } from "./_pointer.js";

export function validate(arg) {
  const to = arg?.to;
  const point = Array.isArray(to) && to.length === 2 && to.every(Number.isFinite);
  if (!point && !(typeof to === "string" && to)) return 'move needs "to": a selector or [x, y]';
  if (arg.duration !== undefined && !(arg.duration > 0)) return 'move "duration" must be a positive number of ms';
  return null;
}

export const run = (ctx, arg) => moveTo(ctx, arg.to, arg.duration);
