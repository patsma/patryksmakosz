<template>
  <div ref="containerRef" class="animation-component animation-component--wjv">
    <WorkingJobsVyneSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

const containerRef = ref(null);
const timeline = ref(null);
const svgComponentRef = ref(null);
let gsapCtx = null;

const props = defineProps({
  showDevTools: { type: Boolean, default: false },
  devToolsId: {
    type: String,
    default: () => `wjv-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: { type: Boolean, default: false },
});

const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectWorkingJobsVyne: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid collisions and remap selectors
  const idPrefix =
    props.devToolsId || `wjv-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths only within this SVG when needed for morphSVG
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

  // Elements used by the legacy sequence (scoped to this SVG)
  const circleBlue = q("#circle_blue");
  const leftGreenTriangleMask = q(
    "#left_green_triangle_mask rect, #left_green_triangle_mask path"
  );
  const rightGreenTriangleMask = q(
    "#right_green_triangle_mask rect, #right_green_triangle_mask path"
  );
  const leftGreenBlueMask = q(
    "#left_green-blue_mask rect, #left_green-blue_mask path"
  );
  const rightGreenBlueMask = q(
    "#right_green-blue_mask rect, #right_green-blue_mask path"
  );
  const rectPurpleBlue = q("#rectangle_purple-blue");
  const rectBlueDarkBlue = q("#rectangle_blue-darkblue");
  const rectDarkBlue = q("#rectangle_darkblue");
  const circlesGreen = qa("#circles_green > circle, #circles_green > path");
  const xBoth = q("#x_both");
  const greenTriangles = q("#green_triangles");
  const blueTriangles = q("#blue_triangles");
  const letterRshape = q("#letterRshape-2");
  const letterO = q("#letterO-2");

  // X groups and parts for morphing
  const xPurple = q("#x_purple");
  const tla = q("#tla");
  const tra = q("#tra");
  const bla = q("#bla");
  const bra = q("#bra");
  const tlM = q("#tlM");
  const trM = q("#trM");
  const blM = q("#blM");
  const brM = q("#brM");

  const xBlue = q("#x_blue");
  const tla2 = q("#tla-2");
  const tra2 = q("#tra-2");
  const bla2 = q("#bla-2");
  const bra2 = q("#bra-2");
  const tlM2 = q("#tlM-2");
  const trM2 = q("#trM-2");
  const blM2 = q("#blM-2");
  const brM2 = q("#brM-2");

  // Initial state
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(xBoth, { autoAlpha: 0 });

  // Timelines (paused master for control parity)
  const tl01 = $gsap.timeline();
  tl01
    .fromTo(
      circleBlue,
      { scale: 0, transformOrigin: "center center" },
      { scale: 6, duration: 1 }
    )
    .add("play_01", "-=0.7")
    .to(
      leftGreenTriangleMask,
      { transformOrigin: "0 50%", rotation: -180, scale: 3, duration: 1 },
      "play_01"
    )
    .to(
      rightGreenTriangleMask,
      { transformOrigin: "100% 50%", rotation: -180, scale: 3, duration: 1 },
      "play_01"
    )
    .add("play_01", "-=0.5")
    .to(
      leftGreenBlueMask,
      { transformOrigin: "0 50%", rotation: -180, scale: 3, duration: 1 },
      "play_01"
    )
    .to(
      rightGreenBlueMask,
      { transformOrigin: "100% 50%", rotation: -180, scale: 3, duration: 1 },
      "play_01"
    )
    .add("play_02")
    .to(
      leftGreenTriangleMask,
      { transformOrigin: "0 50%", rotation: "-=180", scale: 3, duration: 1 },
      "play_02"
    )
    .to(
      rightGreenTriangleMask,
      { transformOrigin: "100% 50%", rotation: "-=180", scale: 3, duration: 1 },
      "play_02"
    )
    .add("playRects", "-=1.3")
    .fromTo(
      rectPurpleBlue,
      { scale: 0, transformOrigin: "center center" },
      { scale: 6, rotation: "+=20", duration: 2 },
      "playRects"
    )
    .fromTo(
      rectBlueDarkBlue,
      { scale: 0, transformOrigin: "center center" },
      { scale: 6, rotation: "+=10", duration: 2 },
      "playRects+=0.3"
    )
    .fromTo(
      rectDarkBlue,
      { scale: 0, transformOrigin: "center center" },
      { scale: 6, rotation: "+=30", duration: 2 },
      "playRects+=0.6"
    )
    .fromTo(
      circlesGreen,
      { scale: 0, transformOrigin: "center center" },
      { scale: 5, repeat: 1, yoyo: true, duration: 0.5 },
      "-=1.5"
    )
    .set(xBoth, { autoAlpha: 1 }, "-=1")
    .set(
      [
        rectDarkBlue,
        rectBlueDarkBlue,
        rectPurpleBlue,
        greenTriangles,
        blueTriangles,
        circleBlue,
      ],
      { autoAlpha: 0 },
      "-=1"
    )
    .set(letterRshape, { fill: "#005597" }, "-=1")
    .set(letterO, { fill: "#005597" }, "-=1");

  const tlX = $gsap.timeline();
  tlX
    .to(containerRef.value, { autoAlpha: 1, duration: 0.6 })
    .add("scale")
    .from(
      xBoth,
      { scale: 63.5, transformOrigin: "center center", duration: 2 },
      0
    )
    .fromTo(
      xPurple,
      { scale: 0, transformOrigin: "center center" },
      { scale: 15, duration: 2 },
      0
    )
    .add("morphBlue", "-=2")
    .to(
      tla2,
      { morphSVG: tlM2, duration: 0.5, ease: "none" },
      "morphXblueAndPurple"
    )
    .to(
      tra2,
      { morphSVG: trM2, duration: 0.5, ease: "none" },
      "morphXblueAndPurple"
    )
    .to(
      bla2,
      { morphSVG: blM2, duration: 0.5, ease: "none" },
      "morphXblueAndPurple"
    )
    .to(
      bra2,
      { morphSVG: brM2, duration: 0.5, ease: "none" },
      "morphXblueAndPurple"
    )
    .add("hideMorphBlue")
    .set([tlM2, tla2, trM2, tra2, blM2, bla2, brM2, bra2], { autoAlpha: 0 })
    .add("morphPurple", "-=1")
    .to(
      tla,
      { morphSVG: tlM, duration: 1, ease: "none" },
      "morphXblueAndPurple"
    )
    .to(
      tra,
      { morphSVG: trM, duration: 1, ease: "none" },
      "morphXblueAndPurple"
    )
    .to(
      bla,
      { morphSVG: blM, duration: 1, ease: "none" },
      "morphXblueAndPurple"
    )
    .to(
      bra,
      { morphSVG: brM, duration: 1, ease: "none" },
      "morphXblueAndPurple"
    )
    .add("hideMorphPurple")
    .set([tlM, tla, trM, tra, blM, bla, brM, bra], { autoAlpha: 0 })
    .timeScale(2.8);

  const tlMaster = $gsap.timeline({ repeat: -1, paused: true });
  tlMaster
    .add(tl01)
    .add(tlX, "-=0.8")
    .add("showOandR", "-=0.1")
    .to(letterRshape, { fill: "#4cb748", duration: 0.6 }, "showOandR")
    .to(letterO, { fill: "#4cb748", duration: 0.6 }, "showOandR");

  // DevTools integration
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

onMounted(() => {
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
      const tl = createAnimation();
      if (props.autoPlay) tl && tl.play();
    }, containerRef.value);
  });
});

onUnmounted(() => {
  if (gsapCtx) gsapCtx.revert();
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
/* Uses shared styles from app/assets/scss/components/_animation-components.scss */
</style>
