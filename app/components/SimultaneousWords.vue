<template>
  <section
    class="simultaneous-words"
    :style="{
      '--sw-pin-height': `${pinHeightVh}vh`,
      '--sw-bg':
        theme === 'light' ? 'var(--color-white)' : 'var(--color-black)',
      '--sw-fg':
        theme === 'light' ? 'var(--color-black)' : 'var(--color-gray-1)',
      '--sw-border':
        theme === 'light' ? 'var(--color-gray-2)' : 'rgba(72,72,72,1)',
    }"
  >
    <div ref="pinRef" class="simultaneous-words__pin">
      <div ref="containerRef" class="simultaneous-words__container">
        <p ref="paragraphRef" class="simultaneous-words__paragraph">
          {{ paragraph }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";

/**
 * @typedef {Object} SimultaneousWordsProps
 * @property {string} scrollLabel
 * @property {string} paragraph
 * @property {('dark'|'light')} theme
 * @property {number} pinHeightVh
 */
const props = defineProps({
  scrollLabel: { type: String, default: "Scroll" },
  paragraph: {
    type: String,
    default: "Describe the project in a concise and engaging way.",
  },
  theme: { type: String, default: "dark" },
  pinHeightVh: { type: Number, default: 500 },
});

const scrollRef = ref(null);
const pinRef = ref(null);
const containerRef = ref(null);
const paragraphRef = ref(null);

const { $gsap } = useNuxtApp();
const tweens = [];
const triggers = [];

const wrapWordsInSpan = (el) => {
  if (!el) return;
  const text = el.textContent || "";
  el.innerHTML = text
    .split(" ")
    .map((word) => `<span class="word">${word}</span>`) // do not join with extra spaces
    .join(" ");
};

const init = () => {
  if (!$gsap) return;
  let ScrollTrigger;
  try {
    ScrollTrigger = $gsap.core.globals().ScrollTrigger;
  } catch (e) {
    return;
  }
  if (!ScrollTrigger) return;

  const pinEl = pinRef.value;
  const containerEl = containerRef.value;
  const paragraphEl = paragraphRef.value;
  const scrollEl = scrollRef.value;
  if (!pinEl || !containerEl || !paragraphEl) return;

  // Hide scroll helper when we hit the section
  if (scrollEl) {
    const t = $gsap.to(scrollEl, {
      autoAlpha: 0,
      duration: 0.2,
      scrollTrigger: {
        trigger: pinEl,
        start: "top top",
        end: "top top-=1",
        toggleActions: "play none reverse none",
      },
    });
    tweens.push(t);
  }

  // Pin container for the section duration
  const pinTrigger = ScrollTrigger.create({
    trigger: pinEl,
    start: "top top",
    end: "bottom bottom",
    pin: containerEl,
    pinSpacing: true,
  });
  triggers.push(pinTrigger);

  // Split into words and compute lines
  wrapWordsInSpan(paragraphEl);
  const words = paragraphEl.querySelectorAll(".word");
  const lines = [[]];
  let lineIndex = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const offsetTop = word.offsetTop;
    if (i > 0 && offsetTop !== words[i - 1].offsetTop) {
      lines.push([]);
      lineIndex++;
    }
    lines[lineIndex].push(word);
  }

  // Initial position: offscreen to the right (numeric, not calc())
  const offsetRightPx = Math.max(0, window.innerWidth - 25);
  $gsap.set(words, { x: offsetRightPx });

  // Animate lines to x=0 with stagger and scrub
  lines.forEach((lineWords) => {
    const tween = $gsap.to(lineWords, {
      x: 0,
      stagger: 0.2,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: pinEl,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });
    tweens.push(tween);
    try {
      triggers.push(tween.scrollTrigger);
    } catch (e) {}
  });
};

onMounted(() => {
  nextTick(async () => {
    try {
      if (document && document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    } catch (e) {}
    init();

    // Ensure ScrollTrigger recalculates pin spacing with Smoother
    try {
      const ST = $gsap.core.globals().ScrollTrigger;
      ST && ST.refresh && ST.refresh();
    } catch (e) {}
  });
});

onBeforeUnmount(() => {
  while (tweens.length) {
    try {
      tweens.pop().kill();
    } catch (e) {}
  }
  while (triggers.length) {
    try {
      triggers.pop().kill();
    } catch (e) {}
  }
});
</script>
