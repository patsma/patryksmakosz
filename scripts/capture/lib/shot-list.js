/**
 * Load a shot list and check all of it before anything records. Every problem is reported at once,
 * each with its JSON path, e.g. `shots[2].actions[1]: unknown action "hovr"`.
 */

import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { pathToFileURL } from "url";
import { parseAction } from "./actions/index.js";

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Read the JSON. A relative baseUrl points at local files next to the shot list (the fixture) */
export function readShotList(file) {
  let list;
  try {
    list = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`Could not read ${file}: ${e.message}`);
  }
  if (typeof list.baseUrl === "string" && list.baseUrl.startsWith(".")) {
    list.baseUrl = pathToFileURL(resolve(dirname(file), list.baseUrl)).href + "/";
  }
  return { devices: ["desktop"], hide: [], ...list };
}

/**
 * @param {object} list
 * @param {{ devices: string[], actions: Record<string, { validate?: (arg: any) => string|null }> }} known
 * @returns {string[]} errors, empty when the list is good
 */
export function validateShotList(list, { devices, actions }) {
  const errors = [];
  const add = (path, msg) => errors.push(`${path}: ${msg}`);
  const checkDevices = (value, path) => {
    if (!Array.isArray(value)) return add(path, "must be an array of device names");
    value.forEach((d, i) => devices.includes(d) || add(`${path}[${i}]`, `unknown device "${d}"`));
  };

  if (!KEBAB.test(list.id || "")) add("id", "needs a kebab-case id, and never a client name");
  if (typeof list.baseUrl !== "string" || !list.baseUrl) add("baseUrl", "is missing");
  if (list.devices !== undefined) checkDevices(list.devices, "devices");
  if (list.hide !== undefined && !(Array.isArray(list.hide) && list.hide.every((s) => typeof s === "string"))) {
    add("hide", "must be an array of selectors");
  }
  if (!Array.isArray(list.shots) || !list.shots.length) {
    add("shots", "needs at least one shot");
    return errors;
  }

  const seen = new Set();
  list.shots.forEach((shot, i) => {
    const at = `shots[${i}]`;
    if (!KEBAB.test(shot.name || "")) add(`${at}.name`, "needs a kebab-case name");
    else if (seen.has(shot.name)) add(`${at}.name`, `duplicate shot name "${shot.name}"`);
    seen.add(shot.name);
    if (shot.devices !== undefined) checkDevices(shot.devices, `${at}.devices`);
    for (const key of ["lead", "tail"]) {
      if (shot[key] !== undefined && !(Number.isFinite(shot[key]) && shot[key] >= 0)) add(`${at}.${key}`, "must be ms");
    }
    if (!Array.isArray(shot.actions)) return add(`${at}.actions`, "must be an array");
    shot.actions.forEach((action, j) => {
      const { name, arg, error } = parseAction(action);
      const problem = error || actions[name].validate?.(arg);
      if (problem) add(`${at}.actions[${j}]`, problem);
    });
  });
  return errors;
}

/**
 * Shots for one device: a shot's own devices override the list's, --only picks one by name.
 * @param {object} list @param {string} device @param {string|null} [only]
 */
export function selectShots(list, device, only = null) {
  return list.shots.filter((s) => (s.devices || list.devices || ["desktop"]).includes(device) && (!only || s.name === only));
}
