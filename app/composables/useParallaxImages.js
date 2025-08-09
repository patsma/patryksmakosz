/**
 * Reusable parallax effect for images inside containers matching a selector.
 *
 * Usage:
 *  import useParallaxImages from "~/app/composables/useParallaxImages";
 *  const destroyParallax = useParallaxImages();
 *  onUnmounted(() => destroyParallax());
 *
 * The effect targets `.image--parallax-01 img` by default.
 * It computes the vertical overflow and animates from -overflow/2 to +overflow/2
 * across the scroll range of the container using GSAP ScrollTrigger.
 *
 * If an `img` has a numeric `data-speed` attribute, it multiplies the movement
 * by that factor. If it's `auto` or missing, it uses the computed overflow as-is.
 *
 * We avoid ScrollSmoother to keep things simple. This plays nicely with native scroll.
 *
 * @param {Object} [options]
 * @param {string} [options.containerSelector='.image--parallax-01']
 * @param {string} [options.imageSelector='img']
 * @returns {() => void} cleanup function to kill created ScrollTriggers
 */
export default function useParallaxImages(options = {}) {
  const { $gsap } = useNuxtApp();
  const containerSelector = options.containerSelector || ".image--parallax-01";
  const imageSelector = options.imageSelector || "img";

  // Lazy import to avoid SSR issues
  let ScrollTrigger;
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    ScrollTrigger = require("gsap/ScrollTrigger").ScrollTrigger;
    $gsap.registerPlugin(ScrollTrigger);
  } catch (e) {
    // Plugin may already be registered in some components
  }

  /** @type {import('gsap').ScrollTrigger[]} */
  const createdTriggers = [];

  const setup = () => {
    const containers = Array.from(document.querySelectorAll(containerSelector));
    if (!containers.length) return;

    containers.forEach((container) => {
      const img = container.querySelector(imageSelector);
      if (!img) return;

      const run = () => {
        try {
          const containerHeight = container.clientHeight;
          const imageHeight = img.clientHeight || containerHeight; // CSS sets 120%
          const overflow = Math.max(0, imageHeight - containerHeight);
          const speedAttr = img.getAttribute("data-speed");
          const speed =
            speedAttr && speedAttr !== "auto" ? parseFloat(speedAttr) || 1 : 1;
          const maxShift = overflow * speed * 0.5;

          // Kill previous trigger for this element if exists
          const existing = createdTriggers.find(
            (t) => t.vars.trigger === container
          );
          if (existing) {
            existing.kill();
          }

          const tl = $gsap.fromTo(
            img,
            { y: -maxShift },
            {
              y: maxShift,
              ease: "none",
              scrollTrigger: {
                trigger: container,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );

          // gsap returns tween; get its ScrollTrigger
          const st = tl.scrollTrigger;
          if (st) createdTriggers.push(st);
        } catch (e) {
          // ignore per-element errors
        }
      };

      if (img.complete) {
        run();
      } else {
        img.addEventListener("load", run, { once: true });
      }
    });
  };

  if (process.client) {
    try {
      // Defer to nextTick to ensure DOM is ready
      // eslint-disable-next-line no-undef
      nextTick(() => setup());
      // Recompute on resize for correct overflow on responsive changes
      const onResize = () => {
        // Kill all and rebuild
        createdTriggers.forEach((t) => t.kill());
        createdTriggers.length = 0;
        setup();
      };
      window.addEventListener("resize", onResize);
      return () => {
        try {
          createdTriggers.forEach((t) => t.kill());
        } catch (e) {}
        window.removeEventListener("resize", onResize);
      };
    } catch (e) {
      // no-op
    }
  }

  return () => {};
}
