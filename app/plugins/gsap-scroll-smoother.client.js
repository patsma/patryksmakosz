// Client-only GSAP ScrollSmoother initialization
// We explicitly avoid enabling on touch/mobile to preserve browser UI bars behavior

/**
 * Nuxt plugin to initialize GSAP ScrollSmoother on desktop only.
 * - It uses #smooth-wrapper and #smooth-content present in app/app.vue
 * - Disables effects on touch devices to keep native mobile scrolling and address browser UI bars
 * - Keeps ScrollTrigger in sync by proxying scroller when smoother is active
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { $gsap } = nuxtApp;

  // Guard for SSR and missing plugin
  if (!process.client || !$gsap) return;

  // Pull ScrollTrigger and ScrollSmoother from registered plugins
  let ScrollTrigger;
  let ScrollSmoother;
  try {
    ScrollTrigger = $gsap.core.globals().ScrollTrigger;
    ScrollSmoother = $gsap.core.globals().ScrollSmoother;
  } catch (e) {
    // If unavailable, silently bail
    return;
  }

  if (!ScrollTrigger || !ScrollSmoother) return;

  const enableSmoother = () => {
    // Avoid double-init
    if (ScrollSmoother.get()) return;

    const wrapper = document.getElementById("smooth-wrapper");
    const content = document.getElementById("smooth-content");
    if (!wrapper || !content) return;

    // Create smoother with conservative defaults
    const smoother = ScrollSmoother.create({
      wrapper,
      content,
      smooth: 0.8,
      effects: false, // avoid data-speed effects; we manage our own parallax
      // Enable conservative smoothing on touch while keeping viewport stable
      smoothTouch: 0.2,
      // Normalize scrolling to reduce iOS/Safari bounce and bar toggling per GSAP docs
      normalizeScroll: true,
      ignoreMobileResize: true, // helps reduce jumpiness on orientation change
      // Prevent GSAP from setting fixed heights that could affect iOS bars
      // We'll let the DOM size naturally; Smoother just handles transform-based scrolling
    });

    // Make ScrollTrigger use the smoother's proxy scroller
    ScrollTrigger.scrollerProxy(content, {
      scrollTop(value) {
        const instance = ScrollSmoother.get();
        if (!instance) return window.scrollY || window.pageYOffset || 0;
        if (arguments.length) instance.scrollTop(value);
        return instance.scrollTop();
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: content.style.transform ? "transform" : "fixed",
    });

    // Defaults so triggers attach to smoother scroller when present
    ScrollTrigger.defaults({ scroller: content });

    // Keep triggers in sync
    ScrollTrigger.addEventListener("refresh", () =>
      requestAnimationFrame(() => ScrollTrigger.update())
    );
    ScrollTrigger.refresh();
  };

  const destroySmoother = () => {
    try {
      const instance = ScrollSmoother.get();
      if (instance) instance.kill();
      // When killing smoother we should reset scrollerProxy to window
      const content = document.getElementById("smooth-content");
      if (content) {
        ScrollTrigger.scrollerProxy(content, null);
      }
      // Reset defaults to window
      ScrollTrigger.defaults({ scroller: null });
      ScrollTrigger.refresh();
    } catch (e) {}
  };

  // Enable only after Nuxt app is mounted (post-hydration) to avoid SSR mismatch
  nuxtApp.hook("app:mounted", () => {
    enableSmoother();
  });

  // Keep things stable across resize/orientation without tearing down Smoother
  const onResize = () => {
    clearTimeout(onResize._t);
    onResize._t = setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (e) {}
    }, 150);
  };
  window.addEventListener("resize", onResize);

  // On each route render completion, enable or destroy Smoother depending on layout structure
  nuxtApp.hook("page:finish", () => {
    const wrapper = document.getElementById("smooth-wrapper");
    const content = document.getElementById("smooth-content");
    if (wrapper && content) {
      enableSmoother();
    } else {
      destroySmoother();
    }

    // Always refresh triggers after layout change
    try {
      const st = $gsap.core.globals().ScrollTrigger;
      st && st.refresh && st.refresh();
    } catch (e) {}
  });

  nuxtApp.hook("app:beforeUnmount", () => {
    destroySmoother();
    window.removeEventListener("resize", onResize);
  });
});
