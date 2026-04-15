<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--yamahata"
  >
    <YamahataSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectYamahata animation component
 * - Follows Pattern A from ProjectDobraHipoteka.vue
 * - Ports the GSAP timeline from old portfolio /logo-animation/yamahata
 * - Sequential letter color fill animation: each letter shifts to a random color then back to white
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
    default: () => `yamahata-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom top" },
});

// Color palette from original animation (excluding black and white)
const colors = [
  "#559CB5",
  "#F04937",
  "#F47920",
  "#FDBA12",
  "#00AE81",
  "#DAE255",
  "#B9571A",
  "#A80B7A",
  "#EE255C",
  "#F59AA9",
  "#FFEF00",
];

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Build the GSAP timeline using the inline SVG IDs
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectYamahata: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `yamahata-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths for compatibility
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

  // Query each letter
  const y = q("#y");
  const a1 = q("#a1");
  const m = q("#m");
  const a2 = q("#a2");
  const h = q("#h");
  const a3 = q("#a3");
  const t = q("#t");
  const a4 = q("#a4");

  const letters = [y, a1, m, a2, h, a3, t, a4];

  // Reveal container and SVG (hidden by CSS to prevent FOUC)
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(svgRoot, { autoAlpha: 1 });

  // Build main timeline - sequential color fill animation
  const tl = $gsap.timeline({
    paused: true,
    delay: 0.1,
    repeat: -1,
    repeatDelay: 2.5,
  });

  // Each letter: animate to random color, then back to white
  for (const letter of letters) {
    if (!letter) continue;
    tl.to(letter, { duration: 3, fill: getRandomColor() });
    tl.to(letter, { duration: 3, fill: "#fff" });
  }

  tl.timeScale(1.2);

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
