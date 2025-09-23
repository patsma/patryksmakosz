<script setup>
import { useMenuStore } from "/stores/menu";

const { $gsap } = useNuxtApp();
const menuStore = useMenuStore();
const route = useRoute();

// Refs for DOM elements we animate
const hamburgerRef = ref(null);
const buttonRef = ref(null);
const lineTopRef = ref(null);
const lineBottomRef = ref(null);
const overlayRef = ref(null);
const panelRef = ref(null);
const menuLinksRefs = ref([]);
const socialLinksRefs = ref([]);

// Helpers to collect element refs into arrays for staggered animations
// Normalize to actual DOM elements (NuxtLink refs are component instances)
// We reset arrays on beforeUpdate to avoid duplicates across re-renders
const toDomEl = (el) =>
  el && el.nodeType === 1
    ? el
    : el && el.$el && el.$el.nodeType === 1
      ? el.$el
      : null;
const setMenuLinkRef = (el) => {
  const dom = toDomEl(el);
  if (dom) menuLinksRefs.value.push(dom);
};
const setSocialLinkRef = (el) => {
  const dom = toDomEl(el);
  if (dom) socialLinksRefs.value.push(dom);
};

onBeforeUpdate(() => {
  menuLinksRefs.value = [];
  socialLinksRefs.value = [];
});

// Master timeline
let tl = null;
let introTl = null;

// Allow adjusting when the hamburger button appears
const props = defineProps({
  showDelaySeconds: { type: Number, default: 3 },
});

// Helper to determine if a link is active
const isActiveLink = (path) => {
  if (path === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(path);
};

onMounted(() => {
  // Compute rem→px to keep project sizing convention while feeding GSAP numbers
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize || "16"
  );
  const linkOffsetY = rootFontSize * 0.5; // 0.75rem
  const socialOffsetY = rootFontSize * 0.75; // 0.5rem
  const iconOffsetY = rootFontSize * 0.3125; // 0.3125rem

  // Basic overlay and panel animation
  tl = $gsap.timeline({
    paused: true,
    defaults: { ease: "power3.out", duration: 0.5 },
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
  // Stagger in primary menu links first (clear order and slower pace)
  // Use rem units for vertical offset to follow project conventions
  const menuTargets = (menuLinksRefs.value || []).filter(Boolean);
  if (menuTargets.length) {
    tl.fromTo(
      menuTargets,
      { x: linkOffsetY, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, stagger: 0.08, duration: 0.25 },
      0.2
    );
  }

  const socialTargets = (socialLinksRefs.value || []).filter(Boolean);
  if (socialTargets.length) {
    tl.fromTo(
      socialTargets,
      { x: socialOffsetY, autoAlpha: 0 },
      {
        x: 0,
        autoAlpha: 1,
        stagger: {
          amount: 0.06,
          from: "start",
        },
        duration: 0.25,
      },
      "<+=0.25"
    );
  }

  // Icon morph and color change driven by GSAP for perfect sync
  tl.to(lineTopRef.value, { y: iconOffsetY, rotate: 45 }, 0);
  tl.to(lineBottomRef.value, { y: -iconOffsetY, rotate: -45 }, 0);
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

  introTl = $gsap.timeline({ delay: props.showDelaySeconds });
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
      <NuxtLink
        :ref="setMenuLinkRef"
        to="/blog"
        :class="[
          'menu-overlay__link',
          { 'menu-overlay__link--active': isActiveLink('/blog') },
        ]"
        ><span class="menu-overlay__link-text">Blog</span></NuxtLink
      >
      <NuxtLink
        :ref="setMenuLinkRef"
        to="/"
        :class="[
          'menu-overlay__link',
          { 'menu-overlay__link--active': isActiveLink('/') },
        ]"
        ><span class="menu-overlay__link-text">Home</span></NuxtLink
      >

      <!-- <a
        :ref="setMenuLinkRef"
        href="https://github.com/patsma"
        target="_blank"
        rel="noopener noreferrer"
        class="menu-overlay__link"
        >About</a
      > -->
      <NuxtLink
        :ref="setMenuLinkRef"
        to="/about"
        :class="[
          'menu-overlay__link',
          { 'menu-overlay__link--active': isActiveLink('/about') },
        ]"
        ><span class="menu-overlay__link-text">About</span></NuxtLink
      >
      <NuxtLink
        :ref="setMenuLinkRef"
        to="/projects"
        :class="[
          'menu-overlay__link',
          { 'menu-overlay__link--active': isActiveLink('/projects') },
        ]"
        ><span class="menu-overlay__link-text">Projects</span></NuxtLink
      >
      <!-- <NuxtLink
        :ref="setMenuLinkRef"
        to="/portfolio"
        :class="[
          'menu-overlay__link',
          { 'menu-overlay__link--active': isActiveLink('/portfolio') },
        ]"
        ><span class="menu-overlay__link-text">Portfolio</span></NuxtLink
      > -->

      <a
        :ref="setMenuLinkRef"
        href="mailto:patryksmakosz1@gmail.com"
        class="menu-overlay__link inline-flex items-center gap-2"
      >
        <span class="menu-overlay__link-text">Contact</span>
        <Icon name="tabler:mail" class="w-5 h-5" />
      </a>

      <div class="mt-8 flex flex-wrap items-center gap-4 text-white/80">
        <a
          :ref="setSocialLinkRef"
          href="https://www.linkedin.com/in/patryksmakosz/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          title="LinkedIn"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-linkedin" class="w-6 h-6" />
          <span class="sr-only">LinkedIn</span>
        </a>
        <a
          :ref="setSocialLinkRef"
          href="https://www.facebook.com/TastySites/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          title="Facebook"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-facebook" class="w-6 h-6" />
          <span class="sr-only">Facebook</span>
        </a>
        <a
          :ref="setSocialLinkRef"
          href="https://dribbble.com/tastysites"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Dribbble"
          title="Dribbble"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-dribbble" class="w-6 h-6" />
          <span class="sr-only">Dribbble</span>
        </a>
        <a
          :ref="setSocialLinkRef"
          href="https://www.upwork.com/freelancers/~01085c23a2f6280a73"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Upwork"
          title="Upwork"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="simple-icons:upwork" class="w-6 h-6" />
          <span class="sr-only">Upwork</span>
        </a>
        <a
          :ref="setSocialLinkRef"
          href="https://x.com/TastySites"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter)"
          title="X (Twitter)"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-x" class="w-6 h-6" />
          <span class="sr-only">X (Twitter)</span>
        </a>
        <a
          :ref="setSocialLinkRef"
          href="https://bsky.app/profile/tastysites.bsky.social"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bluesky"
          title="Bluesky"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="simple-icons:bluesky" class="w-6 h-6" />
          <span class="sr-only">Bluesky</span>
        </a>
        <!-- <a
          :ref="setSocialLinkRef"
          href="https://codepen.io/tastysites"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CodePen"
          title="CodePen"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-codepen" class="w-6 h-6" />
          <span class="sr-only">CodePen</span>
        </a> -->
        <a
          :ref="setSocialLinkRef"
          href="https://www.youtube.com/channel/UCj7wr_x-BwJ0Yam8uw5lDsw"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
          title="YouTube"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-youtube" class="w-6 h-6" />
          <span class="sr-only">YouTube</span>
        </a>
        <a
          :ref="setSocialLinkRef"
          href="https://github.com/patsma"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          title="GitHub"
          class="hover:text-white focus-visible:text-white transition-colors outline-none"
        >
          <Icon name="tabler:brand-github" class="w-6 h-6" />
          <span class="sr-only">GitHub</span>
        </a>
      </div>
    </nav>
  </div>
</template>

<style scoped></style>
