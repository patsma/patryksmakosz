/**
 * Settings in layers: capture.config.json < shot list "settings" < per-shot fields < CLI flags.
 * Every default lives in capture.config.json, so a new knob value never needs a code change.
 */

import { readFileSync } from "fs";
import { homedir } from "os";
import { fileURLToPath } from "url";

const CONFIG_PATH = fileURLToPath(new URL("../capture.config.json", import.meta.url));

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/**
 * Deep merge, later layers win. Objects merge key by key, arrays and values replace,
 * undefined is skipped so an unset CLI flag never blanks a default.
 * @param {...object} layers
 */
export function merge(...layers) {
  const out = {};
  for (const layer of layers) {
    for (const [key, value] of Object.entries(layer || {})) {
      if (value === undefined) continue;
      out[key] = isObject(value) && isObject(out[key]) ? merge(out[key], value) : structuredClone(value);
    }
  }
  return out;
}

/** Read capture.config.json and expand ~ in outDir */
export function loadConfig(path = CONFIG_PATH) {
  const config = JSON.parse(readFileSync(path, "utf8"));
  return { ...config, outDir: expandHome(config.outDir) };
}

/**
 * @param {object} config from loadConfig()
 * @param {{ settings?: object }} list the shot list
 * @param {{ outDir?: string, format?: string }} cli
 */
export function resolveSettings(config, list, cli = {}) {
  const settings = merge(config, list.settings, { outDir: cli.outDir, final: { format: cli.format } });
  settings.outDir = expandHome(settings.outDir);
  return settings;
}

/**
 * The per-shot values: a field on the shot beats the settings, and warm-up defaults per mode.
 * @param {object} settings
 * @param {{ lead?: number, tail?: number, warmup?: boolean }} shot
 * @param {"draft"|"final"} mode
 */
export function shotSettings(settings, shot, mode) {
  return {
    lead: shot.lead ?? settings.lead,
    tail: shot.tail ?? settings.tail,
    warmup: shot.warmup ?? settings[mode].warmup,
  };
}

function expandHome(p) {
  return typeof p === "string" && p.startsWith("~") ? homedir() + p.slice(1) : p;
}
