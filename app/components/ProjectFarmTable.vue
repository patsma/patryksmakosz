<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--farm-table"
  >
    <FarmTableSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectFarmTable animation component
 * - Pattern A (loop/play-pause) architecture
 * - Ports the GSAP timeline from old portfolio /logo-animation/farm-table
 * - Staggered entrance: logo pieces fly in from different directions,
 *   then FARM/TABLE text scales in from top/bottom
 */

const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

// Standard container/timeline refs
const containerRef = ref(null);
const timeline = ref(null);
let gsapCtx = null;
let scrollTriggerInstance = null;

// Ref for the SVG component instance
const svgComponentRef = ref(null);

// Props consistent with other Project components
const props = defineProps({
  showDevTools: {
    type: Boolean,
    default: false,
  },
  devToolsId: {
    type: String,
    default: () => `farm-table-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom top" },
});

/**
 * Build the GSAP timeline ported from old script.js
 * Converts GSAP 2 staggerFrom/cycle syntax to GSAP 3
 */
const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectFarmTable: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `farm-table-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert polygon/polyline shapes to paths for compatibility
  try {
    const svgRootEl = svgRoot.closest && svgRoot.closest("svg");
    if ($MorphSVGPlugin && svgRootEl) {
      const shapes = svgRootEl.querySelectorAll(
        "circle, rect, ellipse, line, polygon, polyline"
      );
      if (shapes && shapes.length) {
        $MorphSVGPlugin.convertToPath(shapes);
      }
    }
  } catch (e) {}

  // Scoped query helpers
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)));

  // Query animation groups
  const logoBottom = qa("#logoBottom > *");
  const logoMiddle = qa("#logoMiddle > *");
  const logoTop = qa("#logoTop > *");
  const farm = qa("#farm > *");
  const table = qa("#table > *");

  // Reveal container and SVG (hidden by CSS to prevent FOUC)
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(svgRoot, { autoAlpha: 1 });

  // Build main timeline
  const tl = $gsap.timeline({
    paused: true,
    delay: 0.1,
    repeat: -1,
    repeatDelay: 2.5,
  });

  // Label for simultaneous text animations
  tl.add("show-farm-table");

  // Logo bottom - 3 paths fly in from different directions
  tl.from(logoBottom, {
    duration: 0.6,
    autoAlpha: 1,
    xPercent: (i) => [500, -500, -500][i],
    yPercent: (i) => [500, 500, 0][i],
    transformOrigin: "bottom",
    stagger: 0.3,
  });

  // Logo middle - 3 elements fly in
  tl.from(
    logoMiddle,
    {
      duration: 0.6,
      autoAlpha: 1,
      xPercent: (i) => [500, 500, 500][i],
      yPercent: (i) => [500, -500, 500][i],
      transformOrigin: "50% 50%",
      stagger: 0.3,
    },
    "-=0.5"
  );

  // Logo top - 3 elements fly in
  tl.from(
    logoTop,
    {
      duration: 0.6,
      autoAlpha: 1,
      xPercent: (i) => [-500, -500, 500][i],
      yPercent: (i) => [-500, -500, -500][i],
      transformOrigin: "top",
      stagger: 0.2,
    },
    "-=0.5"
  );

  // FARM text - scales up from top (simultaneous with label)
  tl.from(
    farm,
    {
      duration: 1,
      autoAlpha: 0,
      yPercent: -10,
      scaleY: 0,
      transformOrigin: "top",
      stagger: 0.48,
    },
    "show-farm-table"
  );

  // TABLE text - scales up from bottom (simultaneous with label)
  tl.from(
    table,
    {
      duration: 1,
      autoAlpha: 0,
      yPercent: -10,
      scaleY: 0,
      transformOrigin: "bottom",
      stagger: 0.48,
    },
    "show-farm-table"
  );

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
      } catch (e) {}
    });
  }

  timeline.value = tl;
  return tl;
};

// Lifecycle
onMounted(() => {
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
      const tl = createAnimation();
      if (props.useScrollTrigger && tl && $ScrollTrigger) {
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
        tl && tl.play();
      }
    }, containerRef.value);
  });
});

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
      $GSDevTools.getById(props.devToolsId)?.kill();
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
/* Styling centralized under app/assets/scss/components/_animation-components.scss */
</style>
