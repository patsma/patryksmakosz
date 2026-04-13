/**
 * Structured console logging for the video orchestration system.
 * Filter in the browser console by "[VIDEO|" to see all video events,
 * or by e.g. "[VIDEO|PLAY]" to isolate a specific event type.
 *
 * Usage:
 *   const logger = createVideoLogger()
 *   logger.play('molki.mp4', 0.87, 1)
 */
export function createVideoLogger() {
  const fmt = (icon, action) => `${icon} [VIDEO|${action}]`

  return {
    /** Video src has been assigned for the first time */
    activate(file, reason) {
      console.log(fmt('📹', 'ACTIVATE'), file, '|', reason)
    },

    /** Video started playing */
    play(file, score, concurrentCount) {
      console.log(fmt('▶️', 'PLAY'), file, '| score:', score.toFixed(2), '| playing:', concurrentCount)
    },

    /** Video was paused */
    pause(file, reason) {
      console.log(fmt('⏸', 'PAUSE'), file, '|', reason)
    },

    /** Video src removed and decoder freed */
    unload(file) {
      console.log(fmt('🗑', 'UNLOAD'), file)
    },

    /** Global state snapshot - fires after every recalculate() */
    state(summary) {
      console.log(fmt('📊', 'STATE'), summary)
    },

    /** Autoplay was blocked by browser */
    blocked(file) {
      console.warn(fmt('🚫', 'BLOCKED'), file, '| autoplay blocked')
    },
  }
}

/**
 * Extracts the filename from a full video path.
 * e.g. "/movies/web-optimized/molki.mp4" → "molki.mp4"
 * @param {string|undefined} path
 * @returns {string}
 */
export function extractFilename(path) {
  return path?.split('/').pop() ?? path ?? 'unknown'
}
