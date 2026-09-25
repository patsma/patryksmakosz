/**
 * Action registry. Every lib/actions/<name>.js is an action called <name>, loaded automatically.
 * Files starting with "_" are helpers, not actions.
 *
 * An action module exports:
 *   run(ctx, arg)   does the thing; throw an Error with a short reason on failure
 *   validate(arg)   optional; returns an error string for a bad argument, or null
 *
 * In a shot list an action is an object with one key: { "<name>": arg }.
 */

import { readdirSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { join } from "path";

/**
 * @typedef {{ page: import("playwright").Page, baseUrl: string, touch: boolean, outDir: string,
 *   prefix: string, mouse: { x: number, y: number }, timeout: number, settings: object }} Ctx
 */

const dir = fileURLToPath(new URL(".", import.meta.url));
const files = readdirSync(dir).filter((f) => f.endsWith(".js") && !f.startsWith("_") && f !== "index.js");

/** @type {Record<string, { run: (ctx: Ctx, arg: any) => Promise<any>, validate?: (arg: any) => string|null }>} */
export const actions = Object.fromEntries(
  await Promise.all(files.map(async (f) => [f.slice(0, -3), await import(pathToFileURL(join(dir, f)).href)]))
);

/**
 * Split { name: arg } into its parts. Returns an error string when the shape is wrong.
 * @returns {{ name?: string, arg?: any, error?: string }}
 */
export function parseAction(action) {
  const keys = action && typeof action === "object" && !Array.isArray(action) ? Object.keys(action) : [];
  if (keys.length !== 1) return { error: `an action is an object with exactly one key, got ${JSON.stringify(action)}` };
  const name = keys[0];
  if (!actions[name]) return { error: `unknown action "${name}"` };
  return { name, arg: action[name] };
}

/**
 * Run one action. A failure names the action by its 1-based position, name and argument,
 * e.g. `action 2 click ".nav a": not found`.
 * @param {Ctx} ctx @param {object} action @param {number} index 0-based
 */
export async function runAction(ctx, action, index) {
  const { name, arg, error } = parseAction(action);
  if (error) throw new Error(`action ${index + 1}: ${error}`);
  try {
    await actions[name].run(ctx, arg);
  } catch (e) {
    const shown = typeof arg === "string" ? `"${arg}"` : JSON.stringify(arg);
    throw new Error(`action ${index + 1} ${name} ${shown}: ${e.message.split("\n")[0]}`);
  }
}
