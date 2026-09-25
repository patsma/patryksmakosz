/** { "goto": "/about/" } - recorded navigation, relative to the shot list's baseUrl */

import { checkResponse } from "../prepare-page.js";

export const validate = (arg) => (typeof arg === "string" && arg ? null : "goto needs a path string");

export async function run(ctx, path) {
  const url = new URL(path, ctx.baseUrl).href;
  checkResponse(await ctx.page.goto(url, { waitUntil: "load" }), url);
}
