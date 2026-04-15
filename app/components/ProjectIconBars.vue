<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--icon-bars"
  >
    <IconBarsSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectIconBars animation component
 * - Pattern A (loop/play-pause) from ProjectDobraHipoteka.vue
 * - Ports the GSAP timeline from old portfolio animations/icon-bars
 * - MorphSVG animation: 4 isometric 3D bars morph between height states
 *   while percentage counters animate (Google, Organic, Bing, Yahoo)
 */

const { $gsap } = useNuxtApp();
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
    default: () => `icon-bars-${Math.random().toString(36).slice(2, 9)}`,
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
    console.warn("ProjectIconBars: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `icon-bars-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths for morph operations (critical - bars are polygons)
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

  // Reveal container and SVG (hidden by CSS to prevent FOUC)
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(svgRoot, { autoAlpha: 1 });

  // Sub-timeline: Yahoo 50% -> 90%
  const createYahooTl = () => {
    const tl = $gsap.timeline({ repeat: -1, yoyo: true });
    const counter = { val: 50 };
    const numberEl = q("#numberAnimate01");

    tl.add("Yahoo50to90")
      .to(counter, {
        val: 90,
        duration: 1,
        roundProps: "val",
        onUpdate: () => {
          if (numberEl) numberEl.textContent = counter.val + "%";
        },
      }, "Yahoo50to90")
      .to("#Yahoo50 > path:nth-child(1)", { morphSVG: "#Yahoo90 > path:nth-child(1)", duration: 1 }, "Yahoo50to90")
      .to("#Yahoo50 > path:nth-child(2)", { morphSVG: "#Yahoo90 > path:nth-child(2)", duration: 1 }, "Yahoo50to90")
      .to("#Yahoo50 > path:nth-child(3)", { morphSVG: "#Yahoo90 > path:nth-child(3)", duration: 1 }, "Yahoo50to90");

    return tl;
  };

  // Sub-timeline: Bing 35% -> 75%
  const createBingTl = () => {
    const tl = $gsap.timeline({ repeat: -1, yoyo: true });
    const counter = { val: 35 };
    const numberEl = q("#numberAnimate02");

    tl.add("Bing35to75")
      .to(counter, {
        val: 75,
        duration: 1,
        roundProps: "val",
        onUpdate: () => {
          if (numberEl) numberEl.textContent = counter.val + "%";
        },
      }, "Bing35to75")
      .to("#Bing35 > path:nth-child(1)", { morphSVG: "#Bing75 > path:nth-child(1)", duration: 1 }, "Bing35to75")
      .to("#Bing35 > path:nth-child(2)", { morphSVG: "#Bing75 > path:nth-child(2)", duration: 1 }, "Bing35to75")
      .to("#Bing35 > path:nth-child(3)", { morphSVG: "#Bing75 > path:nth-child(3)", duration: 1 }, "Bing35to75");

    return tl;
  };

  // Sub-timeline: Organic 75% -> 35%
  const createOrganicTl = () => {
    const tl = $gsap.timeline({ repeat: -1, yoyo: true });
    const counter = { val: 75 };
    const numberEl = q("#numberAnimate03");

    tl.add("Organic75to35")
      .to(counter, {
        val: 35,
        duration: 1,
        roundProps: "val",
        onUpdate: () => {
          if (numberEl) numberEl.textContent = counter.val + "%";
        },
      }, "Organic75to35")
      .to("#Organic75 > path:nth-child(1)", { morphSVG: "#Organic35 > path:nth-child(1)", duration: 1 }, "Organic75to35")
      .to("#Organic75 > path:nth-child(2)", { morphSVG: "#Organic35 > path:nth-child(2)", duration: 1 }, "Organic75to35")
      .to("#Organic75 > path:nth-child(3)", { morphSVG: "#Organic35 > path:nth-child(3)", duration: 1 }, "Organic75to35");

    return tl;
  };

  // Sub-timeline: Google 50% -> 90%
  const createGoogleTl = () => {
    const tl = $gsap.timeline({ repeat: -1, yoyo: true });
    const counter = { val: 50 };
    const numberEl = q("#numberAnimate04");

    tl.add("Google50to90")
      .to(counter, {
        val: 90,
        duration: 1,
        roundProps: "val",
        onUpdate: () => {
          if (numberEl) numberEl.textContent = counter.val + "%";
        },
      }, "Google50to90")
      .to("#Google50 > path:nth-child(1)", { morphSVG: "#Google90 > path:nth-child(1)", duration: 1 }, "Google50to90")
      .to("#Google50 > path:nth-child(2)", { morphSVG: "#Google90 > path:nth-child(2)", duration: 1 }, "Google50to90")
      .to("#Google50 > path:nth-child(3)", { morphSVG: "#Google90 > path:nth-child(3)", duration: 1 }, "Google50to90");

    return tl;
  };

  // Master timeline with staggered sub-timelines
  const master = $gsap.timeline({
    paused: true,
    repeat: -1,
    yoyo: true,
  });

  master
    .add(createYahooTl(), 0)
    .add(createBingTl(), 0.5)
    .add(createOrganicTl(), 0.2)
    .add(createGoogleTl(), 0.3);

  master.timeScale(0.5);

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
