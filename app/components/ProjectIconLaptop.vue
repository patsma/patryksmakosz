<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--icon-laptop"
  >
    <IconLaptopSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectIconLaptop animation component
 * - Ports the GSAP timeline from old portfolio /animations/icon-laptop
 * - 3D isometric laptop with "KEYWORDS" text that reveals letter by letter
 * - Separator bar steps across bezier path with SteppedEase
 */

const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $MotionPathPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

const containerRef = ref(null);
const timeline = ref(null);
let gsapCtx = null;
let scrollTriggerInstance = null;

const svgComponentRef = ref(null);

const props = defineProps({
  showDevTools: {
    type: Boolean,
    default: false,
  },
  devToolsId: {
    type: String,
    default: () => `icon-laptop-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom top" },
});

const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectIconLaptop: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `icon-laptop-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths for motionPath operations
  // This converts the #bezier01 <line> to a <path> so MotionPath can use it
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

  // Get the bezier path element (now converted from <line> to <path>)
  const bezierPath = q("#bezier01");

  // Reveal SVG (hidden by CSS to prevent flash of unstyled content)
  $gsap.set(svgRoot, { autoAlpha: 1 });

  // Letter elements for stagger animations
  const letterIds = [
    "#letterK",
    "#letterE",
    "#letterY",
    "#letterW",
    "#letterO",
    "#letterR",
    "#letterD",
    "#letterS",
  ];
  const letterEls = letterIds.map((id) => q(id)).filter(Boolean);

  // Build sub-timeline for the typing animation
  // The caret (separator) starts at position 0 and steps every 1s.
  // Letters and key highlights start at position 1, so the caret's first
  // jump to 1/8 coincides with the first letter appearing - placing the
  // cursor right AFTER each letter as it types.
  const subTl = $gsap.timeline();

  // Caret starts at position 0, giving it a 1-step head start over letters.
  // steps(8) over duration 8 = jumps at t=1,2,...,8 matching letter stagger.
  if (bezierPath) {
    subTl.to(
      q("#separator"),
      {
        motionPath: {
          path: bezierPath,
          align: "self",
          alignOrigin: [0.5, 0.5],
        },
        duration: 8,
        ease: "steps(8)",
      },
      0
    );
  }

  // Letters appear one by one, offset by 1s so they sync with caret jumps
  subTl.from(
    qa("#keyword > path"),
    {
      autoAlpha: 0,
      duration: 0.0001,
      stagger: 1,
    },
    1
  );

  // Keyboard keys highlight white in sync with letter appearances
  subTl.to(
    letterEls,
    {
      fill: "#fff",
      duration: 1,
      stagger: 1,
    },
    1
  );

  // Keyboard keys fade back to outline
  subTl.to(
    letterEls,
    {
      fill: "none",
      duration: 1,
      stagger: 1,
    },
    1.1
  );

  // Apply timeScale(4) matching original master.add(tl01().timeScale(4))
  subTl.timeScale(4);

  // Wrap in master timeline with repeat and yoyo
  const tl = $gsap.timeline({
    paused: true,
    delay: 0.1,
    repeat: -1,
    yoyo: true,
    repeatDelay: 1,
  });

  tl.add(subTl);

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
