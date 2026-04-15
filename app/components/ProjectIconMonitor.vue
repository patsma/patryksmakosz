<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--icon-monitor"
  >
    <IconMonitorSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectIconMonitor animation component
 * - Ports the GSAP timeline from old portfolio /animations/icon-monitor
 * - 3D isometric monitor with mountain landscape and magnifier on bezier path
 * - Mountains scale up/down with stagger, magnifier traces bezier path
 */

const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $MotionPathPlugin } = useNuxtApp();
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
    default: () => `icon-monitor-${Math.random().toString(36).slice(2, 9)}`,
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
    console.warn("ProjectIconMonitor: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `icon-monitor-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths for motionPath operations
  // This converts the #bezier01 <polygon> to a <path> so MotionPath can use it
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

  // Get the bezier path element (now converted from <polygon> to <path>)
  const bezierPath = q("#bezier01");

  // Reveal SVG (hidden by CSS to prevent flash of unstyled content)
  $gsap.set(svgRoot, { autoAlpha: 1 });

  // Get mountain polygons (now converted to paths)
  const mountainEls = qa("#mountains > g > g > path");

  // Sub-timeline 1: Mountains zoom in/out with stagger
  const mountainTl = $gsap.timeline({ repeat: -1, yoyo: true });
  mountainTl.to(
    mountainEls,
    {
      yPercent: (i) => [4, 3, 5][i % 3],
      xPercent: (i) => [1, 2, 3][i % 3],
      scale: 2.8,
      transformOrigin: "50% 10%",
      duration: 1,
      stagger: 0.2,
    },
    0
  );
  mountainTl.to(
    mountainEls,
    {
      yPercent: (i) => [1, 2, 3][i % 3],
      xPercent: (i) => [1, 2, 3][i % 3],
      scale: 1,
      transformOrigin: "50% 10%",
      duration: 1,
      stagger: 0.2,
    }
  );

  // Sub-timeline 2: Magnifier traces bezier path
  const magnifierTl = $gsap.timeline({ repeat: -1, yoyo: true });
  if (bezierPath) {
    magnifierTl.to(
      q("#magnifier"),
      {
        motionPath: {
          path: bezierPath,
          align: bezierPath,
          alignOrigin: [0.5, 0.5],
        },
        duration: 18,
        ease: "none",
      },
      0
    );
  }

  // Master timeline combining both sub-timelines
  const tl = $gsap.timeline({
    paused: true,
    delay: 0.1,
    repeat: -1,
    yoyo: true,
    repeatDelay: 1,
  });

  tl.add(mountainTl, 0);
  tl.add(magnifierTl, 0);

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
