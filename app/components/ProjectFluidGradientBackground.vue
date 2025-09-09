<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--fluid-gradient w-full h-full"
    aria-hidden="true"
  >
    <!--
      Simple TresJS scene with a fullscreen shader plane.
      This component mirrors the public API of other animation components
      (Zaksa, ArtTech) so it can be dropped into grids with the same controls.
    -->
    <TresCanvas
      class="w-full h-full opacity-40"
      clearColor="#0b0b10"
      :antialias="true"
      :renderMode="'always'"
    >
      <!-- Orthographic camera so a 2x2 plane fills the view nicely -->
      <TresOrthographicCamera
        :args="[-1, 1, 1, -1, 0.1, 10]"
        :position="{ z: 1 }"
      />

      <!-- Fullscreen plane with a custom fragment shader -->
      <TresMesh>
        <TresPlaneGeometry :args="[2, 2]" />
        <TresShaderMaterial
          :uniforms="uniforms"
          :vertexShader="vertexShader"
          :fragmentShader="fragmentShader"
          :transparent="false"
        />
      </TresMesh>
    </TresCanvas>
  </div>
</template>

<script setup>
/**
 * ProjectFluidGradientBackground
 *
 * Very small TresJS-based canvas background to validate our WebGL pipeline.
 * - Uses a simple fluid-like gradient fragment shader
 * - Drives a single `uTime` uniform with GSAP so we can reuse ScrollTrigger
 * - Public API mirrors other animation components for drop-in usage
 */

// Nuxt-provided GSAP plugins (see nuxt.config.ts)
const { $gsap } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();
const { $ScrollTrigger } = useNuxtApp();

import { Color } from "three";

// Core refs
const containerRef = ref(null);
const timeline = ref(null);
let gsapCtx = null;
let scrollTriggerInstance = null;

/**
 * Props consistent with other animation components
 */
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
    default: () => `fluid-gradient-${Math.random().toString(36).slice(2, 9)}`,
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
});

/**
 * Shader uniforms (reactive so GSAP can tween nested .value)
 * Matches the imperative example: single `time` uniform.
 */
const uniforms = reactive({
  time: { value: 0 },
});

/**
 * Minimal passthrough vertex shader. We rely on vUv for fragment calculations.
 */
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  // Use clip-space directly like the original example
  gl_Position = vec4(position, 1.0);
}`;

/**
 * Converted fragment shader from the original imperative example
 */
const fragmentShader = `
precision mediump float;
uniform float time;
varying vec2 vUv;

float noise(vec2 uv, float t) {
  return (1.0 + sin(uv.x * 4.3 + t) + cos(uv.y * 4.3 + t)) * 0.5;
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

vec3 getColor(vec2 uv, float t) {
  vec3 topLeft = vec3(1.0, 0.5, 0.7);
  vec3 topRight = vec3(0.5, 1.0, 0.6);
  vec3 bottomLeft = vec3(0.6, 0.5, 1.0);
  vec3 bottomRight = vec3(0.8, 1.0, 0.5);

  vec2 center = vec2(0.5, 0.5);
  vec2 offset = vec2(0.5) - center;
  vec2 rotatedUV = rotate(uv - center, t * 0.05) + center;

  vec2 noiseUV = vec2(noise(rotatedUV, t * 0.5), noise(rotatedUV, t * 0.75));
  vec3 color = mix(mix(topLeft, topRight, noiseUV.x), mix(bottomLeft, bottomRight, noiseUV.x), noiseUV.y);
  return color;
}

void main() {
  vec3 color = getColor(vUv, time);
  gl_FragColor = vec4(color, 1.0);
}`;

/**
 * Build a GSAP timeline that advances uTime linearly.
 * We use a large duration with repeat:-1 and ease:"none" for stable motion.
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  // Ensure container exists
  if (!containerRef.value) return null;

  const tl = $gsap.timeline({ paused: true });
  // Advance `time` forever (roughly matches requestAnimationFrame increment style)
  tl.to(uniforms.time, {
    value: "+=1000",
    duration: 1000,
    ease: "none",
    repeat: -1,
  });

  // DevTools (optional)
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

// Lifecycle: init GSAP and wire ScrollTrigger control similar to other components
onMounted(() => {
  nextTick(() => {
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
          onLeave: () => tl.pause(0),
          onLeaveBack: () => tl.pause(0),
        });
        $ScrollTrigger.refresh();
      } else if (props.autoPlay) {
        tl.play();
      } else if (props.showDevTools) {
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

// Public API for external control (keeps parity with other components)
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
/* Visual styles are centralized under app/assets/scss/components/_animation-components.scss */
</style>
