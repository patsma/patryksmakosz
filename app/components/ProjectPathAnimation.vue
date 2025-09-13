<template>
  <section
    ref="rootRef"
    class="project-path-animation"
    aria-label="Path animation"
  >
    <!-- Parallax Background Elements -->
    <div class="project-path-animation__parallax-bg parallax-bg">
      <!-- Section 1 (Blue background) - White-ish elements with varied parallax speeds -->
      <div
        class="project-path-animation__parallax-element parallax-element parallax-element--1"
        data-speed="0.8"
        data-lag="0.1"
      ></div>
      <div
        class="project-path-animation__parallax-element parallax-element parallax-element--2"
        data-speed="0.6"
        data-lag="0.05"
      ></div>

      <!-- Section 2 & 3 (White background) - Blue-ish elements with different speeds -->
      <div
        class="project-path-animation__parallax-element parallax-element parallax-element--3"
        data-speed="1.2"
        data-lag="0.08"
      ></div>
      <div
        class="project-path-animation__parallax-element parallax-element parallax-element--4"
        data-speed="0.4"
        data-lag="0.12"
      ></div>
      <div
        class="project-path-animation__parallax-element parallax-element parallax-element--5"
        data-speed="0.9"
        data-lag="0.06"
      ></div>
      <div
        class="project-path-animation__parallax-element parallax-element parallax-element--6"
        data-speed="0.7"
        data-lag="0.04"
      ></div>
      <div
        class="project-path-animation__parallax-element parallax-element parallax-element--7"
        data-speed="0.5"
        data-lag="0.08"
      ></div>
    </div>

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
        <div
          class="project-path-animation__intro intro-header"
          ref="introHeaderRef"
        >
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
              data-control-y="-210"
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
          <div
            class="project-path-animation__skills-grid skills-grid"
            ref="skillsGridRef"
          >
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
                data-control-y="-210"
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
                data-control-y="-290"
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
              <div
                class="dummy-point !absolute !top-0 !left-1/2 !right-auto !bottom-auto"
                data-path-point
                data-path-order="7"
                data-control-x="0.15"
                data-control-y="-300"
                data-offset-x="0"
                data-offset-y="0"
              ></div>
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
        <div
          class="project-path-animation__timeline-header timeline-header"
          ref="timelineHeaderRef"
        >
          <h2>Professional Journey</h2>
          <p>A decade of crafting digital experiences</p>
        </div>

        <div
          class="project-path-animation__timeline timeline-milestones"
          ref="milestonesRef"
        >
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
                data-control-x="0.3"
                data-control-y="-300"
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
            <div class="project-path-animation__milestone-dot milestone-dot">
              <div
                class="dummy-point"
                data-path-point
                data-path-order="8.2"
                data-control-x="0.25"
                data-control-y="-440"
              ></div>
            </div>
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
              <div
                class="dummy-point !absolute !top-1/2 !left-1/2 !right-auto !bottom-auto"
                data-path-point
                data-path-order="8.4"
                data-control-x="0.3"
                data-control-y="-280"
              ></div>
              <h4>Founded TastySites</h4>
              <p>CEO & Creative Lead</p>
              <div
                class="dummy-point !absolute !top-auto !left-auto !right-0 !bottom-0"
                data-path-point
                data-path-order="8.5"
                data-control-x="0.2"
                data-control-y="-390"
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
                data-control-x="0.4"
                data-control-y="-210"
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
        <div
          class="project-path-animation__contact-header contact-header"
          ref="contactHeaderRef"
        >
          <h2>Let's Connect!</h2>
          <p>Ready to bring your vision to life</p>
        </div>

        <div class="project-path-animation__contact contact-info">
          <div
            class="project-path-animation__contact-grid contact-grid"
            ref="contactGridRef"
          >
            <!-- Contact items with dummy points -->
            <!-- Email -->
            <a
              href="mailto:patryksmakosz1@gmail.com"
              class="project-path-animation__contact-item contact-item relative hover:text-primary-1 transition-colors"
            >
              <div
                class="dummy-point !absolute !top-0 !left-0"
                data-path-point
                data-path-order="10"
                data-control-x="0.5"
                data-control-y="-450"
              ></div>
              <Icon name="tabler:mail" class="w-6 h-6 text-black" />
              <span>patryksmakosz1@gmail.com</span>
            </a>

            <!-- LinkedIn -->
            <a
              href="https://www.linkedin.com/in/patryksmakosz/"
              target="_blank"
              rel="noopener noreferrer"
              class="project-path-animation__contact-item contact-item hover:text-primary-1 transition-colors"
            >
              <Icon name="tabler:brand-linkedin" class="w-6 h-6 text-black" />
              <span>LinkedIn</span>
            </a>

            <!-- Facebook -->
            <a
              href="https://www.facebook.com/TastySites/"
              target="_blank"
              rel="noopener noreferrer"
              class="project-path-animation__contact-item contact-item relative hover:text-primary-1 transition-colors"
            >
              <div
                class="dummy-point !absolute !top-0 !left-[70%]"
                data-path-point
                data-path-order="11"
                data-control-x="0.35"
                data-control-y="-450"
              ></div>
              <Icon name="tabler:brand-facebook" class="w-6 h-6 text-black" />
              <span>Facebook</span>
            </a>

            <!-- Dribbble -->
            <a
              href="https://dribbble.com/tastysites"
              target="_blank"
              rel="noopener noreferrer"
              class="project-path-animation__contact-item contact-item hover:text-primary-1 transition-colors"
            >
              <Icon name="tabler:brand-dribbble" class="w-6 h-6 text-black" />
              <span>Dribbble</span>
            </a>

            <!-- Upwork -->
            <a
              href="https://www.upwork.com/freelancers/~01085c23a2f6280a73"
              target="_blank"
              rel="noopener noreferrer"
              class="project-path-animation__contact-item contact-item hover:text-primary-1 transition-colors"
            >
              <Icon name="simple-icons:upwork" class="w-6 h-6 text-black" />
              <span>Upwork</span>
            </a>

            <!-- X (Twitter) -->
            <a
              href="https://x.com/TastySites"
              target="_blank"
              rel="noopener noreferrer"
              class="project-path-animation__contact-item contact-item hover:text-primary-1 transition-colors"
            >
              <Icon name="tabler:brand-x" class="w-6 h-6 text-black" />
              <span>X (Twitter)</span>
            </a>

            <!-- Bluesky -->
            <a
              href="https://bsky.app/profile/tastysites.bsky.social"
              target="_blank"
              rel="noopener noreferrer"
              class="project-path-animation__contact-item contact-item hover:text-primary-1 transition-colors"
            >
              <Icon name="simple-icons:bluesky" class="w-6 h-6 text-black" />
              <span>Bluesky</span>
            </a>

            <!-- YouTube -->
            <a
              href="https://www.youtube.com/channel/UCj7wr_x-BwJ0Yam8uw5lDsw"
              target="_blank"
              rel="noopener noreferrer"
              class="project-path-animation__contact-item contact-item hover:text-primary-1 transition-colors"
            >
              <Icon name="tabler:brand-youtube" class="w-6 h-6 text-black" />
              <span>YouTube</span>
            </a>

            <!-- GitHub -->
            <a
              href="https://github.com/patsma"
              target="_blank"
              rel="noopener noreferrer"
              class="project-path-animation__contact-item contact-item hover:text-primary-1 transition-colors"
            >
              <Icon name="tabler:brand-github" class="w-6 h-6 text-black" />
              <span>GitHub</span>
            </a>
          </div>

          <div class="project-path-animation__cta cta-section">
            <!-- Final target with ordered dummy point -->
            <div
              ref="targetCircleRef"
              class="project-path-animation__target connection-target"
              id="final-target"
            >
              <div
                class="project-path-animation__target-center target-center"
                id="target-center"
              >
                <div
                  class="dummy-point"
                  data-path-point
                  data-path-order="13"
                  data-control-x="0.25"
                  data-control-y="-800"
                  data-center-on="#target-center"
                ></div>
              </div>
            </div>
            <div
              class="project-path-animation__cta-text cta-text"
              ref="ctaTextRef"
            >
              <p>
                Whether you need
                <strong class="text-primary">GSAP animations</strong>,
                <strong class="text-alternative">Nuxt.js apps</strong>, or
                <em class="text-italic-accent"
                  >bespoke WordPress development</em
                >
                - <span class="text-highlight">I'm here to transform</span> your
                ideas into
                <strong class="text-gradient-emphasis"
                  >exceptional digital experiences</strong
                >.
              </p>
              <p class="cta-contact">
                Ready to start?
                <a href="mailto:patryksmakosz1@gmail.com" class="email-link">
                  Let's connect
                </a>
                and bring your vision to life.
              </p>
            </div>
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
const targetCircleRef = ref(null);

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
      introHeaderRef.value.querySelector("h1"),
      introHeaderRef.value.querySelector(".intro-tagline"),
      introHeaderRef.value.querySelector(".intro-description"),
    ].filter(Boolean);

    if (introElements.length > 0) {
      // Set initial state - only opacity, no transforms
      $gsap.set(introElements, { autoAlpha: 0 });

      const introTimeline = $gsap.timeline({
        scrollTrigger: {
          trigger: introHeaderRef.value,
          start: "top bottom-=10%",
          end: "bottom top+=20%",
          toggleActions: "play none none reverse",
        },
      });

      introTimeline.to(introElements, {
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
      });

      sectionTimelines.value.push(introTimeline);
    }
  }

  // Skills Grid Animation
  if (skillsGridRef.value) {
    const skillBubbles = skillsGridRef.value.querySelectorAll(".skill-bubble");

    if (skillBubbles.length > 0) {
      // Set initial state - only opacity, no transforms
      $gsap.set(skillBubbles, { autoAlpha: 0 });

      const skillsTimeline = $gsap.timeline({
        scrollTrigger: {
          trigger: skillsGridRef.value,
          start: "top bottom-=5%",
          end: "bottom top+=20%",
          toggleActions: "play none none reverse",
        },
      });

      skillsTimeline.to(skillBubbles, {
        autoAlpha: 1,
        duration: 0.3,
        stagger: {
          amount: 0.6,
          from: "random",
        },
        ease: "power2.out",
      });

      sectionTimelines.value.push(skillsTimeline);
    }
  }

  // Timeline Header Animation
  if (timelineHeaderRef.value) {
    const timelineHeaderElements = [
      timelineHeaderRef.value.querySelector("h2"),
      timelineHeaderRef.value.querySelector("p"),
    ].filter(Boolean);

    if (timelineHeaderElements.length > 0) {
      // Set initial state - only opacity, no transforms
      $gsap.set(timelineHeaderElements, { autoAlpha: 0 });

      const timelineHeaderTimeline = $gsap.timeline({
        scrollTrigger: {
          trigger: timelineHeaderRef.value,
          start: "top bottom-=10%",
          end: "bottom top+=20%",
          toggleActions: "play none none reverse",
        },
      });

      timelineHeaderTimeline.to(timelineHeaderElements, {
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.out",
      });

      sectionTimelines.value.push(timelineHeaderTimeline);
    }
  }

  // Timeline Milestones Animation
  if (milestonesRef.value) {
    const milestones = milestonesRef.value.querySelectorAll(".milestone");

    if (milestones.length > 0) {
      // Set initial state - only opacity, no transforms
      $gsap.set(milestones, { autoAlpha: 0 });

      const milestonesTimeline = $gsap.timeline({
        scrollTrigger: {
          trigger: milestonesRef.value,
          start: "top bottom-=5%",
          end: "bottom top+=20%",
          toggleActions: "play none none reverse",
        },
      });

      milestonesTimeline.to(milestones, {
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.15,
        ease: "power2.out",
      });

      sectionTimelines.value.push(milestonesTimeline);
    }
  }

  // Contact Header Animation
  if (contactHeaderRef.value) {
    const contactHeaderElements = [
      contactHeaderRef.value.querySelector("h2"),
      contactHeaderRef.value.querySelector("p"),
    ].filter(Boolean);

    if (contactHeaderElements.length > 0) {
      // Set initial state - only opacity, no transforms
      $gsap.set(contactHeaderElements, { autoAlpha: 0 });

      const contactHeaderTimeline = $gsap.timeline({
        scrollTrigger: {
          trigger: contactHeaderRef.value,
          start: "top bottom-=10%",
          end: "bottom top+=20%",
          toggleActions: "play none none reverse",
        },
      });

      contactHeaderTimeline.to(contactHeaderElements, {
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.out",
      });

      sectionTimelines.value.push(contactHeaderTimeline);
    }
  }

  // Contact Grid Animation
  if (contactGridRef.value) {
    const contactItems = contactGridRef.value.querySelectorAll(".contact-item");

    if (contactItems.length > 0) {
      // Set initial state - only opacity, no transforms
      $gsap.set(contactItems, { autoAlpha: 0 });

      const contactGridTimeline = $gsap.timeline({
        scrollTrigger: {
          trigger: contactGridRef.value,
          start: "top bottom-=5%",
          end: "bottom top+=20%",
          toggleActions: "play none none reverse",
        },
      });

      contactGridTimeline.to(contactItems, {
        autoAlpha: 1,
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.out",
      });

      sectionTimelines.value.push(contactGridTimeline);
    }
  }

  // Target Circle Animation
  if (targetCircleRef.value) {
    // Set initial state - only opacity, no transforms
    $gsap.set(targetCircleRef.value, { autoAlpha: 0 });

    const targetCircleTimeline = $gsap.timeline({
      scrollTrigger: {
        trigger: targetCircleRef.value,
        start: "top bottom-=50%",
        // markers: true,
        end: "bottom top+=20%",
        toggleActions: "play none none reverse",
      },
    });

    targetCircleTimeline.to(targetCircleRef.value, {
      autoAlpha: 1,
      duration: 0.6,
      ease: "power2.out",
    });

    sectionTimelines.value.push(targetCircleTimeline);
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

  // Create SplitText instance with masking for line-by-line reveal
  splitTextInstance = $SplitText.create(ctaText, {
    type: "lines",
    mask: "lines",
  });

  if (!splitTextInstance.lines || splitTextInstance.lines.length === 0) {
    return;
  }

  // Create timeline for fancy line-by-line reveal with mask
  const ctaTimeline = $gsap.timeline({
    scrollTrigger: {
      trigger: ctaText,
      start: "top bottom-=20%",
      end: "bottom top+=20%",
      toggleActions: "play none none reverse",
      refreshPriority: -1, // Lower priority for better performance
    },
  });

  // Animate lines from bottom with smooth masking
  ctaTimeline.from(splitTextInstance.lines, {
    yPercent: 100,
    duration: 1.0,
    stagger: {
      amount: 0.4,
      from: "start",
    },
    ease: "power2.out",
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
        start: "top center-=35%",
        end: "bottom bottom",

        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: () => {
          recalcPathAndPosition(root, pathEl, ball);
        },
      },
    })
    .to(ball, {
      duration: 6,
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
