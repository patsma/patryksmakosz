<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--icon-message"
  >
    <IconMessageSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectIconMessage animation component
 * - Ports the GSAP timeline from old portfolio /logo-animation/icon-message
 * - Three 3D isometric chat bubbles (small, medium, big) with typing dots
 *   and message icon reveals, orchestrated on staggered master timelines
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
    default: () => `icon-message-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: "top center" },
  stEnd: { type: String, default: "bottom top" },
});

/**
 * Build a per-size phase 1 timeline: chat bubble scales in
 */
function buildChatEntrance(q, chatId) {
  const tl = $gsap.timeline();
  const chat = q(chatId);
  if (chat) {
    tl.from(chat, {
      scale: 0,
      transformOrigin: "50% 100%",
      ease: "back.out(1.7)",
      duration: 1,
    });
  }
  return tl;
}

/**
 * Build a per-size phase 2 timeline: dots stagger in then stagger out
 * Uses GSAP 3 function-based values for the old cycle:{y:[...]} pattern
 */
function buildDotsFlicker(q, qa, topId, bottomId) {
  const tl = $gsap.timeline();
  const dotsTop = qa(`${topId} > path`);
  const dotsBottom = qa(`${bottomId} > path`);

  // Dots stagger in (from hidden with y offsets)
  if (dotsTop.length) {
    tl.from(
      dotsTop,
      {
        autoAlpha: 0,
        y: (i) => [-10, -20, -30][i] || -10,
        ease: "none",
        duration: 0.3,
        stagger: 0.1,
      },
      "dotsFrom"
    );
  }
  if (dotsBottom.length) {
    tl.from(
      dotsBottom,
      {
        autoAlpha: 0,
        y: (i) => [-10, -20, -30][i] || -10,
        ease: "none",
        duration: 0.3,
        stagger: 0.1,
      },
      "dotsFrom"
    );
  }

  // Dots stagger out (to hidden with reversed y offsets)
  if (dotsTop.length) {
    tl.to(
      dotsTop,
      {
        autoAlpha: 0,
        y: (i) => [-30, -20, -10][i] || -10,
        ease: "none",
        duration: 0.3,
        stagger: 0.1,
      },
      "dotsTo"
    );
  }
  if (dotsBottom.length) {
    tl.to(
      dotsBottom,
      {
        autoAlpha: 0,
        y: (i) => [-30, -20, -10][i] || -10,
        ease: "none",
        duration: 0.3,
        stagger: 0.1,
      },
      "dotsTo"
    );
  }

  return tl;
}

/**
 * Build a per-size phase 3 timeline: dots return, message reveals, group shrinks
 */
function buildMessageReveal(q, qa, topId, bottomId, msgId, groupId) {
  const tl = $gsap.timeline();
  const dotsTop = qa(`${topId} > path`);
  const dotsBottom = qa(`${bottomId} > path`);
  const msg = q(msgId);
  const group = q(groupId);

  // Dots stagger back to visible
  if (dotsTop.length) {
    tl.to(
      dotsTop,
      {
        autoAlpha: 1,
        y: 0,
        ease: "none",
        duration: 0.3,
        stagger: 0.1,
      },
      "dotsReturn"
    );
  }
  if (dotsBottom.length) {
    tl.to(
      dotsBottom,
      {
        autoAlpha: 1,
        y: 0,
        ease: "none",
        duration: 0.3,
        stagger: 0.1,
      },
      "dotsReturn"
    );
  }

  // Message icon fades in
  if (msg) {
    tl.fromTo(
      msg,
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, ease: "back.out(1.7)", duration: 0.6 },
      "-=0.3"
    );
  }

  // Entire group scales out
  if (group) {
    tl.to(
      group,
      {
        scale: 0,
        transformOrigin: "50% 100%",
        ease: "none",
        duration: 0.4,
      },
      "-=0.1"
    );
  }

  return tl;
}

const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("ProjectIconMessage: SVG root not found");
    return null;
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `icon-message-${Math.random().toString(36).slice(2, 6)}`;
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix);

  // Convert shapes to paths for morph/draw operations
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

  // Scoped query helpers
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap));
  const qa = (sel) =>
    Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)));

  // Reveal container and SVG (hidden by CSS to prevent FOUC)
  $gsap.set(containerRef.value, { autoAlpha: 1 });
  $gsap.set(svgRoot, { autoAlpha: 1 });

  // --- Big chat bubble master timeline ---
  const bigMaster = $gsap.timeline();
  bigMaster
    .add(buildChatEntrance(q, "#bigChat"))
    .add(
      buildDotsFlicker(q, qa, "#bigDotsTopColor", "#bigDotsBottomColor"),
      "-=0.8"
    )
    .add(
      buildMessageReveal(
        q,
        qa,
        "#bigDotsTopColor",
        "#bigDotsBottomColor",
        "#bigMsg",
        "#big"
      )
    );

  // --- Medium chat bubble master timeline ---
  const mediumMaster = $gsap.timeline();
  mediumMaster
    .add(buildChatEntrance(q, "#mediumChat"))
    .add(
      buildDotsFlicker(
        q,
        qa,
        "#mediumDotsTopColor",
        "#mediumDotsBottomColor"
      ),
      "-=0.8"
    )
    .add(
      buildMessageReveal(
        q,
        qa,
        "#mediumDotsTopColor",
        "#mediumDotsBottomColor",
        "#mediumMsg",
        "#medium"
      )
    );

  // --- Small chat bubble master timeline (built as a function since it's used twice) ---
  function buildSmallMaster() {
    const sm = $gsap.timeline();
    sm.add(buildChatEntrance(q, "#smallChat"))
      .add(
        buildDotsFlicker(
          q,
          qa,
          "#smallDotsTopColor",
          "#smallDotsBottomColor"
        ),
        "-=0.8"
      )
      .add(
        buildMessageReveal(
          q,
          qa,
          "#smallDotsTopColor",
          "#smallDotsBottomColor",
          "#smallMsg",
          "#small"
        )
      );
    return sm;
  }

  // --- Global master timeline orchestrating all three ---
  // Original offsets: small at -3, big at -2, medium at 0.4, small at 0.8
  // In GSAP 2, adding the same child twice moves it - so only big(-2), medium(0.4), small(0.8) survive
  // Shifted to positive base: big at 0, medium at 2.4, small at 2.8
  const tl = $gsap.timeline({
    paused: true,
    repeat: -1,
  });

  tl.add(bigMaster, 0);
  tl.add(mediumMaster, 2.4);
  tl.add(buildSmallMaster(), 2.8);

  tl.timeScale(0.55);

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
