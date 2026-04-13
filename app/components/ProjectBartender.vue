<template>
  <section
    ref="sectionRef"
    class="project-bartender"
    :style="{ '--pb-pin-height': `${pinHeightVh}vh` }"
    aria-label="Bartender animation"
  >
    <div ref="containerRef" class="project-bartender__container">
      <div class="project-bartender__inner">
        <!-- Header -->
        <div class="project-bartender__header">
          <p ref="title1Ref">BARTENDER</p>
          <p ref="title2Ref">FREE EDITION</p>
          <div ref="separatorRef" class="project-bartender__separator"></div>
        </div>

        <!-- Two columns: text left, SVG right -->
        <div class="project-bartender__content">
          <!-- Text scenes -->
          <div class="project-bartender__texts">
            <!-- Scene 1 -->
            <div class="pb-scene-text">
              <div ref="num1Ref" class="pb-scene-text__number">1</div>
              <div ref="heading1Ref" class="pb-scene-text__heading">
                <p><span>FLEXIBLE, </span><span>POWERFUL</span><br /><span>DESIGN</span></p>
              </div>
            </div>

            <!-- Scene 2 (stacked absolutely) -->
            <div class="pb-scene-text pb-scene-text--abs">
              <div ref="num2Ref" class="pb-scene-text__number">2</div>
              <div ref="heading2Ref" class="pb-scene-text__heading">
                <p>POINT, CLICK, PRINT</p>
              </div>
            </div>

            <!-- Scene 3 (stacked absolutely) -->
            <div class="pb-scene-text pb-scene-text--abs">
              <div ref="num3Ref" class="pb-scene-text__number">3</div>
              <div ref="heading3Ref" class="pb-scene-text__heading">
                <p>FREE SUPPORT<br />WHENEVER AND<br />WHEREVER YOU<br />NEED IT</p>
              </div>
            </div>
          </div>

          <!-- SVG -->
          <div class="project-bartender__animation">
            <BartenderSVG ref="svgRef" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * ProjectBartender - scroll-scrubbed 3-scene animation
 *
 * Ported from a ScrollMagic + GSAP 2 page to GSAP 3 ScrollTrigger.
 * Uses pin + scrub pattern (same as SimultaneousWords.vue), not the
 * play/pause loop pattern used by ProjectArtTech / ProjectBlood.
 *
 * Animation flow:
 *   scene01Tl — SVG boxes slide out, small rect morphs into large rect, content reveals
 *   scene02Tl — text swap: scene 1 → scene 2
 *   scene03Tl — large rect morphs into chat bubble, message tail + headphones drawn in
 *   scene04Tl — text swap: scene 2 → scene 3
 */
import { scopeSvgDefsIds, remapIdSelectors } from '~/utils/scopeSvgIds'

const props = defineProps({
  showDevTools: { type: Boolean, default: false },
  devToolsId: {
    type: String,
    default: () => `bartender-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: { type: Boolean, default: false },
  useScrollTrigger: { type: Boolean, default: true },
  scrub: { type: Number, default: 1 },
  pinHeightVh: { type: Number, default: 500 },
})

const { $gsap, $MorphSVGPlugin, $DrawSVGPlugin } = useNuxtApp()

// Template refs
const sectionRef = ref(null)
const containerRef = ref(null)
const title1Ref = ref(null)
const title2Ref = ref(null)
const separatorRef = ref(null)
const num1Ref = ref(null)
const heading1Ref = ref(null)
const num2Ref = ref(null)
const heading2Ref = ref(null)
const num3Ref = ref(null)
const heading3Ref = ref(null)
const svgRef = ref(null)

// Cleanup tracking (same pattern as SimultaneousWords.vue)
const tweens = []
const triggers = []
const masterTl = ref(null)

const init = () => {
  if (!$gsap) return

  let ScrollTrigger
  try {
    ScrollTrigger = $gsap.core.globals().ScrollTrigger
  } catch (e) {
    return
  }

  const svgRoot = svgRef.value?.svgRootRef
  if (!svgRoot || !containerRef.value || !sectionRef.value) return

  // Scope defs IDs to prevent collisions across multiple instances
  const idPrefix = props.devToolsId
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix)

  // Convert SVG shapes to paths so MorphSVGPlugin can tween between them
  try {
    if ($MorphSVGPlugin) {
      const shapes = svgRoot.querySelectorAll('circle, rect, ellipse, line, polygon, polyline')
      if (shapes?.length) $MorphSVGPlugin.convertToPath(shapes)
    }
  } catch (e) {}

  // Scoped query helpers
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap))
  const qa = (sel) => Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)))

  // SVG element references
  const scene01Group = q('#scene01')                           // parent group for border/dashed/containers
  const outerBorder = q('#scene01-outer-border')
  const dashedArea = q('#scene01-dashed-area')
  const containers = q('#scene01-containers')
  const morphRect = q('#scene01-morph-to-rectangle')      // small rect that morphs
  const morphTarget1 = q('#scene02-rectangle-to-be-morphed')  // large rect target
  const revealMask = q('#scene01-reveal-content-mask')    // mask path (scaleX reveal)
  const maskLine = q('#scene02-show-mask-line')           // sweep reveal line
  const morphTarget2 = q('#scene03-morph-to-message')     // chat bubble target
  const messageTail = q('#scene03-message-tail')          // chat bubble pointer
  const textPlaceholders = qa('#scene-03-text-placeholders > *')
  const headphonePaths = qa('#scene03-headphones > *')

  // Text element groups for transitions
  const heading1El = heading1Ref.value?.querySelector('p')
  const heading2El = heading2Ref.value?.querySelector('p')
  const heading3El = heading3Ref.value?.querySelector('p')
  const heading1Spans = heading1Ref.value
    ? Array.from(heading1Ref.value.querySelectorAll('span'))
    : []

  // ─── Initial states ────────────────────────────────────────────────────────
  $gsap.set(containerRef.value, { autoAlpha: 0 })
  $gsap.set([num2Ref.value, heading2El, num3Ref.value, heading3El].filter(Boolean), {
    autoAlpha: 0,
  })
  // Morph targets start hidden — they're shapes-only, used as morph destination
  if (morphTarget1) $gsap.set(morphTarget1, { autoAlpha: 0 })
  if (morphTarget2) $gsap.set(morphTarget2, { autoAlpha: 0 })
  if (messageTail) $gsap.set(messageTail, { autoAlpha: 0, yPercent: -10 })
  if (textPlaceholders.length) $gsap.set(textPlaceholders, { autoAlpha: 0 })
  // Push mask line fully off-screen left (absolute SVG units, not xPercent which is relative to element's tiny 13px bbox)
  if (maskLine) $gsap.set(maskLine, { x: -15 })
  if (headphonePaths.length) {
    try {
      $gsap.set(headphonePaths, { drawSVG: 0 })
    } catch (e) {}
  }

  // ─── Entrance animation (plays once on mount) ─────────────────────────────
  const initialTl = $gsap.timeline()
  initialTl
    .to(containerRef.value, { autoAlpha: 1, duration: 0.5 })
    .add('show')
    .from(
      [title1Ref.value, title2Ref.value].filter(Boolean),
      { autoAlpha: 0, xPercent: -5, stagger: 0.1, duration: 1 },
      'show'
    )
    .from(separatorRef.value, { width: 0, duration: 0.5 }, 'show+=0.3')
    .from(
      heading1Spans.length ? heading1Spans : [heading1El].filter(Boolean),
      { autoAlpha: 0, yPercent: -5, stagger: 0.1, duration: 1 },
      'show+=0.4'
    )
    .from(num1Ref.value, { scale: 0, autoAlpha: 0, transformOrigin: 'center center', duration: 0.5 }, 'show+=0.5')
    .from(svgRoot, { autoAlpha: 0, duration: 0.5 }, 'show+=0.6')
  tweens.push(initialTl)

  // ─── Scene 01: Boxes exit, small rect morphs into large rect, content reveals ─
  const scene01Tl = $gsap.timeline()
  if (morphRect) {
    scene01Tl.to(morphRect, { duration: 1, autoAlpha: 1, fill: '#96D8EF', stroke: 'transparent' })
    scene01Tl.add('scene01morphToRectangle')
    scene01Tl.to(
      scene01Group,
      { duration: 1.2, yPercent: -110 },
      'scene01morphToRectangle'
    )
    if (morphTarget1) {
      scene01Tl.to(morphRect, { duration: 1, morphSVG: morphTarget1 }, 'scene01morphToRectangle')
    }
    scene01Tl.add('scene02showContentWithLine')
    if (revealMask) {
      scene01Tl.from(revealMask, { duration: 1.6, scaleX: 0 }, 'scene02showContentWithLine+=0.07')
    }
    if (maskLine) {
      // Sweep mask line across full SVG viewBox (141.94px wide) using absolute x values
      // xPercent won't work here - it's relative to the element's own 13px bbox, not the viewBox
      scene01Tl.fromTo(
        maskLine,
        { x: -15 },
        { duration: 1.6, x: 150 },
        'scene02showContentWithLine'
      )
    }
  }

  // ─── Scene 02: Text swap — scene 1 out, scene 2 in ────────────────────────
  const scene02Tl = $gsap.timeline()
  scene02Tl
    .to([num1Ref.value, heading1El].filter(Boolean), {
      duration: 0.3,
      autoAlpha: 0,
      xPercent: -25,
      stagger: 0.1,
    })
    .fromTo(
      [num2Ref.value, heading2El].filter(Boolean),
      { autoAlpha: 0, xPercent: 25 },
      { duration: 0.3, autoAlpha: 1, xPercent: 0, stagger: 0.1 }
    )

  // ─── Scene 03: Rect morphs into chat bubble, headphones drawn ─────────────
  const scene03Tl = $gsap.timeline()
  if (revealMask) {
    scene03Tl.to(revealMask, { duration: 1, autoAlpha: 0 })
  }
  if (morphRect && morphTarget2) {
    scene03Tl.to(morphRect, { duration: 1, morphSVG: morphTarget2 })
  }
  if (messageTail) {
    scene03Tl.to(messageTail, { duration: 1, autoAlpha: 1, yPercent: 0 })
  }
  if (textPlaceholders.length) {
    scene03Tl.to(textPlaceholders, {
      duration: 0.3,
      autoAlpha: 1,
      xPercent: 0,
      stagger: 0.1,
    })
    // Set alternating starting xPercent before animating
    $gsap.set(textPlaceholders, { xPercent: (i) => [-10, 10, -10][i % 3] })
  }
  if (headphonePaths.length) {
    try {
      scene03Tl.to(headphonePaths, { duration: 0.3, drawSVG: '100%', stagger: 0.1 })
    } catch (e) {}
  }

  // ─── Scene 04: Text swap — scene 2 out, scene 3 in ────────────────────────
  const scene04Tl = $gsap.timeline()
  scene04Tl
    .to([num2Ref.value, heading2El].filter(Boolean), {
      duration: 0.3,
      autoAlpha: 0,
      xPercent: -25,
      stagger: 0.1,
    })
    .fromTo(
      [num3Ref.value, heading3El].filter(Boolean),
      { autoAlpha: 0, xPercent: 25 },
      { duration: 0.3, autoAlpha: 1, xPercent: 0, stagger: 0.1 }
    )

  // ─── Master timeline ───────────────────────────────────────────────────────
  const tl = $gsap.timeline({ paused: true })
  tl.add(scene01Tl).add(scene02Tl).add(scene03Tl).add(scene04Tl)
  masterTl.value = tl

  // ─── ScrollTrigger: pin + scrub ────────────────────────────────────────────
  if (props.useScrollTrigger && ScrollTrigger) {
    const pinTrigger = ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top top',
      end: 'bottom bottom',
      pin: containerRef.value,
      pinSpacing: true,
      anticipatePin: 1,
    })
    triggers.push(pinTrigger)

    const scrubTween = $gsap.to(tl, {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top top',
        end: 'bottom bottom',
        scrub: props.scrub,
      },
    })
    tweens.push(scrubTween)

    try {
      ScrollTrigger.refresh()
    } catch (e) {}
  } else if (props.autoPlay) {
    tl.play()
  }
}

onMounted(() => {
  nextTick(async () => {
    try {
      if (document?.fonts?.ready) await document.fonts.ready
    } catch (e) {}
    init()
  })
})

onBeforeUnmount(() => {
  while (tweens.length) {
    try {
      tweens.pop().kill()
    } catch (e) {}
  }
  while (triggers.length) {
    try {
      triggers.pop().kill()
    } catch (e) {}
  }
})

defineExpose({
  containerRef,
  masterTl,
  play: () => masterTl.value?.play(),
  pause: () => masterTl.value?.pause(),
  restart: () => masterTl.value?.restart(),
  seek: (t) => masterTl.value?.seek(t),
})
</script>

<style scoped>
/* Styles in app/assets/scss/components/_project-bartender.scss */
</style>
