<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--blueberry"
  >
    <BlueberryLogoSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
// Get GSAP from Nuxt app
const { $gsap } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
// Ensure DrawSVG is registered globally (kept for parity with Spectrum component)
const { $DrawSVGPlugin } = useNuxtApp();

// Standard refs for animation components
const containerRef = ref(null);
const timeline = ref(null);

// Child SVG component ref to access its exposed element refs
const svgComponentRef = ref(null);

// Props for customization
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
   * Custom ID for the GSDevTools instance (useful when multiple components)
   */
  devToolsId: {
    type: String,
    default: () => `blueberry-${Math.random().toString(36).substr(2, 9)}`,
  },
  /**
   * @type {boolean}
   * When true, starts the animation automatically on mount (useful outside grid)
   */
  autoPlay: {
    type: Boolean,
    default: false,
  },
});

/**
 * Creates the blueberry animation timeline
 * Standard pattern for animation components
 * @returns {GSAPTimeline} The animation timeline
 */
const createAnimation = () => {
  // Pull actual DOM elements from the child SVG component's exposed refs
  // Note: exposed refs on child are unwrapped on the public instance
  // so we access them directly without an extra .value
  const circleEl = svgComponentRef.value?.circleRef;
  const maskEl = svgComponentRef.value?.maskRef;

  // Ensure refs are available
  if (!circleEl || !maskEl) {
    console.warn("Blueberry: Animation elements not found");
    return null;
  }

  // Create timeline with infinite repeat (paused by default for grid performance)
  const tl = $gsap.timeline({ repeat: -1, yoyo: true, paused: true });

  // Animation sequence - using refs instead of selectors
  tl.fromTo(
    circleEl,
    {
      scale: 0,
      transformOrigin: "center center",
    },
    {
      scale: 1,
      yPercent: -6,
      duration: 0.9,
      ease: "elastic.out(1, 0.3)",
    }
  );

  tl.from(
    maskEl,
    {
      drawSVG: 0,
      duration: 2.5,
      ease: "power2.inOut", // Simplified from CustomEase
    },
    "-=0.4"
  );

  // Set time scale for overall speed control
  tl.timeScale(0.9);

  // Store timeline reference
  timeline.value = tl;

  // Create GSDevTools if enabled
  if (props.showDevTools) {
    // Small delay to ensure timeline is ready
    nextTick(() => {
      $GSDevTools.create({
        animation: tl,
        container: containerRef.value, // Attach to the component container
        minimal: true,
        id: props.devToolsId,
        globalSync: false, // Keep each instance independent
      });
    });
  }

  return tl;
};

// Standard animation component lifecycle
onMounted(() => {
  // Small delay to ensure DOM is ready
  nextTick(() => {
    const tl = createAnimation();
    // Auto-play when requested; grid keeps paused by default
    if (props.autoPlay) tl && tl.play();
  });
});

// Standard cleanup for animation components
onUnmounted(() => {
  // Kill timeline
  if (timeline.value) {
    timeline.value.kill();
  }

  // Destroy GSDevTools instance if it exists
  if (props.showDevTools) {
    try {
      $GSDevTools.getById(props.devToolsId)?.kill();
    } catch (e) {
      // GSDevTools might not exist, ignore error
      console.debug("GSDevTools cleanup:", e);
    }
  }
});

// Standard API for animation components
defineExpose({
  // Core refs and timeline
  containerRef,
  timeline,
  svgComponentRef,

  // Standard control methods
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
