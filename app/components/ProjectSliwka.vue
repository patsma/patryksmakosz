<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--sliwka"
  >
    <div ref="innerLogoRef" class="logo-animation">
      <SliwkaLogoSVG ref="svgComponentRef" />
    </div>
  </div>
</template>

<script setup>
// Nuxt GSAP services
const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

// Core refs
const containerRef = ref(null);
const innerLogoRef = ref(null);
const svgComponentRef = ref(null);
const timeline = ref(null);
let gsapCtx = null;
let scrollTriggerInstance = null;

// Props consistent with other project components
const props = defineProps({
  showDevTools: { type: Boolean, default: false },
  devToolsId: {
    type: String,
    default: () => `sliwka-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: { type: Boolean, default: false },
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom center" },
  timeScale: { type: Number, default: 1 },
});

// Build timeline from legacy logic
const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef || svgComponentRef.value;
  if (!svgRoot) return null;

  // Scope defs ids
  const idPrefix =
    props.devToolsId || `sliwka-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert to paths for morph
  try {
    const svgEl = svgRoot.closest ? svgRoot.closest("svg") : svgRoot;
    if ($MorphSVGPlugin && svgEl) {
      const shapes = svgEl.querySelectorAll(
        "circle, rect, ellipse, line, polygon, polyline"
      );
      shapes && shapes.length && $MorphSVGPlugin.convertToPath(shapes);
    }
  } catch (e) {}

  // Scoped selectors
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)));

  // Elements from SVG structure
  const logoGroup = q("#logoGroup");
  const kompot = qa("#kompot *");
  const logoIconGroup = q("#logoIconGroup");
  const logoFrame = q("#logoFrame");
  const logoW = q("#logoW");
  const sliwka = qa("#sliwka *");
  const morphGroup = q("#morphGroup");
  const plum = q("#plum path");

  // Initial states (mirroring legacy index.scss/main.js intent)
  $gsap.set(innerLogoRef.value, { autoAlpha: 1 });
  $gsap.set(morphGroup, { yPercent: -150 });
  if (plum) $gsap.set(plum, { autoAlpha: 0 });

  const tl = $gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2 });

  // Sequence roughly ported from legacy main.js
  tl.from(sliwka, { autoAlpha: 0, stagger: 0.1, duration: 0.25 })
    .from(logoFrame, {
      autoAlpha: 0,
      yPercent: 15,
      duration: 0.5,
      ease: "back.out",
    })
    .to(morphGroup, { yPercent: 0, duration: 0.5, ease: "back.out" }, "<")
    .from(
      logoW,
      {
        morphSVG: plum ? { shape: plum, shapeIndex: 6 } : null,
        fill: "#8e4585",
        duration: 0.5,
        ease: "sine.inOut",
      },
      "-=0.5"
    )
    .from(kompot, { autoAlpha: 0, stagger: 0.1, duration: 0.25 }, "-=0.15")
    .to(logoW, {
      morphSVG: plum ? { shape: plum, shapeIndex: 6 } : null,
      fill: "#8e4585",
      ease: "sine.inOut",
      repeat: 2,
      yoyo: true,
      repeatDelay: 1,
    });

  // Apply speed
  tl.timeScale(props.timeScale);

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
/* Styling inherits from shared animation-component hooks */
</style>
