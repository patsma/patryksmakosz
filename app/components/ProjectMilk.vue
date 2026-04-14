<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--milk"
  >
    <MilkSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectMilk animation component
 * - MorphSVG animation: "Europe Dairy" morphs to "I Love Milk" and back
 * - 17 simultaneous morph tweens with elastic easing
 * - Ported from old portfolio /logo-animation/milk
 * - GSAP 2 syntax migrated to GSAP 3
 */

const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
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
    default: () => `milk-${Math.random().toString(36).slice(2, 9)}`,
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
    console.warn("ProjectMilk: SVG root not found");
    return null;
  }

  const idPrefix =
    props.devToolsId ||
    `milk-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths for MorphSVG compatibility
  try {
    if ($MorphSVGPlugin) {
      const shapes = svgRoot.querySelectorAll(
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

  // Reveal SVG (hidden by CSS to prevent FOUC)
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(svgRoot, { autoAlpha: 1 });
  // #IloveMilk stays hidden - it only provides morph target shapes
  // #EuropeDairy is the visible starting state

  // Build timeline - 17 simultaneous morph tweens (all overlap with '-=1')
  // Yoyo: morphs forward (Europe Dairy -> I Love Milk) then reverses back
  const tl = $gsap.timeline({
    paused: true,
    repeat: -1,
    yoyo: true,
    repeatDelay: 1,
  });

  // Leaf morphs to heart with color change
  tl.to(q("#Leaf"), {
    duration: 1,
    morphSVG: { shape: q("#hearth") },
    fill: "#D52730",
    ease: "elastic.inOut",
  });

  // Rights text morphs
  tl.to(
    q("#Rights"),
    {
      duration: 1,
      morphSVG: { shape: q("#MilkRights") },
      fill: "#010101",
      ease: "elastic.inOut",
    },
    "-=1"
  );

  // Logo element morphs
  tl.to(
    q("#Elogo"),
    {
      duration: 1,
      morphSVG: { shape: q("#MilkI") },
      ease: "elastic.inOut",
    },
    "-=1"
  );

  // Euro Dairy letters morph to Ed Rights letters
  tl.to(q("#EuroD2"), { duration: 1, morphSVG: { shape: q("#EdD") }, ease: "elastic.inOut" }, "-=1");
  tl.to(q("#EuroA2"), { duration: 1, morphSVG: { shape: q("#EdA") }, ease: "elastic.inOut" }, "-=1");
  tl.to(q("#EuroI2"), { duration: 1, morphSVG: { shape: q("#EdI") }, ease: "elastic.inOut" }, "-=1");
  tl.to(q("#EuroE"), { duration: 1, morphSVG: { shape: q("#EdE") }, ease: "elastic.inOut" }, "-=1");
  tl.to(q("#EuroU"), { duration: 1, morphSVG: { shape: q("#EdU") }, ease: "elastic.inOut" }, "-=1");
  tl.to(q("#EuroR_1_"), { duration: 1, morphSVG: { shape: q("#EdR") }, ease: "elastic.inOut" }, "-=1");
  tl.to(q("#EuroO"), { duration: 1, morphSVG: { shape: q("#EdO") }, ease: "elastic.inOut" }, "-=1");
  tl.to(q("#EuroP"), { duration: 1, morphSVG: { shape: q("#EdP") }, ease: "elastic.inOut" }, "-=1");
  tl.to(q("#EuroE2"), { duration: 1, morphSVG: { shape: q("#EdE2") }, ease: "elastic.inOut" }, "-=1");

  // Euro letters morph to Milk letters
  tl.to(q("#EuroD"), { duration: 1, morphSVG: { shape: q("#MilkM") }, ease: "elastic.inOut" }, "-=1");
  tl.to(q("#EuroA"), { duration: 1, morphSVG: { shape: q("#MilkI2") }, ease: "elastic.inOut" }, "-=1");
  tl.to(q("#EuroI"), { duration: 1, morphSVG: { shape: q("#MilkL") }, ease: "elastic.inOut" }, "-=1");
  tl.to(q("#EuroR2"), { duration: 1, morphSVG: { shape: q("#MilkK") }, ease: "elastic.inOut" }, "-=1");

  // Remaining letter morphs
  tl.to(q("#EuroY"), { duration: 1, morphSVG: { shape: q("#EdY") }, ease: "elastic.inOut" }, "-=1");
  tl.to(q("#EuroR_2_"), { duration: 1, morphSVG: { shape: q("#EdR2") }, ease: "elastic.inOut" }, "-=1");

  // Circle stroke morph with color change
  tl.to(
    q("#Rights2"),
    {
      duration: 1,
      morphSVG: { shape: q("#CircleStroke") },
      fill: "#010101",
      ease: "elastic.inOut",
    },
    "-=1"
  );

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
