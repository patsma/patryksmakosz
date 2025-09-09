<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--split-text"
  >
    <div class="wrapper">
      <h1 ref="titleRef">{{ title }}</h1>
    </div>
  </div>
</template>

<script setup>
/**
 * ProjectHeroSplitText animation component
 * - Full viewport hero section with GSAP SplitText character animation
 * - Follows standardized API used by other animation components
 * - Uses masked line animation revealing characters from bottom
 * - Supports ScrollTrigger and GSDevTools integration
 */

// Nuxt/GSAP plugins (provided via @hypernym/nuxt-gsap in nuxt.config.ts)
const { $gsap } = useNuxtApp();
const { $SplitText } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();

// Standard container/timeline refs
const containerRef = ref(null);
const titleRef = ref(null);
const timeline = ref(null);
// GSAP context for scoped animations & automatic cleanup
let gsapCtx = null;
let scrollTriggerInstance = null;

// Props consistent with other animation components
const props = defineProps({
  /**
   * @type {string}
   * The title text to animate
   */
  title: {
    type: String,
    default: "SplitText Masking",
  },

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
    default: () => `split-text-${Math.random().toString(36).slice(2, 9)}`,
  },

  /**
   * @type {boolean}
   * When true, starts the animation automatically on mount (useful outside grid)
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
   * Stagger delay between character animations
   */
  stagger: {
    type: Number,
    default: 0.1,
  },
});

/**
 * Build the GSAP timeline using SplitText
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  if (!titleRef.value || !$SplitText) {
    console.warn("ProjectHeroSplitText: Title element or SplitText plugin not found");
    return null;
  }

  // Create SplitText instance with character and line splitting
  const split = $SplitText.create(titleRef.value, {
    type: "chars, lines",
    mask: "lines"
  });

  if (!split.chars || split.chars.length === 0) {
    console.warn("ProjectHeroSplitText: No characters found to animate");
    return null;
  }

  // Initial state
  $gsap.set(containerRef.value, { autoAlpha: 1 });

  // Build main timeline
  const tl = $gsap.timeline({
    paused: true,
    delay: 0.2,
  });

  // Animate characters from bottom with yPercent
  tl.from(split.chars, {
    yPercent: 100,
    stagger: props.stagger,
    duration: 0.8,
    ease: "power2.out",
  });

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
      } catch (e) {
        console.warn("GSDevTools creation failed:", e);
      }
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
      // ScrollTrigger visibility-controlled animation; fallback to autoPlay
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