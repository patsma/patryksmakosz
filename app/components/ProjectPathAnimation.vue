<template>
  <section
    ref="rootRef"
    class="project-path-animation"
    aria-label="Path animation"
  >
    <!-- Ball that moves along the motion path -->
    <div
      ref="ballRef"
      class="project-path-animation__ball ball"
      aria-hidden="true"
      :class="{ '!opacity-0': !isClient }"
    />

    <!-- Hidden SVG used for motion path alignment/debugging -->
    <svg
      ref="pathSvgRef"
      class="project-path-animation__path-svg path-svg"
      width="100%"
      height="100%"
    >
      <path ref="pathRef" id="desktop-motion-path" />
    </svg>

    <!-- Intro animation starting point (above viewport) -->
    <div class="intro-start !absolute !-top-[20vh] !left-1/2 !-translate-x-1/2">
      <div
        class="dummy-point"
        data-path-point
        data-path-order="0"
        data-control-x="0.25"
        data-control-y="-50"
      ></div>
    </div>

    <!-- Three full-screen sections with built-in dummy points -->
    <!-- Section 1: Introduction & Skills Constellation -->
    <div
      class="project-path-animation__section project-path-animation__section--intro section section-1"
    >
      <div class="project-path-animation__content content">
        <div class="project-path-animation__intro intro-header" ref="introHeaderRef">
          <SentenceHiSVG ref="sentenceHiRef" class="w-40 h-40" />
          <div
            class="dummy-point"
            data-path-point
            data-path-order="1"
            data-control-x="0.25"
            data-control-y="-100"
            data-center-on-svg="circle"
          ></div>
          <h1>I'm Patryk</h1>
          <div class="relative">
            <p class="project-path-animation__intro-tagline intro-tagline">
              Front-end Developer & Creative Web Animator with 10+ years
              experience
            </p>
            <div
              class="dummy-point !absolute !top-0 !left-1/4 !right-auto !bottom-auto"
              data-path-point
              data-path-order="2"
              data-control-x="0.25"
              data-control-y="-300"
              data-offset-x="-5"
              data-offset-y="0"
            ></div>
          </div>
          <p
            class="project-path-animation__intro-description intro-description"
          >
            Passionate about bringing 'fun things in web' to life - transforming
            static designs into captivating, interactive experiences. Recognized
            as a
            <a
              href="https://www.upwork.com/freelancers/~01085c23a2f6280a73"
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:text-primary-1 transition-colors"
              >Top Web Animation Expert on UpWork</a
            >.
          </p>
        </div>

        <div class="project-path-animation__skills skills-constellation">
          <h3>Skills & Technologies</h3>
          <div class="project-path-animation__skills-grid skills-grid" ref="skillsGridRef">
            <!-- Text-only skill bullets; preserve dummy points on Nuxt & GSAP -->
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="nuxt"
            >
              <div
                class="dummy-point !absolute !top-0 !left-1/4 !right-auto !bottom-auto"
                data-path-point
                data-path-order="5"
                data-control-x="0.25"
                data-control-y="-300"
                data-offset-x="2"
              ></div>
              <span>Nuxt.js</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="vue"
            >
              <span>Vue.js</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="javascript"
            >
              <span>JavaScript (ES6+)</span>
            </div>

            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="scrolltrigger"
            >
              <span>ScrollTrigger</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="svg-animation"
            >
              <span>SVG Animation</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="canvas"
            >
              <span>HTML5 Canvas</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="threejs"
            >
              <span>Three.js</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="ui-animation"
            >
              <span>UI Animation</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="gsap"
            >
              <div
                class="dummy-point !absolute !top-0 !left-1/4 !right-auto !bottom-auto"
                data-path-point
                data-path-order="6"
                data-control-x="0.25"
                data-control-y="-600"
                data-offset-x="2"
              ></div>
              <span>GSAP Animation</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="banners"
            >
              <span>HTML5 Banners</span>
            </div>

            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="tailwind"
            >
              <span>Tailwind CSS</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="css-grid-flex"
            >
              <span>CSS Grid/Flexbox</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="performance"
            >
              <span>Performance Optimization</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="a11y"
            >
              <span>Accessibility (A11y)</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="headless-wp"
            >
              <span>Headless WordPress</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="figma"
            >
              <span>Figma to Code</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="animation-architecture"
            >
              <span>Animation Architecture</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="parallax"
            >
              <span>Parallax & Transitions</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="prototypes"
            >
              <span>Interactive Prototypes</span>
            </div>
            <div
              class="project-path-animation__skill skill-bubble"
              data-skill="creative-coding"
            >
              <span>Creative Coding</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Experience Timeline -->
    <div
      class="project-path-animation__section project-path-animation__section--timeline section section-2"
    >
      <div class="project-path-animation__content content">
        <div class="project-path-animation__timeline-header timeline-header" ref="timelineHeaderRef">
          <h2>Professional Journey</h2>
          <p>A decade of crafting digital experiences</p>
        </div>

        <div class="project-path-animation__timeline timeline-milestones" ref="milestonesRef">
          <!-- Career milestones with ordered dummy points -->
          <div
            class="project-path-animation__milestone milestone"
            data-year="2023"
          >
            <div class="project-path-animation__milestone-dot milestone-dot">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="8"
                data-control-x="0.25"
                data-control-y="-800"
              ></div>
            </div>
            <div
              class="project-path-animation__milestone-content milestone-content"
            >
              <h4>Complex SVG Animations</h4>
              <p>Advanced logo animations & isometric projects</p>
            </div>
          </div>

          <div
            class="project-path-animation__milestone milestone"
            data-year="2022-2023"
          >
            <div
              class="project-path-animation__milestone-dot milestone-dot"
            ></div>
            <div
              class="project-path-animation__milestone-content milestone-content"
            >
              <h4>Senior Frontend @ BÆRNHOLDT</h4>
              <p>Tabellae, Nixu, Novo Nordisk projects</p>
            </div>
          </div>

          <div
            class="project-path-animation__milestone milestone"
            data-year="2018"
          >
            <div
              class="project-path-animation__milestone-dot milestone-dot"
            ></div>
            <div
              class="project-path-animation__milestone-content milestone-content relative"
            >
              <h4>Founded TastySites</h4>
              <p>CEO & Creative Lead</p>
              <div
                class="dummy-point !absolute !top-auto !left-auto !right-0 !bottom-0"
                data-path-point
                data-path-order="8"
                data-control-x="0.25"
                data-control-y="-800"
              ></div>
            </div>
          </div>

          <div
            class="project-path-animation__milestone milestone"
            data-year="2017-2018"
          >
            <div class="project-path-animation__milestone-dot milestone-dot">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="9"
                data-control-x="0.25"
                data-control-y="-700"
              ></div>
            </div>
            <div
              class="project-path-animation__milestone-content milestone-content"
            >
              <h4>Creative Coder @ UpWork</h4>
              <p>Interactive web content & SVG banners</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Contact & Future -->
    <div
      class="project-path-animation__section project-path-animation__section--contact section section-3"
    >
      <div class="project-path-animation__content content">
        <div class="project-path-animation__contact-header contact-header" ref="contactHeaderRef">
          <h2>Let's Connect!</h2>
          <p>Ready to bring your vision to life</p>
        </div>

        <div class="project-path-animation__contact contact-info">
          <div class="project-path-animation__contact-grid contact-grid" ref="contactGridRef">
            <!-- Contact items with dummy points -->
            <div
              class="project-path-animation__contact-item contact-item relative"
            >
              <div
                class="dummy-point !absolute !top-0 !left-0"
                data-path-point
                data-path-order="10"
                data-control-x="0.25"
                data-control-y="-400"
              ></div>
              <Icon name="mdi:email" size="24" />
              <a href="mailto:patryksmakosz1@gmail.com">
                patryksmakosz1@gmail.com</a
              >
            </div>
            <div
              class="project-path-animation__contact-item contact-item relative"
            >
              <div
                class="dummy-point !absolute !top-0 !left-[70%]"
                data-path-point
                data-path-order="11"
                data-control-x="0.25"
                data-control-y="-300"
              ></div>
              <Icon name="mdi:linkedin" size="24" />
              <a
                href="https://www.linkedin.com/in/patryksmakosz/"
                target="_blank"
                rel="noopener noreferrer"
                class="underline hover:text-primary-1 transition-colors"
                >@patryksmakosz</a
              >
            </div>

            <div class="project-path-animation__contact-item contact-item">
              <Icon name="mdi:map-marker" size="24" />
              <span>Gdansk, Poland</span>
            </div>
          </div>

          <div class="project-path-animation__cta cta-section">
            <!-- Final target with ordered dummy point -->
            <div
              class="project-path-animation__target connection-target"
              id="final-target"
            >
              <div
                class="project-path-animation__target-ring target-ring"
              ></div>
              <div
                class="project-path-animation__target-center target-center"
                id="target-center"
              >
                <div
                  class="dummy-point"
                  data-path-point
                  data-path-order="12"
                  data-control-x="0.25"
                  data-control-y="-600"
                  data-center-on="#target-center"
                ></div>
              </div>
            </div>
            <p class="project-path-animation__cta-text cta-text" ref="ctaTextRef">
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
const { $SplitText } = useNuxtApp();

// Refs
const rootRef = ref(null);
const ballRef = ref(null);
const pathSvgRef = ref(null);
const pathRef = ref(null);
const sentenceHiRef = ref(null);
const isClient = ref(false);
let resizeObserver = null;
let resizeTimer = null;

// Animation refs for stagger animations
const introHeaderRef = ref(null);
const skillsGridRef = ref(null);
const timelineHeaderRef = ref(null);
const milestonesRef = ref(null);
const contactHeaderRef = ref(null);
const contactGridRef = ref(null);
const ctaTextRef = ref(null);

// Storage for section animation timelines
const sectionTimelines = ref([]);
let splitTextInstance = null;

onMounted(() => {
  isClient.value = true;
  // Wait for hydration to complete and DOM to be ready
  nextTick(() => {
    // Additional delay to ensure GSAP and all components are fully initialized
    setTimeout(() => {
      initializePathAnimation();
      initializeSectionAnimations();
      initializeCTATextAnimation();
    }, 100);
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

  // Clean up section animation timelines
  sectionTimelines.value.forEach((timeline) => {
    try {
      timeline.kill();
    } catch (_) {}
  });
  sectionTimelines.value = [];

  // Clean up split text instance
  if (splitTextInstance) {
    try {
      splitTextInstance.revert();
    } catch (_) {}
    splitTextInstance = null;
  }

  if (resizeObserver) {
    try {
      resizeObserver.disconnect();
    } catch (_) {}
  }
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
});

/**
 * Initialize stagger animations for section elements
 * Creates smooth fade-in animations with stagger for various sections
 */
const initializeSectionAnimations = () => {
  // Guard against server-side execution
  if (!process.client || !isClient.value) return;

  const root = rootRef.value;
  if (!root || !$gsap) return;

  // Clear any existing section timelines
  sectionTimelines.value.forEach((timeline) => {
    try {
      timeline.kill();
    } catch (_) {}
  });
  sectionTimelines.value = [];

  // Section 1: Intro Header Animation
  if (introHeaderRef.value) {
    const introElements = [
      introHeaderRef.value.querySelector('h1'),
      introHeaderRef.value.querySelector('.intro-tagline'),
      introHeaderRef.value.querySelector('.intro-description')
    ].filter(Boolean);

    if (introElements.length > 0) {
      // Set initial state - only opacity, no transforms
      $gsap.set(introElements, { autoAlpha: 0 });
      
      const introTimeline = $gsap.timeline({
        scrollTrigger: {
          trigger: introHeaderRef.value,
          start: "top bottom-=10%",
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      });
      
      introTimeline.to(introElements, {
        autoAlpha: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out"
      });
      
      sectionTimelines.value.push(introTimeline);
    }
  }

  // Skills Grid Animation
  if (skillsGridRef.value) {
    const skillBubbles = skillsGridRef.value.querySelectorAll('.skill-bubble');
    
    if (skillBubbles.length > 0) {
      // Set initial state - only opacity, no transforms
      $gsap.set(skillBubbles, { autoAlpha: 0 });
      
      const skillsTimeline = $gsap.timeline({
        scrollTrigger: {
          trigger: skillsGridRef.value,
          start: "top bottom-=5%",
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      });
      
      skillsTimeline.to(skillBubbles, {
        autoAlpha: 1,
        duration: 0.5,
        stagger: {
          amount: 1.0,
          from: "random"
        },
        ease: "power2.out"
      });
      
      sectionTimelines.value.push(skillsTimeline);
    }
  }

  // Timeline Header Animation
  if (timelineHeaderRef.value) {
    const timelineHeaderElements = [
      timelineHeaderRef.value.querySelector('h2'),
      timelineHeaderRef.value.querySelector('p')
    ].filter(Boolean);

    if (timelineHeaderElements.length > 0) {
      // Set initial state - only opacity, no transforms
      $gsap.set(timelineHeaderElements, { autoAlpha: 0 });
      
      const timelineHeaderTimeline = $gsap.timeline({
        scrollTrigger: {
          trigger: timelineHeaderRef.value,
          start: "top bottom-=10%",
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      });
      
      timelineHeaderTimeline.to(timelineHeaderElements, {
        autoAlpha: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      });
      
      sectionTimelines.value.push(timelineHeaderTimeline);
    }
  }

  // Timeline Milestones Animation
  if (milestonesRef.value) {
    const milestones = milestonesRef.value.querySelectorAll('.milestone');
    
    if (milestones.length > 0) {
      // Set initial state - only opacity, no transforms
      $gsap.set(milestones, { autoAlpha: 0 });
      
      const milestonesTimeline = $gsap.timeline({
        scrollTrigger: {
          trigger: milestonesRef.value,
          start: "top bottom-=5%",
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      });
      
      milestonesTimeline.to(milestones, {
        autoAlpha: 1,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out"
      });
      
      sectionTimelines.value.push(milestonesTimeline);
    }
  }

  // Contact Header Animation
  if (contactHeaderRef.value) {
    const contactHeaderElements = [
      contactHeaderRef.value.querySelector('h2'),
      contactHeaderRef.value.querySelector('p')
    ].filter(Boolean);

    if (contactHeaderElements.length > 0) {
      // Set initial state - only opacity, no transforms
      $gsap.set(contactHeaderElements, { autoAlpha: 0 });
      
      const contactHeaderTimeline = $gsap.timeline({
        scrollTrigger: {
          trigger: contactHeaderRef.value,
          start: "top bottom-=10%",
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      });
      
      contactHeaderTimeline.to(contactHeaderElements, {
        autoAlpha: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      });
      
      sectionTimelines.value.push(contactHeaderTimeline);
    }
  }

  // Contact Grid Animation
  if (contactGridRef.value) {
    const contactItems = contactGridRef.value.querySelectorAll('.contact-item');
    
    if (contactItems.length > 0) {
      // Set initial state - only opacity, no transforms
      $gsap.set(contactItems, { autoAlpha: 0 });
      
      const contactGridTimeline = $gsap.timeline({
        scrollTrigger: {
          trigger: contactGridRef.value,
          start: "top bottom-=5%",
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      });
      
      contactGridTimeline.to(contactItems, {
        autoAlpha: 1,
        duration: 0.5,
        stagger: 0.15,
        ease: "power2.out"
      });
      
      sectionTimelines.value.push(contactGridTimeline);
    }
  }
};

/**
 * Initialize split text animation for CTA text
 * Creates character-by-character reveal animation
 */
const initializeCTATextAnimation = () => {
  // Guard against server-side execution
  if (!process.client || !isClient.value) return;
  
  const ctaText = ctaTextRef.value;
  if (!ctaText || !$SplitText) return;

  // Clean up any existing split text instance
  if (splitTextInstance) {
    try {
      splitTextInstance.revert();
    } catch (_) {}
  }

  // Create SplitText instance with masking like ProjectHeroSplitText
  splitTextInstance = $SplitText.create(ctaText, {
    type: "chars, lines",
    mask: "lines"
  });

  if (!splitTextInstance.chars || splitTextInstance.chars.length === 0) {
    return;
  }

  // Create timeline for split text animation
  const ctaTimeline = $gsap.timeline({
    scrollTrigger: {
      trigger: ctaText,
      start: "top bottom-=5%",
      end: "bottom center",
      toggleActions: "play none none reverse"
    }
  });

  // Animate characters from bottom with yPercent using wrap
  ctaTimeline.from(splitTextInstance.chars, {
    yPercent: (i) => $gsap.utils.wrap([-100, 100])(i),
    stagger: 0.02,
    duration: 0.6,
    ease: "sine.out"
  });

  sectionTimelines.value.push(ctaTimeline);
};

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

    // If data-center-on-svg is specified, find the SVG element within the SentenceHi component
    const centerOnSvgId = point.getAttribute("data-center-on-svg");
    if (centerOnSvgId && sentenceHiRef.value?.svgRootRef) {
      const svgElement = sentenceHiRef.value.svgRootRef.querySelector(
        `#${centerOnSvgId}`
      );
      if (svgElement) {
        targetElement = svgElement;
      }
    }

    const rect = targetElement.getBoundingClientRect();

    // Position at center of target element (could be the dummy point itself or specified element)
    const baseX = rect.left - rootRect.left + rect.width / 2;
    const baseY = rect.top - rootRect.top + rect.height / 2;

    // Get responsive offsets (in viewport units for easy responsiveness)
    const offsetXVw = parseFloat(point.getAttribute("data-offset-x")) || 0;
    const offsetYVh = parseFloat(point.getAttribute("data-offset-y")) || 0;

    // Convert viewport units to pixels (with client-side guard)
    const offsetX =
      typeof window !== "undefined" ? (offsetXVw / 100) * window.innerWidth : 0;
    const offsetY =
      typeof window !== "undefined"
        ? (offsetYVh / 100) * window.innerHeight
        : 0;

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
  // Support both legacy and BEM selectors
  const skillsHeaderEl =
    rootEl.querySelector(".skills-constellation h3") ||
    rootEl.querySelector(".project-path-animation__skills h3");
  const timelineHeaderEl =
    rootEl.querySelector(".timeline-header h2") ||
    rootEl.querySelector(".project-path-animation__timeline-header h2");
  const specialElements = {
    finalTarget: rootEl.querySelector("#final-target"),
    skillsHeader: skillsHeaderEl,
    timelineHeader: timelineHeaderEl,
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
  // Guard against server-side execution
  if (!process.client || !isClient.value) return;

  const root = rootRef.value;
  const ball = ballRef.value;
  const pathEl = pathRef.value;
  if (!root || !ball || !pathEl) return;

  // Ensure GSAP is available
  if (!$gsap) {
    console.warn("GSAP not available, retrying...");
    setTimeout(initializePathAnimation, 200);
    return;
  }

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
        start: "top center+=25",
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
    if (typeof window !== "undefined" && st) {
      // Only create ResizeObserver if available
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          if (resizeTimer) clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            recalcPathAndPosition(root, pathEl, ball);
            st.refresh();
          }, 100);
        });
        resizeObserver.observe(root);
      }

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
