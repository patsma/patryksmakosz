<script setup>
// Minimal hamburger menu with GSAP timeline for open/close
// Uses Pinia store for state and a single master timeline that plays/reverses
import { useMenuStore } from "/stores/menu";

const { $gsap } = useNuxtApp();
const menuStore = useMenuStore();

// Refs for DOM elements we animate
const buttonRef = ref(null);
const lineTopRef = ref(null);
const lineBottomRef = ref(null);
const overlayRef = ref(null);
const panelRef = ref(null);
const linksRef = ref([]);

// Master timeline
let tl = null;

onMounted(() => {
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

  // Icon morph and color change driven by GSAP for perfect sync
  tl.to(lineTopRef.value, { y: "0.3125rem", rotate: 45 }, 0);
  tl.to(lineBottomRef.value, { y: "-0.3125rem", rotate: -45 }, 0);
  tl.to(
    [lineTopRef.value, lineBottomRef.value],
    { backgroundColor: "var(--color-white)" },
    0
  );

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
});
</script>

<template>
  <!-- Button -->
  <div class="hamburger">
    <button
      ref="buttonRef"
      class="hamburger__button"
      :aria-expanded="menuStore.isOpen ? 'true' : 'false'"
      aria-controls="app-menu-overlay"
      aria-label="Toggle menu"
      @click="handleToggle"
    >
      <span class="hamburger__icon">
        <span
          ref="lineTopRef"
          class="hamburger__line hamburger__line--top"
        ></span>
        <span
          ref="lineBottomRef"
          class="hamburger__line hamburger__line--bottom"
        ></span>
      </span>
    </button>
  </div>

  <!-- Overlay -->
  <div
    id="app-menu-overlay"
    ref="overlayRef"
    class="menu-overlay"
    @click="menuStore.close()"
  >
    <!-- Stop clicks from bubbling to overlay -->
    <nav
      ref="panelRef"
      class="menu-overlay__panel"
      role="dialog"
      aria-modal="true"
      aria-label="Main navigation"
      @click.stop
    >
      <NuxtLink ref="linksRef" to="/" class="menu-overlay__link">Home</NuxtLink>
      <NuxtLink ref="linksRef" to="/about" class="menu-overlay__link"
        >About</NuxtLink
      >
      <a ref="linksRef" href="#" class="menu-overlay__link">Portfolio</a>
      <a ref="linksRef" href="#" class="menu-overlay__link">Contact</a>
    </nav>
  </div>
</template>

<style scoped></style>
