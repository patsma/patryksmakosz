<script setup>
// Minimal hamburger menu with GSAP timeline for open/close
// Uses Pinia store for state and a single master timeline that plays/reverses
import { useMenuStore } from "/stores/menu";

const { $gsap } = useNuxtApp();
const menuStore = useMenuStore();

// Refs for DOM elements we animate
const hamburgerRef = ref(null);
const buttonRef = ref(null);
const lineTopRef = ref(null);
const lineBottomRef = ref(null);
const overlayRef = ref(null);
const panelRef = ref(null);
const linksRef = ref([]);

// Master timeline
let tl = null;
let introTl = null;

// Allow adjusting when the hamburger button appears
const props = defineProps({
  showDelaySeconds: { type: Number, default: 3 },
});

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

  // Reveal the hamburger button after a small delay (tweakable)
  introTl = $gsap.timeline({ delay: 3.1 });
  introTl.to(hamburgerRef.value, {
    opacity: 1,
    duration: 0.6,
    ease: "power2.out",
  });
});

onUnmounted(() => {
  try {
    tl && tl.kill();
    introTl && introTl.kill();
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
  <div ref="hamburgerRef" class="hamburger opacity-0">
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
      <NuxtLink ref="linksRef" to="/portfolio" class="menu-overlay__link"
        >Portfolio</NuxtLink
      >

      <a ref="linksRef" href="#" class="menu-overlay__link">Contact</a>

      <!-- Social links row: accessible, keyboard-friendly, white icons on dark bg -->
      <div class="mt-8 flex flex-wrap items-center gap-4 text-white/80">
        <a
          ref="linksRef"
          href="https://www.facebook.com/TastySites/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          title="Facebook"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-facebook" size="24" />
          <span class="sr-only">Facebook</span>
        </a>
        <a
          ref="linksRef"
          href="https://dribbble.com/tastysites"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Dribbble"
          title="Dribbble"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-dribbble" size="24" />
          <span class="sr-only">Dribbble</span>
        </a>
        <a
          ref="linksRef"
          href="https://www.upwork.com/freelancers/~01085c23a2f6280a73"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Upwork"
          title="Upwork"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="simple-icons:upwork" size="24" />
          <span class="sr-only">Upwork</span>
        </a>
        <a
          ref="linksRef"
          href="https://x.com/TastySites"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter)"
          title="X (Twitter)"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-x" size="24" />
          <span class="sr-only">X (Twitter)</span>
        </a>
        <a
          ref="linksRef"
          href="https://bsky.app/profile/tastysites.bsky.social"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bluesky"
          title="Bluesky"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="simple-icons:bluesky" size="24" />
          <span class="sr-only">Bluesky</span>
        </a>
        <a
          ref="linksRef"
          href="https://codepen.io/tastysites"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CodePen"
          title="CodePen"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-codepen" size="24" />
          <span class="sr-only">CodePen</span>
        </a>
        <a
          ref="linksRef"
          href="https://www.youtube.com/channel/UCj7wr_x-BwJ0Yam8uw5lDsw"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
          title="YouTube"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-youtube" size="24" />
          <span class="sr-only">YouTube</span>
        </a>
        <a
          ref="linksRef"
          href="https://github.com/patsma"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          title="GitHub"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-github" size="24" />
          <span class="sr-only">GitHub</span>
        </a>
      </div>
    </nav>
  </div>
</template>

<style scoped></style>
