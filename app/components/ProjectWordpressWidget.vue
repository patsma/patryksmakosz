<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--wordpress-widget"
  >
    <WordpressWidgetSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectWordpressWidget animation component
 * - Pattern A (loop/play-pause) architecture
 * - Ports the GSAP timeline from old portfolio /animations/wordpress-widget
 * - Circular progress tracker with 4 sections drawing in sequentially
 * - Uses DrawSVG, shuffled stagger arrays, and fromTo progress bars
 */

const { $gsap } = useNuxtApp();
const { $DrawSVGPlugin } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
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
    default: () => `wordpress-widget-${Math.random().toString(36).slice(2, 9)}`,
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
    console.warn("ProjectWordpressWidget: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `wordpress-widget-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths for morph/draw operations
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

  // Build shuffled element arrays for randomized stagger order
  const visaArray = [];
  const personalArray = [];
  const requiredArray = [];
  const paymentsArray = [];

  for (let i = 1; i < 16; i++) {
    visaArray.push(qa(`#visa-${i} > *`));
  }
  for (let i = 1; i < 16; i++) {
    personalArray.push(qa(`#personal-${i} > *`));
  }
  for (let i = 1; i < 18; i++) {
    requiredArray.push(qa(`#required-${i} > *`));
  }
  for (let i = 1; i < 17; i++) {
    paymentsArray.push(qa(`#payments-${i} > *`));
  }

  // Flatten arrays (qa returns arrays, we need flat element arrays)
  const visaElements = visaArray.flat();
  const personalElements = personalArray.flat();
  const requiredElements = requiredArray.flat();
  const paymentsElements = paymentsArray.flat();

  // Shuffle for randomized draw order
  $gsap.utils.shuffle(visaElements);
  $gsap.utils.shuffle(personalElements);
  $gsap.utils.shuffle(requiredElements);
  $gsap.utils.shuffle(paymentsElements);

  // Inner shapes array (shuffled for stagger order)
  const innerShapesArray = [
    q("#personal-profile"),
    q("#visa-application"),
    q("#required-documents"),
    q("#payments-charges"),
  ].filter(Boolean);
  $gsap.utils.shuffle(innerShapesArray);

  // Ensure DrawSVG is available
  try {
    $DrawSVGPlugin && $DrawSVGPlugin.getLength && true;
  } catch (e) {}

  // Reveal container and SVG (hidden by CSS to prevent FOUC)
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(svgRoot, { autoAlpha: 1 });

  const lightColor = "#bde3f4";
  const darkColor = "#0194c7";

  // Build main timeline
  const tl = $gsap.timeline({
    paused: true,
    delay: 0.1,
    repeat: -1,
    repeatDelay: 2.5,
  });

  // Inner shapes rotate in and scale up
  tl.from(q("#inner-shapes"), { rotation: -360, transformOrigin: "center center" })
    .from(innerShapesArray, { scale: 0, transformOrigin: "center center", ease: "slow(0.6,0.8)", stagger: 0.1 }, "<")
    .from(q("#thick-2"), { drawSVG: 0, duration: 0.75 }, "<")
    .from(q("#thin-2"), { drawSVG: 0, duration: 0.75 }, "<0.1")

    // Section 1: Personal Profile (0% -> 25%)
    .fromTo(q("#thick"), { drawSVG: 0 }, { drawSVG: "25%" })
    .fromTo(q("#thin"), { drawSVG: 0 }, { drawSVG: "25%" }, "<0.1")
    .from(q("#personal-profile-s"), { drawSVG: 0 }, "<")
    .from(qa("#p-25 > *"), { scaleX: 0, x: "-=5", stagger: 0.01, transformOrigin: "center center" }, "<0.5")
    .from(qa("#personal-profile-b > path"), { fill: lightColor }, "<")
    .from(qa("#personal-profile-t > g > *"), { fill: darkColor }, "<0.2")
    .from(personalElements, { drawSVG: 0, stagger: 0.02 }, "<")

    // Section 2: Visa Application (25% -> 50%)
    .to(q("#thick"), { drawSVG: "50%" })
    .to(q("#thin"), { drawSVG: "50%" }, "<0.1")
    .from(q("#visa-application-s"), { drawSVG: 0 }, "<")
    .from(qa("#p-50 > *"), { scaleX: 0, x: "-=5", stagger: 0.01, transformOrigin: "center center" }, "<0.5")
    .from(qa("#visa-application-b > path"), { fill: lightColor }, "<")
    .from(qa("#visa-application-t > g > *"), { fill: darkColor }, "<")
    .from(visaElements, { drawSVG: 0, stagger: 0.02 }, "<")

    // Section 3: Required Documents (50% -> 75%)
    .to(q("#thick"), { drawSVG: "75%" })
    .to(q("#thin"), { drawSVG: "75%" }, "<0.1")
    .from(q("#required-documents-s"), { drawSVG: 0 }, "<")
    .from(qa("#p-75 > *"), { scaleX: 0, x: "-=5", stagger: 0.01, transformOrigin: "center center" }, "<0.5")
    .from(qa("#required-documents-b > path"), { fill: lightColor }, "<")
    .from(qa("#required-documents-t > g > *"), { fill: darkColor }, "<")
    .from(requiredElements, { drawSVG: 0, stagger: 0.02 }, "<")

    // Section 4: Payments & Charges (75% -> 100%)
    .to(q("#thick"), { drawSVG: "100%" })
    .to(q("#thin"), { drawSVG: "100%" }, "<0.1")
    .from(q("#payments-charges-s"), { drawSVG: 0 }, "<")
    .from(qa("#p-100 > *"), { scaleX: 0, x: "-=5", stagger: 0.01, transformOrigin: "center center" }, "<0.5")
    .from(qa("#payments-charges-b > path"), { fill: lightColor }, "<")
    .from(qa("#payments-charges-t > g > *"), { fill: darkColor }, "<")
    .from(paymentsElements, { drawSVG: 0, stagger: 0.02 }, "<");

  tl.timeScale(0.5);

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
