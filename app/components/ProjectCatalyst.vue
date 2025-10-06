<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--catalyst"
  >
    <!-- SVG component reference, matching pattern from other animation components -->
    <CatalystSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectCatalyst animation component
 * - Follows the standardized API pattern from ProjectZaksa and ProjectArtTech
 * - Ports the GSAP timeline from legacy Catalyst portfolio project
 * - Uses CustomBounce for the "showLogoCircles" bouncing effect
 * - Animates three groups: circles, CATALYST text, CONSORTIUM text
 * - Timeline repeats infinitely with yoyo effect
 */

// Nuxt/GSAP plugins (provided via @hypernym/nuxt-gsap in nuxt.config.ts)
const { $gsap } = useNuxtApp();
const { $CustomBounce } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
import { scopeSvgDefsIds } from "/utils/scopeSvgIds";

// Standard container/timeline refs
const containerRef = ref(null);
const timeline = ref(null);
// GSAP context for scoped animations & automatic cleanup
let gsapCtx = null;
let scrollTriggerInstance = null;

// Ref for the SVG component instance
const svgComponentRef = ref(null);

// Props consistent with ProjectZaksa and ProjectArtTech
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
    default: () => `catalyst-${Math.random().toString(36).slice(2, 9)}`,
  },

  /**
   * @type {boolean}
   * When true, starts the animation automatically on mount (useful outside grid)
   */
  autoPlay: {
    type: Boolean,
    default: false,
  },

  /**
   * @type {boolean}
   * Use ScrollTrigger to play/pause based on visibility
   */
  useScrollTrigger: {
    type: Boolean,
    default: true,
  },

  /**
   * @type {string}
   * ScrollTrigger start position
   */
  stStart: {
    type: String,
    default: "top center",
  },

  /**
   * @type {string}
   * ScrollTrigger end position
   */
  stEnd: {
    type: String,
    default: "bottom center",
  },

  /**
   * @type {number}
   * Global playback speed for the Catalyst master timeline
   */
  timeScale: {
    type: Number,
    default: 1,
  },
});

/**
 * Build the GSAP timeline using the inline SVG IDs
 * Ported from legacy script.js with GSAP 3 syntax
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  // Ensure SVG is mounted
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectCatalyst: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId || `catalyst-${Math.random().toString(36).slice(2, 6)}`;
  scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert SVG shapes to paths for morphing capability (if needed)
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
  } catch (e) {
    console.debug("ProjectCatalyst: MorphSVG conversion issue", e);
  }

  // Helper to query elements within the SVG scope
  const q = (sel) => svgRoot.querySelector(sel);
  const qa = (sel) => Array.from(svgRoot.querySelectorAll(sel));

  // Get references to the animated groups
  const circlesGroup = qa("#circles-group > path");
  const catalystPaths = qa("#catalyst > path");
  const consortiumPaths = qa("#consortium > path");

  // Create CustomBounce ease for the circles animation
  try {
    $CustomBounce?.create("showLogoCircles", { strength: 0.6, squash: 2 });
  } catch (e) {
    console.debug("ProjectCatalyst: CustomBounce setup issue", e);
  }

  // Initial state: SVG hidden, will be revealed by first set() call
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(svgRoot, { autoAlpha: 1 });

  // Build main timeline (repeating with yoyo effect as per original)
  const tl = $gsap.timeline({
    paused: true,
    repeat: -1,
    yoyo: true,
  });

  // Set SVG visible
  tl.set(svgRoot, { autoAlpha: 1 });

  // Label for synchronized animation start
  tl.add("animate-circles");

  // Animate circles group with stagger and bounce ease
  tl.from(
    circlesGroup,
    {
      duration: 1,
      autoAlpha: 0,
      transformOrigin: "50% 50%",
      ease: "showLogoCircles",
      stagger: 0.02,
    },
    "animate-circles"
  );

  // Animate CATALYST text paths with stagger and horizontal offset
  tl.from(
    catalystPaths,
    {
      duration: 1,
      transformOrigin: "50% 50%",
      autoAlpha: 0,
      xPercent: 10,
      stagger: 0.1,
    },
    "animate-circles+=0.3"
  );

  // Animate CONSORTIUM text paths with stagger and horizontal offset
  tl.from(
    consortiumPaths,
    {
      duration: 1,
      transformOrigin: "50% 50%",
      autoAlpha: 0,
      xPercent: -2,
      stagger: 0.1,
    },
    "animate-circles+=0.8"
  );

  // Apply requested playback speed to the timeline
  tl.timeScale(props.timeScale);

  // Attach GSDevTools when requested
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
        console.debug("ProjectCatalyst: GSDevTools error", e);
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

      // ScrollTrigger integration for visibility-based play/pause
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
