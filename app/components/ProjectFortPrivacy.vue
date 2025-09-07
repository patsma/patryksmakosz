<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--fort-privacy"
  >
    <div ref="logoRef" class="logo-animation-wrapper">
      <div ref="innerLogoRef" class="logo-animation">
        <FortPrivacySVG ref="svgComponentRef" />
      </div>
    </div>
  </div>
  <!--
    Structure mirrors other project components (e.g., ProjectZaksa.vue):
    .logo-animation-wrapper > .logo-animation > <svg/>
    Styles are centralized under app/assets/scss/components/_animation-components.scss
  -->
</template>

<script setup>
// Nuxt/GSAP utilities
const { $gsap } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
const { $DrawSVGPlugin } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

// Core refs: mirrors ProjectZaksa.vue for consistency
const containerRef = ref(null);
const logoRef = ref(null);
const innerLogoRef = ref(null);
const timeline = ref(null);
let gsapCtx = null;
let scrollTriggerInstance = null;

// SVG component ref – assumes FortPrivacySVG exposes svgRootRef like other SVG components
const svgComponentRef = ref(null);

// Props for configurability and parity with other animation components
const props = defineProps({
  /**
   * @type {boolean}
   * Show GSDevTools (minimal) for debugging
   */
  showDevTools: { type: Boolean, default: false },
  /**
   * @type {string}
   * Unique id for GSDevTools instance and svg defs scoping prefix
   */
  devToolsId: {
    type: String,
    default: () => `fort-privacy-${Math.random().toString(36).slice(2, 9)}`,
  },
  /**
   * @type {boolean}
   * Autoplay when ScrollTrigger is disabled
   */
  autoPlay: { type: Boolean, default: false },
  /**
   * @type {boolean}
   * Use ScrollTrigger to play/pause based on visibility
   */
  useScrollTrigger: { type: Boolean, default: true },
  /**
   * @type {string}
   * ScrollTrigger start position
   */
  stStart: { type: String, default: "top center" },
  /**
   * @type {string}
   * ScrollTrigger end position
   */
  stEnd: { type: String, default: "bottom center" },
  /**
   * @type {number}
   * Global playback speed for the master timeline
   */
  timeScale: { type: Number, default: 1 },
});

// Scoped selector helpers will be created after ID scoping

/**
 * Port of legacy public/oldportfolio/logo-animation/fort-privacy/main.js
 * Modernized to GSAP 3, DrawSVG calls are replaced with simple reveals for portability.
 * Keeps original labels, structure, and relative timings where feasible.
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  const svgRoot =
    svgComponentRef.value?.svgRootRef ||
    innerLogoRef.value?.querySelector("svg");
  if (!svgRoot) {
    console.warn("FortPrivacy: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions and compute selector remaps
  const idPrefix =
    props.devToolsId || `fort-privacy-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert basic shapes to paths to ensure DrawSVG works across all elements (local to this SVG)
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

  // Local query helpers scoped to this SVG root with ID remapping
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) => Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)) || []);

  // Reveal inner container – legacy relied on visibility toggles on layout wrappers
  $gsap.set(innerLogoRef.value, { autoAlpha: 1 });

  // Element handles from legacy selectors
  const BG = q("#BG");
  const IconsPaths = qa("g#Icons g path");
  const IconsGroups = qa("g#Icons g");
  const ShadowBottom = q(".bottom__shadow");
  const _3D_Logo = q("#_3D_Logo");
  const Figure = q("#Figure");
  const Glow = q("#Glow");
  const Glowing_Lines = q("#Glowing_Lines");
  const checkboard = q("#checkboard");
  const shield = q("#shield");
  const profile = q("#profile");
  const pilars = q("#pilars");
  const Circles = qa("#Circles > g > path");

  const glowing_left_overlay = qa("#glowing__line__left__overlay > path");
  const glowing_top_overlay = qa("#glowing__line__top__overlay > path");
  const glowing_right_overlay = qa("#glowing__line__right__overlay > path");
  const glowing_bottom_overlay = qa("#glowing__line__bottom__overlay > path");

  const glowing_left_overlay_second = qa(
    "#glowing__line__left__overlay__second > path"
  );
  const glowing_top_overlay_second = qa(
    "#glowing__line__top__overlay__second > path"
  );
  const glowing_right_overlay_second = qa(
    "#glowing__line__right__overlay__second > path"
  );
  const glowing_bottom_overlay_second = qa(
    "#glowing__line__bottom__overlay__second > path"
  );

  // Filters inside <defs>
  const glow2Blur = q("#glow2 feGaussianBlur");
  const glowCheckboardBlur = q("#glowCheckboard feGaussianBlur");
  const glow3Blur = q("#glow3 feGaussianBlur");
  const glowShieldBlur = q("#glowShield feGaussianBlur");
  const glow4Blur = q("#glow4 feGaussianBlur");
  const glowProfileBlur = q("#glowProfile feGaussianBlur");
  const glow1Blur = q("#glow1 feGaussianBlur");
  const glowPilarsBlur = q("#glowPilars feGaussianBlur");

  // Initial states
  if (Glow) $gsap.set(Glow, { autoAlpha: 0 });

  

  // tl1 – initial reveal
  const tl1 = $gsap.timeline();
  tl1
    .add("initial-reveal")
    // Legacy had section fade-in; we fade in container + base groups first
    .from(BG, { duration: 0.3, autoAlpha: 0 }, "initial-reveal")
    .from(Figure, { duration: 0.3, autoAlpha: 0 }, "initial-reveal")
    // Then perform DrawSVG for icons and circles under the same label as legacy
    .add("show-icons-circles")
    .from(
      IconsPaths,
      { duration: 0.2, drawSVG: 0, stagger: 0.01, ease: "sine.inOut" },
      "show-icons-circles"
    )
    .from(
      Circles,
      { duration: 0.2, drawSVG: 0, stagger: 0.01, ease: "sine.inOut" },
      "show-icons-circles"
    )
    // After drawing, reveal glow lines and drop the 3D shape per original
    .from(
      Glowing_Lines,
      {
        duration: 1,
        autoAlpha: 0,
        transformOrigin: "50% 50%",
        ease: "back.inOut",
      },
      "show-icons-circles"
    )
    .from(
      _3D_Logo,
      { duration: 0.7, autoAlpha: 0, yPercent: -100, ease: "sine.inOut" },
      "show-icons-circles+=1"
    )
    .from(
      ShadowBottom,
      {
        duration: 0.2,
        scale: 1.1,
        autoAlpha: 0,
        transformOrigin: "50% 50%",
        ease: "none",
      },
      "show-icons-circles+=1.5"
    );
  tl1.timeScale(0.7);

  // tl2 – filter pulses and overlay flickers (first pass)
  const tl2 = $gsap.timeline();
  tl2
    .add("filter-and-glow-one")
    .fromTo(
      checkboard,
      { scale: 1, transformOrigin: "50% 50%" },
      {
        duration: 0.6,
        autoAlpha: 1,
        scale: 1.2,
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-one"
    )
    .to(
      glow2Blur,
      { duration: 0.5, attr: { stdDeviation: 0 }, repeat: 5, yoyo: true },
      "filter-and-glow-one"
    )
    .to(
      glowCheckboardBlur,
      {
        duration: 0.6,
        attr: { stdDeviation: 15 },
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-one"
    )
    .from(
      glowing_left_overlay,
      { duration: 1, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-one"
    )
    .to(
      glowing_left_overlay,
      { duration: 1, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-one+=0.5"
    )
    .to(Glow, { duration: 0.6, autoAlpha: 0.9, repeat: 1, yoyo: true }, "-=0.5")
    .to(Glow, { duration: 0.6, autoAlpha: 0 })
    .add("filter-and-glow-two", "-=3.5")
    .fromTo(
      shield,
      { scale: 1, transformOrigin: "50% 50%" },
      {
        duration: 0.6,
        autoAlpha: 1,
        scale: 1.2,
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-two"
    )
    .to(
      glow3Blur,
      { duration: 0.5, attr: { stdDeviation: 0 }, repeat: 5, yoyo: true },
      "filter-and-glow-two"
    )
    .to(
      glowShieldBlur,
      {
        duration: 0.6,
        attr: { stdDeviation: 15 },
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-two"
    )
    .from(
      glowing_top_overlay,
      { duration: 1, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-two"
    )
    .to(
      glowing_top_overlay,
      { duration: 1, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-two+=0.5"
    )
    .to(Glow, { duration: 0.6, autoAlpha: 0.9, repeat: 1, yoyo: true }, "-=0.5")
    .to(Glow, { duration: 0.6, autoAlpha: 0 })
    .add("filter-and-glow-three", "-=3.4")
    .fromTo(
      profile,
      { scale: 1, transformOrigin: "50% 50%" },
      {
        duration: 0.6,
        autoAlpha: 1,
        scale: 1.2,
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-three"
    )
    .to(
      glow4Blur,
      { duration: 0.5, attr: { stdDeviation: 0 }, repeat: 5, yoyo: true },
      "filter-and-glow-three"
    )
    .to(
      glowProfileBlur,
      {
        duration: 0.6,
        attr: { stdDeviation: 15 },
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-three"
    )
    .from(
      glowing_right_overlay,
      { duration: 1, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-three"
    )
    .to(
      glowing_right_overlay,
      { duration: 1, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-three+=0.5"
    )
    .to(Glow, { duration: 0.6, autoAlpha: 0.9, repeat: 1, yoyo: true }, "-=0.5")
    .to(Glow, { duration: 0.6, autoAlpha: 0 })
    .add("filter-and-glow-four", "-=3.9")
    .fromTo(
      pilars,
      { scale: 1, transformOrigin: "50% 50%" },
      {
        duration: 0.6,
        autoAlpha: 1,
        scale: 1.2,
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-four"
    )
    .to(
      glow1Blur,
      { duration: 0.5, attr: { stdDeviation: 0 }, repeat: 5, yoyo: true },
      "filter-and-glow-four"
    )
    .to(
      glowPilarsBlur,
      {
        duration: 0.6,
        attr: { stdDeviation: 15 },
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-four"
    )
    .from(
      glowing_bottom_overlay,
      { duration: 0.5, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-four"
    )
    .to(
      glowing_bottom_overlay,
      { duration: 0.5, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-four+=0.5"
    );
  tl2.timeScale(2);

  // tl4 – second pass overlays with repeat & repeatDelay
  const tl4 = $gsap.timeline({ repeat: 1, repeatDelay: 3.5 });
  tl4
    .add("filter-and-glow-one")
    .fromTo(
      checkboard,
      { scale: 1, transformOrigin: "50% 50%" },
      {
        duration: 0.6,
        autoAlpha: 1,
        scale: 1.2,
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-one"
    )
    .to(
      glow2Blur,
      { duration: 0.5, attr: { stdDeviation: 0 }, repeat: 5, yoyo: true },
      "filter-and-glow-one"
    )
    .to(
      glowCheckboardBlur,
      {
        duration: 0.6,
        attr: { stdDeviation: 15 },
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-one"
    )
    .from(
      glowing_left_overlay_second,
      { duration: 1, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-one"
    )
    .to(
      glowing_left_overlay_second,
      { duration: 1, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-one+=0.5"
    )
    .add("filter-and-glow-two", "-=2.5")
    .fromTo(
      shield,
      { scale: 1, transformOrigin: "50% 50%" },
      {
        duration: 0.6,
        autoAlpha: 1,
        scale: 1.2,
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-two"
    )
    .to(
      glow3Blur,
      { duration: 0.5, attr: { stdDeviation: 0 }, repeat: 5, yoyo: true },
      "filter-and-glow-two"
    )
    .to(
      glowShieldBlur,
      {
        duration: 0.6,
        attr: { stdDeviation: 15 },
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-two"
    )
    .from(
      glowing_top_overlay_second,
      { duration: 1, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-two"
    )
    .to(
      glowing_top_overlay_second,
      { duration: 1, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-two+=0.5"
    )
    .add("filter-and-glow-three", "-=2.5")
    .fromTo(
      profile,
      { scale: 1, transformOrigin: "50% 50%" },
      {
        duration: 0.6,
        autoAlpha: 1,
        scale: 1.2,
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-three"
    )
    .to(
      glow4Blur,
      { duration: 0.5, attr: { stdDeviation: 0 }, repeat: 5, yoyo: true },
      "filter-and-glow-three"
    )
    .to(
      glowProfileBlur,
      {
        duration: 0.6,
        attr: { stdDeviation: 15 },
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-three"
    )
    .from(
      glowing_right_overlay_second,
      { duration: 1, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-three"
    )
    .to(
      glowing_right_overlay_second,
      { duration: 1, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-three+=0.5"
    )
    .add("filter-and-glow-four", "-=2.5")
    .fromTo(
      pilars,
      { scale: 1, transformOrigin: "50% 50%" },
      {
        duration: 0.6,
        autoAlpha: 1,
        scale: 1.2,
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-four"
    )
    .to(
      glow1Blur,
      { duration: 0.5, attr: { stdDeviation: 0 }, repeat: 5, yoyo: true },
      "filter-and-glow-four"
    )
    .to(
      glowPilarsBlur,
      {
        duration: 0.6,
        attr: { stdDeviation: 15 },
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      },
      "filter-and-glow-four"
    )
    .from(
      glowing_bottom_overlay_second,
      { duration: 0.5, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-four"
    )
    .to(
      glowing_bottom_overlay_second,
      { duration: 0.5, autoAlpha: 0, stagger: 0.1, ease: "steps(1)" },
      "filter-and-glow-four+=0.5"
    );
  tl4.timeScale(2);

  // Master timeline – mirrors legacy order/overlaps
  const masterTl = $gsap.timeline({ repeat: -1, paused: true });
  masterTl.add(tl1).add(tl2).to(Glow, { duration: 1, autoAlpha: 1 }).add(tl4);

  // Global playback speed
  masterTl.timeScale(props.timeScale);

  // DevTools (optional)
  if (props.showDevTools) {
    nextTick(() => {
      try {
        $GSDevTools.create({
          animation: masterTl,
          container: containerRef.value,
          minimal: true,
          id: props.devToolsId,
          globalSync: false,
        });
        // Ensure timeScale remains applied after DevTools initialization
        masterTl.timeScale(props.timeScale);
      } catch (e) {
        console.debug("FortPrivacy: GSDevTools error", e);
      }
    });
  }

  timeline.value = masterTl;
  return masterTl;
};

// Lifecycle: mount, build animation, wire ScrollTrigger
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
      } else if (props.autoPlay || props.showDevTools) {
        tl.play();
      }
    }, containerRef.value);
  });
});

// Cleanup
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

// Public control API
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
/* Visual styles are centralized under app/assets/scss/components/_animation-components.scss */
</style>
