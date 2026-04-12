// Polyfill requestIdleCallback for browsers that don't support it (iOS Safari)
// Uses setTimeout fallback - standard pattern recommended by MDN
export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined' && !window.requestIdleCallback) {
    window.requestIdleCallback = (cb, opts) => {
      return setTimeout(
        () => cb({ didTimeout: false, timeRemaining: () => 50 }),
        opts?.timeout ?? 1,
      ) as unknown as number
    }
    window.cancelIdleCallback = (id) => clearTimeout(id)
  }
})
