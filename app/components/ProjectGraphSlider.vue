<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--graph-slider"
  >
    <!-- HTML overlay panel -->
    <div class="graph-slider-panel">
      <div class="graph-slider-tagline">TRANSACTIONAL VOLUME & MILESTONES</div>
      <div class="graph-slider-slides">
        <div
          v-for="(slide, index) in slides"
          :key="slide.year"
          :ref="el => slideRefs[index] = el"
          class="graph-slider-slide"
        >
          <!-- Intro slide has special layout -->
          <template v-if="slide.isIntro">
            <div class="graph-slider-initial">
              <div class="graph-slider-title">{{ slide.title }}</div>
              <div class="graph-slider-title graph-slider-subtitle">{{ slide.subtitle }}</div>
              <button class="graph-slider-start-btn">
                It all starts here
              </button>
            </div>
          </template>
          <template v-else>
            <div class="graph-slider-amount">{{ slide.title }}</div>
          </template>

          <div class="graph-slider-date-title">{{ slide.year }}</div>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="graph-slider-date-text" v-html="slide.description" />

          <div class="graph-slider-controls">
            <div
              :ref="el => backRefs[index] = el"
              class="graph-slider-back"
              role="button"
              tabindex="0"
            >
              <Icon name="mdi:chevron-left" size="20" />
              <p>Back</p>
            </div>
            <div
              :ref="el => nextRefs[index] = el"
              class="graph-slider-next"
              role="button"
              tabindex="0"
            >
              <p>Next</p>
              <Icon name="mdi:chevron-right" size="20" />
            </div>
            <div
              v-if="index === slides.length - 1"
              class="graph-slider-restart"
              role="button"
              tabindex="0"
            >
              Restart
              <Icon name="mdi:restart" size="18" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SVG graph layer -->
    <div class="graph-slider-svg-wrap">
      <GraphSliderSVG ref="svgComponentRef" />
    </div>
  </div>
</template>

<script setup>
/**
 * ProjectGraphSlider - interactive two-phase graph animation
 * Phase 1: Intro animation (auto-plays on scroll) - graph draws in, dots drop, morphs
 * Phase 2: Interactive navigation - click dates or next/back to explore 28 years of KBS milestones
 * Ported from old portfolio /animations/graph-slider
 */

import { graphSliderSlides } from "~/data/graphSliderSlides";
import { scopeSvgDefsIds, remapIdSelectors } from "/utils/scopeSvgIds";

const { $gsap } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $DrawSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();

const containerRef = ref(null);
const timeline = ref(null);
let gsapCtx = null;
let scrollTriggerInstance = null;
const svgComponentRef = ref(null);

// Template refs for slides and controls
const slideRefs = ref([]);
const backRefs = ref([]);
const nextRefs = ref([]);

const slides = graphSliderSlides;

const props = defineProps({
  showDevTools: {
    type: Boolean,
    default: false,
  },
  devToolsId: {
    type: String,
    default: () => `graph-slider-${Math.random().toString(36).slice(2, 9)}`,
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
    console.warn("ProjectGraphSlider: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `graph-slider-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths for morph/draw operations
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

  // Set initial viewBox
  $gsap.set(svgRoot, { attr: { viewBox: "0 200 1892 1169" } });

  // Query animation groups
  const dotsNarrowAll = qa("#dots-narrow > path");
  const dotsWideAll = qa("#dots-wide > path");
  const linesNarrowAll = qa("#lines-narrow > path");
  const linesWideAll = qa("#lines-wide > path");
  const linesNarrowDummyAll = qa("#lines-narrow-dummy > path");
  const linesNarrowGroup = qa("#lines-narrow > *");
  const dotHoverGroup = qa("#dot-hover-group > g");
  const datesDotsGroupHover = qa("#dates-dots-group-hover > *");
  const clickableDots = qa("#dates > g");

  // Build arrays (0-28, matching original)
  const dotsNarrowArray = [];
  const dotsWideArray = [];
  const linesNarrowArray = [];
  const linesWideArray = [];
  const linesNarrowDummyArray = [];

  for (let i = 0; i < 29; i++) {
    dotsNarrowArray.push(dotsNarrowAll[i]);
    dotsWideArray.push(dotsWideAll[i]);
    linesNarrowArray.push(linesNarrowAll[i]);
    linesWideArray.push(linesWideAll[i]);
    linesNarrowDummyArray.push(linesNarrowDummyAll[i]);
  }

  // Date selectors (years 1992-2019)
  const datesArray = [];
  const datesArrayPath = [];
  for (let i = 1992; i < 2020; i++) {
    datesArray.push(q(`#_${i}`));
    datesArrayPath.push(qa(`#_${i} > path`));
  }

  // Data dot selectors (1-28)
  const dotsSmallArray = [];
  const dotsBigArray = [];
  for (let i = 1; i < 29; i++) {
    dotsSmallArray.push(q(`#data-dot-small-${i}`));
    dotsBigArray.push(q(`#data-dot-big-${i}`));
  }

  // Query intro elements from the first slide (can't use static refs inside v-for)
  const introSlide = slideRefs.value[0];
  const titleFirst = introSlide?.querySelector(".graph-slider-title");
  const titleSubtitle = introSlide?.querySelector(".graph-slider-subtitle");
  const startBtn = introSlide?.querySelector(".graph-slider-start-btn");

  // Set initial states - hide wide (expanded) elements
  $gsap.set(
    [...qa("#dots-wide > *"), ...qa("#lines-wide > *"), q("#graph-wide")].filter(Boolean),
    { visibility: "hidden" }
  );

  // Hide hover elements
  $gsap.set(dotHoverGroup, { autoAlpha: 0 });
  $gsap.set(datesDotsGroupHover, { autoAlpha: 0, scale: 0, transformOrigin: "center center" });

  // Hide data dots (small and big)
  $gsap.set(dotsSmallArray.filter(Boolean), {
    autoAlpha: 0, scale: 0, transformOrigin: "50% 50%",
  });
  $gsap.set(dotsBigArray.filter(Boolean), {
    autoAlpha: 0, scale: 0, transformOrigin: "50% 50%",
  });

  // Hide slides 1+ (slide 0 visible by default)
  for (let i = 1; i < slideRefs.value.length; i++) {
    if (slideRefs.value[i]) {
      $gsap.set(slideRefs.value[i], { autoAlpha: 0 });
    }
  }

  // Hide first back button
  if (backRefs.value[0]) {
    $gsap.set(backRefs.value[0], { display: "none" });
  }

  // Tagline ref needed for intro timeline
  const taglineEl = containerRef.value.querySelector(".graph-slider-tagline");

  // Navigation state
  const dur = 0.5;
  const offsetValue = 100;
  let oldSlide = 0;
  let activeSlide = 0;
  const lastSlide = slides.length - 1;
  const offsets = Array.from(Array(slides.length).keys()).map(
    (k) => -1 * k * offsetValue
  );

  // Slide animation handler
  const slideAnim = (type, index) => {
    oldSlide = activeSlide;

    if (type === "back") {
      activeSlide = activeSlide === 0 ? 1 : activeSlide - 1;
    } else if (type === "next") {
      activeSlide++;
    } else if (type === "reverse") {
      activeSlide = 0;
    } else if (type === "date") {
      activeSlide = index;
    }

    // Clamp
    activeSlide = Math.max(0, Math.min(activeSlide, lastSlide));

    if (oldSlide === activeSlide) return;

    // Hide last next button on last slide
    if (activeSlide === lastSlide && nextRefs.value[lastSlide]) {
      $gsap.set(nextRefs.value[lastSlide], { display: "none" });
    }

    // Hide old slide
    const hideOld = $gsap.timeline();
    hideOld
      .add("play-all")
      .to(datesArray[oldSlide], {
        fill: "#83929b", y: 0, transformOrigin: "50% 100%", scale: 1,
      }, "play-all")
      .to(datesArrayPath[oldSlide], { fill: "#83929b" }, "play-all")
      .to(dotsSmallArray[oldSlide], { autoAlpha: 0, scale: 0 }, "play-all")
      .to(dotsBigArray[oldSlide], { autoAlpha: 0, scale: 0 }, "play-all")
      .to(slideRefs.value[oldSlide], { autoAlpha: 0 }, 0);

    // Show active slide
    const showActive = $gsap.timeline();
    showActive
      .add("play-all")
      .to(datesArray[activeSlide], {
        fill: "#000", y: -40, transformOrigin: "50% 100%", scale: 1.5,
      }, "play-all")
      .to(datesArrayPath[activeSlide], { fill: "#000" }, "play-all")
      .to(dotsBigArray[activeSlide], {
        autoAlpha: 0.3, scale: 1, ease: "sine.out",
      }, "play-all")
      .to(dotsSmallArray[activeSlide], {
        autoAlpha: 1, scale: 1, ease: "sine.out",
      }, "play-all")
      .to(slideRefs.value[activeSlide], { autoAlpha: 1 }, 0);

    // Pan viewBox
    $gsap.to(svgRoot, {
      duration: dur,
      attr: { viewBox: `${offsets[activeSlide] * -1} 200 1892 1169` },
    });
  };

  // Set up event listeners for navigation
  clickableDots.forEach((dot, i) => {
    dot.addEventListener("click", () => slideAnim("date", i));
    dot.setAttribute("class", "date-dots");
  });

  linesNarrowDummyArray.forEach((line, i) => {
    if (!line) return;
    line.addEventListener("click", () => slideAnim("date", i));
    line.setAttribute("class", "date-dots");
  });

  nextRefs.value.forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => slideAnim("next"));
  });

  backRefs.value.forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => slideAnim("back"));
  });

  // Restart button on last slide
  const restartBtn = containerRef.value.querySelector(".graph-slider-restart");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => slideAnim("reverse"));
  }

  // Hover effects on graph lines
  linesNarrowDummyArray.forEach((line, i) => {
    if (!line || !dotHoverGroup[i] || !datesDotsGroupHover[i]) return;

    line.addEventListener("mouseenter", () => {
      const tl = $gsap.timeline();
      tl.add("play-all")
        .to(datesDotsGroupHover[i], {
          autoAlpha: 1, scale: 1, transformOrigin: "center center",
        }, "play-all")
        .to(dotHoverGroup[i], { autoAlpha: 1 }, "play-all")
        .to(linesNarrowGroup[i], {
          duration: 0.2, autoAlpha: 0.4, ease: "linear",
        }, 0)
        .to(datesArray[i], { opacity: 0 }, "play-all");
    });

    line.addEventListener("mouseleave", () => {
      const tl = $gsap.timeline();
      tl.add("play-all")
        .to(datesDotsGroupHover[i], {
          autoAlpha: 0, scale: 0, transformOrigin: "center center",
        }, "play-all")
        .to(dotHoverGroup[i], { autoAlpha: 0 }, "play-all")
        .to(linesNarrowGroup[i], {
          duration: 0.2, autoAlpha: 0.2, ease: "linear",
        }, 0)
        .to(datesArray[i], { opacity: 1 }, "play-all");
    });
  });

  // Build the intro animation (graphAnimation from original)
  const tlLines = $gsap.timeline({ paused: true });
  const tlDots = $gsap.timeline();
  const tlLinesDotsMaster = $gsap.timeline({ paused: true });

  // Morph lines: narrow to wide
  for (let i = 0; i < dotsNarrowArray.length; i++) {
    if (linesNarrowArray[i] && linesWideArray[i]) {
      tlLines.to(linesNarrowArray[i], {
        morphSVG: linesWideArray[i], ease: "linear",
      }, 0);
    }
  }

  // Morph dots: narrow to wide
  for (let i = 0; i < dotsNarrowArray.length; i++) {
    if (dotsNarrowArray[i] && dotsWideArray[i]) {
      tlDots.to(dotsNarrowArray[i], {
        morphSVG: dotsWideArray[i], ease: "linear",
      }, 0);
    }
  }

  tlLinesDotsMaster
    .add("play-all")
    .add(tlDots, "play-all")
    .to(q("#graph-narrow"), {
      duration: 1.5, morphSVG: q("#graph-wide"),
    }, "play-all");

  // Initial intro timeline
  const initialTl = $gsap.timeline();

  initialTl
    .from([taglineEl, titleFirst, titleSubtitle].filter(Boolean), {
      autoAlpha: 0, stagger: 0.3, y: "+=20",
    })
    .from(q("#bottom-graph"), { duration: 1.5, drawSVG: 0 })
    .from(qa("#dots-narrow > *"), {
      duration: 1, autoAlpha: 0, stagger: 0.09, y: "-=100",
      ease: "slow(2.6,4.8)",
    }, "<")
    .fromTo(qa("#lines-narrow > *"), {
      drawSVG: 0, y: "+=20",
    }, {
      duration: 1, drawSVG: "96.5%", stagger: 0.09, ease: "sine.out",
    }, "<")
    .from(q("#graph-narrow"), {
      duration: 1, autoAlpha: 0, scaleY: 0, transformOrigin: "50% 100%",
    })
    .add("show-initial-dates")
    .from(q("#initial-2019"), { autoAlpha: 0 }, "show-initial-dates")
    .from(q("#date-background-1992-initial"), { autoAlpha: 0 }, "<")
    .from(datesArray[0], { autoAlpha: 0 }, "show-initial-dates")
    .from(q("#date-background-2019-initial"), { autoAlpha: 0 }, "<")
    .to(datesArrayPath[0], { fill: "#000", autoAlpha: 1 }, "<")
    .add("show-dot-41b")
    .from(q("#date-dot-2019-initial"), { autoAlpha: 0 }, "show-dot-41b")
    .from(q("#top-41-t"), { autoAlpha: 0 }, "show-dot-41b")
    .from(
      [q("#pulsating-small-inner"), q("#pulsating-big-outer")].filter(Boolean),
      {
        duration: 2, autoAlpha: 0, ease: "slow(0.2,0.5,true)",
        scale: 0, stagger: -0.3, transformOrigin: "50% 50%",
      },
      "show-dot-41b+=0.1"
    )
    .from([startBtn].filter(Boolean), {
      autoAlpha: 0, y: "+=20", duration: 1, ease: "sine.out",
    });

  // Master timeline with pause point
  const master = $gsap.timeline({ paused: true });

  master
    .add(initialTl)
    .addPause()
    // After "It all starts here" click, transition to interactive mode
    .to([startBtn].filter(Boolean), {
      autoAlpha: 0, y: "-=20", display: "none", duration: 1, ease: "sine.out",
    })
    .add("hide-initial")
    .to(q("#date-dot-2019-initial"), { autoAlpha: 0 }, "hide-initial")
    .to(q("#top-41-t"), { autoAlpha: 0 }, "hide-initial")
    .to(q("#initial-2019"), { autoAlpha: 0 }, "hide-initial")
    .to(q("#date-background-2019-initial"), { autoAlpha: 0 }, "hide-initial")
    .to(
      [q("#pulsating-small-inner"), q("#pulsating-big-outer")].filter(Boolean),
      { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%", duration: 0.5 },
      "hide-initial"
    )
    .add("scale-graph")
    .to(qa("#lines-narrow > *"), {
      duration: 1, drawSVG: 0, stagger: 0.01, y: "+=20", ease: "sine.out",
    })
    .add(tlLinesDotsMaster.play())
    .add(tlLines.play(), "<")
    .add("lines-dates")
    .to(qa("#lines-narrow > *"), {
      duration: 1, drawSVG: "96.5%", stagger: 0.09, y: "+=20", ease: "sine.out",
    })
    // Gradient stop tweaking
    .to(
      svgRoot.querySelector(
        remapIdSelectors("#linear-gradient-29", idMap)
          ? `[id="${idMap.get("linear-gradient-29") || "linear-gradient-29"}"] stop:nth-child(2)`
          : "#linear-gradient-29 stop:nth-child(2)"
      ),
      { attr: { offset: "0.09", "stop-opacity": "0.4" } }
    )
    .from(qa("#dates > *:not(:first-child)"), {
      stagger: 0.1, autoAlpha: 0, ease: "sine.out",
    }, "lines-dates")
    .from(qa("#dates-background-rest > *"), {
      scaleX: 0, stagger: 0.1, ease: "sine.out", transformOrigin: "50% 50%",
    }, "<")
    .add("play-date", "-=2")
    .to(datesArray[0], {
      y: -40, transformOrigin: "50% 100%", scale: 1.5,
    }, "play-date")
    .to(datesArrayPath[0], { fill: "#000" }, "play-date")
    .to(dotsBigArray[0], {
      autoAlpha: 0.3, scale: 1, ease: "sine.out",
    }, "play-date")
    .to(dotsSmallArray[0], {
      autoAlpha: 1, scale: 1, ease: "sine.out",
    }, "play-date")
    .from(
      [q("#pulsating-small-inner-2"), q("#pulsating-big-outer-2")].filter(Boolean),
      {
        duration: 2, autoAlpha: 0, ease: "slow(0.2,0.5,true)",
        scale: 0, stagger: -0.3, transformOrigin: "50% 50%",
      },
      "play-date"
    )
    .from(slideRefs.value[0]?.querySelector(".graph-slider-date-title"), {
      autoAlpha: 0,
    }, "<")
    .from(slideRefs.value[0]?.querySelector(".graph-slider-date-text"), {
      autoAlpha: 0,
    }, "<")
    .from(nextRefs.value[0], { autoAlpha: 0 }, "<");

  // Enable pointer events on dates and lines after phase 2
  master.call(() => {
    $gsap.set(
      [...linesNarrowDummyArray.filter(Boolean), ...clickableDots],
      { css: { pointerEvents: "unset" } }
    );
  });

  // Start button triggers phase 2
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      $gsap.set(
        [...linesNarrowDummyArray.filter(Boolean), ...clickableDots],
        { css: { pointerEvents: "unset" } }
      );
      master.play();
    });
  }

  // Disable pointer events initially
  $gsap.set(
    [...linesNarrowDummyArray.filter(Boolean), ...clickableDots],
    { css: { pointerEvents: "none" } }
  );

  // DevTools
  if (props.showDevTools) {
    nextTick(() => {
      try {
        $GSDevTools.create({
          animation: master,
          container: containerRef.value,
          minimal: true,
          id: props.devToolsId,
          globalSync: false,
        });
      } catch (e) {}
    });
  }

  timeline.value = master;
  return master;
};

onMounted(() => {
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
      const tl = createAnimation();
      const svgRoot = svgComponentRef.value?.svgRootRef;

      // Reveal helper - shows container after .from() immediateRender has set initial states
      const revealAndPlay = () => {
        $gsap.set(containerRef.value, { autoAlpha: 1 });
        if (svgRoot) $gsap.set(svgRoot, { autoAlpha: 1 });
        tl.play();
      };

      if (props.useScrollTrigger && tl && $ScrollTrigger) {
        scrollTriggerInstance = $ScrollTrigger.create({
          trigger: containerRef.value,
          start: props.stStart,
          end: props.stEnd,
          onEnter: () => revealAndPlay(),
          onEnterBack: () => revealAndPlay(),
          onLeave: () => tl.pause(0).progress(0),
          onLeaveBack: () => tl.pause(0).progress(0),
        });
        $ScrollTrigger.refresh();
      } else if (props.autoPlay && tl) {
        revealAndPlay();
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
});
</script>

<style scoped>
/* Styling centralized under app/assets/scss/components/_animation-components.scss */
</style>
