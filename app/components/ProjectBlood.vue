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
 * Generate random fill percentage for blood drops
 * @param {number} min - Minimum percentage (default 20)
 * @param {number} max - Maximum percentage (default 100)
 * @returns {number} Random fill percentage
 */
const randomFillPercent = (min = 20, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Build the GSAP timeline for blood drop fill animations
 * Each blood type fills to a random percentage via clipPath rect animation
 * Sequence: fade in → fill with random values → fade out → repeat with NEW random values
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

  // Define blood type configurations (masks and drop elements)
  const bloodTypes = [
    { name: "O+", mask: q("#showPercent0plus rect"), drop: q(".drop0plus") },
    { name: "O-", mask: q("#showPercent0minus rect"), drop: q(".drop0minus") },
    { name: "A+", mask: q("#showPercentAplus rect"), drop: q(".dropAplus") },
    { name: "A-", mask: q("#showPercentAminus rect"), drop: q(".dropAminus") },
    { name: "B+", mask: q("#showPercentBplus rect"), drop: q(".dropBplus") },
    { name: "B-", mask: q("#showPercentBminus rect"), drop: q(".dropBminus") },
    { name: "AB+", mask: q("#showPercentABplus rect"), drop: q(".dropABplus") },
    {
      name: "AB-",
      mask: q("#showPercentABminus rect"),
      drop: q(".dropABminus"),
    },
  ];

  // Get all mask elements and drop elements for batch operations
  const allMasks = bloodTypes.map((t) => t.mask).filter(Boolean);
  const allDrops = bloodTypes.map((t) => t.drop).filter(Boolean);

  // Set initial state - masks at 0% (fully covering red) and drops hidden
  $gsap.set(allMasks, { yPercent: 0 });
  $gsap.set(allDrops, { opacity: 0, scale: 0.8 });

  // Build main timeline with repeat
  const tl = $gsap.timeline({
    paused: true,
    repeat: -1,
    repeatDelay: 1.5,
    // Use onRepeat to regenerate random values for each cycle
    onRepeat: function () {
      // Reset all masks to 0 before new cycle
      $gsap.set(allMasks, { yPercent: 0 });
    },
  });

  // PHASE 1: Fade in drops with stagger (first to last)
  tl.to(allDrops, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    stagger: 0.08, // 80ms delay between each drop
    ease: "back.out(1.2)",
  });

  // PHASE 2: Animate each mask to a random fill level with overlap
  // Generate new random values on each iteration
  tl.add(() => {
    bloodTypes.forEach((type, index) => {
      if (type.mask) {
        const randomFill = -randomFillPercent(30, 100);
        $gsap.to(type.mask, {
          yPercent: randomFill,
          duration: 1.2,
          delay: index * 0.12, // Stagger the start of each fill animation
          ease: "power2.out",
        });
      }
    });
  });

  // Wait for all fill animations to complete
  tl.to({}, { duration: 2 });

  // PHASE 3: Hold the filled state
  tl.to({}, { duration: 1.5 });

  // PHASE 4: Fade out drops with stagger (first to last)
  tl.to(allDrops, {
    opacity: 0,
    scale: 0.8,
    duration: 0.5,
    stagger: 0.08, // Same stagger pattern as fade in
    ease: "power2.in",
  });

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
