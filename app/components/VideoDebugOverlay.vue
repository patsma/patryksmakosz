<script setup>
import { extractFilename } from '~/composables/useVideoLogger'

/**
 * Debug overlay for video orchestration.
 *
 * Activate via URL param:  /projects?videodebug=1
 * Activate via localStorage (mobile console):
 *   localStorage.setItem('videodebug', '1')
 * Deactivate:
 *   localStorage.removeItem('videodebug')
 *
 * The panel shows:
 *  - Device mode (mobile / desktop)
 *  - Playing / in-view / total counts
 *  - Per-video status row with color dot and center score
 */

defineProps({
  /** reactive Map<HTMLVideoElement, VideoState> from useVideoOrchestrator */
  registry: {
    type: Map,
    required: true,
  },
  /** { deviceMode, playingCount, inViewCount, totalCount } */
  debugSummary: {
    type: Object,
    required: true,
  },
})

const STATUS_DOT = {
  playing: 'bg-green-400',
  loading: 'bg-blue-400',
  paused: 'bg-yellow-400',
  unloaded: 'bg-gray-500',
}

const dotClass = (status) => STATUS_DOT[status] ?? 'bg-gray-500'
</script>

<template>
  <div
    class="fixed bottom-4 right-4 z-[9999] bg-black/90 text-white text-[10px] font-mono p-3 rounded-lg w-64 shadow-2xl pointer-events-none"
    aria-hidden="true"
  >
    <!-- Header -->
    <div class="font-bold mb-1 text-[11px]">📹 VIDEO DEBUG</div>

    <!-- Summary row -->
    <div class="text-white/70 mb-1">
      {{ debugSummary.deviceMode }} &nbsp;|&nbsp;
      <span class="text-green-400">{{ debugSummary.playingCount }} playing</span> /
      {{ debugSummary.inViewCount }} in-view /
      {{ debugSummary.totalCount }} total
    </div>

    <hr class="border-white/20 mb-1" />

    <!-- Per-video rows -->
    <div
      v-for="[, state] in registry"
      :key="state.path"
      class="flex items-center gap-1.5 py-0.5"
    >
      <!-- Status dot -->
      <span
        class="w-2 h-2 rounded-full flex-shrink-0"
        :class="dotClass(state.status)"
      />

      <!-- Filename (truncated) -->
      <span class="truncate flex-1 leading-none">{{ extractFilename(state.path) }}</span>

      <!-- Score -->
      <span class="opacity-50 flex-shrink-0 tabular-nums">{{ state.score.toFixed(2) }}</span>
    </div>

    <!-- Empty state -->
    <div v-if="!registry.size" class="opacity-40">No videos registered</div>

    <!-- Legend -->
    <hr class="border-white/20 mt-1 mb-1" />
    <div class="flex gap-3 opacity-50">
      <span><span class="inline-block w-2 h-2 rounded-full bg-green-400 mr-0.5" />play</span>
      <span><span class="inline-block w-2 h-2 rounded-full bg-blue-400 mr-0.5" />load</span>
      <span><span class="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-0.5" />pause</span>
      <span><span class="inline-block w-2 h-2 rounded-full bg-gray-500 mr-0.5" />unload</span>
    </div>
  </div>
</template>
