/**
 * Resolves a local video/media path to an external CDN URL when configured.
 * In production, NUXT_PUBLIC_VIDEO_BASE_URL points to Cloudflare R2.
 * In dev (or when unset), paths resolve locally as before.
 *
 * @param {string | undefined} path - Local asset path (e.g., "/movies/web-optimized/file.mp4")
 * @returns {string | undefined} Full URL with CDN prefix, or original path if no base URL configured
 */
export function useVideoUrl(path) {
  if (!path) return undefined
  const { videoBaseUrl } = useRuntimeConfig().public
  return videoBaseUrl ? `${videoBaseUrl}${path}` : path
}
