<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--inforca"
  >
    <InfOrcaLogoSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
// Nuxt/GSAP
const { $gsap } = useNuxtApp();
const { $DrawSVGPlugin } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

// Core refs
const containerRef = ref(null);
const svgComponentRef = ref(null);
const timeline = ref(null);
let gsapCtx = null;
let scrollTriggerInstance = null;

// Props (aligned with other project components)
const props = defineProps({
  showDevTools: { type: Boolean, default: false },
  devToolsId: {
    type: String,
    default: () => `inforca-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: { type: Boolean, default: false },
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top 80%" },
  stEnd: { type: String, default: "bottom 20%" },
});

// Build animation
const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectInfOrca: SVG root not found");
    return null;
  }

  // Prefix defs IDs (mask references etc.)
  const idPrefix =
    props.devToolsId || `inforca-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths for morph operations
  try {
    const svgRootEl = svgRoot.closest ? svgRoot.closest("svg") : svgRoot;
    if ($MorphSVGPlugin && svgRootEl) {
      const shapes = svgRootEl.querySelectorAll(
        "circle, rect, ellipse, line, polygon, polyline"
      );
      if (shapes && shapes.length) {
        $MorphSVGPlugin.convertToPath(shapes);
      }
    }
  } catch (e) {}

  // Scoped selectors
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)));

  // Elements
  const tail = q("#tail");
  const letter_I01 = q("#letter_I01");
  const letter_F01 = q("#letter_F01");
  const letter_C01 = q("#letter_C01");
  const letter_A01 = q("#letter_A01");
  const letter_R01 = q("#letter_R01");
  const letter_N01 = q("#letter_N01");
  const Tfin = q("#Tfin");
  const Lfin = q("#Lfin");
  const Rfin = q("#Rfin");
  const body = q("#body");
  const belly = q("#belly");
  const Leye = q("#Leye");
  const Reye = q("#Reye");
  const bellyTop = q("#bellyTop");
  const ReyeTop = q("#ReyeTop");
  const LeyeTop = q("#LeyeTop");
  const ReyeBottom = q("#ReyeBottom");
  const LeyeBottom = q("#LeyeBottom");
  const initialOrca = svgRoot.querySelector(".initialOrca");
  const waveWrapper = svgRoot.querySelector(".waveWrapper");
  const wave04 = q("#wave04");
  const wave03 = q("#wave03");
  const wave02 = q("#wave02");
  const wave01 = q("#wave01");

  // Initial state (match legacy)
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(tail, { transformOrigin: "50% 0%", autoAlpha: 1, scaleY: 0 });

  // Orca jump timeline (looped)
  const tlOrca = $gsap.timeline({ repeat: -1 });
  tlOrca
    .add("moveDown")
    .to(
      belly,
      {
        duration: 1,
        scaleY: "-=0.3",
        y: "+=8",
        transformOrigin: "center center",
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveDown"
    )
    .to(
      tail,
      {
        duration: 1,
        transformOrigin: "50% 0%",
        scaleY: "-=1.5",
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveDown"
    )
    .to(
      body,
      {
        duration: 1,
        transformOrigin: "50% 100%",
        scaleY: "-=0.1",
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveDown"
    )
    .to(
      Tfin,
      {
        duration: 1,
        transformOrigin: "50% 100%",
        y: "+=25",
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveDown"
    )
    .to(
      Rfin,
      {
        duration: 1,
        transformOrigin: "0% 0%",
        x: "-=4",
        y: "-=10",
        rotation: "-=30",
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveDown"
    )
    .to(
      Lfin,
      {
        duration: 1,
        transformOrigin: "100% 0%",
        x: "+=4",
        y: "-=10",
        rotation: "+=30",
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveDown"
    )
    .to(
      Leye,
      {
        duration: 1,
        morphSVG: LeyeBottom,
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveDown"
    )
    .to(
      Reye,
      {
        duration: 1,
        morphSVG: ReyeBottom,
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveDown"
    )
    .to(
      initialOrca,
      {
        duration: 1,
        transformOrigin: "center center",
        y: "+=30",
        repeat: 1,
        yoyo: true,
      },
      "moveDown"
    )
    .to(
      initialOrca,
      {
        duration: 1,
        transformOrigin: "center center",
        rotation: "+=1.3",
        repeat: 1,
        yoyo: true,
      },
      "moveDown"
    )

    .add("moveUp")
    .to(
      belly,
      {
        duration: 1,
        scaleX: "-=0.1",
        y: "-=1",
        morphSVG: bellyTop,
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveUp"
    )
    .to(
      Leye,
      { duration: 1, morphSVG: LeyeTop, ease: "none", repeat: 1, yoyo: true },
      "moveUp"
    )
    .to(
      Reye,
      { duration: 1, morphSVG: ReyeTop, ease: "none", repeat: 1, yoyo: true },
      "moveUp"
    )
    .to(
      body,
      {
        duration: 1,
        transformOrigin: "50% 100%",
        scaleY: "+=0.05",
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveUp"
    )
    .to(
      body,
      {
        duration: 1,
        transformOrigin: "50% 50%",
        scaleX: "-=0.1",
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveUp"
    )
    .to(
      tail,
      {
        duration: 1,
        transformOrigin: "50% 0%",
        scaleY: "+=0.85",
        scaleX: "-=0.15",
        y: "-=1",
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveUp"
    )
    .to(
      Rfin,
      {
        duration: 1,
        transformOrigin: "0% 0%",
        x: "-=3",
        y: "+=7",
        rotation: "+=25",
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveUp"
    )
    .to(
      Lfin,
      {
        duration: 1,
        transformOrigin: "100% 0%",
        x: "+=3",
        y: "+=7",
        rotation: "-=25",
        ease: "none",
        repeat: 1,
        yoyo: true,
      },
      "moveUp"
    )
    .to(
      initialOrca,
      {
        duration: 1,
        transformOrigin: "center center",
        y: "-=30",
        repeat: 1,
        yoyo: true,
      },
      "moveUp"
    )
    .to(
      initialOrca,
      {
        duration: 1,
        transformOrigin: "center center",
        rotation: "-=1.3",
        repeat: 1,
        yoyo: true,
      },
      "moveUp"
    );
  tlOrca.timeScale(2);

  // Waves timeline (looped, yoyo)
  const tlWaves = $gsap.timeline({ repeat: -1, yoyo: true });
  tlWaves
    .add("moveWaves")
    .to(
      wave01,
      {
        duration: 1,
        x: "+=35",
        transformOrigin: "center center",
        ease: "none",
      },
      "moveWaves"
    )
    .to(
      wave02,
      {
        duration: 1,
        x: "+=35",
        transformOrigin: "center center",
        ease: "none",
      },
      "moveWaves"
    )
    .to(
      wave03,
      {
        duration: 1,
        x: "-=35",
        transformOrigin: "center center",
        ease: "none",
      },
      "moveWaves"
    )
    .to(
      wave04,
      {
        duration: 1,
        x: "-=35",
        transformOrigin: "center center",
        ease: "none",
      },
      "moveWaves"
    )
    .fromTo(
      waveWrapper,
      {
        duration: 1,
        x: "-=15",
        y: 35,
        transformOrigin: "center center",
        ease: "none",
      },
      { y: -20 },
      "moveWaves"
    )
    .to(waveWrapper, {
      duration: 1,
      y: 35,
      transformOrigin: "center center",
      ease: "none",
    });
  tlWaves.timeScale(1);

  // Master timeline to orchestrate (paused by default, keeps looping sub-timelines)
  const tlMaster = $gsap.timeline({ paused: true });
  tlMaster.add(tlOrca, 0).add(tlWaves, 0);

  // DevTools
  if (props.showDevTools) {
    nextTick(() => {
      try {
        $GSDevTools.create({
          animation: tlMaster,
          container: containerRef.value,
          minimal: true,
          id: props.devToolsId,
          globalSync: false,
        });
      } catch (e) {}
    });
  }

  timeline.value = tlMaster;
  return tlMaster;
};

// Lifecycle
onMounted(() => {
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
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
      } else if (props.autoPlay) {
        tl.play();
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
/* Styling inherits from shared animation-component styles */
</style>
