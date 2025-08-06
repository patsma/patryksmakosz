<template>
  <div ref="containerRef" class="animation-container">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112.06 79.3">
      <defs>
        <mask id="theMask">
          <path
            id="mask1"
            ref="maskRef"
            d="M50.83,43.47c-.5,7.17-4.66,10.84-11.62,13.6s-15.53-1.66-18.89-8.31a16.79,16.79,0,0,1,4.49-20.15C30.68,24,39.38,23.89,45,28.76c4.46-9.63,15.87-15.43,26.4-14.2a26.07,26.07,0,0,1,21.9,20.17A26.08,26.08,0,0,1,81,61.82c-9.23,5.23-20.71,5-28.55-2.18"
            fill="none"
            stroke="#fff"
            stroke-linecap="round"
            stroke-miterlimit="10"
            stroke-width="10"
          />
        </mask>
      </defs>
      <g id="Layer_2" data-name="Layer 2">
        <g id="blueberry_loader_layer">
          <g id="maskReveal" mask="url(#theMask)">
            <path
              id="blueberry_logo"
              data-name="blueberry  logo"
              d="M67.91,10.45A29.36,29.36,0,0,0,43.67,23.39,20,20,0,1,0,54.75,44.63a4,4,0,0,0-2.46-4.51,3.87,3.87,0,0,0-5,2.34,3.38,3.38,0,0,0-.11.34,12,12,0,0,1-2,5.5h0a9,9,0,0,1-.59.79A12.36,12.36,0,1,1,34.9,29a11.63,11.63,0,0,1,1.67.13l.76.11.26.07c.31.06.62.14.93.23l.14.05A12.31,12.31,0,0,1,46,35.94l1.77-3.83A28.48,28.48,0,0,1,50,28.06c4.22-6.17,10.57-9.84,17.89-9.84A21.43,21.43,0,1,1,54,55.93a24.47,24.47,0,0,1-5.7,5.33A29.2,29.2,0,1,0,67.91,10.45Z"
              fill="#fff"
            />
          </g>
          <circle
            id="circle1"
            ref="circleRef"
            cx="50.9"
            cy="43.72"
            r="3.85"
            fill="#fff"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
// Get GSAP from Nuxt app
const { $gsap } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();

// Standard refs for animation components
const containerRef = ref(null);
const timeline = ref(null);

// Component-specific animation element refs
const circleRef = ref(null);
const maskRef = ref(null);

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
});

/**
 * Creates the blueberry animation timeline
 * Standard pattern for animation components
 * @returns {GSAPTimeline} The animation timeline
 */
const createAnimation = () => {
  // Ensure refs are available
  if (!circleRef.value || !maskRef.value) {
    console.warn("Blueberry: Animation elements not found");
    return null;
  }

  // Create timeline with infinite repeat
  const tl = $gsap.timeline({ repeat: -1, yoyo: true });

  // Animation sequence - using refs instead of selectors
  tl.fromTo(
    circleRef.value,
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
    maskRef.value,
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
    createAnimation();
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

  // Standard control methods
  play: () => timeline.value?.play(),
  pause: () => timeline.value?.pause(),
  restart: () => timeline.value?.restart(),
  reverse: () => timeline.value?.reverse(),
  seek: (time) => timeline.value?.seek(time),
});
</script>

<style scoped>
/* Standard animation component container */
.animation-container {
  background-color: #1e2843;
  position: relative;
  /* width: 100%; */
  /* height: 100%; */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Standard GSDevTools integration */
.animation-container :deep(.gs-dev-tools) {
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8) !important;
  border-radius: 0 0 8px 8px !important;
}

/* Standard GSDevTools compact styling */
.animation-container :deep(.gs-dev-tools .gs-top) {
  padding: 0 0 !important;
  font-size: 11px !important;
}

.animation-container :deep(.gs-dev-tools .gs-bottom) {
  padding: 0 0 0 4px !important;
}

/* Standard SVG styling */
.animation-container :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
