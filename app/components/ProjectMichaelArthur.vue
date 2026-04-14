<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--michael-arthur"
  >
    <MichaelArthurSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectMichaelArthur animation component
 * - Circular logo with DrawSVG mask lines and staggered text reveals
 * - Ported from old portfolio /logo-animation/michael-arthur
 * - Already GSAP 3 syntax - no migration needed
 */

const { $gsap } = useNuxtApp();
const { $DrawSVGPlugin } = useNuxtApp();
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
    default: () => `michael-arthur-${Math.random().toString(36).slice(2, 9)}`,
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
    console.warn("ProjectMichaelArthur: SVG root not found");
    return null;
  }

  const idPrefix =
    props.devToolsId ||
    `michael-arthur-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  try {
    if ($MorphSVGPlugin) {
      const shapes = svgRoot.querySelectorAll(
        "circle, rect, ellipse, line, polygon, polyline"
      );
      if (shapes && shapes.length) {
        $MorphSVGPlugin.convertToPath(shapes);
      }
    }
  } catch (e) {}

  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)));

  const inner = q("#inner");
  const outer = q("#outer");
  const logoMaskLines = qa("#logo-mask > *");
  const michaelLetters = qa("#michael > *");
  const arthurLetters = qa("#arthur > *");

  // Reveal SVG (hidden by CSS to prevent FOUC)
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(svgRoot, { autoAlpha: 1 });

  // Build timeline - ported directly from old app.js (already GSAP 3)
  const tl = $gsap.timeline({
    paused: true,
    defaults: { duration: 1.5 },
    repeat: -1,
    repeatDelay: 2.5,
  });

  tl.from(inner, { fill: "transparent", transformOrigin: "50% 50%" });
  tl.from(
    outer,
    {
      delay: 0.5,
      drawSVG: 0,
      stagger: 0.1,
      rotation: 180,
      transformOrigin: "50% 50%",
    },
    "<"
  );
  tl.from(logoMaskLines, { drawSVG: 0, stagger: 0.1 });
  tl.from(
    michaelLetters,
    {
      x: "+=5",
      autoAlpha: 0,
      scaleX: 0,
      stagger: 0.1,
      transformOrigin: "50% 50%",
      ease: "sine.out",
    },
    "<"
  );
  tl.from(
    arthurLetters,
    {
      x: "+=5",
      autoAlpha: 0,
      scaleX: 0,
      stagger: 0.1,
      transformOrigin: "50% 50%",
      ease: "sine.out",
    },
    "-=1.5"
  );

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
