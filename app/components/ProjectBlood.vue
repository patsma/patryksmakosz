<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--blood"
  >
    <!-- SVG component containing all blood drop elements -->
    <BloodSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectBlood animation component
 * - Animates blood type drops filling to different percentage levels
 * - Uses clipPath masks to reveal the red fill progressively
 * - Mirrors the standardized API used by ProjectZaksa and ProjectArtTech
 */

// Nuxt/GSAP plugins
const { $gsap } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

// Standard container/timeline refs
const containerRef = ref(null);
const timeline = ref(null);
// GSAP context for scoped animations & automatic cleanup
let gsapCtx = null;
let scrollTriggerInstance = null;

// Ref for the SVG component instance
const svgComponentRef = ref(null);

// Props consistent with other project components
const props = defineProps({
  /**
   * @type {boolean}
   * Whether to show GSDevTools for debugging and control
   */
  showDevTools: {
    type: Boolean,
    default: false,
  },

  /**
   * @type {string}
   * Custom ID for the GSDevTools instance
   */
  devToolsId: {
    type: String,
    default: () => `blood-${Math.random().toString(36).slice(2, 9)}`,
  },

  /**
   * @type {boolean}
   * When true, starts the animation automatically on mount
   */
  autoPlay: {
    type: Boolean,
    default: false,
  },

  // ScrollTrigger-controlled autoplay defaults to on
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom center" },

  /**
   * @type {number}
   * Global playback speed for the blood drop animation
   */
  timeScale: { type: Number, default: 1.5 },
});

/**
 * Build the GSAP timeline for blood drop fill animations
 * Each blood type fills to a specific percentage via clipPath rect animation
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  // Ensure SVG is mounted
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectBlood: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions and compute selector remaps
  const idPrefix =
    props.devToolsId || `blood-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Query elements by ID from within the SVG scope only
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));

  // Get all clipPath rect elements that control the fill level
  const maskPosition0plus = q("#showPercent0plus rect");
  const maskPosition0minus = q("#showPercent0minus rect");
  const maskPositionAplus = q("#showPercentAplus rect");
  const maskPositionAminus = q("#showPercentAminus rect");
  const maskPositionBplus = q("#showPercentBplus rect");
  const maskPositionBminus = q("#showPercentBminus rect");
  const maskPositionABplus = q("#showPercentABplus rect");
  const maskPositionABminus = q("#showPercentABminus rect");

  // Set initial state - masks start at full height (100%)
  // to completely cover the red fill (showing only grey)
  $gsap.set(
    [
      maskPosition0plus,
      maskPosition0minus,
      maskPositionAplus,
      maskPositionAminus,
      maskPositionBplus,
      maskPositionBminus,
      maskPositionABplus,
      maskPositionABminus,
    ],
    { yPercent: 0 }
  );

  // Build main timeline - animates masks upward to reveal red fill
  // Different yPercent values create different fill levels for each blood type
  const tl = $gsap.timeline({
    paused: true,
    repeat: -1,
    repeatDelay: 1.5,
  });

  // Add label for synchronized start
  tl.add("fillDrops");

  // Animate each blood type to its target fill percentage
  // Negative yPercent moves the mask upward, revealing more red fill
  tl.to(maskPosition0plus, { duration: 2, yPercent: -60 }, "fillDrops")
    .to(maskPosition0minus, { duration: 2, yPercent: -73 }, "fillDrops")
    .to(maskPositionAplus, { duration: 2, yPercent: -100 }, "fillDrops") // Full fill
    .to(maskPositionAminus, { duration: 2, yPercent: -42 }, "fillDrops")
    .to(maskPositionBplus, { duration: 2, yPercent: -42 }, "fillDrops")
    .to(maskPositionBminus, { duration: 2, yPercent: -42 }, "fillDrops")
    .to(maskPositionABplus, { duration: 2, yPercent: -42 }, "fillDrops")
    .to(maskPositionABminus, { duration: 2, yPercent: -42 }, "fillDrops");

  // Apply requested playback speed to the timeline
  tl.timeScale(props.timeScale);

  // DevTools integration for debugging
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
        // Ensure timeScale remains applied after DevTools initialization
        tl.timeScale(props.timeScale);
      } catch (e) {
        console.debug("ProjectBlood: GSDevTools error", e);
      }
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

      // ScrollTrigger visibility-controlled loop; fallback to autoPlay
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
        // When DevTools is shown and no ScrollTrigger/autoPlay, start playback for visibility
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

// Public API for external control
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
/* Visual styles are centralized under app/assets/scss/components/_animation-components.scss */
</style>
