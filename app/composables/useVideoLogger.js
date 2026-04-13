/**
 * Structured console logging for the video orchestration system.
 * Filter in the browser console by "[VIDEO|" to see all video events,
 * or by e.g. "[VIDEO|PLAY]" to isolate a specific event type.
 *
 * Also buffers all logs in-memory so they can be copied on mobile
 * (where DevTools isn't available) via the debug overlay's Copy button.
 *
 * Usage:
 *   const logger = createVideoLogger()
 *   logger.play('molki.mp4', 0.87, 1)
 *   logger.copyLogs()  // copies full buffer to clipboard
 */
export function createVideoLogger() {
  const fmt = (icon, action) => `${icon} [VIDEO|${action}]`

  // In-memory buffer for mobile copy - max 500 entries to avoid memory creep
  const MAX_BUFFER = 500
  const buffer = []

  const ts = () => new Date().toISOString().slice(11, 23) // HH:MM:SS.mmm

  const push = (line) => {
    buffer.push(`${ts()} ${line}`)
    if (buffer.length > MAX_BUFFER) buffer.shift()
  }

  return {
    /** Video src has been assigned for the first time */
    activate(file, reason) {
      const line = `📹 [VIDEO|ACTIVATE] ${file} | ${reason}`
      push(line)
      console.log(fmt('📹', 'ACTIVATE'), file, '|', reason)
    },

    /** Video started playing */
    play(file, score, concurrentCount) {
      const line = `▶️ [VIDEO|PLAY] ${file} | score: ${score.toFixed(2)} | playing: ${concurrentCount}`
      push(line)
      console.log(fmt('▶️', 'PLAY'), file, '| score:', score.toFixed(2), '| playing:', concurrentCount)
    },

    /** Video was paused */
    pause(file, reason) {
      const line = `⏸ [VIDEO|PAUSE] ${file} | ${reason}`
      push(line)
      console.log(fmt('⏸', 'PAUSE'), file, '|', reason)
    },

    /** Video src removed and decoder freed */
    unload(file) {
      const line = `🗑 [VIDEO|UNLOAD] ${file}`
      push(line)
      console.log(fmt('🗑', 'UNLOAD'), file)
    },

    /** Global state snapshot - fires after every recalculate() */
    state(summary) {
      const line = `📊 [VIDEO|STATE] ${summary}`
      push(line)
      console.log(fmt('📊', 'STATE'), summary)
    },

    /** Autoplay was blocked by browser */
    blocked(file) {
      const line = `🚫 [VIDEO|BLOCKED] ${file} | autoplay blocked`
      push(line)
      console.warn(fmt('🚫', 'BLOCKED'), file, '| autoplay blocked')
    },

    /** Copy full log buffer to clipboard */
    async copyLogs() {
      const text = buffer.join('\n') || '(no logs yet)'
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch {
        // Fallback for older mobile browsers
        const el = document.createElement('textarea')
        el.value = text
        el.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        return true
      }
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
