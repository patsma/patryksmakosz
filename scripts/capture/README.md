# Site capture

Records portfolio clips of a live site from a shot list. Real headed Chrome is driven by Playwright,
and ffmpeg films the built-in Retina screen. Each shot becomes one ProRes 422 HQ, 60fps CFR `.mov`
that is ready for DaVinci Resolve.

## Usage

```bash
node scripts/capture/capture-site.js scripts/capture/shots/<id>.json
node scripts/capture/capture-site.js scripts/capture/shots/<id>.json --only home-scroll --device desktop
```

Output goes outside the repo:

```
~/Movies/portfolio-captures/<id>/<YYYY-MM-DD>/<device>-<shot>.mov   (+ <device>-<shot>-<name>.png stills)
```

If another app takes the screen, the shot is retried once with Chrome brought back to the front.
If the Mac is locked, the run waits for an unlock. A shot that still fails is logged, and the run
moves on to the next one. The exit code is 1 if any shot failed.

## Before you run it

- **Leave the Mac alone for the whole run.** The whole screen is filmed. Typing in the terminal,
  or another Claude session finishing in iTerm, brings a window over the page. That shot gets
  retried, but a quiet Mac is faster.
- **Keep it unlocked.** A locked session hides the screen from ffmpeg, so the run pauses until you
  unlock. Run it under `caffeinate -d -i`.
- The built-in display must be the main display, at 60Hz, with its resolution set to look like
  1440x900. Preflight checks all of this.
- Your terminal app needs Screen Recording permission (System Settings > Privacy & Security).
- Turn on Do Not Disturb, because a notification banner lands in the clip.

## Shot list

```json
{
  "id": "architecture-studio",
  "baseUrl": "https://example.com/",
  "hide": ["#cookie-banner"],
  "devices": ["desktop", "mobile"],
  "shots": [
    { "name": "home-scroll", "path": "/", "actions": [{ "scroll": { "to": "bottom", "speed": 700 } }] },
    { "name": "menu", "path": "/", "devices": ["desktop"],
      "actions": [{ "click": "nav a[href*='projects']" }, { "pause": 2500 }] }
  ]
}
```

- `id` is kebab-case and **neutral**. It must not contain a client name, because this repo is
  public.
- **Real shot lists are gitignored**, because their URL and selectors name the client. Only
  `shots/example.json` is committed. Copy it to `shots/<id>.json`, and that copy stays on this
  Mac.
- `hide` lists selectors that are `display: none` on every load (cookie banners, chat widgets).
- Per shot: `devices` overrides the list's devices. `warmup: false` skips the warm-up reload.
  `lead` / `tail` set the ms of stillness before and after the actions (defaults 500 / 800).
- Devices: `desktop` is 1440x900 @2x. `mobile` is 390x844 @2x with touch and an iPhone UA.

### Actions

| Action | Example | Notes |
|---|---|---|
| `scroll` | `{ "scroll": { "to": "bottom", "speed": 700 } }` | `to`: `bottom`, `top`, a selector or a px number. Eased. `method`: `auto` (default) uses wheel input when the page has Lenis and a frame-locked `scrollTo` otherwise |
| `hover` | `{ "hover": ".card" }` | Eased pointer path to the element. Skipped on mobile |
| `move` | `{ "move": { "to": [200, 300], "duration": 700 } }` | `to` is a selector or `[x, y]` |
| `click` | `{ "click": "nav a" }` | Moves there first. Tap on mobile |
| `waitFor` | `{ "waitFor": ".loaded" }` | Waits until the element is visible |
| `pause` | `{ "pause": 2000 }` | ms |
| `goto` | `{ "goto": "/about/" }` | Recorded navigation |
| `screenshot` | `{ "screenshot": "hero" }` | PNG still next to the clip |

The element for `hover` / `click` has to be in the viewport already, so `scroll` to it first.

## How it works

1. **Preflight** finds the built-in screen. avfoundation only calls screens "Capture screen N", so
   it grabs a frame from each one and matches the pixel size.
2. **Chrome** launches with a throwaway profile, and CDP puts the window into macOS fullscreen.
3. **Prepare**: load the page, scroll it once so lazy media downloads, then reload so the
   scroll-triggered reveals play again on camera.
4. **Measure**: the viewport is painted magenta for one grabbed frame, and the magenta box is the
   crop.
5. **Record**: hardware H.264 at 80 Mbps. The base M1 has no ProRes engine, so this is pass one.
6. **Measure again**: if the viewport moved or vanished, something took over the screen and the
   shot fails.
7. **Finish**: crop, `-r 60` CFR, `prores_ks` profile 3. Then every frame is diffed against the
   one before, to count hitches.

Desktop clips come out 2880x1798 and mobile 780x1686. macOS draws a 1px black line over the top
row of a fullscreen window, and ProRes needs even sizes, so each clip loses two rows.

## Reading the frame check

`ok 1359 frames, 12 hitches` counts hitches: one or two repeated frames with clear motion on both
sides, which is what a dropped frame looks like. Long runs of repeats, such as a `pause` or a page
at rest, are stillness and are not counted. The times are printed so you can scrub to them. Over 1%
of frames is flagged `WARN`.

A few hitches on a heavy real site are usually the site's own jank at that point (a big image
decoding, a map starting), which a visitor sees too. On the fixture it should be 0.
`mpdecimate` was tried first and rejected: its duplicate threshold counts slow, flat motion and
lead-in stillness as drops, and it scored a clean scroll at 85%.

`fixture/fixture.json` is a local GSAP page with continuous motion and a frame counter, for checking
the pipeline itself:

```bash
node scripts/capture/capture-site.js scripts/capture/fixture/fixture.json
```

## When a shot fails

The error names a screenshot of the screen at the moment of failure
(`<out>/raw/<device>-<shot>-screen.png`). Common causes:

- `Viewport measured ... at 0,176`: a toolbar or bubble is over the page. The pointer is parked
  away from the top edge, and Translate and the fullscreen toolbar are switched off, so look for
  a new kind of popup.
- `marker not visible` or `Screen changed during the shot`: another window or Space came forward.
- `no longer in the avfoundation device list`: the session locked mid-shot.

ProRes HQ is large, about 40-45 MB per second of real site at desktop size. Check free space
before a full run.
