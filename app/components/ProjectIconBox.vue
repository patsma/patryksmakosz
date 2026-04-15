<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--icon-box"
  >
    <IconBoxSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectIconBox animation component
 * - Ports the GSAP timeline from old portfolio /animations/icon-box
 * - Lightbulb scales up along a bezier path, then light rays stagger in
 * - Uses MotionPath for bezier movement (converted from GSAP 2 bezier plugin)
 */

const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $MotionPathPlugin } = useNuxtApp();
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
    default: () => `icon-box-${Math.random().toString(36).slice(2, 9)}`,
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
 * Build the GSAP timeline using the inline SVG IDs
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectIconBox: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `icon-box-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths for morph/motionPath operations
  // This converts the #bezier01 <line> to a <path> so MotionPath can use it
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

  // Get the bezier path element (now converted from <line> to <path>)
  const bezierPath = q("#bezier01");

  // Reveal SVG (hidden by CSS to prevent flash of unstyled content)
  $gsap.set(svgRoot, { autoAlpha: 1 });

  // Light marks are hidden by CSS - set their end state so .from() works correctly
  $gsap.set(qa("#lightMarks > *"), { autoAlpha: 1, scale: 1 });

  // Build main timeline - repeat with delay, no yoyo
  const tl = $gsap.timeline({
    paused: true,
    delay: 0.5,
    repeat: -1,
    repeatDelay: 2.5,
    yoyo: true,
  });

  // Lightbulb entrance - scales up along bezier path with elastic finish
  tl.from(q("#lightbulb"), {
    autoAlpha: 0,
    scale: 0,
    transformOrigin: "50% 65%",
    motionPath: {
      path: bezierPath,
      align: "self",
      alignOrigin: [0.5, 0.5],
    },
    duration: 1.4,
    ease: "back.out(1.4)",
  });

  // Light rays burst outward with stagger from center
  tl.from(
    qa("#lightMarks > *"),
    {
      autoAlpha: 0,
      scale: 0,
      transformOrigin: "50% 50%",
      duration: 0.6,
      stagger: {
        each: 0.06,
        from: "center",
        ease: "power2.out",
      },
      ease: "back.out(2)",
    },
    "-=0.4"
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
