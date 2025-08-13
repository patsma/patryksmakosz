<template>
  <div class="carousel-timeline" role="region" aria-label="Process timeline">
    <div class="text-wrapper">
      <div class="title">{{ headline }}</div>
      <div class="paragraph">{{ textUnderHeadline }}</div>
    </div>

    <div class="wrapper">
      <!-- Pagination (numbers + circular button bg) -->
      <div class="pagination" ref="paginationRef">
        <template v-for="(step, index) in stepsNormalized" :key="`p-${index}`">
          <div
            class="pagination-item"
            :class="{ 'is-active': currentIndex === index }"
            ref="paginationItemRefs"
            @click="handlePaginationClick(index)"
          >
            <div class="pagination-item__text" ref="paginationItemTextRefs">
              {{ index + 1 }}
            </div>
            <button class="btn-circular-01">
              <svg
                viewBox="0 0 66 66"
                shape-rendering="geometricPrecision"
                class="btn-svg-circular-01"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="paint0_linear_1767_4113"
                    x1="0"
                    y1="64"
                    x2="76.583"
                    y2="39.7686"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="matrix(1, 0, 0, 1, 0.999588, 1.000305)"
                  >
                    <stop
                      style="stop-color: var(--gradient-primary-start)"
                    ></stop>
                    <stop
                      offset="1"
                      style="stop-color: var(--gradient-primary-end)"
                    ></stop>
                  </linearGradient>
                  <linearGradient
                    id="paint0_linear_1767_4110"
                    x1="0"
                    y1="64"
                    x2="76.583"
                    y2="39.7686"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="matrix(1, 0, 0, 1, 1, 1)"
                  >
                    <stop
                      style="stop-color: var(--gradient-primary-start)"
                    ></stop>
                    <stop
                      offset="1"
                      style="stop-color: var(--gradient-primary-end)"
                    ></stop>
                  </linearGradient>
                </defs>
                <circle
                  cx="33"
                  cy="33"
                  r="31"
                  style="fill: var(--color-white)"
                  stroke="url(#paint0_linear_1767_4113)"
                  stroke-width="2"
                  class="gradient-border"
                ></circle>
                <circle
                  cx="33"
                  cy="33"
                  r="31"
                  style="fill: var(--color-white); stroke: var(--color-gray-3)"
                  stroke-width="2"
                  class="solid-border"
                ></circle>
                <circle
                  cx="33"
                  cy="33"
                  r="32"
                  fill="url(#paint0_linear_1767_4110)"
                  class="gradient-fill"
                  ref="paginationGradientFillRefs"
                ></circle>
                <circle
                  cx="33"
                  cy="33"
                  r="32"
                  style="fill: var(--color-gray-1)"
                  class="solid-fill"
                  ref="paginationSolidFillRefs"
                ></circle>
              </svg>
            </button>
          </div>
          <div
            v-if="index < stepsNormalized.length - 1"
            class="pagination-divider"
          >
            <div
              class="pagination-divider-inner"
              ref="paginationDividerInnerRefs"
            ></div>
          </div>
        </template>
      </div>
      <div class="navigation">
        <button class="arrow-left" @click="handlePrev">
          <div class="btn-circular">
            <svg viewBox="224 224 52 52" class="">
              <defs>
                <linearGradient
                  id="gradient5"
                  x1="16"
                  y1="32"
                  x2="35.1458"
                  y2="25.9422"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(1, 0, 0, 1, 242.586243, 96.627258)"
                >
                  <stop
                    style="stop-color: var(--gradient-primary-start)"
                  ></stop>
                  <stop
                    offset="1"
                    style="stop-color: var(--gradient-primary-end)"
                  ></stop>
                </linearGradient>
                <linearGradient
                  id="gradient6"
                  x1="0"
                  y1="48"
                  x2="57.4373"
                  y2="29.8265"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(1, 0, 0, 1, 242.586243, 96.627258)"
                >
                  <stop
                    style="stop-color: var(--gradient-primary-start)"
                  ></stop>
                  <stop
                    offset="1"
                    style="stop-color: var(--gradient-primary-end)"
                  ></stop>
                </linearGradient>
              </defs>
              <g
                transform="matrix(1, 0, 0, 1, -97.889008, 125.600998)"
                class="btn-circular--gradient"
              >
                <path
                  d="M 355.889 123.399 L 343.719 123.399 L 349.309 117.809 L 347.889 116.399 L 339.889 124.399 L 347.889 132.399 L 349.299 130.989 L 343.719 125.399 L 355.889 125.399 L 355.889 123.399 Z"
                  style="fill: var(--color-black)"
                ></path>
                <path
                  d="M 347.889 146.399 C 335.739 146.399 325.889 136.55 325.889 124.399 L 321.889 124.399 C 321.889 138.759 333.53 150.399 347.889 150.399 L 347.889 146.399 Z M 369.889 124.399 C 369.889 136.55 360.04 146.399 347.889 146.399 L 347.889 150.399 C 362.249 150.399 373.889 138.759 373.889 124.399 L 369.889 124.399 Z M 347.889 102.399 C 360.04 102.399 369.889 112.249 369.889 124.399 L 373.889 124.399 C 373.889 110.04 362.249 98.399 347.889 98.399 L 347.889 102.399 Z M 347.889 98.399 C 333.53 98.399 321.889 110.04 321.889 124.399 L 325.889 124.399 C 325.889 112.249 335.739 102.399 347.889 102.399 L 347.889 98.399 Z"
                  style="fill: var(--color-gray-3)"
                ></path>
              </g>
              <g
                transform="matrix(-1, 0, 0, -1, 516.585999, 370.626984)"
                class="btn-circular--default"
              >
                <path
                  d="M 266.586 112.627 L 265.176 114.037 L 270.756 119.627 L 258.586 119.627 L 258.586 121.627 L 270.756 121.627 L 265.176 127.217 L 266.586 128.627 L 274.586 120.627 L 266.586 112.627 Z"
                  fill="url(#gradient5)"
                  style=""
                ></path>
                <path
                  d="M 266.586 142.627 C 254.436 142.627 244.586 132.778 244.586 120.627 L 240.586 120.627 C 240.586 134.987 252.227 146.627 266.586 146.627 L 266.586 142.627 Z M 288.586 120.627 C 288.586 132.778 278.737 142.627 266.586 142.627 L 266.586 146.627 C 280.946 146.627 292.586 134.987 292.586 120.627 L 288.586 120.627 Z M 266.586 98.627 C 278.737 98.627 288.586 108.477 288.586 120.627 L 292.586 120.627 C 292.586 106.268 280.946 94.627 266.586 94.627 L 266.586 98.627 Z M 266.586 94.627 C 252.227 94.627 240.586 106.268 240.586 120.627 L 244.586 120.627 C 244.586 108.477 254.436 98.627 266.586 98.627 L 266.586 94.627 Z"
                  fill="url(#gradient6)"
                  style=""
                ></path>
              </g>
            </svg>
          </div>
        </button>
        <button class="arrow-right" @click="handleNext">
          <div class="btn-circular btn-circular--right">
            <svg viewBox="224 224 52 52" class="">
              <defs>
                <linearGradient
                  id="gradient5"
                  x1="16"
                  y1="32"
                  x2="35.1458"
                  y2="25.9422"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(1, 0, 0, 1, 242.586243, 96.627258)"
                >
                  <stop
                    style="stop-color: var(--gradient-primary-start)"
                  ></stop>
                  <stop
                    offset="1"
                    style="stop-color: var(--gradient-primary-end)"
                  ></stop>
                </linearGradient>
                <linearGradient
                  id="gradient6"
                  x1="0"
                  y1="48"
                  x2="57.4373"
                  y2="29.8265"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(1, 0, 0, 1, 242.586243, 96.627258)"
                >
                  <stop
                    style="stop-color: var(--gradient-primary-start)"
                  ></stop>
                  <stop
                    offset="1"
                    style="stop-color: var(--gradient-primary-end)"
                  ></stop>
                </linearGradient>
              </defs>
              <g
                transform="matrix(1, 0, 0, 1, -97.889008, 125.600998)"
                class="btn-circular--gradient"
              >
                <path
                  d="M 355.889 123.399 L 343.719 123.399 L 349.309 117.809 L 347.889 116.399 L 339.889 124.399 L 347.889 132.399 L 349.299 130.989 L 343.719 125.399 L 355.889 125.399 L 355.889 123.399 Z"
                  style="fill: var(--color-black)"
                ></path>
                <path
                  d="M 347.889 146.399 C 335.739 146.399 325.889 136.55 325.889 124.399 L 321.889 124.399 C 321.889 138.759 333.53 150.399 347.889 150.399 L 347.889 146.399 Z M 369.889 124.399 C 369.889 136.55 360.04 146.399 347.889 146.399 L 347.889 150.399 C 362.249 150.399 373.889 138.759 373.889 124.399 L 369.889 124.399 Z M 347.889 102.399 C 360.04 102.399 369.889 112.249 369.889 124.399 L 373.889 124.399 C 373.889 110.04 362.249 98.399 347.889 98.399 L 347.889 102.399 Z M 347.889 98.399 C 333.53 98.399 321.889 110.04 321.889 124.399 L 325.889 124.399 C 325.889 112.249 335.739 102.399 347.889 102.399 L 347.889 98.399 Z"
                  style="fill: var(--color-gray-3)"
                ></path>
              </g>
              <g
                transform="matrix(-1, 0, 0, -1, 516.585999, 370.626984)"
                class="btn-circular--default"
              >
                <path
                  d="M 266.586 112.627 L 265.176 114.037 L 270.756 119.627 L 258.586 119.627 L 258.586 121.627 L 270.756 121.627 L 265.176 127.217 L 266.586 128.627 L 274.586 120.627 L 266.586 112.627 Z"
                  fill="url(#gradient5)"
                  style=""
                ></path>
                <path
                  d="M 266.586 142.627 C 254.436 142.627 244.586 132.778 244.586 120.627 L 240.586 120.627 C 240.586 134.987 252.227 146.627 266.586 146.627 L 266.586 142.627 Z M 288.586 120.627 C 288.586 132.778 278.737 142.627 266.586 142.627 L 266.586 146.627 C 280.946 146.627 292.586 134.987 292.586 120.627 L 288.586 120.627 Z M 266.586 98.627 C 278.737 98.627 288.586 108.477 288.586 120.627 L 292.586 120.627 C 292.586 106.268 280.946 94.627 266.586 94.627 L 266.586 98.627 Z M 266.586 94.627 C 252.227 94.627 240.586 106.268 240.586 120.627 L 244.586 120.627 C 244.586 108.477 254.436 98.627 266.586 98.627 L 266.586 94.627 Z"
                  fill="url(#gradient6)"
                  style=""
                ></path>
              </g>
            </svg>
          </div>
        </button>
      </div>

      <!-- Optional CTA buttons row (outline/filled) -->
      <div class="button" v-if="buttonsNormalized.length">
        <template v-for="(btn, idx) in buttonsNormalized" :key="`cta-${idx}`">
          <a
            v-if="btn.type === 'outline'"
            :href="btn.link"
            class="featured-services__btn btn-standard-outlined"
          >
            <span>{{ btn.text }}</span>
          </a>
          <a v-else :href="btn.link" class="btn-standard">
            <span>{{ btn.text }}</span>
          </a>
        </template>
      </div>

      <div class="divider"></div>

      <!-- Items -->
      <div class="carousel-timeline__wrapper">
        <div
          v-for="(step, index) in stepsNormalized"
          :key="`item-${index}`"
          class="carousel-timeline__item"
          ref="itemRefs"
          @click="handleItemClick(index)"
        >
          <div class="carousel-timeline__text-wrapper">
            <div class="carousel-timeline__title" ref="titleRefs">
              {{ step.title }}
            </div>
            <div class="carousel-timeline__paragraph" ref="paragraphRefs">
              {{ step.content }}
            </div>
          </div>
          <div class="carousel-timeline__button">
            <button class="btn-circular-02" ref="circularBtnRefs">
              <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient
                    id="paint0_linear_1767_4101"
                    x1="32"
                    y1="28"
                    x2="30.3746"
                    y2="17.7259"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="matrix(1, 0, 0, 1, 7.999969, 8.000443)"
                  >
                    <stop style="stop-color: var(--gradient-primary-start)" />
                    <stop
                      offset="1"
                      style="stop-color: var(--gradient-primary-end)"
                    />
                  </linearGradient>
                  <linearGradient
                    id="paint1_linear_1767_4101"
                    x1="48"
                    y1="48"
                    x2="29.8265"
                    y2="-9.43729"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="matrix(1, 0, 0, 1, 7.999969, 8.000443)"
                  >
                    <stop style="stop-color: var(--gradient-primary-start)" />
                    <stop
                      offset="1"
                      style="stop-color: var(--gradient-primary-end)"
                    />
                  </linearGradient>
                </defs>
                <g
                  transform="matrix(0.923077, 0, 0, 0.923077, -5.538462, -5.538464)"
                >
                  <g class="hover">
                    <path
                      d="M 26.516 32 L 29.333 29.238 L 28.08 28.009 L 24 32 L 28.08 36 L 29.333 34.763 L 26.516 32 Z M 37.484 32 L 34.667 34.763 L 35.92 35.992 L 40 32 L 35.92 28 L 34.667 29.238 L 37.484 32 Z"
                      fill="url(#paint0_linear_1767_4101)"
                    />
                    <path
                      d="M 54 32 C 54 44.151 44.15 54 32 54 L 32 58 C 46.359 58 58 46.36 58 32 L 54 32 Z M 32 10 C 36.33 10 40.367 11.251 43.771 13.411 C 49.919 17.312 54 24.18 54 32 L 58 32 C 58 17.641 46.359 6 32 6 L 32 10 Z M 10 32 C 10 19.85 19.85 10 32 10 L 32 6 C 17.641 6 6 17.641 6 32 L 10 32 Z M 6 32 C 6 46.36 17.641 58 32 58 L 32 54 C 19.85 54 10 44.151 10 32 L 6 32 Z"
                      fill="url(#paint1_linear_1767_4101)"
                    />
                  </g>
                  <g
                    transform="matrix(1, 0, 0, 1, -51.301003, -56.816002)"
                    class="non-hover"
                  >
                    <path
                      d="M 77.817 88.816 L 80.635 86.053 L 79.381 84.824 L 75.301 88.816 L 79.381 92.816 L 80.635 91.578 L 77.817 88.816 Z M 88.786 88.816 L 85.968 91.578 L 87.221 92.807 L 91.301 88.816 L 87.221 84.816 L 85.968 86.053 L 88.786 88.816 Z"
                      style="fill: var(--color-primary-2)"
                    />
                    <path
                      d="M 105.301 88.816 C 105.301 100.966 95.452 110.816 83.301 110.816 L 83.301 114.816 C 97.661 114.816 109.301 103.175 109.301 88.816 L 105.301 88.816 Z M 83.301 66.816 C 95.452 66.816 105.301 76.665 105.301 88.816 L 109.301 88.816 C 109.301 74.456 97.661 62.816 83.301 62.816 L 83.301 66.816 Z M 61.301 88.816 C 61.301 76.665 71.151 66.816 83.301 66.816 L 83.301 62.816 C 68.942 62.816 57.301 74.456 57.301 88.816 L 61.301 88.816 Z M 57.301 88.816 C 57.301 103.175 68.942 114.816 83.301 114.816 L 83.301 110.816 C 71.151 110.816 61.301 100.966 61.301 88.816 L 57.301 88.816 Z"
                      style="fill: var(--color-gray-3)"
                    />
                  </g>
                </g>
              </svg>
            </button>
            <a
              :href="step.read_more_link || '#'"
              class="button btn-standard-outlined carousel-timeline__button-inner"
              ref="buttonInnerRefs"
            >
              <span ref="buttonInnerSpanRefs">Read more</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $gsap } = useNuxtApp();

/**
 * @typedef {Object} TimelineStep
 * @property {string} title
 * @property {string} content
 * @property {string} [read_more_link]
 */

const props = defineProps({
  /** @type {string} */
  headline: { type: String, default: "" },
  /** @type {string} */
  textUnderHeadline: { type: String, default: "" },
  /** @type {Array<TimelineStep>} */
  steps: { type: Array, default: () => [] },
  /** @type {Array<{ type: 'outline'|'filled', link: string, text: string }>} */
  buttons: { type: Array, default: () => [] },
});

const stepsNormalized = computed(() => {
  if (props.steps && props.steps.length) return props.steps;
  return [
    {
      title: "Discover",
      content: "We learn and understand.",
      read_more_link: "#",
    },
    {
      title: "Design",
      content: "We design the solution.",
      read_more_link: "#",
    },
    { title: "Deliver", content: "We build and iterate.", read_more_link: "#" },
  ];
});

const buttonsNormalized = computed(() => props.buttons || []);

// Refs arrays
const titleRefs = ref([]);
const paragraphRefs = ref([]);
const itemRefs = ref([]);
const buttonInnerRefs = ref([]);
const buttonInnerSpanRefs = ref([]);
const circularBtnRefs = ref([]);
const paginationRef = ref(null);
const paginationItemRefs = ref([]);
const paginationDividerInnerRefs = ref([]);
const paginationGradientFillRefs = ref([]);
const paginationSolidFillRefs = ref([]);
const paginationItemTextRefs = ref([]);

// State
const tlPaginationItems = ref(null);
const itemTimelines = ref([]);
const currentIndex = ref(-1);

onBeforeUpdate(() => {
  titleRefs.value = [];
  paragraphRefs.value = [];
  itemRefs.value = [];
  buttonInnerRefs.value = [];
  buttonInnerSpanRefs.value = [];
  circularBtnRefs.value = [];
  paginationItemRefs.value = [];
  paginationDividerInnerRefs.value = [];
  paginationGradientFillRefs.value = [];
  paginationSolidFillRefs.value = [];
  paginationItemTextRefs.value = [];
});

// No querySelector fallbacks; we rely strictly on Vue refs

const buildAnimations = () => {
  const items = itemRefs.value;
  const titles = titleRefs.value;
  const paragraphs = paragraphRefs.value;
  const btnInners = buttonInnerRefs.value;
  const btnInnerSpans = buttonInnerSpanRefs.value;
  const btnCirculars = circularBtnRefs.value;
  const pagDividers = paginationDividerInnerRefs.value;
  // Visual fills and pagination texts from refs
  const gradientFills = paginationGradientFillRefs.value;
  const solidFills = paginationSolidFillRefs.value;
  const paginationItemTexts = paginationItemTextRefs.value;

  if (!items.length) return;

  // Pagination timeline: label per item; when moving to item i, fill dividers [0..i-1]
  const tlP = $gsap.timeline({ paused: true, defaults: { duration: 0.25 } });
  const numDividers = pagDividers.length; // items.length - 1
  // Start with all dividers collapsed
  tlP.set(pagDividers, { width: 0 });
  for (let i = 0; i <= numDividers; i++) {
    tlP.addLabel(`${i}`);
    if (i > 0) {
      for (let d = 0; d < i; d++) {
        tlP.to(pagDividers[d], { width: "3.5rem" }, "<");
      }
    }
    tlP.addPause();
  }
  tlPaginationItems.value = tlP;

  // Per-item timelines (collapsed by default using reverse())
  const timelines = [];
  items.forEach((_, index) => {
    const tl = $gsap.timeline({ paused: true, defaults: { duration: 0.25 } });
    tl.addLabel(`${index}`);
    // Expand card width and show button; adjust to match CSS expectations
    tl.to(items[index], { width: "416px" });
    tl.to(btnInners[index], { autoAlpha: 1, width: "max-content" }, "<");
    tl.to(btnCirculars[index], { autoAlpha: 0 }, "<");
    tl.to(btnInnerSpans[index], { autoAlpha: 1, width: "100%" });
    tl.to(titles[index], { fontSize: "2rem" }, "<");
    tl.to(
      items[index],
      {
        background: "var(--color-white)",
        boxShadow: "var(--shadow-elevation-1)",
        width: "auto",
        duration: 0.5,
      },
      "<"
    );

    tl.to(paragraphs[index], { maxHeight: "23.75rem", duration: 0.01 }, 0);
    tl.to(paragraphs[index], { autoAlpha: 1, duration: 0.01 });
    tl.reverse();
    timelines.push(tl);
  });
  itemTimelines.value = timelines;
};

const openIndex = (index) => {
  if (index < 0 || index >= itemTimelines.value.length) return;
  const previousIndex = currentIndex.value;
  currentIndex.value = index;
  // Collapse all, then expand selected
  itemTimelines.value.forEach((tl, i) => {
    tl.reverse();
  });
  const selected = itemTimelines.value[index];
  selected.reversed(!selected.reversed());
  // Drive pagination to current index (so divider up to current is filled)
  if (tlPaginationItems.value) {
    // Off-by-one fix: divider progress index is (activeItemIndex - 1), clamped at 0
    const dividerLabel = Math.max(0, index + 1);
    tlPaginationItems.value.tweenTo(`${dividerLabel}`);
  }

  // Ensure only active bubble shows gradient fill and white text
  const gradientFills = paginationGradientFillRefs.value;
  const solidFills = paginationSolidFillRefs.value;
  const paginationItemTexts = paginationItemTextRefs.value;

  // 1) Reset previous explicitly (defensive):
  if (previousIndex >= 0) {
    const prevGradient = gradientFills[previousIndex];
    const prevSolid = solidFills[previousIndex];
    const prevText = paginationItemTexts[previousIndex];
    if (prevGradient) $gsap.set(prevGradient, { opacity: 0 });
    if (prevSolid) $gsap.set(prevSolid, { opacity: 0 }); // solid kept 0 in design
    if (prevText) {
      try {
        prevText.removeAttribute("style");
      } catch (e) {}
    }
  }

  // 2) Apply to new active only:
  const activeGradient = gradientFills[index];
  const activeSolid = solidFills[index];
  const activeText = paginationItemTexts[index];
  if (activeGradient) $gsap.set(activeGradient, { opacity: 1 });
  if (activeSolid) $gsap.set(activeSolid, { opacity: 0 });
  if (activeText) {
    $gsap.set(activeText, {
      color: "var(--color-white)",
      background: "none",
      WebkitBackgroundClip: "initial",
      backgroundClip: "initial",
    });
  }
  solidFills.forEach((el) => {
    if (!el) return;
    // Reference default shows solid-fill opacity 0 at all times
    $gsap.set(el, { opacity: 0 });
  });
  // Clean all inline styles first so we always reset to SCSS state
  paginationItemTexts.forEach((el) => {
    if (!el) return;
    try {
      el.removeAttribute("style");
    } catch (e) {}
  });
  // Note: active text handled above when applying to new active only
};

// Start inactive per requirement; do not auto-open any item

const handleItemClick = (index) => {
  openIndex(index);
};

const handlePaginationClick = (index) => {
  openIndex(index);
};

const handlePrev = () => {
  if (currentIndex.value < 0) return;
  const next = Math.max(0, currentIndex.value - 1);
  openIndex(next);
};

const handleNext = () => {
  const next = Math.min(itemTimelines.value.length - 1, currentIndex.value + 1);
  openIndex(next);
};

onMounted(() => {
  nextTick(() => {
    buildAnimations();
  });
});

onUnmounted(() => {
  try {
    tlPaginationItems.value?.kill();
  } catch (e) {}
  itemTimelines.value?.forEach((tl) => tl?.kill());
});
</script>

<style scoped lang="scss"></style>
