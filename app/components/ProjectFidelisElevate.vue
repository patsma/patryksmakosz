<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--fidelis-elevate"
  >
    <FidelisElevateSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectFidelisElevate - interactive hover animation
 * - NOT a standard loop/play-pause component
 * - Hovering text groups rotates the wheel and reveals corresponding icons
 * - Improved hover targeting: listen on description text groups too (wider hit area)
 * - Ported from old portfolio /animations/fidelis-elevate
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
    default: () => `fidelis-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom top" },
});

const setupInteraction = () => {
  const svgWheel = svgComponentRef.value?.svgWheelRef;
  const svgText = svgComponentRef.value?.svgTextRef;
  if (!svgWheel || !svgText) {
    console.warn("ProjectFidelisElevate: SVG refs not found");
    return;
  }

  // Scope IDs for both SVGs
  const wheelPrefix = `${props.devToolsId}-w`;
  const textPrefix = `${props.devToolsId}-t`;
  const wheelIdMap = scopeSvgDefsIds(svgWheel, wheelPrefix);
  const textIdMap = scopeSvgDefsIds(svgText, textPrefix);

  // Convert shapes to paths
  try {
    if ($MorphSVGPlugin) {
      for (const svg of [svgWheel, svgText]) {
        const shapes = svg.querySelectorAll(
          "circle, rect, ellipse, line, polygon, polyline"
        );
        if (shapes && shapes.length) {
          $MorphSVGPlugin.convertToPath(shapes);
        }
      }
    }
  } catch (e) {}

  // Query helpers for each SVG
  const qWheel = (sel) =>
    svgWheel.querySelector(remapIdSelectors(sel, wheelIdMap));
  const qaWheel = (sel) =>
    Array.from(svgWheel.querySelectorAll(remapIdSelectors(sel, wheelIdMap)));
  const qText = (sel) =>
    svgText.querySelector(remapIdSelectors(sel, textIdMap));
  const qaText = (sel) =>
    Array.from(svgText.querySelectorAll(remapIdSelectors(sel, textIdMap)));

  // Wheel elements (in left SVG)
  const circleFidelist = qWheel("#circle");
  const centerText = qWheel("#text");
  const blueIconCenter = qWheel("#blueIconCenter");
  const greenIconCenter = qWheel("#greenIconCenter");
  const redIconCenter = qWheel("#redIconCenter");

  // Text elements (in right SVG)
  const blueText = qText("#blue__text");
  const blueSubText = qaText("#text--network > *");
  const networkDesc = qText("#text--network");

  const redText = qText("#red__text");
  const redSubText = qaText("#text--deception > *");
  const deceptionDesc = qText("#text--deception");

  const greenText = qText("#green__text");
  const greenSubText = qaText("#text--endpoint > *");
  const endpointDesc = qText("#text--endpoint");

  const allIcons = [redIconCenter, greenIconCenter, blueIconCenter].filter(
    Boolean
  );

  // All sub-text groups for batch operations
  const allSubText = [...blueSubText, ...redSubText, ...greenSubText];

  // Reveal the wrapper (hidden by CSS to prevent FOUC)
  const wrapper = containerRef.value?.querySelector(".fidelis-svg-wrapper");
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  if (wrapper) $gsap.set(wrapper, { autoAlpha: 1 });

  // Set initial state for description text (hidden, ready for stagger-in)
  $gsap.set(allSubText, { autoAlpha: 0, y: 7 });

  // Add invisible hit-area rects to SVG groups for better hover targeting
  // SVG <g> elements only capture events on visible child paths, not empty space
  const addHitArea = (group) => {
    if (!group) return;
    const bbox = group.getBBox();
    const rect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    rect.setAttribute("x", bbox.x);
    rect.setAttribute("y", bbox.y);
    rect.setAttribute("width", bbox.width);
    rect.setAttribute("height", bbox.height);
    rect.setAttribute("fill", "transparent");
    rect.style.cursor = "pointer";
    group.insertBefore(rect, group.firstChild);
  };

  [blueText, networkDesc, redText, deceptionDesc, greenText, endpointDesc]
    .filter(Boolean)
    .forEach(addHitArea);

  // Track active section to prevent re-triggering
  let activeSection = null;
  let activeTl = null;

  const sectionConfig = {
    blue: {
      hideIcons: [redIconCenter, greenIconCenter],
      showIcon: blueIconCenter,
      subText: blueSubText,
      rotation: 60,
    },
    red: {
      hideIcons: [blueIconCenter, greenIconCenter],
      showIcon: redIconCenter,
      subText: redSubText,
      rotation: -185,
    },
    green: {
      hideIcons: [blueIconCenter, redIconCenter],
      showIcon: greenIconCenter,
      subText: greenSubText,
      rotation: -65,
    },
  };

  const textPanel = svgText.closest(".fidelis-text");

  const activateSection = (color) => {
    if (activeSection === color) return;
    activeSection = color;

    // Kill any running timeline
    if (activeTl) activeTl.kill();

    const cfg = sectionConfig[color];
    const otherSubText = allSubText.filter(
      (el) => !cfg.subText.includes(el)
    );

    activeTl = $gsap.timeline();

    // Fade out other icons, center text, and other descriptions
    activeTl.to(
      [...cfg.hideIcons.filter(Boolean), centerText].filter(Boolean),
      { duration: 0.4, autoAlpha: 0, ease: "power2.inOut" },
      0
    );
    activeTl.to(
      otherSubText,
      { duration: 0.3, autoAlpha: 0, y: -10, ease: "power2.in" },
      0
    );

    // Rotate wheel smoothly
    activeTl.to(
      circleFidelist,
      {
        duration: 0.8,
        rotation: cfg.rotation,
        transformOrigin: "center center",
        ease: "power2.inOut",
      },
      0
    );

    // Fade in active icon with scale
    activeTl.fromTo(
      cfg.showIcon,
      { autoAlpha: 0, scale: 0.8, transformOrigin: "center center" },
      { duration: 0.6, autoAlpha: 1, scale: 1, ease: "back.out(1.4)" },
      0.2
    );

    // Stagger in description text children
    activeTl.fromTo(
      cfg.subText,
      { autoAlpha: 0, y: 7 },
      {
        duration: 0.5,
        autoAlpha: 1,
        y: 0,
        ease: "power2.out",
        stagger: { each: 0.01, from: "start" },
      },
      0.15
    );
  };

  const resetToIdle = () => {
    activeSection = null;
    if (activeTl) activeTl.kill();

    activeTl = $gsap.timeline();

    // Fade out all icons and descriptions
    activeTl.to(allIcons, { duration: 0.4, autoAlpha: 0, ease: "power2.in" }, 0);
    activeTl.to(
      allSubText,
      { duration: 0.3, autoAlpha: 0, y: -10, ease: "power2.in" },
      0
    );

    // Rotate wheel back
    activeTl.to(
      circleFidelist,
      {
        duration: 0.8,
        rotation: 0,
        transformOrigin: "center center",
        ease: "power2.inOut",
      },
      0
    );

    // Fade center text back in with subtle scale
    activeTl.fromTo(
      centerText,
      { scale: 0.95, transformOrigin: "center center" },
      { duration: 0.6, autoAlpha: 1, scale: 1, ease: "power2.out" },
      0.2
    );
  };

  // Hover zones: listen on both title AND description groups
  const addHoverListeners = (titleEl, descEl, color) => {
    const handler = () => activateSection(color);
    if (titleEl) {
      titleEl.style.cursor = "pointer";
      titleEl.addEventListener("mouseenter", handler);
    }
    if (descEl) {
      descEl.style.cursor = "pointer";
      descEl.addEventListener("mouseenter", handler);
    }
  };

  addHoverListeners(blueText, networkDesc, "blue");
  addHoverListeners(redText, deceptionDesc, "red");
  addHoverListeners(greenText, endpointDesc, "green");

  // Reset on leaving the text panel
  if (textPanel) {
    textPanel.addEventListener("mouseleave", resetToIdle);
  }
};

onMounted(() => {
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
      setupInteraction();
    }, containerRef.value);
  });
});

onUnmounted(() => {
  if (gsapCtx) gsapCtx.revert();
});

defineExpose({
  containerRef,
  timeline,
});
</script>

<style scoped>
/* Styling centralized under app/assets/scss/components/_animation-components.scss */
</style>
