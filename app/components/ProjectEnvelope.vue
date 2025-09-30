<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--envelope"
  >
    <EnvelopeSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectEnvelope animation component
 * - Two-phase interaction:
 *   1) Intro: reveals text and loops arrow bounce until user clicks the button/arrow
 *   2) Open: plays the envelope opening sequence; clicking again toggles to close
 * - Uses refs scoped to the inline SVG root and scoped <defs> id prefixing
 */

// Nuxt/GSAP plugins available via Nuxt app injection
const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();

import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

// Core refs and state
const containerRef = ref(null);
const svgComponentRef = ref(null);
const timeline = ref(null); // exposed as the "open" timeline
let gsapCtx = null;
let scrollTriggerInstance = null;

// Internal timelines
let introTl = null; // one-shot: just reveal text
let arrowLoopTl = null; // loops arrow bounce until click
let openTl = null; // main open/close sequence

// Elements cache
let els = null;

// Simple state
const isOpen = ref(false);
const introPlayed = ref(false);

// Props for consistency with other project components
const props = defineProps({
  /** @type {boolean} Show GSDevTools (minimal) for debugging */
  showDevTools: { type: Boolean, default: false },
  /** @type {string} Unique id for GSDevTools instance */
  devToolsId: {
    type: String,
    default: () => `envelope-${Math.random().toString(36).slice(2, 9)}`,
  },
  /** @type {boolean} Autoplay intro when ScrollTrigger is disabled */
  autoPlay: { type: Boolean, default: true },
  /** @type {boolean} Use ScrollTrigger to play/pause based on visibility */
  useScrollTrigger: { type: Boolean, default: true },
  /** @type {string} ScrollTrigger start position */
  stStart: { type: String, default: "top center" },
  /** @type {string} ScrollTrigger end position */
  stEnd: { type: String, default: "bottom center" },
  /** @type {number} Playback speed multiplier applied to all timelines */
  timeScale: { type: Number, default: 1 },
});

/**
 * Build timelines using the Envelope SVG structure.
 * - Scopes <defs> ids to avoid collisions and remaps selectors
 * - Creates: introTl (reveal), arrowLoopTl (indefinite), openTl (open/close)
 */
const createTimelines = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectEnvelope: SVG root not found");
    return null;
  }

  // Prefix <defs> ids to avoid collisions and prepare selector remapping
  const idPrefix =
    props.devToolsId || `envelope-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths within this SVG only (for morph/draw compatibility)
  try {
    const svgEl = svgRoot.closest && svgRoot.closest("svg");
    if ($MorphSVGPlugin && svgEl) {
      const shapes = svgEl.querySelectorAll(
        "circle, rect, ellipse, line, polygon, polyline"
      );
      if (shapes && shapes.length) $MorphSVGPlugin.convertToPath(shapes);
    }
  } catch (e) {}

  // Scoped query helpers that remap defs-based id selectors
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)));

  // Cache elements we need
  els = {
    textItems: qa("#text > *"),
    arrow: q("#arrow"),
    button: q("#button"),
    closed: q("#closed"),
    patternTop: q("#pattern-top"),
    paper: q("#paper"),
    paperMask: q("#paper-mask"),
    paperMaskFull: q("#paper-mask-full"),
    shadowsInner: q("#shadows-inner"),
    patternBottom: q("#pattern-bottom"),
    accents: q("#accents"),
    body: q("#body"),
    bottomShadow: q("#bottom-shadow"), // optional
  };

  // Initial visibility for container
  $gsap.set(containerRef.value, { autoAlpha: 1 });

  // Default starting states for intro
  if (els.textItems.length) $gsap.set(els.textItems, { autoAlpha: 0 });
  if (els.arrow) $gsap.set(els.arrow, { autoAlpha: 0, y: 0 });

  // INTRO: reveal text; then hand off to arrow loop
  introTl = $gsap.timeline({
    paused: true,
    defaults: { ease: "power2.inOut" },
  });
  introTl
    .to(els.textItems, { autoAlpha: 1, stagger: 0.1 })
    .to(els.arrow, { autoAlpha: 1 }, "<");

  // ARROW LOOP: bounce until click
  arrowLoopTl = $gsap.timeline({ paused: true });
  if (els.arrow) {
    arrowLoopTl.to(els.arrow, {
      y: "+=10",
      duration: 0.6,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  // OPEN: envelope opening sequence, adapted from legacy main.js
  const movingGroup = [
    els.patternTop,
    els.closed,
    els.shadowsInner,
    els.patternBottom,
    els.accents,
    els.body,
  ].filter(Boolean);
  if (els.bottomShadow) movingGroup.push(els.bottomShadow);

  openTl = $gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
  openTl
    // hide arrow + button + text
    .to(els.arrow, { autoAlpha: 0 })
    .to(
      els.button,
      { autoAlpha: 0, scale: 0, transformOrigin: "center center" },
      "<"
    )
    .to(els.textItems, { autoAlpha: 0, stagger: 0.05 }, "<")
    // flip top (closed) and reveal pattern/paper
    .to(els.closed, {
      duration: 2,
      transformOrigin: "center top",
      fill: "#f5f5f5",
      scaleY: -1,
      ease: "linear",
    })
    .from(
      els.patternTop,
      {
        duration: 1.5,
        transformOrigin: "center bottom",
        scaleY: 0,
        ease: "linear",
      },
      "-=1.2"
    )
    .from(
      els.paper,
      { duration: 2, scaleY: 0, transformOrigin: "center bottom" },
      "-=2.5"
    )
    // slide paper and move envelope down
    .to(els.paperMask, { y: "+=500", duration: 2.5 })
    .to(movingGroup, { y: "+=500", duration: 2.6 }, "<")
    .from(els.paperMaskFull, { autoAlpha: 0, duration: 0.01 }, "-=1")
    .from(els.shadowsInner, { autoAlpha: 0, y: "+=2" }, 0.1);

  // Configure auto-yoyo behavior: forward then wait 2s then reverse back
  openTl.repeat(1).yoyo(true).repeatDelay(2);
  // When the full forward+reverse cycle completes, return to waiting state
  openTl.eventCallback("onComplete", () => {
    isOpen.value = false;
    // Keep text visible and resume arrow loop without replaying the intro
    introPlayed.value = true;
    arrowLoopTl?.play();
  });

  // Apply requested playback speed
  introTl.timeScale(props.timeScale);
  arrowLoopTl.timeScale(props.timeScale);
  openTl.timeScale(props.timeScale);

  // DevTools integration (focus on the open timeline)
  if (props.showDevTools) {
    nextTick(() => {
      try {
        $GSDevTools.create({
          animation: openTl,
          container: containerRef.value,
          minimal: true,
          id: props.devToolsId,
          globalSync: false,
        });
        openTl.timeScale(props.timeScale);
      } catch (e) {}
    });
  }

  timeline.value = openTl;
  return { introTl, arrowLoopTl, openTl };
};

/**
 * Start intro (once) and loop arrow
 */
function startIntro() {
  if (!introPlayed.value) {
    introPlayed.value = true;
    introTl?.play(0).eventCallback("onComplete", () => {
      arrowLoopTl?.play();
    });
  } else {
    arrowLoopTl?.play();
  }
}

/** Stop arrow loop and reset arrow position */
function stopIntroLoop() {
  if (arrowLoopTl) {
    arrowLoopTl.pause(0);
    if (els?.arrow) $gsap.set(els.arrow, { y: 0 });
  }
}

/** Toggle open/close on click */
function handleToggle() {
  if (!openTl) return;
  if (!isOpen.value) {
    // Opening: stop intro loop and play open
    stopIntroLoop();
    openTl.restart(true, false);
    isOpen.value = true;
  } else {
    // If already opening/open, ignore extra clicks while cycle runs
  }
}

// Lifecycle: mount, build timelines, wire ScrollTrigger + clicks
onMounted(() => {
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
      const tls = createTimelines();
      if (!tls) return;

      // Click handlers on the obvious interactive targets
      const clickTargets = [els?.button, els?.arrow].filter(Boolean);
      clickTargets.forEach((el) => {
        el.style.cursor = "pointer";
        el.addEventListener("click", handleToggle);
      });

      // ScrollTrigger visibility-controlled intro/open; fallback to autoPlay
      if (props.useScrollTrigger && $ScrollTrigger) {
        scrollTriggerInstance = $ScrollTrigger.create({
          trigger: containerRef.value,
          start: props.stStart,
          end: props.stEnd,
          onEnter: () => {
            // If already open, leave as is; else (re)start intro loop
            if (!isOpen.value) startIntro();
          },
          onEnterBack: () => {
            if (!isOpen.value) startIntro();
          },
          onLeave: () => {
            // Pause and reset when leaving view
            stopIntroLoop();
            if (!isOpen.value) {
              // Reset intro to beginning for a clean re-entry
              introTl?.pause(0);
              if (els?.textItems?.length)
                $gsap.set(els.textItems, { autoAlpha: 0 });
              if (els?.arrow) $gsap.set(els.arrow, { autoAlpha: 0, y: 0 });
              introPlayed.value = false;
            }
          },
          onLeaveBack: () => {
            stopIntroLoop();
            if (!isOpen.value) {
              introTl?.pause(0);
              if (els?.textItems?.length)
                $gsap.set(els.textItems, { autoAlpha: 0 });
              if (els?.arrow) $gsap.set(els.arrow, { autoAlpha: 0, y: 0 });
              introPlayed.value = false;
            }
          },
        });
        $ScrollTrigger.refresh();
      } else if (props.autoPlay) {
        startIntro();
      } else if (props.showDevTools) {
        startIntro();
      }
    }, containerRef.value);
  });
});

// Cleanup
onUnmounted(() => {
  if (gsapCtx) gsapCtx.revert();
  if (scrollTriggerInstance) {
    try {
      scrollTriggerInstance.kill();
    } catch (e) {}
    scrollTriggerInstance = null;
  }
  if (props.showDevTools) {
    try {
      $GSDevTools.getById?.(props.devToolsId)?.kill();
    } catch (e) {}
  }
  // Remove listeners if still present
  try {
    if (els?.button) els.button.removeEventListener("click", handleToggle);
    if (els?.arrow) els.arrow.removeEventListener("click", handleToggle);
  } catch (e) {}
});

// Public API
defineExpose({
  containerRef,
  timeline, // open timeline
  playIntro: () => startIntro(),
  playOpen: () => {
    stopIntroLoop();
    openTl?.restart(true, false);
    isOpen.value = true;
  },
  toggle: () => handleToggle(),
  play: () => timeline.value?.play(),
  pause: () => timeline.value?.pause(),
  restart: () => timeline.value?.restart(),
  reverse: () => timeline.value?.reverse(),
  seek: (time) => timeline.value?.seek(time),
});
</script>

<style scoped>
/* Visual layout follows shared styles in app/assets/scss/components/_animation-components.scss */
</style>
