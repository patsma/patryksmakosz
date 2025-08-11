<script setup>
// Minimal hamburger menu with GSAP timeline for open/close
// Uses Pinia store for state and a single master timeline that plays/reverses
import { useMenuStore } from "/stores/menu";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const { $gsap } = useNuxtApp();
const menuStore = useMenuStore();

// Refs for DOM elements we animate
const buttonRef = ref(null);
const lineTopRef = ref(null);
const lineMiddleRef = ref(null);
const lineBottomRef = ref(null);
const overlayRef = ref(null);
const panelRef = ref(null);
const linksRef = ref([]);

// Master timeline
let tl = null;

/**
 * Create the GSAP timeline once on mount
 * Timeline stays paused; we play() on open and reverse() on close
 */
onMounted(() => {
  try {
    $gsap.registerPlugin(ScrollTrigger);
  } catch (e) {}

  // Basic overlay and panel animation
  tl = $gsap.timeline({
    paused: true,
    defaults: { ease: "power3.out", duration: 0.4 },
  });
  // Overlay fade in
  tl.fromTo(
    overlayRef.value,
    { autoAlpha: 0, pointerEvents: "none" },
    { autoAlpha: 1, pointerEvents: "auto" },
    0
  );
  // Slide panel from the right
  tl.fromTo(panelRef.value, { xPercent: 100 }, { xPercent: 0 }, 0);
  // Stagger in links
  tl.fromTo(
    linksRef.value,
    { y: 16, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, stagger: 0.06 },
    0.1
  );

  // Burger to X morph
  tl.to(lineTopRef.value, { y: 7, rotate: 45 }, 0);
  tl.to(lineMiddleRef.value, { autoAlpha: 0 }, 0);
  tl.to(lineBottomRef.value, { y: -7, rotate: -45 }, 0);

  // Sync with current state
  if (menuStore.isOpen) {
    tl.progress(1);
  } else {
    tl.progress(0);
  }
});

onUnmounted(() => {
  try {
    tl && tl.kill();
  } catch (e) {}
});

// Watch store and play/reverse
watch(
  () => menuStore.isOpen,
  (isOpen) => {
    if (!tl) return;
    // Prevent scroll jumps when opening overlay by locking body scroll
    // document.documentElement.style.overflow = isOpen ? "hidden" : "";
    isOpen ? tl.play() : tl.reverse();
  }
);

// A11y and event handlers
const handleToggle = () => {
  menuStore.toggle();
};

const handleKeydown = (e) => {
  if (e.key === "Escape" && menuStore.isOpen) {
    menuStore.close();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  // document.documentElement.style.overflow = "";
});
</script>

<template>
  <!-- Button -->
  <button
    ref="buttonRef"
    class="fixed z-20 right-4 top-4 h-12 w-12 grid place-items-center rounded-full bg-black/40 backdrop-blur text-white focus:outline-none focus:ring-2 focus:ring-white/40"
    :aria-expanded="menuStore.isOpen ? 'true' : 'false'"
    aria-controls="app-menu-overlay"
    aria-label="Toggle menu"
    @click="handleToggle"
  >
    <span class="relative block h-5 w-6">
      <span
        ref="lineTopRef"
        class="absolute left-0 top-0 block h-0.5 w-6 bg-white will-change-transform"
      ></span>
      <span
        ref="lineMiddleRef"
        class="absolute left-0 top-2 block h-0.5 w-6 bg-white will-change-transform"
      ></span>
      <span
        ref="lineBottomRef"
        class="absolute left-0 bottom-0 block h-0.5 w-6 bg-white will-change-transform"
      ></span>
    </span>
  </button>

  <!-- Overlay -->
  <div
    id="app-menu-overlay"
    ref="overlayRef"
    class="fixed inset-0 z-10 bg-black/60 backdrop-blur-sm pointer-events-none opacity-0"
    @click="menuStore.close()"
  >
    <!-- Stop clicks from bubbling to overlay -->
    <nav
      ref="panelRef"
      class="absolute right-0 top-0 h-full w-[min(92vw,360px)] bg-zinc-900 text-white shadow-xl p-6 flex flex-col gap-3"
      role="dialog"
      aria-modal="true"
      aria-label="Main navigation"
      @click.stop
    >
      <NuxtLink ref="linksRef" to="/" class="text-lg hover:text-zinc-300"
        >Home</NuxtLink
      >
      <NuxtLink ref="linksRef" to="/about" class="text-lg hover:text-zinc-300"
        >About</NuxtLink
      >
      <a ref="linksRef" href="#" class="text-lg hover:text-zinc-300"
        >Case Studies</a
      >
      <a ref="linksRef" href="#" class="text-lg hover:text-zinc-300">Contact</a>
    </nav>
  </div>
</template>

<style scoped></style>
