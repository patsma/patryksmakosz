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
    <!-- Section 1: Introduction & Skills Constellation -->
    <div class="section section-1">
      <div class="content">
        <div class="intro-header">
          <h1>Hello! I'm Patryk</h1>
          <p class="intro-tagline">
            Front-end Developer & Creative Web Animator with 10+ years
            experience
          </p>
          <p class="intro-description">
            Passionate about bringing 'fun things in web' to life - transforming
            static designs into captivating, interactive experiences. Recognized
            as a Top Web Animation Expert on UpWork.
          </p>
        </div>

        <div class="skills-constellation">
          <h3>Skills & Technologies</h3>
          <div class="skills-grid">
            <!-- Skill bubbles with positioned dummy points -->
            <div class="skill-bubble" data-skill="nuxt">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="1"
                data-control-x="0.25"
                data-control-y="-100"
              ></div>
              <!-- 
                data-offset-x="-15"
                data-offset-y="-10"
              -->
              <Icon name="logos:nuxt-icon" size="24" />
              <span>Nuxt.js</span>
            </div>
            <div class="skill-bubble" data-skill="vue">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="2"
                data-control-x="0.25"
                data-control-y="-100"
                data-offset-x="2"
                data-offset-y="-1"
              ></div>
              <Icon name="logos:vue" size="24" />
              <span>Vue.js</span>
            </div>
            <div class="skill-bubble" data-skill="gsap">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="3"
                data-control-x="0.25"
                data-control-y="-100"
              ></div>
              <Icon name="simple-icons:greensock" size="24" />
              <span>GSAP</span>
            </div>
            <div class="skill-bubble" data-skill="threejs">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="4"
                data-control-x="0.25"
                data-control-y="-100"
                data-offset-x="3"
                data-offset-y="0.5"
              ></div>
              <Icon name="logos:threejs" size="24" />
              <span>Three.js</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Experience Timeline -->
    <div class="section section-2">
      <div class="content">
        <div class="timeline-header">
          <h2>Professional Journey</h2>
          <p>A decade of crafting digital experiences</p>
        </div>

        <div class="timeline-milestones">
          <!-- Career milestones with ordered dummy points -->
          <div class="milestone" data-year="2023">
            <div class="milestone-dot">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="5"
                data-control-x="0.25"
                data-control-y="-100"
              ></div>
            </div>
            <div class="milestone-content">
              <h4>Complex SVG Animations</h4>
              <p>Advanced logo animations & isometric projects</p>
            </div>
          </div>

          <div class="milestone" data-year="2022-2023">
            <div class="milestone-dot">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="6"
                data-control-x="0.25"
                data-control-y="-100"
                data-offset-x="-2"
                data-offset-y="-0.5"
              ></div>
            </div>
            <div class="milestone-content">
              <h4>Senior Frontend @ BÆRNHOLDT</h4>
              <p>Disney, Mazda, Novo Nordisk projects</p>
            </div>
          </div>

          <div class="milestone" data-year="2018">
            <div class="milestone-dot">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="7"
                data-control-x="0.25"
                data-control-y="-100"
              ></div>
            </div>
            <div class="milestone-content">
              <h4>Founded TastySites</h4>
              <p>CEO & Creative Lead</p>
            </div>
          </div>

          <div class="milestone" data-year="2017-2018">
            <div class="milestone-dot">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="8"
                data-control-x="0.25"
                data-control-y="-100"
              ></div>
            </div>
            <div class="milestone-content">
              <h4>Creative Coder @ GREEN RUBINO</h4>
              <p>Interactive web content & SVG banners</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Contact & Future -->
    <div class="section section-3">
      <div class="content">
        <div class="contact-header">
          <h2>Let's Connect!</h2>
          <p>Ready to bring your vision to life</p>
        </div>

        <div class="contact-info">
          <div class="contact-grid">
            <!-- Contact items with dummy points -->
            <div class="contact-item">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="9"
                data-control-x="0.25"
                data-control-y="-100"
              ></div>
              <Icon name="mdi:email" size="24" />
              <span>kontakt@tastysites.pl</span>
            </div>
            <div class="contact-item">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="10"
                data-control-x="0.25"
                data-control-y="-100"
              ></div>
              <Icon name="mdi:linkedin" size="24" />
              <span>@patryksmakosz</span>
            </div>
            <div class="contact-item">
              <Icon name="mdi:web" size="24" />
              <span>tastysites.pl</span>
            </div>
            <div class="contact-item">
              <Icon name="mdi:map-marker" size="24" />
              <span>Gdansk, Poland</span>
            </div>
          </div>

          <div class="cta-section">
            <!-- Final target with ordered dummy point -->
            <div class="connection-target" id="final-target">
              <div class="target-ring"></div>
              <div class="target-center" id="target-center">
                <div
                  class="dummy-point"
                  data-path-point
                  data-path-order="11"
                  data-control-x="0.25"
                  data-control-y="-100"
                  data-center-on="#target-center"
                ></div>
              </div>
            </div>
            <p class="cta-text">
              Whether you need GSAP animations, Nuxt.js apps, or bespoke
              WordPress development - I'm here to transform your ideas into
              exceptional digital experiences.
            </p>
          </div>
        </div>
      </div>
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
let resizeObserver = null;
let resizeTimer = null;

onMounted(() => {
  nextTick(() => {
    initializePathAnimation();
  });
});

onUnmounted(() => {
  // Kill any ScrollTrigger instances created for this component to avoid leaks
  try {
    const st = $gsap.core.globals().ScrollTrigger;
    if (st) {
      st.getAll().forEach((t) => {
        if (rootRef.value && t.vars && t.vars.trigger === rootRef.value) {
          t.kill();
        }
      });
    }
  } catch (_) {}

  if (resizeObserver) {
    try {
      resizeObserver.disconnect();
    } catch (_) {}
  }
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
});

// Enhanced system: get positions from ordered DOM elements with [data-path-point]
const getPathPointPositions = (rootEl) => {
  if (!rootEl) return [];

  const rootRect = rootEl.getBoundingClientRect();
  const pathPoints = rootEl.querySelectorAll("[data-path-point]");

  // Sort by data-path-order attribute to ensure correct sequence
  const sortedPoints = Array.from(pathPoints).sort((a, b) => {
    const orderA = parseInt(a.getAttribute("data-path-order")) || 0;
    const orderB = parseInt(b.getAttribute("data-path-order")) || 0;
    return orderA - orderB;
  });

  return sortedPoints.map((point) => {
    const centerOnSelector = point.getAttribute("data-center-on");
    let targetElement = point;

    // If data-center-on is specified, find the target element to center on
    if (centerOnSelector) {
      const targetEl = rootEl.querySelector(centerOnSelector);
      if (targetEl) {
        targetElement = targetEl;
      }
    }

    const rect = targetElement.getBoundingClientRect();

    // Position at center of target element (could be the dummy point itself or specified element)
    const baseX = rect.left - rootRect.left + rect.width / 2;
    const baseY = rect.top - rootRect.top + rect.height / 2;

    // Get responsive offsets (in viewport units for easy responsiveness)
    const offsetXVw = parseFloat(point.getAttribute("data-offset-x")) || 0;
    const offsetYVh = parseFloat(point.getAttribute("data-offset-y")) || 0;

    // Convert viewport units to pixels
    const offsetX = (offsetXVw / 100) * window.innerWidth;
    const offsetY = (offsetYVh / 100) * window.innerHeight;

    return {
      x: baseX + offsetX,
      y: baseY + offsetY,
      controlX: parseFloat(point.getAttribute("data-control-x")) || 0.25,
      controlY: parseFloat(point.getAttribute("data-control-y")) || -100,
      order: parseInt(point.getAttribute("data-path-order")) || 0,
      element: point,
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

const drawPath = (rootEl, pathEl) => {
  const points = getPathPointPositions(rootEl);
  if (points.length < 2) return { pathData: "", points: [] };
  const pathData = createBouncyPath(points);
  pathEl.setAttribute("d", pathData);
  return { pathData, points };
};

// Enhanced positioning system for precise element alignment
const getElementPosition = (element, rootEl) => {
  if (!element || !rootEl) return null;
  const rootRect = rootEl.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  return {
    x: elementRect.left - rootRect.left + elementRect.width / 2,
    y: elementRect.top - rootRect.top + elementRect.height / 2,
  };
};

// Enhanced positioning system with special element targeting
const getSpecialElementPositions = (rootEl) => {
  const specialElements = {
    finalTarget: rootEl.querySelector("#final-target"),
    skillsHeader: rootEl.querySelector(".skills-constellation h3"),
    timelineHeader: rootEl.querySelector(".timeline-header h2"),
  };

  const positions = {};
  Object.entries(specialElements).forEach(([key, element]) => {
    if (element) {
      positions[key] = getElementPosition(element, rootEl);
    }
  });

  return positions;
};

const recalcPathAndPosition = (root, pathEl, ball) => {
  // Wait a frame to ensure layout is settled after resize
  requestAnimationFrame(() => {
    const { pathData, points } = drawPath(root, pathEl);
    if (!pathData || points.length === 0) return;

    // Position ball at first path point
    const firstPt = points[0];
    const half = 12; // ball is 24px
    $gsap.set(ball, { left: firstPt.x - half, top: firstPt.y - half });
  });
};

const initializePathAnimation = () => {
  const root = rootRef.value;
  const ball = ballRef.value;
  const pathEl = pathRef.value;
  if (!root || !ball || !pathEl) return;

  let { pathData, points } = drawPath(root, pathEl);
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
        start: "top top+=25%",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: () => {
          recalcPathAndPosition(root, pathEl, ball);
        },
      },
    })
    .to(ball, {
      duration: 5,
      ease: "none",
      motionPath: {
        path: pathEl,
        align: pathEl,
        alignOrigin: [0.5, 0.5],
        autoRotate: true,
      },
    });

  // Observe root size changes and window resize to force refresh
  try {
    const st = $gsap.core.globals().ScrollTrigger;
    if (window && st) {
      resizeObserver = new ResizeObserver(() => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          recalcPathAndPosition(root, pathEl, ball);
          st.refresh();
        }, 100);
      });
      resizeObserver.observe(root);

      window.addEventListener(
        "resize",
        () => {
          if (resizeTimer) clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            recalcPathAndPosition(root, pathEl, ball);
            st.refresh();
          }, 100);
        },
        { passive: true }
      );
    }
  } catch (_) {}
};
</script>

<style scoped></style>
