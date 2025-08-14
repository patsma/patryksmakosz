<template>
  <div ref="containerRef" class="animation-container">
    <!-- Keep SVG as a child component for clarity and reuse -->
    <ArtTechLogoSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectArtTech animation component
 * - Mirrors the standardized API used by ProjectBlueberry.vue
 * - Uses refs instead of query selectors outside of the SVG root
 * - Ports the GSAP timeline from old portfolio /art-tech
 */

// Nuxt/GSAP plugins (provided via @hypernym/nuxt-gsap in nuxt.config.ts)
const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $DrawSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();

// Standard container/timeline refs
const containerRef = ref(null);
const timeline = ref(null);

// Ref for the SVG component instance
const svgComponentRef = ref(null);

// Props consistent with ProjectBlueberry
const props = defineProps({
  /**
   * @type {boolean}
   * Whether to show GSDevTools for debugging and control
   */
  showDevTools: {
    type: Boolean,
    default: false,
  },

  /**
   * @type {string}
   * Custom ID for the GSDevTools instance
   */
  devToolsId: {
    type: String,
    default: () => `art-tech-${Math.random().toString(36).slice(2, 9)}`,
  },
});

/**
 * Build the GSAP timeline using the inline SVG IDs
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  // Ensure SVG is mounted
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectArtTech: SVG root not found");
    return null;
  }

  // Convert simple shapes to paths for morph/draw operations
  try {
    $MorphSVGPlugin &&
      $MorphSVGPlugin.convertToPath(
        "circle, rect, ellipse, line, polygon, polyline"
      );
  } catch (e) {}

  // Query elements by ID from within the SVG scope only
  const q = (sel) => svgRoot.querySelector(sel);
  const qa = (sel) => Array.from(svgRoot.querySelectorAll(sel));

  const artTech = q("#artTech");
  const artTechText = q("#artTechText");
  const tech = qa("#tech *");
  const art = qa("#art *");
  const letterAMasks = qa("#letterAMasks *");
  const letterRPaths = qa("#letterRpaths *");
  const letterTMasks = qa("#letterTMasks *");
  const letterRfill = q("#letterRfill");
  const lineMask1 = q("#lineMask1");
  const lineMask2 = q("#lineMask2");
  const lineMask3 = q("#lineMask3");
  const lineMask4 = q("#lineMask4");
  const lineMask5 = q("#lineMask5");
  const lineMask6 = q("#lineMask6");
  const lineMask7 = q("#lineMask7");
  const lineMask8 = q("#lineMask8");
  const lineMask9 = q("#lineMask9");
  const lineMask10 = q("#lineMask10");
  const lineMask11 = q("#lineMask11");
  const lineMask12 = q("#lineMask12");
  const letterA = q("#letterA");
  const letterT = q("#letterT");
  const line1 = q("#line1");
  const line2 = q("#line2");
  const line3 = q("#line3");
  const line4 = q("#line4");
  const line5 = q("#line5");
  const line6 = q("#line6");
  const line7 = q("#line7");
  const line8 = q("#line8");
  const line9 = q("#line9");
  const line10 = q("#line10");
  const line11 = q("#line11");
  const line12 = q("#line12");
  const shadows = q("#shadows");
  const letterA01Rmask = q("#letterA01Rmask");
  const letterA02Rmask = q("#letterA02Rmask");
  const letterT01Rmask = q("#letterT01Rmask");
  const letterT02Rmask = q("#letterT02Rmask");
  const letterT03Rmask = q("#letterT03Rmask");
  const letterT04Rmask = q("#letterT04Rmask");

  // Helper to clone and setup glitch elements
  function createGlitchElements(
    element,
    idSuffix,
    parentElement,
    insertFirst = true
  ) {
    if (!element || !parentElement) return null;
    const clone = element.cloneNode(true);
    clone.id = `${element.id}${idSuffix}`;
    if (insertFirst) {
      if (parentElement.firstChild) {
        parentElement.insertBefore(clone, parentElement.firstChild);
      } else {
        parentElement.appendChild(clone);
      }
    } else {
      parentElement.appendChild(clone);
    }
    $gsap.set(clone, {
      x: "+=5",
      y: "+=5",
      fill: "#ff00ff",
      opacity: 0,
    });
    return clone;
  }

  function randomGlitchValue(base, range) {
    return base + Math.random() * range - range / 2;
  }

  function glitchAnimation(element) {
    const tl = $gsap.timeline({ repeat: 1, yoyo: true });
    for (let i = 0; i < 5; i++) {
      tl.to(element, {
        duration: 0.02,
        x: `+=${randomGlitchValue(2, 4)}`,
        y: `+=${randomGlitchValue(1, 2)}`,
        fill: $gsap.utils.random(["#00fe03", "#00ffff", "#1100a3", "#e802fc"]),
        ease: "rough({ strength: 2, points: 20, randomize: true })",
        opacity: $gsap.utils.random([0, 1]),
      });
    }
    return tl;
  }

  function createGlitchAnimation(element) {
    return function () {
      const tl = $gsap.timeline({ repeat: 1, yoyo: true });
      for (let i = 0; i < 5; i++) {
        tl.to(element, {
          duration: 0.02,
          x: `+=${randomGlitchValue(2, 4)}`,
          y: `+=${randomGlitchValue(1, 2)}`,
          fill: $gsap.utils.random([
            "#00fe03",
            "#00ffff",
            "#1100a3",
            "#e802fc",
          ]),
          ease: "rough({ strength: 2, points: 20, randomize: true })",
          opacity: $gsap.utils.random([0, 1]),
        });
      }
      return tl;
    };
  }

  // Prepare clones for glitch effect
  const svgRootNode = q("#artTech");
  const glitchLetterRfill = createGlitchElements(
    letterRfill,
    "Glitch",
    svgRootNode,
    false
  );
  const glitchLetterA = createGlitchElements(letterA, "Glitch", svgRootNode);
  const glitchArtTech = createGlitchElements(artTech, "Glitch", svgRootNode);
  const glitchLetterT = createGlitchElements(letterT, "Glitch", svgRootNode);
  const glitchLine1 = createGlitchElements(line1, "Glitch", svgRootNode);
  const glitchLine2 = createGlitchElements(line2, "Glitch", svgRootNode);
  const glitchLine3 = createGlitchElements(line3, "Glitch", svgRootNode);
  const glitchLine4 = createGlitchElements(line4, "Glitch", svgRootNode);
  const glitchLine5 = createGlitchElements(line5, "Glitch", svgRootNode);
  const glitchLine6 = createGlitchElements(line6, "Glitch", svgRootNode);
  const glitchLine7 = createGlitchElements(line7, "Glitch", svgRootNode);
  const glitchLine8 = createGlitchElements(line8, "Glitch", svgRootNode);
  const glitchLine9 = createGlitchElements(line9, "Glitch", svgRootNode);
  const glitchLine10 = createGlitchElements(line10, "Glitch", svgRootNode);
  const glitchLine11 = createGlitchElements(line11, "Glitch", svgRootNode);
  const glitchLine12 = createGlitchElements(line12, "Glitch", svgRootNode);
  const glitchLetterRPaths = createGlitchElements(
    letterRPaths?.[0],
    "Glitch",
    svgRootNode
  );
  const glitchArt0 = createGlitchElements(art?.[0], "Glitch", svgRootNode);
  const glitchArt1 = createGlitchElements(art?.[1], "Glitch", svgRootNode);
  const glitchArt3 = createGlitchElements(art?.[3], "Glitch", svgRootNode);
  const glitchTech0 = createGlitchElements(tech?.[0], "Glitch", svgRootNode);
  const glitchTech4 = createGlitchElements(tech?.[4], "Glitch", svgRootNode);

  const glitchAnimLetterRfill = createGlitchAnimation(glitchLetterRfill);

  // Initial state
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(
    [
      ...letterRPaths,
      letterRfill,
      letterA01Rmask,
      letterA02Rmask,
      letterT01Rmask,
      letterT02Rmask,
      letterT03Rmask,
      letterT04Rmask,
    ],
    { autoAlpha: 0 }
  );
  $gsap.set(artTech, { y: 100 });

  // Build main timeline
  const tl = $gsap.timeline({
    paused: true,
    delay: 0.1,
    repeat: -1,
    repeatDelay: 2.5,
  });

  // Ensure DrawSVG is available
  try {
    $DrawSVGPlugin && $DrawSVGPlugin.getLength && true;
  } catch (e) {}

  tl.set(letterA01Rmask, { drawSVG: "100% 100%" });
  tl.set(letterA02Rmask, { drawSVG: "100% 100%" });
  tl.set(letterT01Rmask, { drawSVG: "100% 100%" });
  tl.set(letterT02Rmask, { drawSVG: "100% 100%" });
  tl.set(letterT03Rmask, { drawSVG: "100% 100%" });
  tl.set(letterT04Rmask, { drawSVG: "100% 100%" });
  tl.set(
    [
      letterA01Rmask,
      letterA02Rmask,
      letterT01Rmask,
      letterT02Rmask,
      letterT03Rmask,
      letterT04Rmask,
    ],
    { autoAlpha: 1 }
  );

  tl.to(letterA01Rmask, { duration: 0.1, drawSVG: "0 50%" });
  tl.to(letterA01Rmask, { drawSVG: "0 0%" });
  tl.add("letterA", "-=0.5");
  tl.from(lineMask1, { drawSVG: 0 }, "letterA");
  tl.from(lineMask4, { drawSVG: 0 }, "letterA+=0.4");
  tl.from(lineMask8, { drawSVG: 0 }, "letterA+=0.5");
  tl.from(lineMask9, { drawSVG: 0 }, "letterA+=0.6");
  tl.from(letterAMasks[0], { drawSVG: 0 }, "letterA");
  tl.from(letterAMasks[1], { drawSVG: 0 }, "letterA+=0.3");

  tl.add("letterR", "-=0.2");
  tl.from(lineMask2, { drawSVG: 0 }, "letterR");
  tl.from(lineMask3, { drawSVG: 0 }, "letterR");
  tl.to(letterA02Rmask, { duration: 0.4, drawSVG: "0 50%" }, "-=1.5");
  tl.to(letterA02Rmask, { duration: 0.1, drawSVG: "0 0%" }, "-=1.1");
  tl.from(shadows, { autoAlpha: 0, y: 2, stagger: 0.1 }, "letterR+=0.2");

  tl.add("letterT", "-=0.5");
  tl.from(lineMask7, { drawSVG: 0 }, "letterT");
  tl.from(lineMask10, { drawSVG: 0 }, "letterT");
  tl.from(letterTMasks[0], { drawSVG: 0 }, "letterT+=0.3");
  tl.from(letterTMasks[1], { drawSVG: 0 }, "letterT+=0.5");
  tl.from(lineMask5, { drawSVG: 0 }, "letterT+=0.6");
  tl.from(lineMask6, { drawSVG: 0 }, "letterT+=0.6");
  tl.from(lineMask11, { drawSVG: 0 }, "letterT+=0.4");
  tl.from(lineMask12, { drawSVG: 0 }, "letterT+=0.4");
  tl.to(letterT01Rmask, { duration: 0.1, drawSVG: "0 50%" }, "-=2");
  tl.to(letterT01Rmask, { drawSVG: "0 0%" }, "-=1.6");

  tl.add("lastT", "-=1.2");
  tl.to(letterT02Rmask, { drawSVG: "0 50%" }, "-=1.7");
  tl.to(letterT02Rmask, { drawSVG: "0 0%" }, "-=1.2");
  tl.to(letterT03Rmask, { duration: 0.1, drawSVG: "0 50%" }, "lastT");
  tl.to(letterT03Rmask, { duration: 0.2, drawSVG: "0 0%" }, "-=1");
  tl.to(letterT04Rmask, { duration: 0.2, drawSVG: "0 50%" }, "lastT");
  tl.to(letterT04Rmask, { duration: 0.2, drawSVG: "0 0%" }, "-=1");

  tl.add("startGlitch");
  if (glitchLetterA) tl.add(glitchAnimation(glitchLetterA), "startGlitch");
  if (glitchLetterRPaths)
    tl.add(glitchAnimation(glitchLetterRPaths), "startGlitch+=0.1");
  if (glitchLetterT)
    tl.add(glitchAnimation(glitchLetterT), "startGlitch+=0.05");
  if (glitchLine2) tl.add(glitchAnimation(glitchLine2), "startGlitch+=0.05");
  if (glitchLine3) tl.add(glitchAnimation(glitchLine3), "startGlitch+=0.05");
  if (glitchLine4) tl.add(glitchAnimation(glitchLine4), "startGlitch+=0.05");
  if (glitchLine5) tl.add(glitchAnimation(glitchLine5), "startGlitch+=0.05");
  if (glitchLine6) tl.add(glitchAnimation(glitchLine6), "startGlitch+=0.05");
  if (glitchLine7) tl.add(glitchAnimation(glitchLine7), "startGlitch+=0.05");
  if (glitchLine8) tl.add(glitchAnimation(glitchLine8), "startGlitch+=0.05");
  if (glitchLine9) tl.add(glitchAnimation(glitchLine9), "startGlitch+=0.05");
  if (glitchLine10) tl.add(glitchAnimation(glitchLine10), "startGlitch+=0.05");
  if (glitchLine11) tl.add(glitchAnimation(glitchLine11), "startGlitch+=0.05");
  if (glitchLine12) tl.add(glitchAnimation(glitchLine12), "startGlitch+=0.05");
  if (artTech) tl.to(artTech, { y: 0 }, "startGlitch");
  if (art?.length)
    tl.from(art, { autoAlpha: 0, y: 10, stagger: 0.1 }, "startGlitch");
  if (glitchArt0) tl.add(glitchAnimation(glitchArt0), "+=0.05");
  if (glitchArt1) tl.add(glitchAnimation(glitchArt1), "<");
  if (glitchTech0) tl.add(glitchAnimation(glitchTech0));
  if (tech?.length)
    tl.from(tech, { autoAlpha: 0, x: 10, stagger: 0.1 }, "-=0.5");
  if (glitchTech4) tl.add(glitchAnimation(glitchTech4), "-=0.1");
  if (glitchLetterRfill) tl.add(glitchAnimation(glitchLetterRfill), "+=0.1");
  tl.add(glitchAnimLetterRfill(), "+=0.1");
  tl.add(glitchAnimLetterRfill(), "+=0.1");

  tl.timeScale(1.5);

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
    const tl = createAnimation();
    // Autoplay shortly after mount to mimic old behavior
    setTimeout(() => tl && tl.play(), 300);
  });
});

onUnmounted(() => {
  if (timeline.value) timeline.value.kill();
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
.animation-container {
  background-color: #000000;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.animation-container :deep(svg) {
  width: 100%;
  height: 100%;
}

.animation-container :deep(.gs-dev-tools) {
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8) !important;
  border-radius: 0 0 8px 8px !important;
}

.animation-container :deep(.gs-dev-tools .gs-top) {
  padding: 0 0 !important;
  font-size: 11px !important;
}

.animation-container :deep(.gs-dev-tools .gs-bottom) {
  padding: 0 0 0 4px !important;
}
</style>
