<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--vibeuu"
  >
    <div ref="innerLogoRef" class="logo-animation">
      <VibeuuLogoSVG ref="svgComponentRef" />
    </div>
  </div>
</template>

<script setup>
// Nuxt GSAP services
const { $gsap } = useNuxtApp();
const { $DrawSVGPlugin } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
const { $CustomBounce } = useNuxtApp();
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

// Core refs
const containerRef = ref(null);
const innerLogoRef = ref(null);
const svgComponentRef = ref(null);
const timeline = ref(null);

let gsapCtx = null;
let scrollTriggerInstance = null;

const props = defineProps({
  showDevTools: { type: Boolean, default: false },
  devToolsId: {
    type: String,
    default: () => `vibeuu-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: { type: Boolean, default: false },
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom center" },
  // Global speed for this animation, mirrors legacy feel while staying configurable
  timeScale: { type: Number, default: 1 },
});

/**
 * Create the Vibeuu animation timeline.
 * Ported from public/oldportfolio/logo-animation/vibeuu/src/main.js
 * - Converts shapes to paths (for safety)
 * - Draws letter masks sequentially (VB, B, I)
 * - Bounces in the dot with GSAP CustomBounce
 */
const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) return null;

  // Prefix defs IDs to avoid collisions
  const idPrefix =
    props.devToolsId || `vibeuu-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Best-effort conversion for Morph safety (noop if plugin missing)
  try {
    const svgEl = svgRoot.closest ? svgRoot.closest("svg") : svgRoot;
    if ($MorphSVGPlugin && svgEl) {
      const shapes = svgEl.querySelectorAll(
        "circle, rect, ellipse, line, polygon, polyline"
      );
      if (shapes && shapes.length) $MorphSVGPlugin.convertToPath(shapes);
    }
  } catch (e) {}

  // Scoped query helpers that remap #ids when required
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));

  // Targets inside Vibeuu SVG
  const vbMask = q("#letterVBmask");
  const bMask = q("#letterBmask");
  const iMask = q("#letterImask");
  const dot = q("#letterIdot");

  // Reveal inner
  $gsap.set(innerLogoRef.value, { autoAlpha: 1 });

  // Main timeline
  const tl = $gsap.timeline({
    paused: true,
    defaults: { ease: "power2.inOut" },
    repeat: -1,
    repeatDelay: 0,
  });

  // If DrawSVGPlugin exists, animate mask strokes. If not, fallback to opacity fades as minimal viable effect
  const canDraw = Boolean($DrawSVGPlugin);

  if (canDraw) {
    tl.from(vbMask, { drawSVG: 0, duration: 2.0 })
      .from(bMask, { drawSVG: 1, duration: 1.0 }, "-=1.25")
      .from(iMask, { drawSVG: 1, duration: 1.0 }, "-=0.75");
  } else {
    tl.from(vbMask, { autoAlpha: 0, duration: 0.8 })
      .from(bMask, { autoAlpha: 0, duration: 0.6 }, "-=0.3")
      .from(iMask, { autoAlpha: 0, duration: 0.6 }, "-=0.3");
  }

  $gsap.set(dot, { y: -100, autoAlpha: 0, transformOrigin: "center bottom" });
  try {
    $CustomBounce?.create("dotBounce", { strength: 0.6, squash: 2 });
  } catch (e) {}
  tl.to(dot, { y: 0, duration: 1.5, ease: "dotBounce" }, "-=0.75")
    .to(dot, { autoAlpha: 1, duration: 0.25, ease: "linear" }, "<")
    .to(
      dot,
      {
        duration: 1.5,
        scaleX: 1.2,
        scaleY: 0.8,
        ease: "dotBounce-squash",
        transformOrigin: "center bottom",
      },
      "<"
    )
    .to(dot, { scaleX: 1, scaleY: 1, duration: 0.25 }, ">-=0.05");

  // Apply timeScale
  tl.timeScale(props.timeScale);

  // DevTools
  if (props.showDevTools) {
    nextTick(() => {
      try {
        $GSDevTools?.create({
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
      } else if (props.autoPlay || props.showDevTools) {
        tl.play();
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
      $GSDevTools?.getById?.(props.devToolsId)?.kill?.();
    } catch (e) {}
  }
});

// Public control API
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
/* Visual class hooks reused from shared styles in app/assets/scss/components/_animation-components.scss */
</style>
