<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--blood blood-animation-hidden"
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
  timeScale: { type: Number, default: 1.2 },
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

  // Set initial state with GSAP - this is critical for consistent starting point
  // Container hidden initially
  $gsap.set(containerRef.value, { autoAlpha: 0 });
  // Masks at 0% (fully covering red - no fill showing)
  $gsap.set(allMasks, { yPercent: 0 });
  // Drops completely hidden and scaled down
  $gsap.set(allDrops, { autoAlpha: 0, scale: 0.8 });

  // Build main timeline with repeat
  const tl = $gsap.timeline({
    paused: true,
    repeatRefresh: true,
    repeat: -1,
    repeatDelay: 0.5,
  });

  // PHASE 0: Initial delay + reveal container
  // tl.to({}, { duration: 0.5 }); // Small initial breathing room
  tl.set(containerRef.value, { autoAlpha: 1 });
  tl.to({}, { duration: 0.1 }); // Another small delay before drops animate

  // PHASE 1: Fade in drops with stagger (first to last)
  tl.to(
    allDrops,
    {
      autoAlpha: 1,
      scale: 1,
      duration: 1,
      stagger: {
        each: 0.12,
        ease: "none",
      },
      ease: "power2.out",
    },
    "+=0.1"
  );

  // PHASE 2: Animate masks to random fill levels
  // Use a label and add animations with stagger
  tl.add("fillMasks", "+=0.2");

  bloodTypes.forEach((type, index) => {
    if (type.mask) {
      // Generate a NEW random value each time this animation runs
      tl.to(
        type.mask,
        {
          yPercent: function () {
            // This function is called each time the animation plays (including repeats)
            return -randomFillPercent(30, 100);
          },
          duration: 1.5,
          ease: "power2.out",
        },
        `fillMasks+=${index * 0.15}` // Stagger by 0.15s each
      );
    }
  });

  // PHASE 3: Hold the filled state
  tl.to({}, { duration: 1 });

  // PHASE 4: Fade out drops with stagger (first to last)
  tl.to(
    allDrops,
    {
      autoAlpha: 0,
      scale: 0.85,
      duration: 1, // Slightly longer for smoother fade
      stagger: {
        each: 0.12, // Slightly slower stagger
        ease: "none", // Linear stagger distribution
      },
      ease: "power1.out", // Gentler ease out
    },
    "+=0.3" // Longer delay before fade out
  );

  // PHASE 5: Small delay before hiding container
  tl.to({}, { duration: 0.3 });

  // Reset masks to 0 before hiding (prepare for next cycle)
  tl.set(allMasks, { yPercent: 0 });

  // Hide container at the very end before repeat
  tl.set(containerRef.value, { autoAlpha: 0 });

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
    // Add a small delay to ensure DOM is fully ready and prevent premature animation
    setTimeout(() => {
      gsapCtx = $gsap.context(() => {
        const tl = createAnimation();
        if (!tl) return;

        // Ensure timeline is fully paused and at progress 0 before any triggers
        tl.pause(0).progress(0);

        // ScrollTrigger visibility-controlled loop; fallback to autoPlay
        if (props.useScrollTrigger && $ScrollTrigger) {
          scrollTriggerInstance = $ScrollTrigger.create({
            trigger: containerRef.value,
            start: props.stStart,
            end: props.stEnd,
            onEnter: () => {
              // Explicitly pause, reset to 0, then play from beginning
              tl.pause();
              tl.progress(0);
              tl.play();
            },
            onEnterBack: () => {
              // Explicitly pause, reset to 0, then play from beginning
              tl.pause();
              tl.progress(0);
              tl.play();
            },
            onLeave: () => {
              // Pause and reset to beginning
              tl.pause();
              tl.progress(0);
              // Reset all elements to initial state
              $gsap.set(containerRef.value, { autoAlpha: 0 });
              $gsap.set(allDrops, { autoAlpha: 0, scale: 0.8 });
              $gsap.set(allMasks, { yPercent: 0 });
            },
            onLeaveBack: () => {
              // Pause and reset to beginning
              tl.pause();
              tl.progress(0);
              // Reset all elements to initial state
              $gsap.set(containerRef.value, { autoAlpha: 0 });
              $gsap.set(allDrops, { autoAlpha: 0, scale: 0.8 });
              $gsap.set(allMasks, { yPercent: 0 });
            },
          });
          $ScrollTrigger.refresh();
        } else if (props.autoPlay) {
          // Small delay before autoplay to ensure everything is initialized
          setTimeout(() => {
            tl.restart();
          }, 100);
        } else if (props.showDevTools) {
          // When DevTools is shown and no ScrollTrigger/autoPlay, start playback for visibility
          setTimeout(() => {
            tl.restart();
          }, 100);
        }
      }, containerRef.value);
    }, 200); // 200ms delay to ensure DOM is fully settled
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
/* Initial hidden state - revealed by GSAP when animation is ready */
.blood-animation-hidden {
  opacity: 0;
  visibility: hidden;
}

/* Visual styles are centralized under app/assets/scss/components/_animation-components.scss */
</style>
