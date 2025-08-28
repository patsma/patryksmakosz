<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--page404"
  >
    <!-- Keep SVG as a child component for clarity and reuse -->
    <Page404SVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectPage404 animation component
 * - Mirrors the standardized API used by other Project* components (e.g. ProjectArtTech)
 * - Uses scoped refs rather than global selectors
 * - Ports the GSAP timelines from legacy /oldportfolio/page404/app.js
 * - Keeps code simple, readable, and well-documented
 */

// Nuxt/GSAP plugins (provided via @hypernym/nuxt-gsap in nuxt.config.ts)
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

// Public props consistent with other Project* components
const props = defineProps({
  /**
   * @type {boolean}
   * Whether to show GSDevTools for debugging and control
   */
  showDevTools: { type: Boolean, default: false },
  /**
   * @type {string}
   * Custom ID for the GSDevTools instance
   */
  devToolsId: {
    type: String,
    default: () => `page-404-${Math.random().toString(36).slice(2, 9)}`,
  },
  /**
   * @type {boolean}
   * When true, starts the animation automatically on mount (useful outside grid)
   */
  autoPlay: { type: Boolean, default: false },
  // ScrollTrigger-controlled autoplay defaults to on
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom center" },
});

/**
 * Build the GSAP timelines using the inline SVG IDs
 * Ported closely from legacy app.js but scoped to this SVG only
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  // Ensure SVG is mounted
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectPage404: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions and compute selector remaps
  const idPrefix =
    props.devToolsId || `page-404-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Query helpers scoped to this svg only
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)));

  // Collect elements by ID (matching legacy selectors)
  const ship = q("#ship");
  const background1 = q("#background-1");
  const background2 = q("#background-2");
  const octo = q("#octo");
  const octoM = q("#octo-m");
  const shark = q("#shark");
  const sharkM = q("#shark-m");
  const sharkWave = q("#sharkWave");
  const shipWave = q("#shipWave");
  const textHome = qa("#text-home > *");
  const text404 = q("#txt-404");
  const textYouAreLost = qa("#txt-you-are-lost > *");
  const textDontPanic = qa("#txt-dont-panic > *");
  const textFindYourWayBack = qa("#txt-find-your-way-back > *");
  const guy1 = q("#guy-1");
  const guy2 = q("#guy-2");
  const guy3 = q("#guy-3");

  // Initial state - ensure container visible and set element bases
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(ship, { scale: 0.8, y: "+=80", transformOrigin: "50% 50%" });
  $gsap.set(sharkWave, { y: "+=18", transformOrigin: "50% 50%" });
  $gsap.set([guy2, guy3], { autoAlpha: 0 });
  $gsap.set([sharkM], { scaleY: 0, transformOrigin: "50% 100%" });
  $gsap.set([octoM], { scaleY: 0, transformOrigin: "50% 100%" });

  // Random color helper (returns a function for GSAP functional value)
  const colors = ["#34A3D4", "#62269E", "#4cb748", "#005597"];
  function random(list) {
    return function () {
      return list[Math.floor(Math.random() * list.length)];
    };
  }

  // Sub-timelines following legacy structure
  const tl1 = $gsap.timeline();
  const tl2 = $gsap.timeline();
  const tl3 = $gsap.timeline();

  // Ship travel
  tl1.to(ship, { duration: 18, x: 1250, y: 210, scale: 1, ease: "sine.out" });

  // Guys fade/loop
  tl2
    .to(guy2, { autoAlpha: 1, ease: "steps(1)" })
    .to(guy1, { autoAlpha: 0, ease: "steps(1)" }, "<")
    .to(guy3, {
      duration: 1,
      autoAlpha: 1,
      ease: "steps(1)",
      repeat: -1,
      repeatDelay: 1,
    });

  // Texts, shark and octo entrances with loops
  tl3
    .from(text404, { autoAlpha: 0, ease: "steps(1)" })
    .from(textYouAreLost, { autoAlpha: 0, stagger: 0.1, ease: "steps(1)" })
    .from(textDontPanic, { autoAlpha: 0, stagger: 0.1, ease: "steps(1)" })
    .from(textFindYourWayBack, { autoAlpha: 0, stagger: 0.1, ease: "steps(1)" })
    .from(textHome, { autoAlpha: 0, ease: "steps(1)" })
    .to(
      textHome,
      {
        // Use functional value; repeatRefresh picks a new one each cycle
        fill: random(colors),
        repeat: -1,
        repeatRefresh: true,
        yoyo: true,
      },
      "+=1"
    )
    .from(sharkWave, { y: "+=100", scale: 0, transformOrigin: "50% 100%" })
    .add("shark", "-=0.1")
    .to(sharkM, { scaleY: 1 }, "shark")
    .to(
      shark,
      { y: "+=5", repeatDelay: 0.05, x: "+=2", repeat: -1, yoyo: true },
      "shark+=0.5"
    )
    .to(sharkWave, { autoAlpha: 0, ease: "steps(1)" }, "shark+=0.4")
    .from(shark, { y: "+=250", transformOrigin: "50% 100%" }, "shark")
    .add("octo", "+=1")
    .to(octoM, { scaleY: 1 }, "octo")
    .to(
      octo,
      { y: "+=5", x: "+=1", repeat: -1, repeatDelay: 0.1, yoyo: true },
      "octo+=0.5"
    )
    .from(octo, { y: "+=250", transformOrigin: "50% 100%" }, "octo");

  // Master timeline - paused by default, relies on internal infinite loops
  const master = $gsap.timeline({ paused: true });
  master
    .add(tl1)
    .add(tl2, "-=16.5")
    .add(tl3, "<")
    // Continuous bobbing and background flicker
    .to(
      ship,
      {
        yPercent: "+=2",
        xPercent: "-=1",
        repeat: -1,
        yoyo: true,
        ease: "bounce.inOut",
      },
      0
    )
    .to(
      background1,
      { duration: 3, autoAlpha: 0, repeat: -1, ease: "steps(1)" },
      0
    )
    .to(shipWave, { autoAlpha: 0, ease: "steps(1)" }, 16);

  // DevTools integration
  if (props.showDevTools) {
    nextTick(() => {
      try {
        $GSDevTools.create({
          animation: master,
          container: containerRef.value,
          minimal: true,
          id: props.devToolsId,
          globalSync: false,
        });
      } catch (e) {}
    });
  }

  timeline.value = master;
  return master;
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
