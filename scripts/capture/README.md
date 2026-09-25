# Site capture

Records portfolio clips of a live site from a shot list. Two modes, one shot list:

- **Draft** (default): headless Chrome, runs in the background while you work. Gives a small mp4
  and a contact sheet per shot, for getting selectors, timing and framing right
- **Final** (`--final`): real Chrome in fullscreen, filmed from the built-in Retina screen. Gives
  one ProRes 422 HQ, 60fps CFR `.mov` per shot, ready for DaVinci Resolve. Takes over the screen

## The loop

1. Copy `shots/example.json` to `shots/<id>.json` and fill it in
2. Draft it, look at the sheets and mp4s, fix the shot list, repeat:
   ```bash
   npm run capture -- scripts/capture/shots/<id>.json
   npm run capture -- scripts/capture/shots/<id>.json --only menu --device desktop
   ```
3. When every draft looks right, record the real thing:
   ```bash
   caffeinate -d -i npm run capture:final -- scripts/capture/shots/<id>.json
   ```

Output goes outside the repo, to `outDir` from `capture.config.json`:

```
~/Movies/portfolio-captures/<id>/<YYYY-MM-DD>/draft/<device>-<shot>.mp4        draft clip, max 1280 wide
~/Movies/portfolio-captures/<id>/<YYYY-MM-DD>/draft/<device>-<shot>-sheet.png  6 frames across the shot
~/Movies/portfolio-captures/<id>/<YYYY-MM-DD>/<device>-<shot>.mov              final clip
```

Options: `--only <shot>`, `--device <name>`, `--out <dir>`, `--format <name>`, `--help`.

The whole shot list is checked before anything records, and every problem is listed with its path,
e.g. `shots[2].actions[1]: unknown action "hovr"`. A shot that fails at run time names the action:
`desktop-menu: action 2 click ".nav a": not found`, and draft mode saves the page as
`<device>-<shot>-failed.png`. Other shots still run, and the exit code is 1.

## Shot list

```json
{
  "id": "architecture-studio",
  "baseUrl": "https://example.com/",
  "hide": ["#cookie-banner"],
  "devices": ["desktop", "mobile"],
  "settings": { "lead": 800, "scroll": { "speed": 500 } },
  "shots": [
    { "name": "home-scroll", "path": "/", "actions": [{ "scroll": { "to": "bottom", "speed": 700 } }] },
    { "name": "menu", "path": "/", "devices": ["desktop"], "tail": 1500,
      "actions": [{ "click": "nav a[href*='projects']" }, { "pause": 2500 }] }
  ]
}
```

- `id` is kebab-case and **neutral**. It must not contain a client name, because this repo is public
- **Real shot lists are gitignored**, because their URL and selectors name the client. Only
  `shots/example.json` is committed
- `hide`: selectors that are `display: none` on every load (cookie banners, chat widgets)
- `devices`: which devices to record, from the ones defined in the config
- `settings`: overrides any key of `capture.config.json` for this list only
- Per shot: `devices`, `lead`, `tail` and `warmup` override the settings for that shot

A shot is a journey: its actions can cross pages with `click` on a nav link or `goto`.

## Config - `capture.config.json`

Merge order, later wins: **config file < shot list `settings` < per-shot fields < CLI flags.**

| Key | Default | What |
|---|---|---|
| `outDir` | `~/Movies/portfolio-captures` | Output root. `--out` overrides |
| `lead` / `tail` | `500` / `800` | ms of stillness before and after the actions |
| `actionTimeout` | `5000` | ms to find a `click` / `hover` / `move` target |
| `scroll.speed` / `scroll.method` | `600` / `auto` | Defaults for the `scroll` action |
| `devices.<name>` | desktop, mobile | Playwright context options: `viewport`, `deviceScaleFactor`, `isMobile`, `hasTouch`, `userAgent` |
| `draft.warmup` | `false` | Warm-up scroll and reload before a draft shot |
| `draft.maxWidth` / `draft.sheetFrames` | `1280` / `6` | Draft mp4 width cap, frames on the sheet |
| `draft.channel` | `chrome` | Playwright browser channel for drafts |
| `final.warmup` | `true` | Warm-up scroll and reload before a final shot |
| `final.format` | `prores-hq` | See formats below. `--format` overrides |
| `final.bitrate` / `final.codec` | `80M` / `h264_videotoolbox` | Live screen capture, pass one |
| `hitches.still` / `.moving` / `.maxShare` | `0.02` / `0.3` / `0.01` | Frame check thresholds |

**Adding a device** is a config entry, no code. A tablet:
`"tablet": { "viewport": { "width": 820, "height": 1180 }, "deviceScaleFactor": 2, "isMobile": true, "hasTouch": true }`.
A device with `hasTouch` taps instead of clicking and skips `hover`. Final mode only fits devices
whose viewport fits the 1440x900 screen, so a tablet is draft-only.

## Actions

| Action | Example | Notes |
|---|---|---|
| `scroll` | `{ "scroll": { "to": "bottom", "speed": 700 } }` | `to`: `bottom`, `top`, a selector or a px number. Eased. `method`: `auto` uses wheel input when the page has Lenis and a frame-locked `scrollTo` otherwise |
| `hover` | `{ "hover": ".card" }` | Eased pointer path to the element. Skipped on touch devices |
| `move` | `{ "move": { "to": [200, 300], "duration": 700 } }` | `to` is a selector or `[x, y]` |
| `click` | `{ "click": "nav a" }` | Moves there first. A tap on touch devices |
| `waitFor` | `{ "waitFor": ".loaded" }` | Waits up to 15s for the element to be visible |
| `pause` | `{ "pause": 2000 }` | ms |
| `goto` | `{ "goto": "/about/" }` | Recorded navigation |
| `screenshot` | `{ "screenshot": "hero" }` | PNG still next to the clip |

The element for `hover` / `click` has to be in the viewport already, so `scroll` to it first.

### Adding an action

Drop one file in `lib/actions/`. The file name is the action name, and it is picked up
automatically. Files starting with `_` are helpers (`_pointer.js` has the eased pointer and timing).

```js
// lib/actions/press.js - { "press": "Escape" }
export const validate = (key) => (typeof key === "string" && key ? null : "press needs a key name");

export async function run(ctx, key) {
  await ctx.page.keyboard.press(key);
}
```

`validate(arg)` is optional and returns an error string or `null`; it runs before anything
records. `run(ctx, arg)` throws a short reason on failure. `ctx` has `page`, `baseUrl`, `touch`,
`outDir`, `prefix`, `mouse`, `timeout` and the merged `settings`. Remember the final recorder films
in real time, so motion should be eased and paced.

### Adding an output format

Add an entry to `FORMATS` in `lib/formats.js`: a file extension and the ffmpeg encode args. Then
use it with `"final": { "format": "<name>" }` or `--format <name>`. Built in: `prores-hq` (Resolve
master) and `h264-hq` (near-lossless mp4 for sharing).

## Final mode

Before you run it:

- **Leave the Mac alone while shots record.** The whole screen is filmed. A window coming forward
  gets the shot retried once, but a quiet Mac is faster
- **Keep it unlocked.** A locked session hides the screen from ffmpeg, so the run pauses until you
  unlock. Run it under `caffeinate -d -i`
- The built-in display must be the main display, at 60Hz, looking like 1440x900. Preflight checks it
- Your terminal app needs Screen Recording permission (System Settings > Privacy & Security)
- Turn on Do Not Disturb, because a notification banner lands in the clip

Every shot records first. Then Chrome closes and **"Screen is free"** is printed: from there you
can use the Mac while the queue encodes (`[2/7] desktop-menu`). The raw H.264 is kept if an encode
fails.

How it works: preflight finds the built-in screen by grabbing a frame from each avfoundation
screen. Chrome launches with a throwaway profile, and CDP puts it into macOS fullscreen. The page
is loaded, scrolled once so lazy media downloads, then reloaded so reveals play again on camera.
The viewport is painted magenta for one frame, and the magenta box is the crop. Hardware H.264
records the shot, the viewport is measured again to catch a takeover, and the encode crops,
forces 60fps CFR and writes the format. Desktop comes out 2880x1798 and mobile 780x1686: macOS
draws a 1px line over the top row of a fullscreen window, and ProRes needs even sizes.

### Reading the frame check

`ok 1359 frames, 12 hitches` counts one or two repeated frames with clear motion on both sides,
which is what a dropped frame looks like. Long runs of repeats (a `pause`, a page at rest) are
stillness and are not counted. Over `hitches.maxShare` of frames is flagged `WARN`. A few hitches
on a heavy real site are usually the site's own jank, which a visitor sees too. On the fixture it
should be 0. ProRes HQ is about 40-45 MB per second at desktop size, so check free space first.

## Checks

```bash
npm run capture:test    # unit tests + a headless draft smoke run on the fixture, about a minute
```

Final mode needs the screen, so it is a manual check. Run it after changing the recorder, browser,
preflight or finish code:

```bash
npm run capture:final -- scripts/capture/fixture/fixture.json
```

Expect `0 hitches` on every shot, and `ffprobe` showing `prores`, `HQ`, `60/1`, 2880x1798 / 780x1686.

## Troubleshooting

- `Viewport measured ... at 0,176`: a toolbar or bubble is over the page (final). Translate and
  the fullscreen toolbar are switched off, so look for a new kind of popup. The error names a PNG
  of the screen at that moment, in `<out>/raw/`
- `marker not visible` or `Screen changed during the shot`: another window or Space came forward
- `no longer in the avfoundation device list`: the session locked mid-shot
- `HTTP 429 from ...`: the site's host rate-limits this Mac (o2switch "Tiger Protect" does it).
  Any page that answers 400 or more fails the shot, so a block page is never recorded as a clip.
  Wait a while, then re-run only the failed shots with `--only`
- `not in the viewport - scroll to it first`: add a `scroll` to the element before `click` / `hover`
- A draft passes but the final shot fails: the draft skips the warm-up by default, so a lazy
  element may load later. Try `"draft": { "warmup": true }` in the list's `settings`
