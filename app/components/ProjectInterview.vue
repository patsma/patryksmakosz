<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--interview"
  >
    <InterviewSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectInterview animation component
 * - Pattern A: standardized API matching ProjectDobraHipoteka.vue
 * - 4 independent timelines matching original architecture:
 *   tlIntro (plays once), tlAmbient/tlFly/tlClock (loop with yoyo)
 * - Uses MorphSVG (paper morph), DrawSVG (clock), MotionPath (fly bezier)
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
let allTimelines = [];
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
    default: () => `interview-${Math.random().toString(36).slice(2, 9)}`,
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
 * Build 4 GSAP timelines matching the original architecture:
 * - tlIntro: plays once (scene reveal, eyebrow pulse, fly entrance, phone pulse)
 * - tlAmbient: loops with yoyo (smoke, paper morph, shoe, blink)
 * - tlFly: loops with yoyo (fly bezier motion)
 * - tlClock: loops with yoyo (clock draw, ginger shake)
 * @returns {GSAPTimeline[]} all timelines
 */
const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectInterview: SVG root not found");
    return [];
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `interview-${Math.random().toString(36).slice(2, 6)}`;
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

  // Ensure DrawSVG is available
  try {
    $DrawSVGPlugin && $DrawSVGPlugin.getLength && true;
  } catch (e) {}

  // Reveal container and SVG (hidden by CSS to prevent FOUC)
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(svgRoot, { autoAlpha: 1 });

  // === TIMELINE 1: INTRO (plays once) ===
  const tlIntro = $gsap.timeline({ paused: true, delay: 0.1 });

  tlIntro.add("showAll");
  tlIntro.to(qa("#white_wall, #purple_wall"), {
    autoAlpha: 1,
    duration: 1,
    stagger: 0.1,
  }, "showAll");
  tlIntro.to(q("#table"), { autoAlpha: 1, duration: 1 }, "showAll");
  tlIntro.from(q("#red_armchair"), {
    autoAlpha: 0,
    yPercent: 20,
    duration: 1,
  }, "showAll");
  tlIntro.from(q("#interviewer"), {
    autoAlpha: 0,
    yPercent: -2,
    duration: 1,
  }, "showAll");
  tlIntro.from(qa("#dark, #black_armchair_highlight, #suit, #ginger_head"), {
    autoAlpha: 0,
    xPercent: 50,
    duration: 1,
  }, "showAll");

  // Eyebrow pulse
  tlIntro.to(q("#eyebrows"), {
    yPercent: 40,
    yoyo: true,
    repeat: 3,
    duration: 0.5,
  });

  // Fly entrance
  tlIntro.to(q("#fly"), {
    xPercent: 100,
    yPercent: 100,
    autoAlpha: 1,
    duration: 1,
  });

  // Phone color pulse (infinite - runs forever since tlIntro doesn't repeat)
  tlIntro.to(qa("#phone path"), {
    fill: "#3d8ba7",
    yoyo: true,
    repeat: -1,
    duration: 1,
  });

  // === TIMELINE 2: AMBIENT LOOP (smoke, paper, shoe, blink) ===
  const tlAmbient = $gsap.timeline({ paused: true, repeat: -1, yoyo: true });

  tlAmbient.add("smokeMove");
  tlAmbient.to(q("#smoke1"), { yPercent: 20, duration: 1 }, "smokeMove");
  tlAmbient.to(q("#smoke2"), { yPercent: -20, duration: 1 }, "smokeMove");
  tlAmbient.to(q("#paper_bottom"), {
    morphSVG: q("#paper_top"),
    duration: 1,
  });
  tlAmbient.from(q("#shoe_2"), {
    yPercent: -5,
    rotation: 5,
    transformOrigin: "50% 0%",
    duration: 1,
  });
  tlAmbient.add("blink");
  tlAmbient.to(qa("#eyebrows > path:nth-child(1)"), {
    yPercent: 50,
    duration: 0.2,
  }, "blink");
  tlAmbient.to(qa("#eyes > path:nth-child(1)"), {
    autoAlpha: 0,
    duration: 0.1,
  }, "blink");

  // === TIMELINE 3: FLY LOOP (bezier motion) ===
  const tlFly = $gsap.timeline({ paused: true, repeat: -1, yoyo: true });

  tlFly.from(q("#fly"), {
    duration: 2,
    motionPath: {
      path: [
        { x: 100, y: 250 },
        { x: 500, y: 200 },
        { x: 800, y: -400 },
      ],
      type: "soft",
      autoRotate: true,
    },
    ease: "power1.inOut",
  });

  // === TIMELINE 4: CLOCK LOOP (draw + ginger shake) ===
  const tlClock = $gsap.timeline({ paused: true, repeat: -1, yoyo: true });

  tlClock.to(q("#clock"), { autoAlpha: 1, duration: 1 });
  tlClock.from(qa("#shadow_clock, #clock_base"), {
    drawSVG: "0%",
    duration: 1,
  });
  tlClock.from(q("#clock_hands"), { drawSVG: "0%", duration: 1 });
  tlClock.from(q("#ginger_dude"), {
    yPercent: -1,
    rotation: 2,
    transformOrigin: "50% 50%",
    duration: 1,
  });

  // DevTools integration (attach to intro timeline)
  if (props.showDevTools) {
    nextTick(() => {
      try {
        $GSDevTools.create({
          animation: tlIntro,
          container: containerRef.value,
          minimal: true,
          id: props.devToolsId,
          globalSync: false,
        });
      } catch (e) {}
    });
  }

  timeline.value = tlIntro;
  return [tlIntro, tlAmbient, tlFly, tlClock];
};

// Lifecycle
onMounted(() => {
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
      allTimelines = createAnimation();
      if (props.useScrollTrigger && allTimelines.length && $ScrollTrigger) {
        scrollTriggerInstance = $ScrollTrigger.create({
          trigger: containerRef.value,
          start: props.stStart,
          end: props.stEnd,
          onEnter: () => allTimelines.forEach((t) => t.play()),
          onEnterBack: () => allTimelines.forEach((t) => t.play()),
          onLeave: () =>
            allTimelines.forEach((t) => t.pause(0).progress(0)),
          onLeaveBack: () =>
            allTimelines.forEach((t) => t.pause(0).progress(0)),
        });
        $ScrollTrigger.refresh();
      } else if (props.autoPlay) {
        allTimelines.forEach((t) => t.play());
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
  play: () => allTimelines.forEach((t) => t.play()),
  pause: () => allTimelines.forEach((t) => t.pause()),
  restart: () => allTimelines.forEach((t) => t.restart()),
  reverse: () => allTimelines.forEach((t) => t.reverse()),
  seek: (time) => timeline.value?.seek(time),
});
</script>

<style scoped>
/* Styling centralized under app/assets/scss/components/_animation-components.scss */
</style>
