/**
 * Command line parsing. Draft is the default mode, so an accidental run never takes over the screen.
 */

export const USAGE = `Usage: node scripts/capture/capture-site.js <shots.json> [options]

  --final            Screen-record ProRes clips (takes over the screen). Default is a headless draft
  --draft            Headless draft mp4 + contact sheet per shot (the default)
  --only <shot>      Only the shot with this name
  --device <name>    Only this device (desktop, mobile, or any in capture.config.json)
  --out <dir>        Output root instead of the configured outDir
  --format <name>    Final output format (prores-hq, h264-hq)
  --help             This text`;

const VALUE_FLAGS = { "--only": "only", "--device": "device", "--out": "outDir", "--format": "format" };

/**
 * @param {string[]} argv process.argv.slice(2)
 * @returns {{ file: string|null, mode: "draft"|"final", only: string|null, device: string|null,
 *   outDir: string|undefined, format: string|undefined, help: boolean }}
 */
export function parseArgs(argv) {
  const opts = { file: null, mode: "draft", only: null, device: null, outDir: undefined, format: undefined, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--final" || arg === "--draft") opts.mode = arg.slice(2);
    else if (arg === "--help" || arg === "-h") opts.help = true;
    else if (VALUE_FLAGS[arg]) {
      const value = argv[++i];
      if (value === undefined || value.startsWith("--")) throw new Error(`${arg} needs a value`);
      opts[VALUE_FLAGS[arg]] = value;
    } else if (arg.startsWith("-")) throw new Error(`Unknown option "${arg}"`);
    else if (opts.file) throw new Error(`Pass one shot list, got "${opts.file}" and "${arg}"`);
    else opts.file = arg;
  }
  if (!opts.file && !opts.help) throw new Error("Pass a shot list .json");
  return opts;
}
