<script setup>
import { ref } from 'vue'
import { extractFilename } from '~/composables/useVideoLogger'

/**
 * Debug overlay for video playback.
 *
 * Activate via URL param:  /projects?videodebug=1
 * Activate via localStorage (mobile - paste in console or address bar trick):
 *   javascript:localStorage.setItem('videodebug','1');location.reload()
 * Deactivate:
 *   localStorage.removeItem('videodebug')
 *
 * "Copy Logs" button copies the full in-memory log buffer to clipboard -
 * useful on mobile Safari where DevTools isn't available.
 */

const props = defineProps({
  /** reactive Map<path, status> from projects/index.vue */
  videoStatuses: {
    type: Map,
    required: true,
  },
  /** { deviceMode, playingCount, totalCount } */
  debugSummary: {
    type: Object,
    required: true,
  },
  /** async () => boolean - copies log buffer to clipboard */
  copyLogs: {
    type: Function,
    required: true,
  },
})

const STATUS_DOT = {
  playing: 'bg-green-400',
  loading: 'bg-blue-400',
  paused:  'bg-yellow-400',
  unloaded: 'bg-gray-500',
}

const dotClass = (status) => STATUS_DOT[status] ?? 'bg-gray-500'

const copied = ref(false)

const handleCopy = async () => {
  await props.copyLogs()
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div
    class="fixed bottom-4 right-4 z-[9999] bg-black/90 text-white text-[10px] font-mono p-3 rounded-lg w-64 shadow-2xl"
    aria-hidden="true"
  >
    <!-- Header + Copy button -->
    <div class="flex items-center justify-between mb-1">
      <span class="font-bold text-[11px]">📹 VIDEO DEBUG</span>
      <button
        class="text-[9px] px-2 py-0.5 rounded border border-white/30 hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
        :class="copied ? 'text-green-400 border-green-400/50' : 'text-white/60'"
        @click="handleCopy"
      >
        {{ copied ? '✓ copied!' : 'copy logs' }}
      </button>
    </div>

    <!-- Summary row -->
    <div class="text-white/70 mb-1">
      {{ debugSummary.deviceMode }} &nbsp;|&nbsp;
      <span class="text-green-400">{{ debugSummary.playingCount }} playing</span> /
      {{ debugSummary.totalCount }} total
    </div>

    <hr class="border-white/20 mb-1" />

    <!-- Per-video rows -->
    <div
      v-for="[path, status] in videoStatuses"
      :key="path"
      class="flex items-center gap-1.5 py-0.5"
    >
      <span class="w-2 h-2 rounded-full flex-shrink-0" :class="dotClass(status)" />
      <span class="truncate flex-1 leading-none">{{ extractFilename(path) }}</span>
      <span class="opacity-50 flex-shrink-0 text-[9px]">{{ status }}</span>
    </div>

    <!-- Empty state -->
    <div v-if="!videoStatuses.size" class="opacity-40">No videos registered</div>

    <!-- Legend -->
    <hr class="border-white/20 mt-1 mb-1" />
    <div class="flex flex-wrap gap-x-3 gap-y-0.5 opacity-50">
      <span><span class="inline-block w-2 h-2 rounded-full bg-green-400 mr-0.5" />play</span>
      <span><span class="inline-block w-2 h-2 rounded-full bg-blue-400 mr-0.5" />load</span>
      <span><span class="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-0.5" />pause</span>
      <span><span class="inline-block w-2 h-2 rounded-full bg-gray-500 mr-0.5" />unload</span>
    </div>
  </div>
</template>
