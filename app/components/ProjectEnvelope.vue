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
 * - Follows the same API and lifecycle patterns as ProjectArtTech/ProjectZaksa
 * - Uses refs scoped to the inline SVG root for reliable querying
 * - Ports the GSAP timeline from the legacy /public/projects-to-import/envelope/src/main.js
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
const timeline = ref(null);
let gsapCtx = null;
let scrollTriggerInstance = null;

// Props for consistency with other project components
const props = defineProps({
  /**
   * @type {boolean}
   * Show GSDevTools (minimal) for debugging
   */
  showDevTools: { type: Boolean, default: false },
  /**
   * @type {string}
   * Unique id for GSDevTools instance
   */
  devToolsId: {
    type: String,
    default: () => `envelope-${Math.random().toString(36).slice(2, 9)}`,
  },
  /**
   * @type {boolean}
   * Autoplay when ScrollTrigger is disabled
   */
  autoPlay: { type: Boolean, default: true },
  /**
   * @type {boolean}
   * Use ScrollTrigger to play/pause based on visibility
   */
  useScrollTrigger: { type: Boolean, default: true },
  /**
   * @type {string}
   * ScrollTrigger start position
   */
  stStart: { type: String, default: "top center" },
  /**
   * @type {string}
   * ScrollTrigger end position
   */
  stEnd: { type: String, default: "bottom center" },
  /**
   * @type {boolean}
   * Loop the animation (restarts from the beginning)
   */
  loop: { type: Boolean, default: true },
  /**
   * @type {number}
   * Playback speed multiplier
   */
  timeScale: { type: Number, default: 1 },
});

/**
 * Build the GSAP timeline using the Envelope SVG structure.
 * This mirrors the original sequence from the legacy project while scoping <defs> ids.
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
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

  // Initial visibility for container
  $gsap.set(containerRef.value, { autoAlpha: 1 });

  // Create main timeline (looping optional)
  const tl = $gsap.timeline({
    paused: true,
    repeat: props.loop ? -1 : 0,
    defaults: { ease: "power2.inOut" },
    onComplete: () => {
      // Keep API consistent; no-op when repeating
    },
  });

  // Elements used in the sequence
  const textItems = qa("#text > *");
  const arrow = q("#arrow");
  const button = q("#button");
  const closed = q("#closed");
  const patternTop = q("#pattern-top");
  const paper = q("#paper");
  const paperMask = q("#paper-mask");
  const paperMaskFull = q("#paper-mask-full");
  const shadowsInner = q("#shadows-inner");
  const patternBottom = q("#pattern-bottom");
  const accents = q("#accents");
  const body = q("#body");
  const bottomShadow = q("#bottom-shadow"); // Present in original list; optional in inline SVG

  // Guard against missing optional element
  const movingGroup = [
    patternTop,
    closed,
    shadowsInner,
    patternBottom,
    accents,
    body,
  ].filter(Boolean);
  if (bottomShadow) movingGroup.push(bottomShadow);

  // Default starting states
  if (textItems.length) $gsap.set(textItems, { autoAlpha: 0 });
  if (arrow) $gsap.set(arrow, { autoAlpha: 0 });

  // Sequence (ported from legacy main.js with minimal changes)
  tl.to(textItems, { autoAlpha: 1, stagger: 0.1 })
    .fromTo(
      arrow,
      { y: "+=10", autoAlpha: 0 },
      { y: 0, repeat: 2, yoyo: true, autoAlpha: 1 },
      "<"
    )
    .to(arrow, { autoAlpha: 0 })
    .to(
      button,
      {
        autoAlpha: 0,
        scale: 0,
        transformOrigin: "center center",
      },
      "<"
    )
    .to(textItems, { autoAlpha: 0, stagger: 0.1 }, "<")
    .to(closed, {
      duration: 2,
      transformOrigin: "center top",
      fill: "#f5f5f5",
      scaleY: -1,
      ease: "linear",
    })
    .from(
      patternTop,
      {
        duration: 1.5,
        transformOrigin: "center bottom",
        scaleY: 0,
        ease: "linear",
      },
      "-=1"
    )
    .from(
      paper,
      {
        duration: 2,
        scaleY: 0,
        transformOrigin: "center bottom",
      },
      "-=2.5"
    )
    .to(paperMask, { y: "+=500", duration: 2.5 })
    .to(
      movingGroup,
      {
        y: "+=500",
        duration: 2.6,
      },
      "<"
    )
    .from(paperMaskFull, { autoAlpha: 0, duration: 0.01 }, "-=1")
    .from(shadowsInner, { autoAlpha: 0, y: "+=2" }, 0.1);

  // Apply requested playback speed
  tl.timeScale(props.timeScale);

  // DevTools integration
  if (props.showDevTools) {
    nextTick(() => {
      try {
        $GSDevTools.create({
          animation: tl,
          container: containerRef.value,
          minimal: true,
          id: props.devToolsId,
          globalSync: false,
        });
        tl.timeScale(props.timeScale);
      } catch (e) {}
    });
  }

  timeline.value = tl;
  return tl;
};

// Lifecycle: mount, build animation, wire ScrollTrigger
onMounted(() => {
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
      const tl = createAnimation();
      if (!tl) return;

      if (props.useScrollTrigger && $ScrollTrigger) {
        scrollTriggerInstance = $ScrollTrigger.create({
          trigger: containerRef.value,
          start: props.stStart,
          end: props.stEnd,
          onEnter: () => tl.play(),
          onEnterBack: () => tl.play(),
          onLeave: () => tl.pause(0).progress(0),
          onLeaveBack: () => tl.pause(0).progress(0),
        });
        $ScrollTrigger.refresh();
      } else if (props.autoPlay) {
        tl.play();
      } else if (props.showDevTools) {
        tl.play();
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
});

// Public API
defineExpose({
  containerRef,
  timeline,
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
