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

  const initScrollSmoother = () => {
    // Clean up any existing instance
    const existing = ScrollSmoother.get();
    if (existing) {
      existing.kill();
      const content = document.getElementById("smooth-content");
      if (content) ScrollTrigger.scrollerProxy(content, null);
      ScrollTrigger.defaults({ scroller: null });
    }

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

  // Reinitialize on every page change - SIMPLE
  nuxtApp.hook("page:finish", () => {
    setTimeout(initScrollSmoother, 500); // Wait for components to mount
  });

  // Cleanup
  nuxtApp.hook("app:beforeUnmount", () => {
    const existing = ScrollSmoother.get();
    if (existing) existing.kill();
  });
});
