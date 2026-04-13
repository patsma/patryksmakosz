import { reactive, computed, nextTick, onMounted } from 'vue'
import { createVideoLogger, extractFilename } from './useVideoLogger'

/**
 * Central video playback orchestrator.
 *
 * Rules:
 *  - Mobile (< 768px): only the video most centered in the viewport plays (max 1)
 *  - Desktop (≥ 768px): the two most-centered videos play (max 2)
 *  - Memory: when a video scrolls > 2× viewport height away, its src is unloaded
 *
 * Safari autoplay quirks handled:
 *  - state.status is set to 'playing' SYNCHRONOUSLY before el.play() to prevent
 *    recalculate() from retrying a blocked video every animation frame
 *  - 'blocked' status: Safari rejected autoplay - don't retry until video re-enters view
 *  - Resize handler uses 250ms debounce - mobile Safari fires resize every frame
 *    as the URL bar slides in/out during scroll, which would spam recalculate()
 *
 * @param {{ activatedVideos: Set<string> }} options
 */
export function useVideoOrchestrator({ activatedVideos }) {
  const logger = createVideoLogger()

  /**
   * registry: Map<HTMLVideoElement, VideoState>
   * VideoState.status values:
   *   'unloaded'  – src never assigned
   *   'loading'   – src assigned, waiting for nextTick + play()
   *   'playing'   – play() called and optimistically accepted
   *   'paused'    – explicitly paused (not in top-N)
   *   'blocked'   – Safari rejected autoplay; won't retry until re-enters view
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

  // ─── Resize (debounced) ───────────────────────────────────────────────────────
  // Mobile Safari fires resize every frame as the URL bar slides in/out.
  // A plain rAF debounce isn't enough - we need a real timeout debounce.

  let resizeTimer = null
  const handleResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(scheduleRecalculate, 250)
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize, { passive: true })
  })

  // ─── Core helpers ─────────────────────────────────────────────────────────────

  const safePlay = (el, state) => {
    // Set status synchronously BEFORE calling play().
    // If we wait for the promise to resolve, recalculate() may fire again and
    // call safePlay() a second time before Safari's rejection arrives — causing
    // an infinite blocked → retry loop at 60fps.
    state.status = 'playing'
    logger.play(extractFilename(state.path), state.score, countPlaying())

    const p = el.play?.()
    if (p && typeof p.then === 'function') {
      p.catch(() => {
        // Safari blocked autoplay. Mark as 'blocked' so recalculate() skips it.
        // Status resets to 'paused' when the video re-enters the viewport.
        state.status = 'blocked'
        logger.blocked(extractFilename(state.path))
      })
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

  const countPlaying = () =>
    [...registry.values()].filter((s) => s.status === 'playing').length

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
        // Unload if scrolled far away
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

    for (const [el, state] of registry) {
      if (winners.has(el)) {
        if (!state.isActivated) {
          activateVideo(el, state)
        } else if (
          state.status !== 'playing' &&
          state.status !== 'loading' &&
          state.status !== 'blocked'  // don't retry Safari-blocked videos
        ) {
          safePlay(el, state)
        }
      } else if (state.status === 'playing') {
        el.pause()
        state.status = 'paused'
        logger.pause(extractFilename(state.path), 'not-in-top-N')
      }
    }

    const playingCount = countPlaying()
    logger.state(
      `${playingCount}/${maxPlay} playing | ${scored.length} in-view | ${registry.size} total | ${isMobile ? 'mobile' : 'desktop'}`
    )
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

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

  const unregisterVideo = (el) => {
    registry.delete(el)
  }

  const onIntersectChange = (el, isInView) => {
    const state = registry.get(el)
    if (!state) return
    state.isInView = isInView
    // Reset blocked status when video re-enters view so Safari gets another chance
    if (isInView && state.status === 'blocked') {
      state.status = 'paused'
    }
    scheduleRecalculate()
  }

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
    clearTimeout(resizeTimer)
  }

  const destroy = () => {
    reset()
    if (process.client) {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }

  // ─── Debug summary ────────────────────────────────────────────────────────────

  const debugSummary = computed(() => {
    const states = [...registry.values()]
    return {
      deviceMode: (process.client && window.innerWidth < 768) ? 'mobile' : 'desktop',
      playingCount: states.filter((s) => s.status === 'playing').length,
      blockedCount: states.filter((s) => s.status === 'blocked').length,
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
    copyLogs: () => logger.copyLogs(),
  }
}
