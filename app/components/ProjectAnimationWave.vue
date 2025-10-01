<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--waves relative w-full overflow-hidden"
  >
    <!-- Background layer (plain img to avoid /1x auto params) -->
    <div ref="bgRef" class="absolute inset-0 z-0 opacity-0">
      <img
        v-if="currentImage"
        :src="currentImage"
        alt=""
        class="h-full w-full object-cover"
      />
    </div>
    <!-- Heading and CTA (kept minimal; no SplitText dependency) -->
    <div
      ref="headingRef"
      class="pointer-events-none absolute left-[10%] top-[30%] z-10 text-[#071e3e] select-none"
    >
      <h1 class="font-sans font-light leading-tight">
        <span class="headingSpan01 block text-4xl">The</span>
        <span class="headingSpan02 block text-7xl">Hearing</span>
        <span class="headingSpan03 ml-3 inline-block text-6xl">Club</span>
      </h1>
      <p class="slider__subtitle mt-4 max-w-[40ch] text-base leading-6">
        We help people hear better. Modern diagnostics and personalized care.
      </p>
      <div class="cta mt-6 flex items-center gap-4">
        <p class="uppercase tracking-wide m-0">search this site</p>
        <button
          class="golden pointer-events-auto inline-grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-yellow-300 via-amber-300 to-amber-600 text-white text-xl"
        >
          >
        </button>
      </div>
    </div>

    <!-- Waves SVG (lines converted to paths before draw animations) -->
    <div
      class="animation__waves relative z-[1] h-screen w-full translate-y-[8%]"
    >
      <AnimateionWavesSVG ref="wavesSvgRef" />
    </div>

    <!-- Logo SVG (ear shape) -->
    <div
      class="animation__logo absolute right-[23%] top-1/2 z-[2] h-screen w-screen translate-x-1/2 -translate-y-[44%] scale-[0.6]"
    >
      <AnimationWavesLogoSVG ref="logoSvgRef" />
    </div>

    <!-- Slider progress bar -->
    <div
      ref="progressRef"
      class="slider__progress absolute bottom-0 left-0 z-[5] h-1 w-0 bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-700"
    ></div>
  </div>
</template>

<script setup>
// Nuxt/GSAP plugins (provided via @hypernym/nuxt-gsap in nuxt.config.ts)
const { $gsap } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $DrawSVGPlugin } = useNuxtApp();

// Utilities for scoping SVG <defs> IDs and remapping selectors (gradients, masks)
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";
import { NuxtImg } from "#components";

// Core refs
const containerRef = ref(null);
const progressRef = ref(null);
const wavesSvgRef = ref(null);
const logoSvgRef = ref(null);
const headingRef = ref(null);
const bgRef = ref(null);
const timeline = ref(null);
let gsapCtx = null;
let scrollTriggerInstance = null;

// Preload and image state
const imagesReady = ref(false);
const currentImage = ref("");

// Props aligned with other project animation components
const props = defineProps({
  /** Show GSDevTools for debugging */
  showDevTools: { type: Boolean, default: false },
  /** Unique ID for DevTools instance */
  devToolsId: {
    type: String,
    default: () => `waves-${Math.random().toString(36).slice(2, 9)}`,
  },
  /** Autoplay when ScrollTrigger is disabled */
  autoPlay: { type: Boolean, default: false },
  /** Control visibility-triggered playback */
  useScrollTrigger: { type: Boolean, default: true },
  /** ScrollTrigger start/end */
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom center" },
  /** Master timeScale */
  timeScale: { type: Number, default: 2 },
  /** Background images to cycle through for the slider */
  backgrounds: {
    type: Array,
    default: () => [
      "projects/animation-wave/photo1.jpg",
      "projects/animation-wave/photo2.jpg",
      "projects/animation-wave/photo3.jpg",
      "projects/animation-wave/photo4.jpg",
    ],
  },
});

/**
 * Convert SVG primitives to paths for DrawSVG compatibility
 */
function convertSvgPrimitivesToPaths() {
  const waveRoot = wavesSvgRef.value?.svgRootRef;
  const logoRoot = logoSvgRef.value?.svgRootRef;

  try {
    if ($MorphSVGPlugin) {
      [waveRoot, logoRoot].forEach((root) => {
        if (!root) return;
        const shapes = root.querySelectorAll(
          "circle, rect, ellipse, line, polygon, polyline"
        );
        if (shapes && shapes.length) $MorphSVGPlugin.convertToPath(shapes);
      });
    }
  } catch (e) {
    console.warn("Failed to convert SVG primitives:", e);
  }
}

/**
 * Create heading/CTA entrance timeline
 * Animates heading spans and subtitle/CTA in sequence
 */
function createHeadingTimeline() {
  const el = headingRef.value;
  if (!el) return $gsap.timeline();

  const tl = $gsap.timeline();

  // Animate each heading span sequentially
  const spans = el.querySelectorAll(
    ".headingSpan01, .headingSpan02, .headingSpan03"
  );
  const subtitle = el.querySelector(".slider__subtitle");
  const ctaElements = el.querySelectorAll(".cta > *");

  if (spans.length) {
    tl.staggerFrom(
      spans,
      1.4,
      {
        opacity: 0,
        scale: 0,
        y: 40,
        rotationX: 180,
        transformOrigin: "0% 50% -50",
        ease: "back.out(1.7)",
      },
      0.3
    );
  }

  if (subtitle) {
    tl.from(subtitle, { opacity: 0, duration: 0.8, ease: "none" }, "-=0.5");
  }

  if (ctaElements.length) {
    tl.staggerFrom(
      ctaElements,
      0.9,
      {
        opacity: 0,
        scale: 0,
        xPercent: -10,
        transformOrigin: "center center",
        ease: "power3.out",
      },
      0.25,
      "-=0.3"
    );
  }

  return tl;
}

/**
 * Create logo show timeline (ear shape reveal)
 * Based on original earShapeShowTl() with added intro morphing
 */
function createLogoShowTimeline() {
  const root = logoSvgRef.value?.svgRootRef;
  if (!root) return $gsap.timeline();

  // Scope <defs> ids to avoid collisions
  const idPrefix =
    props.devToolsId || `waves-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(root, idPrefix);
  const q = (sel) => root.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(root.querySelectorAll(remapIdSelectors(sel, idMap)));

  // Query elements
  const innerLogoShape = q("#innerLogoShape");
  const centerLogoShape = q("#centerLogoShape");
  const outerLogoShape = q("#outerLogoShape");
  const outerCircle01 = q("#outerCircle01");
  const outerCircle02 = q("#outerCircle02");
  const outerCircle03 = q("#outerCircle03");
  const outerCircle04 = q("#outerCircle04");
  const innerCircles = qa("#innerCircles > path");
  const acrossPaths = qa("#acrossPaths > path");
  const shapesGroup01 = qa("#shapesGroup01 > path");
  const shapesGroup02 = qa("#shapesGroup02 > path");
  const shapesGroup03 = qa("#shapesGroup03 > path");
  const shapesGroup04 = qa("#shapesGroup04 > path");
  const arrow = q("#arrow");

  const tl = $gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 4 });

  // Initialize DrawSVG elements
  try {
    if ($DrawSVGPlugin) {
      const initTargets = [
        ...innerCircles,
        ...acrossPaths,
        outerCircle01,
        outerCircle02,
        outerCircle03,
        outerCircle04,
      ].filter(Boolean);
      if (initTargets.length) $gsap.set(initTargets, { drawSVG: 0 });
    }
  } catch (e) {}

  // Circle 1 + shapes group 1
  if (outerCircle01)
    tl.from(outerCircle01, 2, {
      drawSVG: 0,
      svgOrigin: "370 370",
      rotation: 360,
    });
  tl.add("showCirclesShape01", "-=1");
  if (outerCircle02)
    tl.from(
      outerCircle02,
      2,
      { drawSVG: 0, svgOrigin: "370 370", rotation: 360 },
      "showCirclesShape01"
    );
  if (shapesGroup01.length)
    tl.staggerFrom(
      shapesGroup01,
      2,
      {
        scaleY: 0,
        scaleX: 0,
        autoAlpha: 0,
        transformOrigin: "center center",
      },
      0.02,
      "showCirclesShape01"
    );

  // Circle 2 + shapes group 2
  tl.add("showCirclesShape02", "-=1");
  if (outerCircle03)
    tl.from(
      outerCircle03,
      2,
      { drawSVG: 0, svgOrigin: "370 370", rotation: 360 },
      "showCirclesShape02"
    );
  if (shapesGroup02.length)
    tl.staggerFrom(
      shapesGroup02,
      2,
      {
        scaleY: 0,
        scaleX: 0,
        autoAlpha: 0,
        rotation: -360,
        transformOrigin: "center center",
      },
      0.02,
      "showCirclesShape02"
    );

  // Circle 3 + shapes group 3
  tl.add("showCirclesShape03", "-=1");
  if (outerCircle04)
    tl.from(
      outerCircle04,
      2,
      { drawSVG: 0, svgOrigin: "370 370", rotation: 360 },
      "showCirclesShape03"
    );
  if (shapesGroup03.length)
    tl.staggerFrom(
      shapesGroup03,
      2,
      {
        scaleY: 0,
        scaleX: 0,
        autoAlpha: 0,
        rotation: -360,
        transformOrigin: "center center",
      },
      0.02,
      "showCirclesShape03"
    );

  // Inner circles and across paths
  if (innerCircles.length)
    tl.staggerFrom(innerCircles, 1, { drawSVG: 0 }, 0.1, "-=1");
  if (acrossPaths.length)
    tl.staggerFrom(acrossPaths, 1, { drawSVG: 0 }, 0.1, "-=1");

  // Final shapes group and arrow
  const group4PlusArrow = [...shapesGroup04, arrow].filter(Boolean);
  if (group4PlusArrow.length)
    tl.staggerFrom(
      group4PlusArrow,
      2,
      { scaleY: 0, scaleX: 0, transformOrigin: "center center" },
      0.02,
      "-=1"
    );

  return tl;
}

/**
 * Create logo rotate timeline (continuous rotation)
 * Based on original earShapeRotateTl()
 */
function createLogoRotateTimeline() {
  const root = logoSvgRef.value?.svgRootRef;
  if (!root) return $gsap.timeline();

  const idPrefix =
    props.devToolsId || `waves-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(root, idPrefix);
  const q = (sel) => root.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(root.querySelectorAll(remapIdSelectors(sel, idMap)));

  const logoShapesGroup = q("#logoShapesGroup");
  const shapesGroup02 = q("#shapesGroup02");
  const innerCircle06 = q("#innerCircle06");
  const acrossPaths = qa("#acrossPaths > path");

  const tl = $gsap.timeline({ repeat: -1, yoyo: true });

  if (logoShapesGroup)
    tl.to(logoShapesGroup, 100, { rotation: 720, svgOrigin: "370 370" }, 0);
  if (shapesGroup02)
    tl.to(shapesGroup02, 100, { rotation: 360, svgOrigin: "370 370" }, 0);
  const rotateTargets = [innerCircle06, ...acrossPaths].filter(Boolean);
  if (rotateTargets.length)
    tl.to(rotateTargets, 100, { rotation: 720, svgOrigin: "370 370" }, 0);

  return tl;
}

/**
 * Initialize logo intro fade-in
 * Just fades in innerLogoShape at the start (matches original line 59)
 */
function initLogoIntro() {
  const root = logoSvgRef.value?.svgRootRef;
  if (!root) return;

  const idPrefix =
    props.devToolsId || `waves-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(root, idPrefix);
  const q = (sel) => root.querySelector(remapIdSelectors(sel, idMap));

  const innerLogoShape = q("#innerLogoShape");

  if (innerLogoShape) {
    $gsap.from(innerLogoShape, 0.2, {
      autoAlpha: 0,
      scale: 0,
      transformOrigin: "center center",
    });
  }
}

/**
 * Preload background images
 */
async function preloadImages(srcs) {
  const tasks = srcs.map(
    (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      })
  );
  await Promise.all(tasks);
}

/**
 * Create main animation timeline
 * Matches original soundWaveHeadingSliderTl() structure
 * Now includes morphing intro at the start of each cycle
 */
function createMainTimeline() {
  const root = wavesSvgRef.value?.svgRootRef;
  if (!root) return $gsap.timeline();

  const svgEl = (root.closest && root.closest("svg")) || root;
  const wavesTop = Array.from(svgEl.querySelectorAll("#waves__top path"));
  const wavesBottom = Array.from(svgEl.querySelectorAll("#waves__bottom path"));

  let imageIndex = 1;

  const tl = $gsap.timeline({
    repeatDelay: 10,
    repeat: -1,
    onStart: function () {
      // Start progress bar on first run (half the cycle duration - 10% for faster speed)
      const cycleDuration = ((tl.duration() + 10) / 2) * 0.95;
      $gsap.fromTo(
        progressRef.value,
        { width: "0" },
        { width: "100vw", duration: cycleDuration, ease: "none" }
      );
    },
    onRepeat: function () {
      // Cycle background images
      if (imageIndex >= props.backgrounds.length) {
        imageIndex = 0;
      }

      const nextImage = props.backgrounds[imageIndex];
      const bgEl = bgRef.value;

      // Fade out, change image, fade in
      const fadeTl = $gsap.timeline();
      fadeTl
        .to(bgEl, 0.4, { autoAlpha: 0 }, 0)
        .call(() => {
          currentImage.value = nextImage;
        })
        .to(bgEl, 0.4, { autoAlpha: 1 });

      // Restart progress bar (half the cycle duration - 10% for faster speed)
      const cycleDuration = ((tl.duration() + 10) / 2) * 0.9;
      $gsap.fromTo(
        progressRef.value,
        { width: "0" },
        { width: "100vw", duration: cycleDuration, ease: "none" }
      );

      imageIndex++;
    },
  });

  // Waves animation (play twice during cycle)
  tl.add("playBothWaves");
  if (wavesTop.length)
    tl.staggerFrom(
      wavesTop,
      1,
      { drawSVG: "100% 100%" },
      -0.1,
      "playBothWaves"
    );
  if (wavesBottom.length)
    tl.staggerFrom(wavesBottom, 1, { drawSVG: "0% 0%" }, -0.1, "playBothWaves");

  // Second wave pass
  tl.add("playBothWaves2", "-=8");
  if (wavesTop.length)
    tl.staggerTo(wavesTop, 1, { drawSVG: "100% 100%" }, -0.1, "playBothWaves2");
  if (wavesBottom.length)
    tl.staggerTo(wavesBottom, 1, { drawSVG: "0% 0%" }, -0.1, "playBothWaves2");

  // Heading animation
  tl.add("playHeading", "-=4");
  const headingTl = createHeadingTimeline();
  if (headingTl) tl.add(headingTl, "playHeading");

  return tl;
}

/**
 * Build master timeline combining all animations
 * Matches original master timeline structure
 */
function createAnimation() {
  // Reveal container
  $gsap.set(containerRef.value, { autoAlpha: 1 });

  // Set initial background
  if (props.backgrounds && props.backgrounds.length) {
    currentImage.value = props.backgrounds[0];
  }

  const master = $gsap.timeline({ paused: true });

  // Add main waves + heading + slider timeline (now includes morphing intro)
  master.add(createMainTimeline());

  // Add logo show timeline (starts 9s before main timeline ends, per original)
  master.add(createLogoShowTimeline(), "-=9");

  // Add logo rotate timeline (starts from beginning, runs in parallel)
  master.add(createLogoRotateTimeline(), 0);

  // Apply timeScale
  master.timeScale(props.timeScale);

  // DevTools
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
      } catch (e) {
        console.warn("Failed to create DevTools:", e);
      }
    });
  }

  timeline.value = master;
  return master;
}

// Lifecycle
onMounted(() => {
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
      // Preload images before starting any animation
      preloadImages(props.backgrounds).then(() => {
        imagesReady.value = true;

        // Convert SVG primitives to paths BEFORE creating animations
        convertSvgPrimitivesToPaths();

        // Initialize logo intro fade-in (matches original line 59)
        initLogoIntro();

        // Show initial background
        if (bgRef.value) {
          $gsap.set(bgRef.value, { autoAlpha: 1 });
        }

        const tl = createAnimation();
        if (!tl) return;

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
        } else if (props.autoPlay || props.showDevTools) {
          tl.play();
        }
      });
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
      $GSDevTools.getById?.(props.devToolsId)?.kill();
    } catch (e) {}
  }
});

// Public API
defineExpose({
  containerRef,
  progressRef,
  wavesSvgRef,
  logoSvgRef,
  timeline,
  play: () => timeline.value?.play(),
  pause: () => timeline.value?.pause(),
  restart: () => timeline.value?.restart(),
  reverse: () => timeline.value?.reverse(),
  seek: (time) => timeline.value?.seek(time),
});
</script>

<style>
#innerLogoShape,
#centerLogoShape,
#outerLogoShape {
  opacity: 0;
  visibility: hidden;
}
/* Visual styling is largely handled via Tailwind utility classes.
   We only keep component-scope container visibility centralized here. */
</style>
