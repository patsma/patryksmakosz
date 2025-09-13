// Simple ScrollSmoother that actually works
export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return;

  const { $gsap } = nuxtApp;
  if (!$gsap) return;

  let ScrollTrigger, ScrollSmoother;
  try {
    ScrollTrigger = $gsap.core.globals().ScrollTrigger;
    ScrollSmoother = $gsap.core.globals().ScrollSmoother;
  } catch (e) {
    return;
  }

  if (!ScrollTrigger || !ScrollSmoother) return;

  const hardResetScrollPosition = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch (e) {
      try {
        window.scrollTo(0, 0);
      } catch (_) {}
    }
  };

  const killSmootherAndTriggers = () => {
    try {
      const existing = ScrollSmoother.get();
      if (existing) {
        try {
          existing.scrollTop(0, false);
        } catch (_) {}
        existing.kill();
      }
    } catch (e) {}

    try {
      const content = document.getElementById("smooth-content");
      if (content) {
        try {
          ScrollTrigger.scrollerProxy(content, null);
        } catch (_) {}
        try {
          // Remove any transform leftovers to avoid fixed elements glitch
          content.style.removeProperty("transform");
        } catch (_) {}
      }
    } catch (e) {}

    try {
      ScrollTrigger.defaults({ scroller: null });
    } catch (e) {}

    try {
      // Kill any stray triggers from unmounted pages/components
      const all = ScrollTrigger.getAll();
      for (let i = 0; i < all.length; i++) all[i].kill();
    } catch (e) {}

    hardResetScrollPosition();
  };

  const initScrollSmoother = () => {
    // Always start from a clean slate
    killSmootherAndTriggers();

    const wrapper = document.getElementById("smooth-wrapper");
    const content = document.getElementById("smooth-content");
    if (!wrapper || !content) return;

    // Create ScrollSmoother
    const smoother = ScrollSmoother.create({
      wrapper,
      content,
      smooth: 0.8,
      effects: true,
      smoothTouch: 0.2,
      normalizeScroll: true,
      ignoreMobileResize: true,
    });

    // Ensure we start at absolute top without interpolation
    try {
      smoother.scrollTop(0, false);
    } catch (e) {}
    hardResetScrollPosition();

    // Setup ScrollTrigger proxy
    ScrollTrigger.scrollerProxy(content, {
      scrollTop(value) {
        const instance = ScrollSmoother.get();
        if (!instance) return window.scrollY || 0;
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

    ScrollTrigger.defaults({ scroller: content });
    ScrollTrigger.refresh();
  };

  // Initialize on app mount
  nuxtApp.hook("app:mounted", () => {
    setTimeout(initScrollSmoother, 100);
  });

  // Kill smoother and triggers right as navigation starts, and force top
  nuxtApp.hook("page:start", () => {
    // Run asap to avoid race with new page mounting
    setTimeout(killSmootherAndTriggers, 0);
  });

  // Reinitialize on every page change
  nuxtApp.hook("page:finish", () => {
    // Ensure we land at the very top instantly before init
    hardResetScrollPosition();
    // Give the page a tick to mount its content
    setTimeout(initScrollSmoother, 100);
  });

  // Cleanup
  nuxtApp.hook("app:beforeUnmount", () => {
    killSmootherAndTriggers();
  });
});
