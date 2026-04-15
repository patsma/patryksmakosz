<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--spectrometer"
  >
    <SpectrometerSVG ref="svgComponentRef" />
    <SpectrometerStatsSVG ref="statsComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectSpectrometer animation component
 * - Ports the GSAP timeline from legacy /animations/spectrometer
 * - Complex multi-phase animation: preloader -> molecule -> spectrometer -> statistics
 * - Uses MorphSVG, DrawSVG, MotionPath, CustomBounce, CustomWiggle, CustomEase
 * - Two SVGs: main spectrometer scene + statistics chart
 */

const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $DrawSVGPlugin } = useNuxtApp();
const { $CustomBounce } = useNuxtApp();
const { $CustomWiggle } = useNuxtApp();
const { $CustomEase } = useNuxtApp();
const { $MotionPathPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

const containerRef = ref(null);
const timeline = ref(null);
let gsapCtx = null;
let scrollTriggerInstance = null;

const svgComponentRef = ref(null);
const statsComponentRef = ref(null);

const props = defineProps({
  showDevTools: { type: Boolean, default: false },
  devToolsId: {
    type: String,
    default: () => `spectrometer-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: { type: Boolean, default: false },
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom top" },
});

const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  const statsRoot = statsComponentRef.value?.svgRootRef;
  const statsWrapper = statsComponentRef.value?.wrapperRef;
  if (!svgRoot || !statsRoot) {
    console.warn("ProjectSpectrometer: SVG root(s) not found");
    return null;
  }

  // Scope defs IDs to prevent cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `spectrometer-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);
  const statsIdMap = scopeSvgDefsIds(statsRoot, `${idPrefix}-stats`);

  // Convert shapes to paths for morph/draw operations
  try {
    if ($MorphSVGPlugin) {
      const mainShapes = svgRoot.querySelectorAll(
        "circle, rect, ellipse, line, polygon, polyline"
      );
      if (mainShapes.length) $MorphSVGPlugin.convertToPath(mainShapes);

      const statsShapes = statsRoot.querySelectorAll(
        "circle, rect, ellipse, line, polygon, polyline"
      );
      if (statsShapes.length) $MorphSVGPlugin.convertToPath(statsShapes);
    }
  } catch (e) {
    console.debug("ProjectSpectrometer: convertToPath issue", e);
  }

  // Scoped query helpers for main SVG
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)));

  // Scoped query helpers for stats SVG
  const sq = (sel) =>
    statsRoot.querySelector(remapIdSelectors(sel, statsIdMap));
  const sqa = (sel) =>
    Array.from(statsRoot.querySelectorAll(remapIdSelectors(sel, statsIdMap)));

  // ------- Create custom eases -------
  try {
    $CustomWiggle?.create("funWiggle", { wiggles: 1, type: "anticipate" });
    $CustomWiggle?.create("moleculeBreakEase", {
      wiggles: 1,
      type: "anticipate",
    });
  } catch (e) {
    console.debug("ProjectSpectrometer: CustomWiggle setup issue", e);
  }

  try {
    $CustomBounce?.create("electronBounce", { strength: 0.7, squash: 3 });
    $CustomBounce?.create("magnetsForce", { strength: 0.7, squash: 3 });
  } catch (e) {
    console.debug("ProjectSpectrometer: CustomBounce setup issue", e);
  }

  // Custom acceleration eases for particle exit paths
  const purpleAccelEase = $CustomEase?.create(
    "purpleAccel",
    "M0,0,C0,0,0,0,0.001,0,0.001,0,0.001,0,0.001,0,0.002,0,0.002,0,0.003,0,0.234,0.014,0.5,1,0.5,1,0.5,1,1,1,1,1"
  );
  const blueAccelEase = $CustomEase?.create(
    "blueAccel",
    "M0,0,C0,0,0,0,0.001,0,0.001,0,0.001,0,0.001,0,0.302,0.014,0.5,1,0.5,1,0.5,1,1,1,1,1"
  );
  const greenAccelEase = $CustomEase?.create(
    "greenAccel",
    "M0,0,C0,0,0,0,0.001,0,0.38,0.014,0.5,1,0.5,1,0.5,1,1,1,1,1"
  );
  const yellowAccelEase = $CustomEase?.create(
    "yellowAccel",
    "M0,0,C0.454,0.012,0.5,1,0.5,1,0.5,1,1,1,1,1"
  );
  const redAccelEase = $CustomEase?.create(
    "redAccel",
    "M0,0,C0.516,0,0.5,1,0.5,1,0.5,1,1,1,1,1"
  );

  // ------- Query elements in main SVG -------

  // Preloader
  const preloaderDotsGroup = q("#preloaderDotsGroup");
  const preloaderPurple = q("#preloaderPurple");
  const preloaderBlue = q("#preloaderBlue");
  const preloaderGreen = q("#preloaderGreen");
  const preloaderYellow = q("#preloaderYellow");
  const preloaderRed = q("#preloaderRed");

  // Preloader morph targets
  const moleculePreloaderPurple = q("#moleculePreloaderPurple");
  const moleculePreloaderBlue = q("#moleculePreloaderBlue");
  const moleculePreloaderGreen = q("#moleculePreloaderGreen");
  const moleculePreloaderYellow = q("#moleculePreloaderYellow");
  const moleculePreloaderRed = q("#moleculePreloaderRed");

  // Molecule particles
  const moleculeLarge = q("#moleculeLarge");
  const purpleParticle = q("#particle-05-purple");
  const yellowParticle = q("#particle-01-yellow");
  const greenParticle = q("#particle-04-green");
  const blueParticle = q("#particle-02-blue");
  const redParticle = q("#particle-03-red");
  const bond1 = q("#bond-01");
  const bond2 = q("#bond-02");
  const bond3 = q("#bond-03");
  const bond4 = q("#bond-04");

  // New particles after break
  const purpleParticleNew = q("#purpleParticleAfterBreak");
  const blueParticleNew = q("#blueParticleAfterBreak");
  const greenParticleNew = q("#greenParticleAfterBreak");
  const yellowParticleNew = q("#yellowParticleAfterBreak");
  const redParticleNew = q("#redParticleAfterBreak");

  // Spectrometer parts
  const topCutCircles = q("#topCutCircles");
  const bottomCutCircles = q("#bottomCutCircles");
  const spectrometerBody = q("#spectrometerBody");
  const electronShot = q("#electronShot");

  // Magnets
  const forceGroupTop = qa("#forceGroupTop path");
  const forceGroupBottom = qa("#forceGroupBottom path");

  // Bezier path elements
  const firstMovePath = q("#firstMovementLargeMoleculeToSpectrometer");
  const secondMovePath = q("#secondMovementLargeMoleculeToSpectrometer");
  const laserBezierEl = q("#laserBezier");
  const purpleBezier02 = q("#purpleBezierPath02");
  const blueBezier02 = q("#blueBezierPath02");
  const greenBezier02 = q("#greenBezierPath02");
  const yellowBezier02 = q("#yellowBezierPath02");
  const redBezier02 = q("#redBezierPath02");
  const purpleBezier01 = q("#purpleBezierPath01");

  // Plus/minus symbol groups
  const plusPaths14 = qa("#_ > path.cls-14");
  const plusPaths13 = qa("#_ > path.cls-13");
  const minusPaths14 = qa('[id="_-"] > path.cls-14');
  const minusPaths13 = qa('[id="_-"] > path.cls-13');

  // Boom and finished particles
  const boomPaths = qa("#boomGroup path");
  const finishedPaths = qa("#finishedParticles path");
  const laserParticlesPaths = qa("#laserParticles path");
  const laserParticlesGroup = q("#laserParticles");

  // Gradients
  const radialGradientStops = qa("#radial-gradient stop");
  const radialGradient5Stops = qa("#radial-gradient-5 stop");
  const radialGradient3Stops = qa("#radial-gradient-3 stop");
  const radialGradient2Stops = qa("#radial-gradient-2 stop");
  const radialGradient4Stops = qa("#radial-gradient-4 stop");

  // ------- Query elements in stats SVG -------
  const statsBackground = statsWrapper;
  const statisticsGroup = sq("#statistics");

  const purpleDotTwo = sq("#purple-dot-two");
  const blueDotTwo = sq("#blue-dot-two");
  const greenDotTwo = sq("#green-dot-two");
  const yellowDotTwo = sq("#yellow-dot-two");
  const redDotTwo = sq("#red-dot-two");
  const preloaderTwo = sq("#preloaderTwo");

  const chartBarPurple = sq("#chart-bar-04-purple");
  const chartBarBlue = sq("#chart-bar-01-blue");
  const chartBarGreen = sq("#chart-bar-05-green");
  const chartBarYellow = sq("#chart-bar-02-yellow");
  const chartBarRed = sq("#chart-bar-03-red");

  const scaleBottomPaths = sqa("#scaleBottomLines path");
  const scaleLeftPaths = sqa("#scaleLeftLines path");
  const resultsTextEls = sqa("#resultsText text");
  const barsGroup = sq("#bars");
  const topPhrasesGroup = sq("#topPhrases");
  const otherPhrasesGroup = sq("#otherPhrasesGroup");
  const bgRect = sq("#bg");

  // Top phrase text elements (5 texts)
  const phraseTexts = sqa("#topPhrases > text");
  const phrase1 = phraseTexts[0];
  const phrase2 = phraseTexts[1];
  const phrase3 = phraseTexts[2];
  const phrase4 = phraseTexts[3];
  const phrase5 = phraseTexts[4];

  // Color morph targets
  const colour01 = sq("#colour-01");
  const colour02 = sq("#colour-02");
  const colour03 = sq("#colour-03");
  const colour04 = sq("#colour-04");
  const colour05 = sq("#colour-05");

  // ------- Reveal containers (hidden by CSS to prevent FOUC) -------
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(svgRoot, { autoAlpha: 1 });
  // Stats SVG stays hidden until phase 2

  // ======= BUILD SUB-TIMELINES =======

  // --- Phase 1: Preloader dots ---
  const preloaderTl = $gsap.timeline();
  preloaderTl
    .set(preloaderDotsGroup, { autoAlpha: 1 })
    .fromTo(
      preloaderPurple,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.1, ease: "none" },
      "showPreloader+=0.2"
    )
    .fromTo(
      preloaderBlue,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.1, ease: "none" },
      "showPreloader+=0.4"
    )
    .fromTo(
      preloaderGreen,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.1, ease: "none" },
      "showPreloader+=0.6"
    )
    .fromTo(
      preloaderYellow,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.1, ease: "none" },
      "showPreloader+=0.8"
    )
    .fromTo(
      preloaderRed,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.1, ease: "none" },
      "showPreloader+=1"
    )
    .to(
      preloaderDotsGroup,
      {
        svgOrigin: "592.131 356.95",
        rotation: 720,
        yoyo: true,
        autoAlpha: 1,
        ease: "funWiggle",
        duration: 2,
        stagger: 0.2,
      },
      "showPreloader"
    );

  // --- Phase 2: Morph preloader into molecule ---
  const preloaderMorphTl = $gsap.timeline();
  preloaderMorphTl
    .addLabel("morphIntoMolecule")
    .to(
      preloaderPurple,
      { morphSVG: moleculePreloaderPurple, duration: 1 },
      "morphIntoMolecule"
    )
    .to(
      preloaderBlue,
      { morphSVG: moleculePreloaderBlue, duration: 1 },
      "morphIntoMolecule"
    )
    .to(
      preloaderGreen,
      { morphSVG: moleculePreloaderGreen, duration: 1 },
      "morphIntoMolecule"
    )
    .to(
      preloaderYellow,
      { morphSVG: moleculePreloaderYellow, duration: 1 },
      "morphIntoMolecule"
    )
    .to(
      preloaderRed,
      { morphSVG: moleculePreloaderRed, duration: 1 },
      "morphIntoMolecule"
    )
    .addLabel("replacePreloaderWithMolecule")
    .to(
      preloaderDotsGroup,
      { autoAlpha: 0, duration: 1 },
      "replacePreloaderWithMolecule"
    )
    .to(
      [purpleParticle, redParticle, blueParticle, greenParticle, yellowParticle],
      { autoAlpha: 1, duration: 0.5 },
      "replacePreloaderWithMolecule"
    )
    .fromTo(
      [bond1, bond2, bond3, bond4],
      { strokeWidth: "4px", autoAlpha: 1, drawSVG: "0%" },
      {
        strokeWidth: "5px",
        autoAlpha: 1,
        drawSVG: "100%",
        ease: "power2.out",
        duration: 0.6,
        stagger: -0.05,
      },
      "replacePreloaderWithMolecule+=0.5"
    );

  // --- Phase 3: Move molecule into spectrometer ---
  const moleculeMoveTl = $gsap.timeline();
  moleculeMoveTl
    .addLabel("moveSpectrometerToCenterFix")
    .to(
      moleculeLarge,
      {
        motionPath: { path: firstMovePath, align: "self", alignOrigin: [0.5, 0.5] },
        ease: "none",
        duration: 2,
      },
      "moveSpectrometerToCenterFix"
    )
    .to(
      svgRoot,
      { xPercent: -8, duration: 1 },
      "moveSpectrometerToCenterFix"
    )
    .to(
      [
        purpleParticle,
        yellowParticle,
        greenParticle,
        blueParticle,
        redParticle,
        bond1,
        bond2,
        bond3,
        bond4,
      ],
      {
        scale: 0.08,
        svgOrigin: "592.131 356.95",
        duration: 1,
      }
    )
    .to(moleculeLarge, {
      motionPath: { path: secondMovePath, align: "self", alignOrigin: [0.5, 0.5] },
      ease: "none",
      duration: 2,
    }, "-=0.1");

  // --- Phase 4: Electron gun + laser ---
  const moleculeBreakTl = $gsap.timeline();
  moleculeBreakTl
    .from(electronShot, {
      motionPath: { path: q("#electronBezier"), align: "self", alignOrigin: [0.5, 0.5] },
      duration: 0.4,
      ease: "electronBounce",
    })
    .to(electronShot, {
      motionPath: { path: q("#electronBezierBack"), align: "self", alignOrigin: [0.5, 0.5] },
      duration: 0.4,
      ease: "electronBounce",
    })
    .set(laserParticlesGroup, { autoAlpha: 1 })
    .to(laserParticlesPaths, {
      scale: 0.5,
      autoAlpha: 1,
      repeat: 5,
      motionPath: { path: laserBezierEl, align: laserParticlesGroup, alignOrigin: [0.5, 0.5] },
      duration: 0.5,
      stagger: 0.1,
    })
    .to(laserParticlesPaths, {
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.1,
    }, "-=1");

  // --- Phase 5: Magnets force arrows ---
  const magnetsTl = $gsap.timeline();
  magnetsTl
    .addLabel("magnetsForce")
    .fromTo(
      forceGroupTop,
      {
        autoAlpha: 0,
        yPercent: (i) => [20, -10, 20][i % 3],
      },
      {
        autoAlpha: 1,
        yPercent: 0,
        repeat: 2,
        ease: "magnetsForce",
        duration: 0.6,
        stagger: 0.1,
      },
      "magnetsForce"
    )
    .fromTo(
      forceGroupBottom,
      {
        autoAlpha: 0,
        yPercent: (i) => [20, -10, 20][i % 3],
      },
      {
        autoAlpha: 1,
        yPercent: 0,
        repeat: 2,
        ease: "magnetsForce",
        duration: 0.6,
        stagger: 0.1,
      },
      "magnetsForce"
    );

  // --- Phase 6: Final travel - particles break and exit ---
  const finalTravelTl = $gsap.timeline();
  finalTravelTl
    .addLabel("gradientFade")
    // Gradient color shifts
    .to(radialGradientStops, { stopColor: "#9fa8da", duration: 0.1 }, "gradientFade")
    .to(radialGradient5Stops, { stopColor: "#80deea", duration: 0.1 }, "gradientFade")
    .to(radialGradient3Stops, { stopColor: "#ef9a9a", duration: 0.1 }, "gradientFade")
    .to(radialGradient2Stops, { stopColor: "#69f0ae", duration: 0.1 }, "gradientFade")
    .to(radialGradient4Stops, { stopColor: "#ffcc80", duration: 0.1 }, "gradientFade")
    // Particle micro-movements
    .to(blueParticle, { y: "-=5px", duration: 0.3 }, "gradientFade")
    .to(yellowParticle, { y: "+=5px", duration: 0.3 }, "gradientFade")
    .to(purpleParticle, { x: "+=5px", duration: 0.3 }, "gradientFade")
    .to(greenParticle, { x: "-=5px", duration: 0.3 }, "gradientFade")
    .to(
      redParticle,
      { scale: 0.1, transformOrigin: "50% 50%", duration: 0.3 },
      "gradientFade"
    )
    // Bonds fade out
    .to(bond1, { autoAlpha: 0, y: "-=5px", duration: 0.3 }, "gradientFade")
    .to(bond2, { autoAlpha: 0, y: "+=5px", duration: 0.3 }, "gradientFade")
    .to(bond3, { autoAlpha: 0, x: "-=5px", duration: 0.3 }, "gradientFade")
    .to(bond4, { autoAlpha: 0, x: "+=5px", duration: 0.3 }, "gradientFade")
    // Molecule break apart
    .addLabel("moleculeBreak")
    .to(blueParticle, { y: "+=15px", duration: 0.3 }, "moleculeBreak")
    .to(yellowParticle, { y: "-=15px", duration: 0.3 }, "moleculeBreak")
    .to(purpleParticle, { x: "-=15px", duration: 0.3 }, "moleculeBreak")
    .to(greenParticle, { x: "+=15px", duration: 0.3 }, "moleculeBreak")
    // Show replacement particles early so they're visible during separation
    .set(
      [
        purpleParticleNew,
        blueParticleNew,
        greenParticleNew,
        yellowParticleNew,
        redParticleNew,
      ],
      { autoAlpha: 1 },
      "moleculeBreak"
    )
    // Replace original particles - move along first bezier
    .addLabel("replaceMoleculeAfterLaser")
    .to(
      [
        purpleParticle,
        blueParticle,
        greenParticle,
        yellowParticle,
        redParticle,
      ],
      {
        transformOrigin: "50% 50%",
        scale: 0.08,
        motionPath: { path: purpleBezier01, align: "self", alignOrigin: [0.5, 0.5] },
        ease: "none",
        duration: 0.5,
        stagger: 0.01,
      }
    )
    .addLabel("toSpeedUp")
    // Accelerated exit along individual bezier paths
    .addLabel("accelerated", "-=0.2")
    .to(
      purpleParticleNew,
      {
        autoAlpha: 1,
        motionPath: { path: purpleBezier02, align: "self", alignOrigin: [0.5, 0.5] },
        ease: purpleAccelEase || "power1.in",
        duration: 4,
      },
      "accelerated"
    )
    .to(
      blueParticleNew,
      {
        autoAlpha: 1,
        motionPath: { path: blueBezier02, align: "self", alignOrigin: [0.5, 0.5] },
        ease: blueAccelEase || "power1.in",
        duration: 4,
      },
      "accelerated"
    )
    .to(
      greenParticleNew,
      {
        autoAlpha: 1,
        motionPath: { path: greenBezier02, align: "self", alignOrigin: [0.5, 0.5] },
        ease: greenAccelEase || "power1.in",
        duration: 4,
      },
      "accelerated"
    )
    .to(
      yellowParticleNew,
      {
        autoAlpha: 1,
        motionPath: { path: yellowBezier02, align: "self", alignOrigin: [0.5, 0.5] },
        ease: yellowAccelEase || "power1.in",
        duration: 4,
      },
      "accelerated"
    )
    .to(
      redParticleNew,
      {
        autoAlpha: 1,
        motionPath: { path: redBezier02, align: "self", alignOrigin: [0.5, 0.5] },
        ease: redAccelEase || "power1.in",
        duration: 4,
      },
      "accelerated"
    )
    // Plus/minus blinking (4 cycles)
    .addLabel("showPlusMinus1", "-=3.8")
    .to(plusPaths14, { fill: "#fff", duration: 0.1 }, "showPlusMinus1")
    .to(
      plusPaths13,
      { fill: "#216dd9", strokeWidth: "4px", duration: 0.1 },
      "showPlusMinus1"
    )
    .to(minusPaths14, { fill: "#fff", duration: 0.1 }, "showPlusMinus1")
    .to(
      minusPaths13,
      { fill: "#216dd9", strokeWidth: "4px", duration: 0.1 },
      "showPlusMinus1"
    )
    .addLabel("showPlusMinus2", "-=3.7")
    .to(plusPaths14, { fill: "#216dd9", duration: 0.1 }, "showPlusMinus2")
    .to(
      plusPaths13,
      { fill: "#fff", strokeWidth: "2px", duration: 0.1 },
      "showPlusMinus2"
    )
    .to(minusPaths14, { fill: "#216dd9", duration: 0.1 }, "showPlusMinus2")
    .to(
      minusPaths13,
      { fill: "#fff", strokeWidth: "2px", duration: 0.1 },
      "showPlusMinus2"
    )
    .addLabel("showPlusMinus3", "-=3.6")
    .to(plusPaths14, { fill: "#fff", duration: 0.1 }, "showPlusMinus3")
    .to(
      plusPaths13,
      { fill: "#216dd9", strokeWidth: "4px", duration: 0.1 },
      "showPlusMinus3"
    )
    .to(minusPaths14, { fill: "#fff", duration: 0.1 }, "showPlusMinus3")
    .to(
      minusPaths13,
      { fill: "#216dd9", strokeWidth: "4px", duration: 0.1 },
      "showPlusMinus3"
    )
    .addLabel("showPlusMinus4", "-=3.5")
    .to(plusPaths14, { fill: "#216dd9", duration: 0.1 }, "showPlusMinus4")
    .to(
      plusPaths13,
      { fill: "#fff", strokeWidth: "2px", duration: 0.1 },
      "showPlusMinus4"
    )
    .to(minusPaths14, { fill: "#216dd9", duration: 0.1 }, "showPlusMinus4")
    .to(
      minusPaths13,
      { fill: "#fff", strokeWidth: "2px", duration: 0.1 },
      "showPlusMinus4"
    )
    // Boom effect
    .addLabel("boom", "-=2.4")
    .fromTo(
      boomPaths,
      { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" },
      {
        autoAlpha: 1,
        scale: 1,
        transformOrigin: "50% 50%",
        ease: "back.inOut",
        duration: 0.1,
        stagger: 0.025,
      },
      "boom+=0.4"
    )
    .fromTo(
      finishedPaths,
      { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" },
      {
        autoAlpha: 1,
        scale: 1,
        transformOrigin: "50% 50%",
        ease: "back.inOut",
        duration: 0.1,
        stagger: 0.025,
      },
      "boom+=0.35"
    )
    .to(
      boomPaths,
      {
        autoAlpha: 0,
        scale: 0,
        ease: "back.inOut",
        duration: 0.1,
        stagger: 0.025,
      },
      "boom+=0.55"
    );

  // --- Phase 7: Statistics chart ---
  const showStatisticsTl = $gsap.timeline();
  showStatisticsTl
    .addLabel("showStatistics")
    .to(statsBackground, { autoAlpha: 1, duration: 0.5 })
    .to(statsRoot, { autoAlpha: 1, duration: 0.1 })
    // Preloader dots appear and rotate
    .addLabel("showPreloader")
    .fromTo(
      purpleDotTwo,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.2, ease: "none" },
      "showPreloader+=0.2"
    )
    .fromTo(
      blueDotTwo,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.2, ease: "none" },
      "showPreloader+=0.4"
    )
    .fromTo(
      greenDotTwo,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.2, ease: "none" },
      "showPreloader+=0.6"
    )
    .fromTo(
      yellowDotTwo,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.2, ease: "none" },
      "showPreloader+=0.8"
    )
    .fromTo(
      redDotTwo,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.2, ease: "none" },
      "showPreloader+=1"
    )
    .to(
      preloaderTwo,
      {
        svgOrigin: "486.2 364.3",
        rotation: 720,
        autoAlpha: 1,
        duration: 3,
        stagger: 0.2,
      },
      "showPreloader"
    )
    // Background fade
    .fromTo(
      bgRect,
      { autoAlpha: 0, xPercent: 5 },
      { xPercent: 0, autoAlpha: 1, duration: 1 }
    )
    // Morph dots into chart bars
    .addLabel("morphIntoBars", "-=1.9")
    .to(
      purpleDotTwo,
      { autoAlpha: 1, morphSVG: chartBarPurple, duration: 1 },
      "morphIntoBars+=0.1"
    )
    .to(
      blueDotTwo,
      { autoAlpha: 1, morphSVG: chartBarBlue, duration: 1 },
      "morphIntoBars+=0.3"
    )
    .to(
      greenDotTwo,
      { autoAlpha: 1, morphSVG: chartBarGreen, duration: 1 },
      "morphIntoBars+=0.5"
    )
    .to(
      yellowDotTwo,
      { autoAlpha: 1, morphSVG: chartBarYellow, duration: 1 },
      "morphIntoBars+=0.7"
    )
    .to(
      redDotTwo,
      { autoAlpha: 1, morphSVG: chartBarRed, duration: 1 },
      "morphIntoBars+=0.9"
    )
    // Scale lines appear
    .addLabel("showScales", "-=1.6")
    .fromTo(
      scaleBottomPaths,
      {
        autoAlpha: 0,
        yPercent: (i) => (i % 2 === 0 ? -200 : 200),
      },
      {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.05,
      },
      "showScales"
    )
    .fromTo(
      scaleLeftPaths,
      {
        autoAlpha: 0,
        xPercent: (i) => (i % 2 === 0 ? -200 : 200),
      },
      {
        xPercent: 0,
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.05,
      },
      "showScales"
    )
    .fromTo(
      resultsTextEls,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 1, stagger: 0.6 },
      "showScales+=1.4"
    )
    .set(barsGroup, { autoAlpha: 1 })
    .to(topPhrasesGroup, { autoAlpha: 1, duration: 0.4 });

  // Color phrase cycling - dots morph to color swatches with text reveals
  if (phrase1 && colour03) {
    showStatisticsTl
      .addLabel("showPhrase1")
      .to(
        greenDotTwo,
        { autoAlpha: 1, morphSVG: colour03, duration: 1 },
        "showPhrase1"
      )
      .fromTo(
        phrase1,
        { xPercent: 10, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 0.5 },
        "showPhrase1+=0.7"
      )
      .addLabel("showPhrase2")
      .to(
        redDotTwo,
        { autoAlpha: 1, morphSVG: colour01, duration: 1 },
        "showPhrase2"
      )
      .fromTo(
        phrase2,
        { xPercent: 10, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 0.5 },
        "showPhrase2+=0.7"
      )
      .addLabel("showPhrase3")
      .to(
        yellowDotTwo,
        { autoAlpha: 1, morphSVG: colour02, duration: 1 },
        "showPhrase3"
      )
      .fromTo(
        phrase3,
        { xPercent: 10, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 0.5 },
        "showPhrase3+=0.7"
      )
      .addLabel("showPhrase4")
      .to(
        purpleDotTwo,
        { autoAlpha: 1, morphSVG: colour04, duration: 1 },
        "showPhrase4"
      )
      .fromTo(
        phrase4,
        { xPercent: 10, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 0.5 },
        "showPhrase4+=0.7"
      )
      .addLabel("showPhrase5")
      .to(
        blueDotTwo,
        { autoAlpha: 1, morphSVG: colour05, duration: 1 },
        "showPhrase5"
      )
      .fromTo(
        phrase5,
        { xPercent: 10, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 0.5 },
        "showPhrase5+=0.7"
      );
  }

  // Other phrases group fade in
  showStatisticsTl.fromTo(
    otherPhrasesGroup,
    { yPercent: -10, autoAlpha: 0 },
    { yPercent: 0, autoAlpha: 1, duration: 0.4 }
  );

  // ======= MASTER TIMELINE =======
  const tl = $gsap.timeline({
    paused: true,
    delay: 0.1,
    repeat: -1,
    repeatDelay: 2.5,
  });

  tl.addLabel("startAnimation")
    .add(preloaderTl)
    .add(preloaderMorphTl)
    // Move molecule into spectrometer
    .add(moleculeMoveTl)
    // Show spectrometer body
    .to(
      [topCutCircles, bottomCutCircles, spectrometerBody],
      { autoAlpha: 1, duration: 1 },
      "-=3"
    )
    // Electron gun + laser
    .addLabel("laserShot")
    .add(moleculeBreakTl)
    // Final particle travel (at half speed) + magnets
    .addLabel("finalTravel")
    .add(finalTravelTl.timeScale(0.5), "-=2")
    .add(magnetsTl, "-=6.2")
    // Transition to statistics (overlap to cut dead time after boom)
    .addLabel("phase2", "-=3")
    .to(svgRoot, { autoAlpha: 0, duration: 1 }, "phase2")
    .set(svgRoot, { display: "none" })
    .add(showStatisticsTl, "phase2+=0.5")
    .addLabel("phase3");

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
