<template>
  <!--
    Full-viewport hero video component with smooth loading.
    - Autoplays on loop, including on mobile Safari (muted + playsinline)
    - Uses TailwindCSS for layout and sizing
    - Smooth fade-in prevents black flashes during loading
    - User-friendly messaging for autoplay blocks and fullscreen capability
  -->
  <section
    class="relative w-full h-screen min-h-screen overflow-hidden bg-black"
    :aria-label="ariaLabel || 'Hero video'"
  >
    <!-- Video element with smooth opacity transition -->
    <video
      ref="videoEl"
      class="absolute inset-0 h-full w-full transition-opacity duration-700 ease-out"
      :class="[videoObjectClass, videoOpacityClass]"
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
      @loadeddata="handleLoadedData"
      @playing="handlePlaying"
      @pause="handlePause"
      @ended="handleEnded"
      @loadstart="handleLoadStart"
    />

    <!-- Loading state overlay -->
    <div
      v-if="isLoading && showLoadingSpinner"
      class="absolute inset-0 bg-black flex items-center justify-center transition-opacity duration-500"
      :class="{ 'opacity-0 pointer-events-none': !isLoading }"
    >
      <div class="text-white/60 text-center">
        <div class="w-8 h-8 mx-auto mb-3 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
        <p class="text-sm">Loading video...</p>
      </div>
    </div>

    <!-- Tap-to-play overlay with improved messaging -->
    <button
      v-if="showPlayOverlay"
      type="button"
      class="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-all duration-300"
      aria-label="Play video"
      @click="handleUserPlay"
      @keydown.enter.prevent="handleUserPlay"
    >
      <!-- Play icon -->
      <div class="w-16 h-16 mb-4 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
        <svg class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <!-- Message -->
      <p class="text-lg font-medium mb-2">Tap to play</p>
      <p class="text-sm text-white/80 max-w-xs text-center">Your browser requires user interaction to autoplay videos</p>
    </button>

    <!-- Fullscreen hint (bottom-right corner) -->
    <div
      v-if="showFullscreenHint && showFullscreenHintState && !showPlayOverlay"
      class="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white/80 text-xs max-w-xs transition-all duration-300"
      :class="{ 'opacity-0 pointer-events-none': !showFullscreenHintState }"
    >
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
        </svg>
        <span>Tap for fullscreen</span>
      </div>
    </div>
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
 * @property {boolean} [showFullscreenHint] - Show fullscreen hint in corner (defaults true)
 * @property {boolean} [showLoadingSpinner] - Show loading spinner during video load (defaults true)
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
  showFullscreenHint: { type: Boolean, default: true },
  showLoadingSpinner: { type: Boolean, default: true },
});

/** @type {import('vue').Ref<HTMLVideoElement|null>} */
const videoEl = ref(null);

// Internal reactive state
const isPlaying = ref(false);
const showPlayOverlay = ref(false);
const hasTriedAutoplay = ref(false);
const isLoading = ref(true);
const videoReady = ref(false);
const showFullscreenHintState = ref(false);

// Compute object-fit Tailwind class based on `fit` prop
const videoObjectClass = computed(() => {
  return props.fit === "contain" ? "object-contain" : "object-cover";
});

// Compute video opacity class for smooth fade-in
const videoOpacityClass = computed(() => {
  return videoReady.value && !isLoading.value ? "opacity-100" : "opacity-0";
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
const handleLoadStart = () => {
  isLoading.value = true;
  videoReady.value = false;
  showFullscreenHintState.value = false;
};

const handleLoadedData = () => {
  videoReady.value = true;
  // Small delay for smooth transition
  setTimeout(() => {
    isLoading.value = false;
  }, 300);
};

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
  // Show fullscreen hint after a delay if autoplay succeeded and prop allows it
  if (!showPlayOverlay.value && props.showFullscreenHint) {
    setTimeout(() => {
      showFullscreenHintState.value = true;
      // Auto-hide hint after 4 seconds
      setTimeout(() => {
        showFullscreenHintState.value = false;
      }, 4000);
    }, 2000);
  }
};

const handlePause = () => {
  isPlaying.value = false;
  showFullscreenHintState.value = false;
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
    isLoading.value = true;
    videoReady.value = false;
    showFullscreenHintState.value = false;
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
