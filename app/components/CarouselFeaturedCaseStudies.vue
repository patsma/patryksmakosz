<template>
  <div
    ref="containerRef"
    class="carousel-featured-case-studies"
    :data-id="idAttr"
    role="region"
    aria-label="Featured case studies carousel"
  >
    <div class="navigation">
      <div
        ref="navigationPaginationRef"
        class="navigation-pagination"
        aria-hidden="true"
      >
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

      <a
        v-if="viewAllHref"
        :href="viewAllHref"
        class="navigation-button"
        :class="{ 'navigation-button--incident': alternativeColors }"
        aria-label="View all case studies"
      >
        View all
      </a>
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
            <div class="text-top-tags">
              <div class="text-top-tag">Case-study</div>
            </div>
            <div class="text-top-title">
              {{ item.post_title }}
            </div>
            <div class="text-top-paragraph">{{ item.post_excerpt }}...</div>
          </div>
          <div class="text-bottom">
            <div
              class="text-bottom-paragraph"
              :class="{ 'text-bottom-paragraph--incident': alternativeColors }"
            >
              “{{ item.testimonial_content }}“
            </div>
            <div class="text-bottom-captions">
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
          <a
            :href="item.permalink"
            class="btn-standard"
            :class="{ 'btn-standard--incident': alternativeColors }"
          >
            <span>Explore case</span>
          </a>
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
import useParallaxImages from "/composables/useParallaxImages";

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

// Single refs
const navigationPaginationRef = ref(null);

// GSAP timeline and scrolltrigger refs
const paginationTl = ref(null);
const scrollTriggerRef = ref(null);
let parallaxCleanup = null;

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

  if (images.length === 0 || texts.length === 0) {
    return;
  }

  // Correct z-index ordering for images
  for (let i = images.length, j = 0; i > 0; i--, j++) {
    $gsap.set(images[j], { zIndex: i });
  }

  if (images.length > 1) {
    const tl = $gsap.timeline({ paused: true, repeat: -1 });

    navigationDividersInner.forEach((_, index) => {
      tl.addLabel(`${index}`);
      tl.from(texts[index], { autoAlpha: 0, yPercent: -10 });
      tl.to(images[index], { scale: 1, x: 0 }, "<");
      tl.to(navigationDividers[index], { width: "48px" });
      tl.to(navigationDividersInner[index], { duration: 6, width: "100%" });
      if (index !== 0) {
        tl.to(navigationDividers[index - 1], { width: "0" }, "<-=1");
        tl.to(texts[index - 1], { autoAlpha: 0, yPercent: 10 }, "<");
        tl.to(images[index - 1], { autoAlpha: 0, yPercent: -10 }, "<");
      }
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

  // Enable reusable parallax on images inside `.image--parallax-01`
  parallaxCleanup = useParallaxImages({
    containerElements: parallaxContainerRefs,
  });
});

onUnmounted(() => {
  if (paginationTl.value) {
    paginationTl.value.kill();
  }
  if (scrollTriggerRef.value) {
    scrollTriggerRef.value.kill();
  }
  if (parallaxCleanup) {
    parallaxCleanup();
  }
});
</script>

<style scoped lang="scss"></style>
