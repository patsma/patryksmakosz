<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--icon-phone"
  >
    <IconPhoneSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectIconPhone animation component
 * - Ports the GSAP timeline from old portfolio /animations/icon-phone
 * - 3D isometric phone with cars traveling bezier paths, swapping with social icons
 * - Cars move along paths then elastic-ease into social media icons
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
    default: () => `icon-phone-${Math.random().toString(36).slice(2, 9)}`,
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
    console.warn("ProjectIconPhone: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `icon-phone-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths for MotionPath (bezier lines need to be paths)
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

  // Get bezier path elements (now converted from <line> to <path>)
  const bezierPath01 = q("#bezier01");
  const bezierPath02 = q("#bezier02");
  const bezierPath03 = q("#bezier03");

  // Get car and social icon groups
  const car01 = q("#car01");
  const car02 = q("#car02");
  const car03 = q("#car03");
  const social01 = q("#social01");
  const social02 = q("#social02");
  const social03 = q("#social03");

  // Reveal SVG (hidden by CSS to prevent flash of unstyled content)
  $gsap.set(svgRoot, { autoAlpha: 1 });

  // Make social icons visible (CSS hides them, GSAP controls from here)
  $gsap.set([social01, social02, social03], { autoAlpha: 1 });

  // Build sub-timeline replicating old tl01()
  const subTl = $gsap.timeline();

  // Car01 moves along bezier01 path, then swaps with social01
  if (bezierPath01 && car01) {
    subTl.to(car01, {
      motionPath: {
        path: bezierPath01,
        align: bezierPath01,
        alignOrigin: [0.5, 0.5],
      },
      autoAlpha: 1,
      duration: 1,
    });
  }
  subTl.addLabel("show01");
  if (car01) {
    subTl.to(
      car01,
      {
        yPercent: -10,
        autoAlpha: 0,
        scale: 0,
        transformOrigin: "center center",
        ease: "elastic.inOut",
        duration: 0.5,
      },
      "show01"
    );
  }
  if (social01) {
    subTl.from(
      social01,
      {
        yPercent: -10,
        autoAlpha: 0,
        scale: 0,
        transformOrigin: "center center",
        ease: "elastic.inOut",
        duration: 0.5,
      },
      "show01"
    );
  }

  // Car02 moves along bezier02 path, then swaps with social02
  if (bezierPath02 && car02) {
    subTl.to(car02, {
      motionPath: {
        path: bezierPath02,
        align: bezierPath02,
        alignOrigin: [0.5, 0.5],
      },
      autoAlpha: 1,
      duration: 1,
    });
  }
  subTl.addLabel("show02");
  if (car02) {
    subTl.to(
      car02,
      {
        yPercent: -10,
        autoAlpha: 0,
        scale: 0,
        transformOrigin: "center center",
        ease: "elastic.inOut",
        duration: 0.5,
      },
      "show02"
    );
  }
  if (social02) {
    subTl.from(
      social02,
      {
        yPercent: -10,
        autoAlpha: 0,
        scale: 0,
        transformOrigin: "center center",
        ease: "elastic.inOut",
        duration: 0.5,
      },
      "show02"
    );
  }

  // Car03 moves along bezier03 path, then swaps with social03
  if (bezierPath03 && car03) {
    subTl.to(car03, {
      motionPath: {
        path: bezierPath03,
        align: bezierPath03,
        alignOrigin: [0.5, 0.5],
      },
      autoAlpha: 1,
      duration: 1,
    });
  }
  subTl.addLabel("show03");
  if (car03) {
    subTl.to(
      car03,
      {
        yPercent: -10,
        autoAlpha: 0,
        scale: 0,
        transformOrigin: "center center",
        ease: "elastic.inOut",
        duration: 0.5,
      },
      "show03"
    );
  }
  if (social03) {
    subTl.from(
      social03,
      {
        yPercent: -10,
        autoAlpha: 0,
        scale: 0,
        transformOrigin: "center center",
        ease: "elastic.inOut",
        duration: 0.5,
      },
      "show03"
    );
  }

  // Apply timeScale matching original master.timeScale(0.5)
  subTl.timeScale(0.5);

  // Wrap in master timeline with repeat (no yoyo per skill convention)
  const tl = $gsap.timeline({
    paused: true,
    delay: 0.1,
    repeat: -1,
    repeatDelay: 2.5,
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
