<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--aeroflux"
  >
    <!-- Particles background container -->
    <div ref="particlesRef" class="particles-background"></div>

    <!-- SVG animation component -->
    <div class="aeroflux-svg-wrapper">
      <AeroFluxSVG ref="svgComponentRef" />
    </div>
  </div>
</template>

<script setup>
/**
 * ProjectAeroflux animation component
 * - Ported from legacy portfolio /aeroflux project
 * - Uses DrawSVG and MorphSVG plugins for advanced SVG animations
 * - Includes particles.js background effect
 * - Follows the standardized API pattern used by ProjectZaksa and ProjectArtTech
 */

// Nuxt/GSAP plugins (provided via @hypernym/nuxt-gsap in nuxt.config.ts)
const { $gsap } = useNuxtApp();
const { $DrawSVGPlugin } = useNuxtApp();
const { $MorphSVGPlugin } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();
import { scopeSvgDefsIds } from "/utils/scopeSvgIds";

// Core refs for the component container and SVG
const containerRef = ref(null);
const particlesRef = ref(null);
const timeline = ref(null);
let gsapCtx = null;
let scrollTriggerInstance = null;

// Child SVG component ref to access its exposed element refs
const svgComponentRef = ref(null);

// Props for configurability and parity with other animation components
const props = defineProps({
  /**
   * @type {boolean}
   * Show GSDevTools (minimal) for debugging
   */
  showDevTools: { type: Boolean, default: false },
  /**
   * @type {string}
   * Unique id for GSDevTools instance
   */
  devToolsId: {
    type: String,
    default: () => `aeroflux-${Math.random().toString(36).slice(2, 9)}`,
  },
  /**
   * @type {boolean}
   * Autoplay when ScrollTrigger is disabled
   */
  autoPlay: { type: Boolean, default: false },
  /**
   * @type {boolean}
   * Use ScrollTrigger to play/pause based on visibility
   */
  useScrollTrigger: { type: Boolean, default: true },
  /**
   * @type {string}
   * ScrollTrigger start position
   */
  stStart: { type: String, default: "top center" },
  /**
   * @type {string}
   * ScrollTrigger end position
   */
  stEnd: { type: String, default: "bottom center" },
  /**
   * @type {number}
   * Global playback speed for the master timeline
   */
  timeScale: { type: Number, default: 1 },
  /**
   * @type {boolean}
   * Enable particles.js background effect
   */
  enableParticles: { type: Boolean, default: true },
});

/**
 * Resolve query helper scoped to the SVG root
 * @param {string} selector
 */
const qs = (selector) =>
  svgComponentRef.value?.svgRootRef?.querySelector(selector);

/**
 * Build the AeroFlux animation timeline (ported from legacy app.js)
 * Uses GSAP 3 APIs with DrawSVG plugin for progressive reveals
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef;
  if (!svgRoot) {
    console.warn("AeroFlux: SVG root not found");
    return null;
  }

  // Scope <defs> IDs to avoid collisions across the page
  const idPrefix =
    props.devToolsId || `aeroflux-${Math.random().toString(36).slice(2, 6)}`;
  scopeSvgDefsIds(svgRoot, idPrefix);

  // Register GSAP plugins
  try {
    if ($DrawSVGPlugin) $gsap.registerPlugin($DrawSVGPlugin);
    if ($MorphSVGPlugin) $gsap.registerPlugin($MorphSVGPlugin);
  } catch (e) {
    console.debug("AeroFlux: Plugin registration issue", e);
  }

  // Element handles - query from SVG root
  const xPath = qs("#x-path");
  const circle = qs("#circle");
  const parts = svgRoot.querySelectorAll("#parts > *");
  const wings = svgRoot.querySelectorAll("#wings > *");
  const aeroflux = svgRoot.querySelectorAll("#aeroflux > *");
  const taglineEn = svgRoot.querySelectorAll("#tagline-en > *");
  const taglineJp = svgRoot.querySelectorAll("#tagline-jp > *");
  const layer = qs("#Layer_1-2");

  // EXACT PORT FROM app.js - NO MODIFICATIONS
  // Initial state: reveal container
  $gsap.set(containerRef.value, { visibility: "visible" });

  // Main animation timeline - EXACT COPY from app.js
  const initialTl = $gsap.timeline({
    defaults: { ease: "sine.out", duration: 2 },
    repeat: -1,
  });

  initialTl
    .from(xPath, { drawSVG: 0 })
    .from(xPath, { fill: "transparent" })

    .from(
      circle,
      { drawSVG: 0, rotation: -180, transformOrigin: "50% 50%" },
      "<"
    )
    .from(circle, { fill: "transparent" }, "<0.2")
    .from(parts, { drawSVG: 0 }, "<")
    .from(parts, { fill: "transparent" })
    .from(
      wings,
      { duration: 3, rotation: 720, autoAlpha: 0, transformOrigin: "50% 50%" },
      "-=1.5"
    )
    .from(
      aeroflux,
      {
        drawSVG: 0,
        stagger: 0.1,
        duration: 6,
        ease: "slow(0.6,0.8,true)",
      },
      "-=2"
    )
    .from(aeroflux, { fill: "transparent", stagger: 0.1 }, "<0.5")
    .from(
      taglineEn,
      { autoAlpha: 0, stagger: 0.4, y: "-=10", ease: "sine.out" },
      "-=4"
    )
    .from(
      taglineJp,
      { autoAlpha: 0, stagger: 0.2, y: "-=10", ease: "sine.out" },
      "<"
    )

    .to(taglineEn, { drawSVG: 0 }, "<+=2")
    .to(taglineJp, { drawSVG: 0 }, "<+=2")

    .to(layer, { y: "-=20", repeat: 10, duration: 4, yoyo: true });

  // Master timeline
  const masterTl = $gsap.timeline({ paused: true });
  masterTl.add(initialTl);

  // Apply requested playback speed
  masterTl.timeScale(props.timeScale);

  // Attach GSDevTools when requested
  if (props.showDevTools) {
    nextTick(() => {
      try {
        $GSDevTools.create({
          animation: masterTl,
          container: containerRef.value,
          minimal: true,
          id: props.devToolsId,
          globalSync: false,
        });
        // Ensure timeScale remains applied after DevTools initialization
        masterTl.timeScale(props.timeScale);
      } catch (e) {
        console.debug("AeroFlux: GSDevTools error", e);
      }
    });
  }

  timeline.value = masterTl;
  return masterTl;
};

/**
 * Initialize particles.js background effect
 * TODO: Add particles.js library integration if needed
 * For now, creates a simple animated starfield background using CSS/Canvas
 */
const initParticles = () => {
  if (!props.enableParticles || !particlesRef.value) return;

  try {
    // Create a simple canvas-based particle background as fallback
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "1";
    particlesRef.value.appendChild(canvas);

    // Resize canvas to fill container
    const resizeCanvas = () => {
      canvas.width = particlesRef.value.offsetWidth;
      canvas.height = particlesRef.value.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Simple particle system
    const particles = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1,
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles and connections
      particles.forEach((p, i) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();

        // Draw connections to nearby particles
        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  } catch (e) {
    console.debug("AeroFlux: Particle background creation failed", e);
  }
};

// Lifecycle: mount, build animation, wire ScrollTrigger
onMounted(() => {
  nextTick(() => {
    // Initialize particles background
    if (props.enableParticles) {
      initParticles();
    }

    // Setup GSAP animation
    gsapCtx = $gsap.context(() => {
      const tl = createAnimation();
      if (!tl) return;

      if (props.useScrollTrigger && $ScrollTrigger) {
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
        tl.play();
      } else if (props.showDevTools) {
        // When DevTools is shown and no ScrollTrigger/autoPlay, start playback for visibility
        tl.play();
      }
    }, containerRef.value);
  });
});

// Cleanup
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
      $GSDevTools.getById?.(props.devToolsId)?.kill();
    } catch (e) {}
  }
});

// Public API for external control
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

<style>
.animation-component--aeroflux {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #000;
  overflow: hidden;
  visibility: hidden;
}

.particles-background {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #000;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
  z-index: 1;
}

.aeroflux-svg-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
}

.aeroflux-svg-wrapper :deep(.drone-animation) {
  width: 40%;
  height: auto;
  max-height: 90vh;
  opacity: 1;
  pointer-events: auto;
}
.drone-animation {
  position: absolute;
  width: 40%;
  height: 100%;
  opacity: 1;
  left: 50%;
  transform: translate(-50%, 0);
}

/* Ensure all SVG paths have proper stroke-width for DrawSVG */
.aeroflux-svg-wrapper :deep(path) {
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .aeroflux-svg-wrapper :deep(.drone-animation) {
    width: 60%;
  }
}

@media (max-width: 768px) {
  .aeroflux-svg-wrapper :deep(.drone-animation) {
    width: 80%;
  }
}
</style>
