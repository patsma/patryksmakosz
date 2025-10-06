<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--booking-engine lg:p-20"
  >
    <!-- Keep SVG as a child component for clarity and reuse -->
    <BookingEngineSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectBookingEngine animation component
 * - Mirrors the standardized API used by ProjectArtTech.vue and ProjectZaksa.vue
 * - Uses refs instead of query selectors outside of the SVG root
 * - Ports the GSAP timeline from old portfolio /booking-engine
 */

// Nuxt/GSAP plugins (provided via @hypernym/nuxt-gsap in nuxt.config.ts)
const { $gsap } = useNuxtApp();
const { $DrawSVGPlugin } = useNuxtApp();
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

// Props consistent with ProjectArtTech and ProjectZaksa
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
    default: () => `booking-engine-${Math.random().toString(36).slice(2, 9)}`,
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
   * Global playback speed for the timeline
   */
  timeScale: { type: Number, default: 1 },
});

/**
 * Build the GSAP timeline using the inline SVG IDs
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  // Ensure SVG is mounted
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectBookingEngine: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions and compute selector remaps
  const idPrefix =
    props.devToolsId ||
    `booking-engine-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Query elements by ID from within the SVG scope only
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)));

  // Get all the animation target elements
  const svg = svgRoot.closest("svg");
  const p1 = q("#p1");
  const p2 = q("#p2");
  const p3 = q("#p3");
  const p4 = q("#p4");
  const p5 = q("#p5");
  const p6 = q("#p6");
  const box1 = q("#box1");
  const box2 = q("#box2");
  const box3 = q("#box3");
  const box4 = q("#box4");
  const box5 = q("#box5");
  const box6 = q("#box6");
  const text1 = qa("#text-1 > *");
  const text2 = qa("#text-2 > *");
  const text3 = qa("#text-3 > *");
  const text4 = qa("#text-4 > *");
  const text5 = qa("#text-5 > *");
  const text6 = qa("#text-6 > *");

  // Initial state
  $gsap.set(containerRef.value, { autoAlpha: 1 });

  // Ensure DrawSVG is available
  try {
    $DrawSVGPlugin && $DrawSVGPlugin.getLength && true;
  } catch (e) {
    console.debug("ProjectBookingEngine: DrawSVG plugin issue", e);
  }

  // Build main timeline
  // Original animation has default transformOrigin and ease
  const tl = $gsap.timeline({
    paused: true,
    defaults: { transformOrigin: "50% 100%", ease: "sine.inOut" },
  });

  // Animation sequence: for each step (1-6), draw path, slide box, reveal text
  tl.from(svg, { autoAlpha: 0 })
    // Step 1
    .to(p1, { duration: 1, drawSVG: 0 })
    .to(box1, { yPercent: 100 }, "-=0.5")
    .from(text1, { y: "+=10", autoAlpha: 0, stagger: 0.05 }, "<")
    // Step 2
    .to(p2, { duration: 1, drawSVG: 0 })
    .to(box2, { yPercent: 100 }, "-=0.7")
    .from(text2, { y: "+=10", autoAlpha: 0, stagger: 0.05 }, "<")
    // Step 3
    .to(p3, { duration: 1, drawSVG: 0 })
    .to(box3, { yPercent: 100 }, "-=0.7")
    .from(text3, { y: "+=10", autoAlpha: 0, stagger: 0.05 }, "<")
    // Step 4
    .to(p4, { duration: 1, drawSVG: 0 })
    .to(box4, { yPercent: 100 }, "-=0.7")
    .from(text4, { y: "+=10", autoAlpha: 0, stagger: 0.05 }, "<")
    // Step 5
    .to(p5, { duration: 1, drawSVG: 0 })
    .to(box5, { yPercent: 100 }, "-=0.7")
    .from(text5, { y: "+=10", autoAlpha: 0, stagger: 0.05 }, "<")
    // Step 6
    .to(p6, { duration: 1, drawSVG: 0 })
    .to(box6, { yPercent: 100 }, "-=1")
    .from(text6, { y: "+=10", autoAlpha: 0, stagger: 0.05 }, "<");

  // Apply requested playback speed
  tl.timeScale(props.timeScale);

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
        console.debug("ProjectBookingEngine: GSDevTools error", e);
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
      // ScrollTrigger visibility-controlled loop; fallback to autoPlay
      if (props.useScrollTrigger && tl && $ScrollTrigger) {
        scrollTriggerInstance = $ScrollTrigger.create({
          trigger: containerRef.value,
          start: props.stStart,
          end: props.stEnd,
          onEnter: () => {
            $gsap.to(containerRef.value, {
              autoAlpha: 1,
              duration: 0.5,
              ease: "power2.out",
            });
            tl.play();
          },
          onEnterBack: () => {
            $gsap.to(containerRef.value, {
              autoAlpha: 1,
              duration: 0.5,
              ease: "power2.out",
            });
            tl.play();
          },
          onLeave: () => {
            $gsap.to(containerRef.value, {
              autoAlpha: 0,
              duration: 0.5,
              ease: "power2.in",
              onComplete: () => {
                tl.pause(0).progress(0);
              },
            });
          },
          onLeaveBack: () => {
            $gsap.to(containerRef.value, {
              autoAlpha: 0,
              duration: 0.5,
              ease: "power2.in",
              onComplete: () => {
                tl.pause(0).progress(0);
              },
            });
          },
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
