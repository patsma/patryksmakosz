<template>
  <section
    ref="rootRef"
    class="project-path-animation"
    aria-label="Path animation"
  >
    <!-- Ball that moves along the motion path -->
    <div ref="ballRef" class="ball" aria-hidden="true" />

    <!-- Hidden SVG used for motion path alignment/debugging -->
    <svg ref="pathSvgRef" class="path-svg" width="100%" height="100%">
      <path ref="pathRef" id="desktop-motion-path" />
    </svg>

    <!-- Three full-screen sections with built-in dummy points -->
    <div class="section section-1">
      <div class="content">
        <h2>Section One</h2>
        <p>Scroll to move the ball along the path.</p>
      </div>
      <div
        class="dummy dummy-desktop"
        data-control-x="0.25"
        data-control-y="-100"
        style="top: 15%; left: 20%"
      />
      <div
        class="dummy dummy-desktop"
        data-control-x="0.25"
        data-control-y="-150"
        style="top: 35%; left: 60%"
      />
    </div>

    <div class="section section-2">
      <div class="content">
        <h2>Section Two</h2>
        <p>Smoothly continues across the page.</p>
      </div>
      <div
        class="dummy dummy-desktop"
        data-control-x="0.25"
        data-control-y="-100"
        style="top: 50%; left: 10%"
      />
      <div
        class="dummy dummy-desktop"
        data-control-x="0.25"
        data-control-y="-200"
        style="top: 70%; left: 50%"
      />
    </div>

    <div class="section section-3">
      <div class="content">
        <h2>Section Three</h2>
        <p>Path ends here.</p>
      </div>
      <div
        class="dummy dummy-desktop"
        data-control-x="0.25"
        data-control-y="-150"
        style="top: 30%; left: 75%"
      />
      <div
        class="dummy dummy-desktop"
        data-control-x="0.25"
        data-control-y="-100"
        style="top: 85%; left: 30%"
      />
    </div>
  </section>
</template>

<script setup>
// Nuxt/GSAP injection via @hypernym/nuxt-gsap
// We rely on nuxt.config.ts for plugin registration
const { $gsap } = useNuxtApp();

// Refs
const rootRef = ref(null);
const ballRef = ref(null);
const pathSvgRef = ref(null);
const pathRef = ref(null);

onMounted(() => {
  nextTick(() => {
    initializePathAnimation();
  });
});

const getDummyPositions = (rootEl, selector) => {
  const dummies = rootEl ? rootEl.querySelectorAll(selector) : [];
  const rootRect = rootEl
    ? rootEl.getBoundingClientRect()
    : { left: 0, top: 0 };
  return Array.from(dummies).map((dummy) => {
    const rect = dummy.getBoundingClientRect();
    return {
      x: rect.left - rootRect.left + rect.width / 2,
      y: rect.top - rootRect.top + rect.height / 2,
      controlX: parseFloat(dummy.getAttribute("data-control-x")) || 0.25,
      controlY: parseFloat(dummy.getAttribute("data-control-y")) || -100,
    };
  });
};

const createBouncyPath = (points) => {
  if (!points || points.length < 2) return "";
  let path = `M ${points[0].x},${points[0].y} `;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const controlX1 = prev.x + (curr.x - prev.x) * points[i].controlX;
    const controlY1 =
      prev.y + (curr.y - prev.y) * points[i].controlX + points[i].controlY;
    const controlX2 = curr.x - (next.x - curr.x) * points[i].controlX;
    const controlY2 =
      curr.y - (next.y - curr.y) * points[i].controlX + points[i].controlY;
    path += `C ${controlX1},${controlY1} ${controlX2},${controlY2} ${curr.x},${curr.y} `;
  }
  const lastControlX1 =
    points[points.length - 2].x +
    (points[points.length - 1].x - points[points.length - 2].x) *
      points[points.length - 1].controlX;
  const lastControlY1 =
    points[points.length - 2].y +
    (points[points.length - 1].y - points[points.length - 2].y) *
      points[points.length - 1].controlX +
    points[points.length - 1].controlY;
  path += `C ${lastControlX1},${lastControlY1} ${points[points.length - 1].x},${
    points[points.length - 1].y
  } ${points[points.length - 1].x},${points[points.length - 1].y}`;
  return path;
};

const drawPath = (rootEl, selector, pathEl) => {
  const points = getDummyPositions(rootEl, selector);
  if (points.length < 2) return { pathData: "", points: [] };
  const pathData = createBouncyPath(points);
  pathEl.setAttribute("d", pathData);
  return { pathData, points };
};

const initializePathAnimation = () => {
  const root = rootRef.value;
  const ball = ballRef.value;
  const pathEl = pathRef.value;
  if (!root || !ball || !pathEl) return;

  const { pathData, points } = drawPath(root, ".dummy-desktop", pathEl);
  if (!pathData || points.length === 0) return;

  // Place the ball at the first dummy coordinates immediately (no snapping)
  const first = points[0];
  const ballRect = ball.getBoundingClientRect();
  const halfW = ballRect.width ? ballRect.width / 2 : 12;
  const halfH = ballRect.height ? ballRect.height / 2 : 12;
  $gsap.set(ball, {
    left: first.x - halfW,
    top: first.y - halfH,
    autoAlpha: 1,
    clearProps: "transform",
  });

  $gsap
    .timeline({
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    })
    .to(ball, {
      duration: 5,
      ease: "none",
      motionPath: {
        path: pathData,
        align: pathEl,
        alignOrigin: [0.5, 0.5],
        autoRotate: true,
      },
    });
};
</script>

<style scoped></style>
