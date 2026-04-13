import { reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { createVideoLogger, extractFilename } from './useVideoLogger'

/**
 * Central video playback orchestrator.
 *
 * Rules:
 *  - Mobile (< 768px): only the video most centered in the viewport plays (max 1)
 *  - Desktop (≥ 768px): the two most-centered videos play (max 2)
 *  - Memory: when a video scrolls > 2× viewport height away, its src is unloaded
 *
 * Usage (inside <script setup> of the projects page):
 *   const orchestrator = useVideoOrchestrator({ activatedVideos })
 *
 * @param {{ activatedVideos: Set<string> }} options
 */
export function useVideoOrchestrator({ activatedVideos }) {
  const logger = createVideoLogger()

  /**
   * registry: Map<HTMLVideoElement, VideoState>
   * VideoState shape:
   *   path        – from el.dataset.videoSrc
   *   isInView    – currently tracked as in-viewport by ScrollTrigger
   *   isActivated – src has been assigned at least once
   *   status      – 'unloaded' | 'loading' | 'paused' | 'playing'
   *   score       – 0–1, how close el center is to viewport center
   */
  const registry = reactive(new Map())

  let rafId = null

  // ─── rAF debounce ────────────────────────────────────────────────────────────

  const scheduleRecalculate = () => {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
      rafId = null
      recalculate()
    })
  }

  // ─── Resize ──────────────────────────────────────────────────────────────────

  const handleResize = () => scheduleRecalculate()

  // Guard with onMounted – window is not available during SSR
  onMounted(() => {
    window.addEventListener('resize', handleResize, { passive: true })
  })

  // ─── Core helpers ─────────────────────────────────────────────────────────────

  const safePlay = (el, state) => {
    const p = el.play?.()
    if (p && typeof p.then === 'function') {
      p.then(() => {
        state.status = 'playing'
      }).catch(() => {
        // autoplay blocked – leave as paused
        state.status = 'paused'
        logger.blocked(extractFilename(state.path))
      })
    } else {
      state.status = 'playing'
    }
  }

  const activateVideo = (el, state) => {
    activatedVideos.add(state.path)
    state.isActivated = true
    state.status = 'loading'
    logger.activate(extractFilename(state.path), 'entered-top-N')
    // Wait for Vue to update :src binding before calling play
    nextTick(() => safePlay(el, state))
  }

  const unloadVideo = (el, state) => {
    el.pause()
    el.removeAttribute('src')
    el.load() // resets network state to NETWORK_EMPTY, frees decoder memory
    activatedVideos.delete(state.path)
    state.isActivated = false
    state.status = 'unloaded'
    state.score = 0
    logger.unload(extractFilename(state.path))
  }

  // ─── recalculate() ────────────────────────────────────────────────────────────

  const recalculate = () => {
    if (!process.client) return
    const vh = window.innerHeight
    const vpCenter = vh / 2
    const isMobile = window.innerWidth < 768
    const maxPlay = isMobile ? 1 : 2

    const scored = []

    for (const [el, state] of registry) {
      if (state.isInView) {
        const rect = el.getBoundingClientRect()
        const elCenter = rect.top + rect.height / 2
        const dist = Math.abs(elCenter - vpCenter)
        state.score = Math.max(0, 1 - dist / vh)
        scored.push({ el, state })
      } else {
        // Check if far enough away to unload
        if (state.isActivated) {
          const rect = el.getBoundingClientRect()
          const elCenter = rect.top + rect.height / 2
          if (Math.abs(elCenter - vpCenter) > vh * 2) {
            unloadVideo(el, state)
          }
        }
        state.score = 0
      }
    }

    // Sort by score descending – highest visibility wins
    scored.sort((a, b) => b.state.score - a.state.score)
    const winners = new Set(scored.slice(0, maxPlay).map(({ el }) => el))

    let playingCount = 0

    for (const [el, state] of registry) {
      if (winners.has(el)) {
        if (!state.isActivated) {
          activateVideo(el, state)
        } else if (state.status !== 'playing' && state.status !== 'loading') {
          safePlay(el, state)
        }
        if (state.status === 'playing' || state.status === 'loading') playingCount++
      } else if (state.status === 'playing') {
        el.pause()
        state.status = 'paused'
        logger.pause(extractFilename(state.path), 'not-in-top-N')
      }
    }

    // Log winners with their scores
    for (const { el, state } of scored.slice(0, maxPlay)) {
      if (state.status === 'playing' || state.status === 'loading') {
        logger.play(extractFilename(state.path), state.score, playingCount)
      }
    }

    logger.state(
      `${playingCount}/${maxPlay} playing | ${scored.length} in-view | ${registry.size} total | ${isMobile ? 'mobile' : 'desktop'}`
    )
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  /**
   * Register a video element. Call from setVideoRef after el is added to DOM.
   * @param {HTMLVideoElement} el
   */
  const registerVideo = (el) => {
    if (!el || registry.has(el)) return
    registry.set(el, {
      path: el.dataset.videoSrc ?? '',
      isInView: false,
      isActivated: false,
      status: 'unloaded',
      score: 0,
    })
  }

  /**
   * Unregister a video element. Called on unmount or filter reset.
   * @param {HTMLVideoElement} el
   */
  const unregisterVideo = (el) => {
    registry.delete(el)
  }

  /**
   * Called by ScrollTrigger onEnter/onLeave callbacks.
   * @param {HTMLVideoElement} el
   * @param {boolean} isInView
   */
  const onIntersectChange = (el, isInView) => {
    const state = registry.get(el)
    if (!state) return
    state.isInView = isInView
    scheduleRecalculate()
  }

  /**
   * Gracefully pause + unload all videos and clear registry.
   * Call this when the project filter changes.
   */
  const reset = () => {
    for (const [el] of registry) {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
    registry.clear()
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  /**
   * Full teardown. Call from onBeforeUnmount only.
   */
  const destroy = () => {
    reset()
    if (process.client) window.removeEventListener('resize', handleResize)
  }

  // ─── Debug summary ────────────────────────────────────────────────────────────

  const debugSummary = computed(() => {
    const states = [...registry.values()]
    return {
      deviceMode: (process.client && window.innerWidth < 768) ? 'mobile' : 'desktop',
      playingCount: states.filter((s) => s.status === 'playing').length,
      inViewCount: states.filter((s) => s.isInView).length,
      totalCount: registry.size,
    }
  })

  return {
    registry,
    debugSummary,
    registerVideo,
    unregisterVideo,
    onIntersectChange,
    reset,
    destroy,
  }
}
