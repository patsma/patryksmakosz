<template>
  <!--
    Full-viewport hero video component.
    - Autoplays on loop, including on mobile Safari (muted + playsinline)
    - Uses TailwindCSS for layout and sizing
    - Displays an accessible play overlay if autoplay is blocked
  -->
  <section
    class="relative w-full h-screen min-h-screen overflow-hidden bg-black"
    :aria-label="ariaLabel || 'Hero video'"
  >
    <video
      ref="videoEl"
      class="absolute inset-0 h-full w-full"
      :class="videoObjectClass"
      :src="src"
      :poster="poster || undefined"
      :preload="preload"
      :autoplay="autoPlay"
      :loop="loop"
      :muted="muted"
      :playsinline="playsInline"
      webkit-playsinline
      x-webkit-airplay="allow"
      disablePictureInPicture
      :controls="showControls"
      @click="handleVideoClick"
      @canplay="handleCanPlay"
      @playing="handlePlaying"
      @pause="handlePause"
      @ended="handleEnded"
    />

    <!-- Tap-to-play overlay shown when autoplay is blocked -->
    <button
      v-if="showPlayOverlay"
      type="button"
      class="absolute inset-0 flex items-center justify-center text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      aria-label="Play video"
      @click="handleUserPlay"
      @keydown.enter.prevent="handleUserPlay"
    ></button>
  </section>
</template>

<script setup>
// IMPORTANT: This project uses JavaScript with JSDoc (no TypeScript)
// This component follows Nuxt 4 + Vue 3 Composition API with script setup.
// We keep the code simple, readable, and well-documented.

import { onMounted, onBeforeUnmount, ref, computed, watch } from "vue";

/**
 * @typedef {Object} Props
 * @property {string} src - Public path to the video asset (e.g., "/movies/web-optimized/example.mp4")
 * @property {string} [poster] - Optional poster image path
 * @property {boolean} [autoPlay] - Whether to autoplay; requires muted + playsinline for iOS
 * @property {boolean} [loop] - Whether to loop
 * @property {boolean} [muted] - Must be true for mobile autoplay
 * @property {boolean} [playsInline] - Keep video inline on iOS (no fullscreen)
 * @property {string} [preload] - Video preload strategy (metadata|auto|none)
 * @property {boolean} [showControls] - Show native controls (defaults off for clean hero)
 * @property {('cover'|'contain')} [fit] - Object-fit behavior for the video element
 * @property {string} [ariaLabel] - Accessible label for the video section
 * @property {boolean} [allowFullscreenOnClick] - Allow entering fullscreen when video is clicked
 * @property {boolean} [forceFullscreenOnClick] - Force fullscreen on click, even if already inline
 */

/** @type {Props} */
const props = defineProps({
  src: { type: String, required: true },
  poster: { type: String, default: "" },
  autoPlay: { type: Boolean, default: true },
  loop: { type: Boolean, default: true },
  muted: { type: Boolean, default: true },
  playsInline: { type: Boolean, default: true },
  preload: { type: String, default: "auto" },
  showControls: { type: Boolean, default: false },
  fit: { type: String, default: "cover" },
  ariaLabel: { type: String, default: "" },
  allowFullscreenOnClick: { type: Boolean, default: true },
  forceFullscreenOnClick: { type: Boolean, default: false },
});

/** @type {import('vue').Ref<HTMLVideoElement|null>} */
const videoEl = ref(null);

// Internal reactive state
const isPlaying = ref(false);
const showPlayOverlay = ref(false);
const hasTriedAutoplay = ref(false);

// Compute object-fit Tailwind class based on `fit` prop
const videoObjectClass = computed(() => {
  return props.fit === "contain" ? "object-contain" : "object-cover";
});

// Attempt to play the video. If autoplay is blocked, show overlay.
/** @returns {Promise<void>} */
const attemptPlay = async () => {
  if (!videoEl.value) return;

  try {
    // iOS Safari quirks: ensure properties and attributes are set BEFORE play()
    videoEl.value.muted = props.muted !== false;
    videoEl.value.setAttribute("muted", "");
    videoEl.value.playsInline = props.playsInline !== false;
    videoEl.value.setAttribute("playsinline", "");
    videoEl.value.setAttribute("webkit-playsinline", "");
    videoEl.value.autoplay = props.autoPlay !== false;
    videoEl.value.loop = props.loop !== false;
    videoEl.value.preload = props.preload || "auto";

    // Load explicitly to ensure readiness in some browsers
    try {
      videoEl.value.load();
    } catch (e) {
      /* no-op */
    }

    const playPromise = videoEl.value.play();
    if (playPromise && typeof playPromise.then === "function") {
      await playPromise;
    }
    isPlaying.value = true;
    showPlayOverlay.value = false;
  } catch (err) {
    // Autoplay likely blocked; show overlay and set a one-time pointer handler
    isPlaying.value = false;
    showPlayOverlay.value = true;
    addOneTimePointerResume();
  }
};

// Add a one-time pointer/touch handler to resume playback after user gesture
const addOneTimePointerResume = () => {
  const resume = async () => {
    window.removeEventListener("pointerdown", resume);
    window.removeEventListener("touchend", resume);
    await attemptPlay();
  };
  window.addEventListener("pointerdown", resume, { once: true });
  window.addEventListener("touchend", resume, { once: true });
};

// Handlers
const handleCanPlay = () => {
  // Try autoplay once we know the browser can play the media
  if (props.autoPlay && !hasTriedAutoplay.value) {
    hasTriedAutoplay.value = true;
    attemptPlay();
  }
};

const handlePlaying = () => {
  isPlaying.value = true;
  showPlayOverlay.value = false;
};

const handlePause = () => {
  isPlaying.value = false;
};

const handleEnded = () => {
  // If loop is disabled for some reason, keep the overlay hidden
  if (!props.loop) {
    isPlaying.value = false;
  }
};

// Explicit user-triggered play (via overlay)
const handleUserPlay = async () => {
  await attemptPlay();
};

// Cross-browser fullscreen helpers
const isFullscreenActive = () => {
  // @ts-ignore - vendor-prefixed properties for Safari/old browsers
  return (
    document.fullscreenElement ||
    // @ts-ignore
    document.webkitFullscreenElement ||
    // @ts-ignore
    document.mozFullScreenElement ||
    // @ts-ignore
    document.msFullscreenElement ||
    null
  );
};

/** @returns {Promise<void>} */
const enterFullscreen = async () => {
  const el = videoEl.value;
  if (!el) return;
  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return;
    }
    // @ts-ignore - iOS Safari specific API
    if (typeof el.webkitEnterFullscreen === "function") {
      // iPhone Safari: enters native video fullscreen UI
      // @ts-ignore
      el.webkitEnterFullscreen();
      return;
    }
    // @ts-ignore - older WebKit
    if (el.webkitRequestFullscreen) {
      // @ts-ignore
      await el.webkitRequestFullscreen();
      return;
    }
    // @ts-ignore - MS
    if (el.msRequestFullscreen) {
      // @ts-ignore
      await el.msRequestFullscreen();
      return;
    }
  } catch (e) {
    // Silently ignore; some browsers block without user gesture or API unsupported
  }
};

// Handle clicking the video surface to optionally enter fullscreen
const handleVideoClick = async () => {
  if (!props.allowFullscreenOnClick && !props.forceFullscreenOnClick) return;

  // Ensure playback starts on click as well
  if (!isPlaying.value) {
    await attemptPlay();
  }

  if (props.forceFullscreenOnClick) {
    await enterFullscreen();
    return;
  }

  if (!isFullscreenActive()) {
    await enterFullscreen();
  }
};

// If the `src` changes dynamically, re-attempt autoplay
watch(
  () => props.src,
  () => {
    hasTriedAutoplay.value = false;
    isPlaying.value = false;
    showPlayOverlay.value = false;
    // Small delay allows the browser to register the new source
    setTimeout(() => attemptPlay(), 0);
  }
);

onMounted(() => {
  // If autoplay is requested, try immediately as well
  if (props.autoPlay) {
    attemptPlay();
  }
});

onBeforeUnmount(() => {
  // Clean up video element references if needed
  if (videoEl.value) {
    try {
      videoEl.value.pause();
    } catch (e) {
      /* no-op */
    }
  }
});
</script>
