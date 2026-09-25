# Site capture pipeline - design

Date: 2026-09-25. Status: built, in `scripts/capture/`. Usage lives in `scripts/capture/README.md`.

## Goal

One repeatable tool that drives real Chrome through a per-site shot list and writes one
Resolve-ready clip per shot, so every portfolio case study is recorded the same way. The edit
itself happens in DaVinci Resolve.

## Decisions

- **Capture**: real headed Chrome (Playwright, `channel: 'chrome'`), filmed with ffmpeg
  avfoundation screen capture. Not Playwright's `recordVideo` or CDP screencast, because both drop
  and retime frames under load
- **Screen**: the built-in Retina only, looking like 1440x900 @2x at 60Hz. The 4K external runs at
  30Hz and is not used
- **Clips**: a full-page scroll per device (desktop 1440x900 @2x, mobile 390x844 @2x), plus
  scripted moments per site (transitions, hovers, physics)
- **Output**: ProRes 422 HQ, 60fps CFR, in `~/Movies/portfolio-captures/<id>/<date>/`, outside the
  repo
- **Two passes**: the base M1 has no ProRes engine, so the live capture is `h264_videotoolbox` at
  80 Mbps and `prores_ks` runs offline afterwards
- **Naming**: shot list ids are neutral (`architecture-studio`, `auto-service-platform`) and never a
  client name. The repo is public, and client contracts forbid naming the client

## Modules

| File | Job |
|---|---|
| `capture-site.js` | CLI: args, per-device browser, per-shot error isolation |
| `lib/preflight.js` | Session unlocked, built-in display 60Hz and big enough, capture screen found by frame size (also the permission probe) |
| `lib/ffmpeg.js` | ffmpeg/ffprobe helpers. Screens are resolved by name on every use |
| `lib/browser.js` | Chrome launch, CDP fullscreen, pointer parking, magenta viewport measurement |
| `lib/prepare-page.js` | Hide selectors and scrollbars, warm-up scroll, reload |
| `lib/actions.js` | goto, scroll, hover, move, click, waitFor, pause, screenshot |
| `lib/screen-recorder.js` | Start/stop the H.264 capture (`q` on stdin, SIGKILL fallback) |
| `lib/finish.js` | Crop, CFR, ProRes, then the hitch check (isolated repeated frames mid-motion) |

## Found during the build

- `--kiosk` and `--start-fullscreen` do nothing under Playwright. `Browser.setWindowBounds` with
  `windowState: 'fullscreen'` works
- A fresh profile shows the toolbar in fullscreen. Seed `browser.show_fullscreen_toolbar: false`
- Google Translate's bubble on French pages pulls the toolbar down. Turn it off in the prefs and
  with `--disable-features=Translate`
- Playwright's default `--no-sandbox` makes Chrome show a warning bar, so it is dropped from the
  args
- A real pointer near the top edge reveals the menu bar. It is warped to the right edge with
  `CGWarpMouseCursorPosition`, which posts no event
- macOS draws a 1px black hairline over row 0 of a fullscreen window. Clips are cropped inside it
  to even sizes: 2880x1798 and 780x1686
- The viewport rect is measured, never computed: paint it magenta, grab a frame, take the bounding
  box. It is measured again after the shot to catch anything that took over the screen
- A locked session removes every "Capture screen" from avfoundation. Preflight checks
  `CGSSessionScreenIsLocked`
- As the page scrolls under the pointer, it lands on links and Chrome shows its URL bubble. Links
  get `pointer-events: none` for the length of each scroll
- Warm-up alone leaves scroll reveals already played, so the page is reloaded from the warm cache
  before recording
- `mpdecimate` makes a poor drop detector: lead-in stillness and slow, flat motion count as
  duplicates (a clean scroll scored 85%). The check diffs frames (`tblend` + `signalstats`) and
  counts only 1-2 frame repeats with motion on both sides
- Other Claude sessions finishing in iTerm raise it over the page. The shot is retried once, with
  the capture Chrome raised by PID through System Events, and a locked session pauses the run
- Scroll uses wheel input when Lenis is present, so Lenis eases it. Otherwise it uses a
  frame-locked `scrollTo` in `requestAnimationFrame`

## Verification

- The fixture page (continuous GSAP motion plus a frame counter) records with 0 hitches on desktop
  and mobile. The counter advances exactly one per captured frame
- A real site's full desktop scroll gave 12 hitches in 1359 frames, and the mobile one 0
- `ffprobe` shows `prores`, `HQ`, `60/1`, 2880x1798 / 780x1686
