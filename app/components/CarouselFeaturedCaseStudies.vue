<template>
  <div
    ref="containerRef"
    class="carousel-featured-case-studies"
    :data-id="idAttr"
    role="region"
    aria-label="Featured case studies carousel"
  >
    <div class="navigation">
      <div ref="navigationPaginationRef" class="navigation-pagination">
        <template
          v-for="(item, index) in normalizedCases"
          :key="`nav-${index}`"
        >
          <div
            class="navigation-item"
            role="button"
            tabindex="0"
            @click="handleNavigate(index)"
            @keyup.enter="handleNavigate(index)"
            ref="navigationItemRefs"
          >
            {{ index + 1 }}
          </div>
          <div class="navigation-divider" ref="navigationDividerRefs">
            <div
              class="navigation-divider__inner"
              :class="{
                'navigation-divider__inner--incident': alternativeColors,
              }"
              ref="navigationDividerInnerRefs"
            />
          </div>
        </template>
      </div>

      <NuxtLink
        v-if="viewAllHref"
        :href="viewAllHref"
        class="navigation-button"
        :class="{ 'navigation-button--incident': alternativeColors }"
        aria-label="View all case studies"
      >
        View all
      </NuxtLink>
      <!-- If you need a custom button component, we'll wire it in a follow-up -->
    </div>

    <div
      data-speed="0.95"
      class="title"
      :class="{
        'gradient-text-2': alternativeColors && gradientTitle,
        'gradient-text-1': !alternativeColors && gradientTitle,
      }"
    >
      {{ headline }}
    </div>

    <div class="inner-wrapper">
      <div
        v-for="(item, index) in normalizedCases"
        :key="`text-${index}`"
        class="inner-item"
        ref="textItemRefs"
      >
        <div class="text-wrapper">
          <div class="text-top">
            <div class="text-top-tags" ref="tagRefs">
              <div class="text-top-tag">Case-study</div>
            </div>
            <div class="text-top-title" ref="titleRefs">
              {{ item.post_title }}
            </div>
            <div class="text-top-paragraph" ref="excerptRefs">
              {{ item.post_excerpt }}...
            </div>
          </div>
          <div class="text-bottom">
            <div
              class="text-bottom-paragraph"
              :class="{ 'text-bottom-paragraph--incident': alternativeColors }"
              ref="quoteRefs"
            >
              “{{ item.testimonial_content }}“
            </div>
            <div class="text-bottom-captions" ref="captionsRefs">
              <div class="text-bottom-caption">
                {{ item.testimonial_name }},
              </div>
              <div class="text-bottom-caption">
                {{ item.testimonial_position }}
              </div>
            </div>
          </div>
        </div>

        <div class="button">
          <!-- Button styles and component can be enhanced later -->
          <NuxtLink
            :to="item.permalink"
            class="btn-standard"
            :class="{ 'btn-standard--incident': alternativeColors }"
            ref="buttonRefs"
          >
            <span>Explore case</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="image-wrapper">
      <div
        v-for="(item, index) in normalizedCases"
        :key="`img-${index}`"
        class="image-item"
        ref="imageItemRefs"
      >
        <div class="image image--parallax-01" ref="parallaxContainerRefs">
          <NuxtImg
            :src="item.thumbnail_url"
            :alt="item.post_title"
            data-speed="auto"
            data-lag="0.15"
            format="webp"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Use GSAP through Nuxt injection to align with our animation standards
const { $gsap } = useNuxtApp();

// We'll register ScrollTrigger on client only
import { ScrollTrigger } from "gsap/ScrollTrigger";
// SplitText provided by @hypernym/nuxt-gsap (club plugin)
const { $SplitText } = useNuxtApp();

/**
 * @typedef {Object} CaseStudy
 * @property {number|string} [ID]
 * @property {string} post_title
 * @property {string} post_excerpt
 * @property {string} testimonial_content
 * @property {string} testimonial_name
 * @property {string} testimonial_position
 * @property {string} [permalink]
 * @property {string} [thumbnail_url]
 */

const props = defineProps({
  /**
   * @type {string}
   */
  headline: { type: String, default: "Featured case studies" },
  /**
   * @type {boolean}
   */
  alternativeColors: { type: Boolean, default: false },
  /**
   * @type {boolean}
   */
  gradientTitle: { type: Boolean, default: false },
  /**
   * @type {Array<CaseStudy>}
   */
  cases: { type: Array, default: () => [] },
  /**
   * Optional "View all" link
   * @type {string|null}
   */
  viewAllHref: { type: String, default: null },
  /**
   * Optional id to bind as data attribute for debugging/parity with WP
   * @type {string|null}
   */
  idAttr: { type: String, default: null },
});

// Root container
const containerRef = ref(null);

// Refs arrays (populated by v-for)
const navigationItemRefs = ref([]);
const textItemRefs = ref([]);
const imageItemRefs = ref([]);
const parallaxContainerRefs = ref([]);
const navigationDividerRefs = ref([]);
const navigationDividerInnerRefs = ref([]);
// Granular element refs for nicer per-part animations (left side)
const tagRefs = ref([]);
const titleRefs = ref([]);
const excerptRefs = ref([]);
const quoteRefs = ref([]);
const buttonRefs = ref([]);
const captionsRefs = ref([]);

// Single refs
const navigationPaginationRef = ref(null);

// GSAP timeline and scrolltrigger refs
const paginationTl = ref(null);
const scrollTriggerRef = ref(null);
/**
 * Track the currently active slide index for potential external integrations
 * or future UI bindings. This fixes a ReferenceError from a leftover callback
 * that updates the index during timeline progression.
 * @type {import('vue').Ref<number>}
 */
const activeIndex = ref(0);
let parallaxCleanup = null;
// SplitText instances for titles to revert on cleanup
let splitTitleInstances = [];

/**
 * Normalize incoming cases to expected shape and fill gaps if needed
 * @returns {Array<CaseStudy & { permalink: string, thumbnail_url: string }>}
 */
const normalizedCases = computed(() => {
  if (props.cases && props.cases.length > 0) {
    return props.cases.map((c) => ({
      post_title: c.post_title || "Untitled",
      post_excerpt: c.post_excerpt || "",
      testimonial_content: c.testimonial_content || "",
      testimonial_name: c.testimonial_name || "",
      testimonial_position: c.testimonial_position || "",
      permalink: c.permalink || "#",
      thumbnail_url: c.thumbnail_url || "",
      ID: c.ID ?? undefined,
    }));
  }
  // Fallback demo data if no cases provided
  return [
    {
      post_title: "Sample Case A",
      post_excerpt: "Short description of case study A",
      testimonial_content: "Great collaboration and results",
      testimonial_name: "Jane Doe",
      testimonial_position: "Head of Marketing",
      permalink: "#",
      thumbnail_url: "/Image-component-3.png",
    },
    {
      post_title: "Sample Case B",
      post_excerpt: "Short description of case study B",
      testimonial_content: "Outstanding delivery",
      testimonial_name: "John Smith",
      testimonial_position: "CTO",
      permalink: "#",
      thumbnail_url: "/Image-component-4.png",
    },
    {
      post_title: "Sample Case C",
      post_excerpt: "Short description of case study C",
      testimonial_content: "Impressive expertise",
      testimonial_name: "Alex Roe",
      testimonial_position: "Founder",
      permalink: "#",
      thumbnail_url: "/Image-component-3.png",
    },
  ];
});

// Reset refs arrays before each update to avoid duplicates
onBeforeUpdate(() => {
  navigationItemRefs.value = [];
  textItemRefs.value = [];
  imageItemRefs.value = [];
  navigationDividerRefs.value = [];
  navigationDividerInnerRefs.value = [];
  parallaxContainerRefs.value = [];
  tagRefs.value = [];
  titleRefs.value = [];
  excerptRefs.value = [];
  quoteRefs.value = [];
  buttonRefs.value = [];
  captionsRefs.value = [];
  // Revert SplitText instances to restore DOM
  if (splitTitleInstances && splitTitleInstances.length) {
    try {
      splitTitleInstances.forEach(
        (inst) => inst && inst.revert && inst.revert()
      );
    } catch (e) {}
  }
  splitTitleInstances = [];
});

/**
 * Initialize GSAP timeline analogous to the WP implementation
 */
const initAnimation = () => {
  const images = imageItemRefs.value;
  const texts = textItemRefs.value;
  const navigationItems = navigationItemRefs.value;
  const navigationDividers = navigationDividerRefs.value;
  const navigationDividersInner = navigationDividerInnerRefs.value;
  const navigationPagination = navigationPaginationRef.value;
  const tags = tagRefs.value;
  const titles = titleRefs.value;
  const excerpts = excerptRefs.value;
  const quotes = quoteRefs.value;
  const buttons = buttonRefs.value;
  const captions = captionsRefs.value;

  if (images.length === 0 || texts.length === 0) {
    return;
  }

  // Correct z-index ordering for images
  for (let i = images.length, j = 0; i > 0; i--, j++) {
    $gsap.set(images[j], { zIndex: i });
  }
  // Ensure current text for first slide is visible (SplitText anim will handle next steps)
  $gsap.set(
    [
      ...[titleRefs.value?.[0]].filter(Boolean),
      ...[excerptRefs.value?.[0]].filter(Boolean),
      ...[quoteRefs.value?.[0]].filter(Boolean),
      ...[buttonRefs.value?.[0]].filter(Boolean),
    ]
      .map((n) => (n && n.$el ? n.$el : n))
      .filter((el) => el && el.nodeType === 1),
    { autoAlpha: 1 }
  );

  // Prepare SplitText instances for titles (mask by lines, animate chars)
  if ($SplitText && titles.length) {
    try {
      splitTitleInstances = titles.map((el) =>
        $SplitText.create(el, { type: "chars, lines", mask: "lines" })
      );
    } catch (e) {
      splitTitleInstances = [];
    }
  }

  // Helper: resolve Vue component refs to DOM elements
  const toEl = (node) => (node && node.$el ? node.$el : node);

  if (images.length > 1) {
    const tl = $gsap.timeline({ paused: true, repeat: -1 });

    navigationDividersInner.forEach((_, index) => {
      tl.addLabel(`${index}`);
      tl.call(() => {
        activeIndex.value = index;
      });

      // Animate OUT previous content and IN current in parallel
      if (index !== 0) {
        const prev = index - 1;

        // OUT previous (fast)
        if (tags[prev]) {
          tl.to(toEl(tags[prev]), {
            autoAlpha: 0,
            y: -8,
            duration: 0.18,
            ease: "sine.in",
          });
        }
        if (splitTitleInstances[prev] && splitTitleInstances[prev].chars) {
          tl.to(
            splitTitleInstances[prev].chars,
            {
              autoAlpha: 0,
              yPercent: (i) => $gsap.utils.wrap([100, -100])(i),
              stagger: 0.02,
              duration: 0.25,
              ease: "sine.in",
            },
            "<"
          );
        } else if (titles[prev]) {
          tl.to(
            toEl(titles[prev]),
            { autoAlpha: 0, y: -8, duration: 0.2, ease: "sine.in" },
            "<"
          );
        }
        if (excerpts[prev]) {
          tl.to(
            toEl(excerpts[prev]),
            { autoAlpha: 0, y: -8, duration: 0.18, ease: "sine.in" },
            "<"
          );
        }
        if (quotes[prev]) {
          tl.to(
            toEl(quotes[prev]),
            { autoAlpha: 0, y: -8, duration: 0.18, ease: "sine.in" },
            "<"
          );
        }
        if (captions[prev]) {
          const childrenPrev =
            toEl(captions[prev]) && toEl(captions[prev]).children
              ? Array.from(toEl(captions[prev]).children).filter(
                  (n) => n && n.nodeType === 1
                )
              : [];
          if (childrenPrev.length) {
            tl.to(
              childrenPrev,
              {
                autoAlpha: 0,
                y: -6,
                duration: 0.16,
                stagger: 0.04,
                ease: "sine.in",
              },
              "<"
            );
          }
        }
        if (buttons[prev]) {
          tl.to(
            toEl(buttons[prev]),
            { autoAlpha: 0, y: -8, duration: 0.16, ease: "sine.in" },
            "<"
          );
        }
        // Previous image OUT (unchanged) in parallel
        tl.to(
          images[prev],
          {
            autoAlpha: 0,
            xPercent: -20,
            scale: 0.9,
            duration: 0.3,
            ease: "sine.in",
          },
          "<"
        );
        tl.to(navigationDividers[prev], { width: "0" }, "<");
        tl.set(texts[prev], { autoAlpha: 0 });
      }

      // IN current (starts with previous OUT, via "<")
      tl.set(texts[index], { autoAlpha: 1 }, "<");
      if (splitTitleInstances[index] && splitTitleInstances[index].chars) {
        tl.from(
          splitTitleInstances[index].chars,
          {
            yPercent: (i) => $gsap.utils.wrap([-100, 100])(i),
            autoAlpha: 0,
            stagger: 0.04,
            duration: 0.5,
            ease: "sine.out",
          },
          "<"
        );
      } else if (titles[index]) {
        tl.from(
          toEl(titles[index]),
          { autoAlpha: 0, y: 12, duration: 0.4, ease: "sine.out" },
          "<"
        );
      }
      if (tags[index]) {
        tl.fromTo(
          toEl(tags[index]),
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.22, ease: "sine.out" },
          "<0.05"
        );
      }
      if (excerpts[index]) {
        tl.fromTo(
          toEl(excerpts[index]),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: "sine.out" },
          "<0.05"
        );
      }
      if (quotes[index]) {
        tl.fromTo(
          toEl(quotes[index]),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: "sine.out" },
          "<0.05"
        );
      }
      if (captions[index]) {
        const childrenCur =
          toEl(captions[index]) && toEl(captions[index]).children
            ? Array.from(toEl(captions[index]).children).filter(
                (n) => n && n.nodeType === 1
              )
            : [];
        if (childrenCur.length) {
          tl.fromTo(
            childrenCur,
            { autoAlpha: 0, y: 6 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.28,
              stagger: 0.05,
              ease: "sine.out",
            },
            "<0.05"
          );
        }
      }
      if (buttons[index]) {
        tl.fromTo(
          toEl(buttons[index]),
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.3, ease: "sine.out" },
          "<"
        );
      }

      // Images (right side) remain unchanged
      tl.to(images[index], { autoAlpha: 1, scale: 1, x: 0 }, "<");
      tl.to(navigationDividers[index], { width: "48px" });
      tl.to(navigationDividersInner[index], { duration: 6, width: "100%" });
    });

    paginationTl.value = tl;

    // Start playback when section enters viewport
    scrollTriggerRef.value = ScrollTrigger.create({
      trigger: containerRef.value,
      start: "top center+=10%",
      end: "bottom bottom+=50%",
      once: true,
      onEnter: () => {
        paginationTl.value?.play(0);
      },
    });

    // Note: We attach click via template handler; labels already exist
  } else {
    // Single image case
    $gsap.set(images[0], { scale: 1, x: 0 });
    if (navigationPagination) {
      $gsap.set(navigationPagination, { autoAlpha: 0 });
    }
  }
};

/**
 * Navigate to specific slide index
 * @param {number} index
 */
const handleNavigate = (index) => {
  if (paginationTl.value) {
    paginationTl.value.play(`${index}`);
  }
};

onMounted(() => {
  // Register plugin safely on client
  try {
    $gsap.registerPlugin(ScrollTrigger);
  } catch (e) {
    // In case plugin is already registered, ignore
  }

  // Small nextTick to ensure refs arrays are populated
  nextTick(() => {
    initAnimation();
  });

  // ScrollSmoother handles data-speed="auto" automatically - no composable needed
});

onUnmounted(() => {
  if (paginationTl.value) {
    paginationTl.value.kill();
  }
  if (scrollTriggerRef.value) {
    scrollTriggerRef.value.kill();
  }
  if (splitTitleInstances && splitTitleInstances.length) {
    try {
      splitTitleInstances.forEach(
        (inst) => inst && inst.revert && inst.revert()
      );
    } catch (e) {}
  }
  // ScrollSmoother cleans up automatically
});
</script>

<style scoped lang="scss"></style>
