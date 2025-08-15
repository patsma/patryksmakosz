<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--spectrum"
  >
    <SpectrumLogoSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectSpectrum animation component
 * - Follows the same approach as ProjectArtTech.vue/ProjectBlueberry.vue
 * - Draws the vertical lines inside the SVG mask repeatedly
 * - Paused by default for grid performance
 */

const { $gsap } = useNuxtApp();
const { $DrawSVGPlugin } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

const containerRef = ref(null);
const timeline = ref(null);
const svgComponentRef = ref(null);
// GSAP context for scoped animations & automatic cleanup
let gsapCtx = null;
let scrollTriggerInstance = null;

const props = defineProps({
  showDevTools: { type: Boolean, default: false },
  devToolsId: {
    type: String,
    default: () => `spectrum-${Math.random().toString(36).slice(2, 9)}`,
  },
  // Helpful for testing standalone (grid keeps paused by default)
  autoPlay: { type: Boolean, default: false },
  // ScrollTrigger-controlled autoplay (enabled by default for performance)
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top 80%" },
  stEnd: { type: String, default: "bottom 20%" },
});

const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectSpectrum: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions and compute selector remaps
  const idPrefix =
    props.devToolsId || `spectrum-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert only shapes inside this SVG to paths for draw/morph compatibility
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

  // Scope queries to this SVG instance
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)));

  // Newest animation structure variables (presence-checked)
  // Prefer component refs for speed/safety
  const svg = svgComponentRef.value;
  const paths = qa("#logoPaths *");
  const mask = q("#mask");
  const logoMask = q("#logoMask");
  const logoInnerMask = q("#logoInnerMask");
  const logoMaskLines = Array.from(
    svg?.logoMaskLinesRef?.querySelectorAll("*") || qa("#logoMaskLines *")
  );
  const logoFills = svg?.logoFillsRef || q("#logoFills");
  const logoFillsTop = Array.from(
    svg?.logoFillsTopRef?.querySelectorAll("*") || qa("#logoFillsTop *")
  );
  const logoFillsBottom = Array.from(
    svg?.logoFillsBottomRef?.querySelectorAll("*") || qa("#logoFillsBottom *")
  );
  const gradientBezNazwy55 = q("#Gradient_bez_nazwy_55");
  const spectrumLogoAnimation =
    svg?.spectrumLogoRef || q("#spectrumLogoAnimation");
  const logoText = svg?.logoTextRef || q("#logoText");
  const spectrum = Array.from(
    svg?.spectrumTextRef?.querySelectorAll("*") || qa("#spectrum *")
  );
  const way = Array.from(
    svg?.wayTextRef?.querySelectorAll("*") || qa("#way *")
  );
  const logoIconPaths = svg?.logoIconPathsRef || q("#logoIconPaths");
  const logoPathsTop = Array.from(
    svg?.logoPathsTopRef?.querySelectorAll("*") || qa("#logoPathsTop *")
  );
  const logoPathsBottom = Array.from(
    svg?.logoPathsBottomRef?.querySelectorAll("*") || qa("#logoPathsBottom *")
  );
  const logoIconFills = svg?.logoIconFillsRef || q("#logoIconFills");
  const dummy = svg?.dummyRef || q("#dummy");

  // Fallbacks for current SVG (which may not include the new groups)
  const fallbackLines = logoMaskLines.length
    ? logoMaskLines
    : qa("#logoMaskLines line");
  const fallbackSpectrum = spectrum.length ? spectrum : qa("#logoText > *");
  const fallbackWay = way.length ? way : [];

  // Timelines
  const tlMaster = $gsap.timeline({ repeat: -1, paused: true });
  const tlIcon = $gsap.timeline();
  const tlIconHide = $gsap.timeline();
  const tlText = $gsap.timeline();
  const tlTextHide = $gsap.timeline();

  // Icon draw/hide and fills
  tlIcon.add("draw-lines");
  if (logoPathsTop.length) {
    tlIcon.from(
      logoPathsTop,
      {
        drawSVG: "100% 100%",
        duration: 1,
        stagger: 0.1,
        ease: "sine.out",
      },
      "draw-lines"
    );
  } else if (fallbackLines.length) {
    tlIcon.to(
      fallbackLines,
      {
        drawSVG: "100% 100%",
        stagger: 0.1,
        ease: "linear",
      },
      "draw-lines"
    );
  }
  if (logoPathsBottom.length) {
    tlIcon.from(
      logoPathsBottom,
      {
        drawSVG: "100% 100%",
        duration: 1,
        stagger: 0.3,
        ease: "sine.out",
      },
      "draw-lines"
    );
  }
  tlIcon
    .add("hide-lines", "-=4")
    .to(
      logoPathsTop,
      {
        drawSVG: "50% 50%",
        duration: 1,
        stagger: 0.1,
        ease: "sine.out",
      },
      "hide-lines"
    )
    .to(
      logoPathsBottom,
      {
        drawSVG: "50% 50%",
        duration: 1,
        stagger: 0.3,
        ease: "sine.out",
      },
      "hide-lines"
    )
    .add("show-fills", "-=6.5")
    .from(
      logoFillsTop,
      {
        autoAlpha: 0,
        duration: 1.75,
        y: -4,
        stagger: 0.1,
        ease: "sine.out",
      },
      "show-fills"
    )
    .from(
      logoFillsBottom,
      {
        autoAlpha: 0,
        duration: 1,
        stagger: 0.3,
        ease: "sine.out",
      },
      "show-fills"
    );
  tlIcon.timeScale(3);

  tlIconHide
    .add("hide-fills")
    .to(
      logoFillsTop,
      {
        autoAlpha: 0,
        duration: 1.75,
        y: -4,
        stagger: 0.1,
        ease: "sine.out",
      },
      "hide-fills"
    )
    .to(
      logoFillsBottom,
      {
        autoAlpha: 0,
        duration: 1,
        stagger: 0.3,
        ease: "sine.out",
      },
      "hide-fills"
    );
  tlIconHide.timeScale(3);

  // Text show/hide
  if (fallbackSpectrum.length) {
    tlText.from(spectrum.length ? spectrum : fallbackSpectrum, {
      autoAlpha: 0,
      duration: 1,
      stagger: 0.1,
      ease: "sine.out",
    });
  }
  if (fallbackWay.length) {
    tlText.from(
      way,
      {
        autoAlpha: 0,
        duration: 1,
        stagger: 0.1,
        ease: "sine.out",
      },
      "-=0.5"
    );
  }
  if (fallbackSpectrum.length) {
    tlTextHide.to(spectrum.length ? spectrum : fallbackSpectrum, {
      autoAlpha: 0,
      duration: 1,
      stagger: 0.1,
      ease: "sine.out",
    });
  }
  if (fallbackWay.length) {
    tlTextHide.to(
      way,
      {
        autoAlpha: 0,
        duration: 1,
        stagger: 0.1,
        ease: "sine.out",
      },
      "-=0.5"
    );
  }

  // Master sequence (keep paused by default)
  tlMaster
    .add(tlIcon)
    .add(tlText, "-=2")
    // original code uses body; scope to container for component encapsulation
    .to(containerRef.value, { autoAlpha: 1, duration: 4 })
    .add(tlIconHide)
    .add(tlTextHide, "-=2");

  if (props.showDevTools) {
    nextTick(() => {
      try {
        $GSDevTools.create({
          minimal: true,
          repeat: true,
          animation: tlMaster,
          container: containerRef.value,
          id: props.devToolsId,
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
      // Use ScrollTrigger to control playback when visible
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
/* Uses shared styles from app/assets/scss/components/_animation-components.scss */
</style>
