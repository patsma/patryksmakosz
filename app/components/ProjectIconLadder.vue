<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--icon-ladder"
  >
    <IconLadderSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectIconLadder animation component
 * - Ports the GSAP timeline from old portfolio /animations/icon-ladder
 * - 3D isometric staircase with a character climbing along 4 path segments
 * - Uses relative x/y tweens converted from GSAP 2 bezier motion paths
 */

const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

const containerRef = ref(null);
const timeline = ref(null);
let gsapCtx = null;
let scrollTriggerInstance = null;

const svgComponentRef = ref(null);

const props = defineProps({
  showDevTools: {
    type: Boolean,
    default: false,
  },
  devToolsId: {
    type: String,
    default: () => `icon-ladder-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom top" },
});

const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectIconLadder: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `icon-ladder-${Math.random().toString(36).slice(2, 6)}`;
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

  // Reveal container and SVG (hidden by CSS to prevent FOUC)
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(svgRoot, { autoAlpha: 1 });

  // Get the animated character group
  const ladderGuy = q("#ladderGuy");
  if (!ladderGuy) {
    console.warn("ProjectIconLadder: #ladderGuy not found");
    return null;
  }

  // Build main timeline
  // Original used bezier motion paths with align:"relative" - these are straight lines,
  // so we convert to simple relative x/y tweens using the delta of each line segment:
  // bezier01: (292.15, 585.5) -> (182.65, 522) => dx=-109.5, dy=-63.5
  // bezier02: (182.65, 522) -> (393.65, 644) => dx=211, dy=122
  // bezier03: (393.65, 644) -> (334.65, 610) => dx=-59, dy=-34
  // bezier04: (334.65, 610) -> (285.65, 582) => dx=-49, dy=-28
  const tl = $gsap.timeline({
    paused: true,
    delay: 0.1,
    repeat: -1,
    repeatDelay: 2.5,
  });

  tl.to(ladderGuy, {
    x: "-=109.5",
    y: "-=63.5",
    duration: 2,
    ease: "power4.out",
  })
    .to({}, { duration: 0.2 })
    .to(ladderGuy, {
      x: "+=211",
      y: "+=122",
      duration: 2,
      ease: "power4.out",
    })
    .to({}, { duration: 0.2 })
    .to(ladderGuy, {
      x: "-=59",
      y: "-=34",
      duration: 2,
      ease: "power4.out",
    })
    .to({}, { duration: 0.2 })
    .to(ladderGuy, {
      x: "-=49",
      y: "-=28",
      duration: 2,
      ease: "power4.out",
    })
    .to({}, { duration: 0.2 });

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
