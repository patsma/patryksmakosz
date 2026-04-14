<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--iceberg-webdesign"
  >
    <IcebergWebdesignSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectIcebergWebdesign animation component
 * - Ports the GSAP timeline from old portfolio /logo-animation/icebergwebdesign
 * - Text fade-in followed by penguin sliding in with CustomBounce wobble
 */

const { $gsap } = useNuxtApp();
const { $CustomBounce } = useNuxtApp();
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
    default: () =>
      `iceberg-webdesign-${Math.random().toString(36).slice(2, 9)}`,
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
    console.warn("ProjectIcebergWebdesign: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `iceberg-webdesign-${Math.random().toString(36).slice(2, 6)}`;
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

  // Create CustomBounce ease
  try {
    $CustomBounce?.create("myBounce", {
      strength: 0.2,
      squash: 0,
      squashID: "myBounce-squash",
    });
  } catch (e) {
    console.debug("ProjectIcebergWebdesign: CustomBounce setup issue", e);
  }

  // Query animation groups
  const penguinGroup = q("#penguin");
  const penguinPaths = qa("#penguin > path");
  const icebergPaths = qa("#iceberg > path");
  const webDesignPaths = qa("#webDesign > path");

  // Reveal container and SVG (hidden by CSS to prevent FOUC)
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(svgRoot, { autoAlpha: 1 });
  // Reveal penguin (hidden by CSS in original)
  $gsap.set(penguinGroup, { autoAlpha: 1 });

  // Build main timeline
  const tl = $gsap.timeline({
    paused: true,
    delay: 0.1,
    repeat: -1,
    repeatDelay: 2.5,
  });

  // 'triggerAll' - text fade in (all at once, stagger 0)
  tl.addLabel("triggerAll");
  tl.from(
    icebergPaths,
    { autoAlpha: 0, duration: 1, ease: "power2.out", stagger: 0 },
    "triggerAll"
  );
  tl.from(
    webDesignPaths,
    { autoAlpha: 0, duration: 1, ease: "power2.out", stagger: 0 },
    "triggerAll"
  );

  // 'triggerPenguin' - penguin slides in with bounce effects
  tl.addLabel("triggerPenguin");
  tl.fromTo(
    penguinGroup,
    { x: -250 },
    { x: -10, duration: 2, ease: "none" },
    "triggerPenguin"
  );
  tl.to(
    penguinGroup,
    {
      rotation: 10,
      duration: 0.2,
      ease: "myBounce-squash",
      yoyo: true,
      repeat: 7,
      transformOrigin: "center bottom",
    },
    "triggerPenguin"
  );
  // Head bob
  tl.to(
    penguinPaths[0],
    {
      yPercent: 20,
      duration: 0.6,
      ease: "myBounce-squash",
      yoyo: true,
      repeat: 2,
    },
    "triggerPenguin+=0.2"
  );
  // Left flipper
  tl.to(
    penguinPaths[4],
    {
      xPercent: 30,
      yPercent: 30,
      duration: 0.2,
      ease: "myBounce-squash",
      yoyo: true,
      repeat: 8,
    },
    "triggerPenguin"
  );
  // Right flipper
  tl.to(
    penguinPaths[5],
    {
      xPercent: 30,
      yPercent: 30,
      duration: 0.2,
      ease: "myBounce-squash",
      yoyo: true,
      repeat: 8,
    },
    "triggerPenguin+=0.1"
  );

  tl.timeScale(0.7);

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
