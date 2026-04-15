<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--laptop-isometric"
  >
    <LaptopIsometricSVG ref="svgComponentRef" />
  </div>
</template>

<script setup>
/**
 * ProjectLaptopIsometric animation component
 * - Pattern A (loop/play-pause) architecture
 * - Ports the GSAP timeline from old portfolio /animations/laptop-isometric
 * - Three-phase animation: stairs+cloud, graph elements, monitor+keyboard
 */

const { $gsap } = useNuxtApp()
const { $DrawSVGPlugin } = useNuxtApp()
const { $MorphSVGPlugin } = useNuxtApp()
const { $GSDevTools } = useNuxtApp()
const { $ScrollTrigger } = useNuxtApp()
import { scopeSvgDefsIds, remapIdSelectors } from '/utils/scopeSvgIds'

// Standard container/timeline refs
const containerRef = ref(null)
const timeline = ref(null)
let gsapCtx = null
let scrollTriggerInstance = null

// Ref for the SVG component instance
const svgComponentRef = ref(null)

// Props consistent with other Project components
const props = defineProps({
  showDevTools: {
    type: Boolean,
    default: false,
  },
  devToolsId: {
    type: String,
    default: () => `laptop-isometric-${Math.random().toString(36).slice(2, 9)}`,
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
  useScrollTrigger: { type: Boolean, default: true },
  stStart: { type: String, default: 'top center' },
  stEnd: { type: String, default: 'bottom top' },
})

/**
 * Build the GSAP timeline using the inline SVG IDs
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef
  if (!svgRoot) {
    console.warn('ProjectLaptopIsometric: SVG root not found')
    return null
  }

  // Prefix defs IDs to avoid cross-SVG collisions
  const idPrefix =
    props.devToolsId ||
    `laptop-isometric-${Math.random().toString(36).slice(2, 6)}`
  const idMap = scopeSvgDefsIds(svgRoot, idPrefix)

  // Convert shapes to paths for morph/draw operations
  try {
    const svgRootEl = svgRoot.closest && svgRoot.closest('svg')
    if ($MorphSVGPlugin && svgRootEl) {
      const shapes = svgRootEl.querySelectorAll(
        'circle, rect, ellipse, line, polygon, polyline',
      )
      if (shapes && shapes.length) {
        $MorphSVGPlugin.convertToPath(shapes)
      }
    }
  } catch (e) {}

  // Scoped query helpers
  const q = (sel) => svgRoot.querySelector(remapIdSelectors(sel, idMap))
  const qa = (sel) =>
    Array.from(svgRoot.querySelectorAll(remapIdSelectors(sel, idMap)))

  // Query animation groups
  const stairs = qa('#stairs > path')
  const awsCloud = qa('#awsCloud > path')
  const graphGraphLine = q('#graphGraphLine')
  const graphCircles = qa('#graphCircles > path')
  const graphBottomBar = qa('#graphBottomBar > path')
  const graphMiddleBar = qa('#graphMiddleBar > path')
  const graphTopBar = qa('#graphTopBar > path')
  const monitorGroup = qa('#monitorGroup > *')
  const keyboardGroup = qa('#keyboardGroup > *')

  // Reveal container and SVG (hidden by CSS to prevent FOUC)
  $gsap.set(containerRef.value, { autoAlpha: 1 })
  $gsap.set(svgRoot, { autoAlpha: 1 })

  // Build main timeline - three-phase animation (plays forward then reverses)
  const master = $gsap.timeline({
    paused: true,
    delay: 0.1,
    repeat: -1,
    yoyo: true,
    repeatDelay: 1,
  })

  // Phase 1 (t=0): Stairs fade in + AWS cloud scales up
  const phase1 = $gsap.timeline()
  phase1
    .from(stairs, { autoAlpha: 0, duration: 1, stagger: 0.1 })
    .from(
      awsCloud,
      {
        autoAlpha: 0,
        scale: 0,
        transformOrigin: 'center bottom',
        duration: 0.2,
        stagger: -0.1,
      },
      '-=0.5',
    )

  // Phase 2 (t=1): Graph line draws + circles and bars scale in
  const phase2 = $gsap.timeline()
  phase2
    .from(graphGraphLine, { drawSVG: 0, duration: 1 }, 0.1)
    .from(
      graphCircles,
      {
        autoAlpha: 0,
        scale: 0,
        transformOrigin: 'center bottom',
        duration: 0.2,
        stagger: 0.2,
      },
      0,
    )
    .from(
      graphBottomBar,
      {
        autoAlpha: 0,
        scale: 0,
        transformOrigin: 'center bottom',
        duration: 0.2,
        stagger: 0.2,
      },
      0,
    )
    .from(
      graphMiddleBar,
      {
        autoAlpha: 0,
        scale: 0,
        transformOrigin: 'center bottom',
        duration: 0.2,
        stagger: 0.2,
      },
      0.2,
    )
    .from(
      graphTopBar,
      {
        autoAlpha: 0,
        scale: 0,
        transformOrigin: 'center bottom',
        duration: 0.2,
        stagger: 0.2,
      },
      0.4,
    )

  // Phase 3 (t=2): Monitor and keyboard fade in
  const phase3 = $gsap.timeline()
  phase3
    .from(
      monitorGroup,
      {
        autoAlpha: 0,
        transformOrigin: 'center bottom',
        duration: 1,
        stagger: 0.2,
      },
      0,
    )
    .from(
      keyboardGroup,
      {
        autoAlpha: 0,
        transformOrigin: 'center bottom',
        duration: 1,
        stagger: 0.2,
      },
      0,
    )

  // Compose master timeline
  master
    .add(phase1, 0)
    .add(phase2, 1)
    .add(phase3, 2)

  // DevTools integration
  if (props.showDevTools) {
    nextTick(() => {
      try {
        $GSDevTools.create({
          animation: master,
          container: containerRef.value,
          minimal: true,
          id: props.devToolsId,
          globalSync: false,
        })
      } catch (e) {}
    })
  }

  timeline.value = master
  return master
}

// Lifecycle
onMounted(() => {
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
      const tl = createAnimation()
      if (props.useScrollTrigger && tl && $ScrollTrigger) {
        scrollTriggerInstance = $ScrollTrigger.create({
          trigger: containerRef.value,
          start: props.stStart,
          end: props.stEnd,
          onEnter: () => tl.play(),
          onEnterBack: () => tl.play(),
          onLeave: () => tl.pause(0).progress(0),
          onLeaveBack: () => tl.pause(0).progress(0),
        })
        $ScrollTrigger.refresh()
      } else if (props.autoPlay) {
        tl && tl.play()
      }
    }, containerRef.value)
  })
})

onUnmounted(() => {
  if (gsapCtx) gsapCtx.revert()
  if (scrollTriggerInstance) {
    try {
      scrollTriggerInstance.kill()
    } catch (e) {}
    scrollTriggerInstance = null
  }
  if (props.showDevTools) {
    try {
      $GSDevTools.getById(props.devToolsId)?.kill()
    } catch (e) {}
  }
})

// Public API
defineExpose({
  containerRef,
  timeline,
  play: () => timeline.value?.play(),
  pause: () => timeline.value?.pause(),
  restart: () => timeline.value?.restart(),
  reverse: () => timeline.value?.reverse(),
  seek: (time) => timeline.value?.seek(time),
})
</script>

<style scoped>
/* Styling centralized under app/assets/scss/components/_animation-components.scss */
</style>
