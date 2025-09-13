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

  // Prepare ScrollTrigger scroller defaults early so components mounting now
  // will bind to the correct scroller even before ScrollSmoother exists.
  const setScrollerDefaultsEarly = () => {
    try {
      const content = document.getElementById("smooth-content");
      if (!content) return;
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
    } catch (e) {}
  };

  // After navigation, DOM may still be building under #smooth-content while
  // components mount async. We wait for DOM to be idle for 200ms (max 1500ms)
  // before creating the Smoother to avoid measuring half-built layouts.
  let settleObserver;
  let settleTimer;
  let settleTimeout;
  let initInProgress = false;
  const waitForDomSettledThenInit = () => {
    if (initInProgress) return;
    initInProgress = true;

    const content = document.getElementById("smooth-content");
    if (!content) {
      initInProgress = false;
      return;
    }

    const cleanup = () => {
      try {
        if (settleObserver) settleObserver.disconnect();
      } catch (_) {}
      try {
        clearTimeout(settleTimer);
      } catch (_) {}
      try {
        clearTimeout(settleTimeout);
      } catch (_) {}
      settleObserver = undefined;
      settleTimer = undefined;
      settleTimeout = undefined;
    };

    const finalizeInit = () => {
      cleanup();
      try {
        initScrollSmoother();
      } finally {
        initInProgress = false;
      }
    };

    // Safety cap: initialize no later than 1500ms
    settleTimeout = setTimeout(finalizeInit, 1500);

    // Debounce: if no mutations for 200ms, consider DOM settled
    const scheduleFinalize = () => {
      try {
        clearTimeout(settleTimer);
      } catch (_) {}
      settleTimer = setTimeout(finalizeInit, 200);
    };

    // Start with an initial debounce in case nothing mutates at all
    scheduleFinalize();

    try {
      settleObserver = new MutationObserver(() => {
        scheduleFinalize();
      });
      settleObserver.observe(content, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    } catch (e) {
      // If observer fails, fall back to timed init
      // Will trigger by settleTimeout or the current settleTimer
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

    // Do NOT clear scrollerProxy/defaults here; keep them stable across nav
    try {
      const content = document.getElementById("smooth-content");
      if (content) {
        try {
          // Remove any transform leftovers to avoid fixed elements glitch
          content.style.removeProperty("transform");
        } catch (_) {}
      }
    } catch (e) {}

    try {
      // Kill any stray triggers from unmounted pages/components
      const all = ScrollTrigger.getAll();
      for (let i = 0; i < all.length; i++) all[i].kill();
    } catch (e) {}

    hardResetScrollPosition();
  };

  const initScrollSmoother = () => {
    // Do NOT kill here; we already killed on page:start to avoid killing
    // triggers created by the new page while it mounts.

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
    // Multiple refresh passes to catch late-mounted components
    try {
      ScrollTrigger.refresh();
    } catch (_) {}
    setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (_) {}
    }, 200);
    setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (_) {}
    }, 800);

    // Also refresh after fonts load to ensure correct measurements
    try {
      if (document && document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          try {
            ScrollTrigger.refresh();
          } catch (_) {}
        });
      }
    } catch (e) {}
  };

  // Initialize on app mount
  nuxtApp.hook("app:mounted", () => {
    setTimeout(() => {
      try {
        setScrollerDefaultsEarly();
      } catch (_) {}
      initScrollSmoother();
    }, 100);
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
    // Set scroller defaults early so late components bind correctly
    setScrollerDefaultsEarly();
    // Wait for DOM to settle (about page heavy content) then init smoother
    waitForDomSettledThenInit();
  });

  // Cleanup
  nuxtApp.hook("app:beforeUnmount", () => {
    killSmootherAndTriggers();
  });
});
