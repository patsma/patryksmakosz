<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--player-prototype"
  >
    <!-- Keep SVG as a child component for clarity and reuse -->
    <PlayerPrototypeSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectPlayerPrototype animation component
 * - Mirrors the standardized API used by ProjectArtTech.vue
 * - Uses refs instead of query selectors outside of the SVG root
 * - Ports the GSAP timeline from old portfolio /player-prototype/app.js
 * - We intentionally skip the external particles.js overlay for now
 */

// Nuxt/GSAP plugins (provided via @hypernym/nuxt-gsap in nuxt.config.ts)
const { $gsap } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

// Standard container/timeline refs
const containerRef = ref(null);
const timeline = ref(null);
// GSAP context for scoped animations & automatic cleanup
let gsapCtx = null;
let scrollTriggerInstance = null;

// Ref for the SVG component instance
const svgComponentRef = ref(null);

// Props consistent with other project components
const props = defineProps({
  /**
   * @type {boolean}
   * Whether to show GSDevTools for debugging and control
   */
  showDevTools: { type: Boolean, default: false },
  /**
   * @type {string}
   * Custom ID for the GSDevTools instance
   */
  devToolsId: {
    type: String,
    default: () => `player-prototype-${Math.random().toString(36).slice(2, 9)}`,
  },
  /**
   * @type {boolean}
   * When true, starts the animation automatically on mount (useful outside grid)
   */
  autoPlay: { type: Boolean, default: false },
  // ScrollTrigger-controlled autoplay defaults to on
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom center" },
});

/**
 * Build the GSAP timeline using the inline SVG IDs
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  // Ensure SVG is mounted
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectPlayerPrototype: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions and compute selector remaps
  const idPrefix =
    props.devToolsId ||
    `player-prototype-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Query helpers scoped to this SVG only
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)));

  // Elements from the SVG used by the legacy animation
  const abbreviationGroup = q("#abbreviationGroup");
  const abbreviationShapes = qa("#abbreviationShapes > *");
  const abbreviationTextMaskGroup = qa("#abbreviationTextMaskGroup > *");
  const abbreviationTextStroke = qa("#abbreviationText-10");
  const abbreviationText = q("#abbreviationText-3");
  const playerBig = q("#playerBig");
  const playerBackground = q("#playerBackground");
  const player = q("#player");
  const background = q("#background");
  const player01 = q("#player01");
  const playerNumber = q("#number");
  const playerName = q("#playerName");
  const playerLastName = q("#playerLastName");
  const player02 = q("#player02");
  const player02Mask = player02?.closest && player02.closest("g");
  const playerTrianglesMask = qa("#playerTrianglesMask > *");
  const playerMasks01 = qa("#playerMasks01 > *");
  const playerMasks02 = qa("#playerMasks02 > *");
  const teamNameGroup = q("#teamNameGroup");
  const teamNameBackground = q("#teamNameBackground");
  const teamNameBackground2 = q("#teamNameBackground2");
  const teamNameTextGroupArray = qa("#teamNameTextGroup > *");
  const lastNameTextGroupArray = qa("#lastNameTextGroup > *");

  // Initial state (mirrors legacy app.js, adapted for scoped refs)
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(
    [
      teamNameGroup,
      player,
      ...teamNameTextGroupArray,
      ...lastNameTextGroupArray,
      teamNameBackground2,
    ].filter(Boolean),
    { autoAlpha: 0 }
  );
  $gsap.set(playerBig, {
    autoAlpha: 0,
    transformOrigin: "50% 50%",
    scale: 2,
    y: "+=400",
    x: "+=150",
  });
  if (playerMasks01[0])
    $gsap.set(playerMasks01[0], { scaleY: 0, transformOrigin: "50% 0%" });
  if (playerMasks01[1])
    $gsap.set(playerMasks01[1], { scaleY: 0, transformOrigin: "50% 100%" });
  if (playerMasks02[0])
    $gsap.set(playerMasks02[0], { scaleY: 0, transformOrigin: "50% 0%" });
  if (playerMasks02[1])
    $gsap.set(playerMasks02[1], { scaleY: 0, transformOrigin: "50% 100%" });
  if (playerTrianglesMask?.length)
    $gsap.set(playerTrianglesMask, { autoAlpha: 0 });
  if (player02Mask) $gsap.set(player02Mask, { mixBlendMode: "hard-light" });

  // Colors
  const orange = "#f7b517";

  // Sub-timelines (ported from legacy with minor API cleanups)
  function staggerTexts() {
    const staggerTextsTl = $gsap.timeline();
    staggerTextsTl
      .to(teamNameTextGroupArray, {
        autoAlpha: 1,
        stagger: { amount: -1, each: 1 },
        ease: "steps(1)",
      })
      .to(
        teamNameTextGroupArray,
        {
          autoAlpha: 0,
          stagger: { amount: -1, each: 1 },
          ease: "steps(1)",
        },
        "<0.5"
      )
      .to(
        teamNameTextGroupArray,
        {
          fill: "none",
          stroke: orange,
          strokeWidth: 6,
          autoAlpha: 1,
          y: "+=50",
          repeat: 1,
          ease: "steps(1)",
          stagger: { amount: 1 },
        },
        "-=2"
      )
      .to(
        teamNameTextGroupArray,
        {
          fill: "none",
          stroke: "#000",
          strokeWidth: 6,
          autoAlpha: 1,
          y: "+=50",
          ease: "steps(1)",
          stagger: { amount: 0.2 },
        },
        "-=0.5"
      )
      .fromTo(
        teamNameBackground,
        { css: { mixBlendMode: "difference" } },
        { css: { mixBlendMode: "color" } },
        "-=1"
      )
      .set(teamNameTextGroupArray, { autoAlpha: 0 });
    staggerTextsTl.timeScale(0.5);
    return staggerTextsTl;
  }

  function staggerWords() {
    const staggerWordsTl = $gsap.timeline();
    staggerWordsTl
      .to(lastNameTextGroupArray, {
        autoAlpha: 1,
        stagger: { amount: -0.5 },
        repeat: 2,
        ease: "steps(1)",
        immediateRender: false,
      })
      .to(
        lastNameTextGroupArray,
        { autoAlpha: 0, stagger: { amount: -0.5 }, ease: "steps(1)" },
        "<0.5"
      )
      .to(
        lastNameTextGroupArray,
        {
          fill: "none",
          stroke: orange,
          strokeWidth: 6,
          autoAlpha: 1,
          y: "+=50",
          repeat: 1,
          ease: "steps(1)",
          stagger: { amount: 0.5 },
        },
        "<"
      )
      .set(lastNameTextGroupArray, { autoAlpha: 0 });
    return staggerWordsTl;
  }

  function abbreviation() {
    const abbreviationTl = $gsap.timeline();
    abbreviationTl
      .to(abbreviationTextMaskGroup, {
        stagger: { amount: 0.3 },
        y: (i) => $gsap.utils.wrap([-200, -80])(i),
      })
      .to(abbreviationText, { y: "+=50" }, "<")
      .to(
        abbreviationTextStroke,
        {
          x: 100,
          stagger: { amount: 1 },
        },
        "-=0.5"
      )
      .to(
        abbreviationShapes,
        {
          y: (i) => $gsap.utils.wrap([20, 40])(i),
          stagger: { amount: 0.3 },
        },
        "<"
      );
    return abbreviationTl;
  }

  function playerBigTl() {
    const tl = $gsap.timeline();
    tl.add("show-player")
      .set(player, { autoAlpha: 1 })
      .fromTo(
        playerBig,
        {
          css: { mixBlendMode: "exclusion" },
          repeat: 2,
          ease: "steps(1)",
          immediateRender: false,
        },
        { css: { mixBlendMode: "soft-light" }, repeat: 2, ease: "steps(1)" },
        "show-player"
      )
      .set(playerBig, { autoAlpha: 1 }, "show-player")
      .to(
        playerBig,
        { duration: 2, y: "-=30", ease: "slow(0.6,0.8)" },
        "show-player"
      )
      .set(playerBig, { autoAlpha: 0 });
    return tl;
  }

  function showPlayer() {
    const tl = $gsap.timeline();
    tl.to(playerTrianglesMask, {
      autoAlpha: 1,
      stagger: 0.03,
      ease: "steps(1)",
    })
      .to(playerMasks02, { scaleY: 1, stagger: 0.3 }, "<")
      .to(
        playerTrianglesMask,
        { scale: 4, x: "+=100", transformOrigin: "50% 50%" },
        "<0.2"
      )
      .fromTo(
        teamNameBackground,
        { css: { mixBlendMode: "hue" } },
        { css: { mixBlendMode: "normal" } },
        "<"
      )
      .to(playerMasks02, { scaleY: 1, stagger: 0.5 }, "<")
      .to(playerBackground, { autoAlpha: 0 }, "<")
      .to(teamNameBackground, { css: { mixBlendMode: "color" }, duration: 0.1 })
      .from(
        playerName,
        { autoAlpha: 0, ease: "steps(1)", repeat: 2, duration: 0.1 },
        "<"
      )
      .from(
        playerLastName,
        { autoAlpha: 0, ease: "steps(1)", repeat: 2, duration: 0.1 },
        "<0.1"
      )
      .from(
        playerNumber,
        { autoAlpha: 0, ease: "steps(1)", repeat: 2, duration: 0.1 },
        "<0.1"
      )
      .to(player, { scale: 1.05, transformOrigin: "50% 50%", duration: 2 }, "<")
      .to(
        background,
        { scale: 1.05, transformOrigin: "50% 50%", duration: 2 },
        "<"
      )
      .to(playerNumber, { x: "-=50" }, "<0.1")
      .to(playerName, { x: "+=50" }, "<")
      .to(playerLastName, { x: "+=50" }, "<0.1");
    return tl;
  }

  // Build main timeline
  const tl = $gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1 });
  tl.add(abbreviation())
    .set(abbreviationGroup, { autoAlpha: 0 })
    .set(teamNameGroup, { autoAlpha: 1 })
    .add(staggerTexts(), "-=1")
    .add(playerBigTl(), "-=1")
    .add(staggerWords(), "-=1")
    .add(showPlayer(), "-=1");

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
      // ScrollTrigger visibility-controlled loop; fallback to autoPlay
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
