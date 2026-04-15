<script setup>
// Projects index with Vue CSS transitions
import { createVideoLogger } from '~/composables/useVideoLogger'

const route = useRoute();
const category = computed(() => route.query.category || "");

// Debug overlay – activate via ?videodebug=1 or localStorage.setItem('videodebug','1')
const isDebugMode = computed(() =>
  route.query.videodebug === '1' || (process.client && localStorage.getItem('videodebug') === '1')
)

// Get all projects
const { data: allProjects } = await useAsyncData("all-projects", async () => {
  const result = await queryCollection("projects").all();
  return result?.sort((a, b) => a.title?.localeCompare(b.title)) || [];
});

// Filtered projects - reactive
const projects = computed(() => {
  if (!allProjects.value) return [];

  if (category.value) {
    return allProjects.value.filter(
      (item) => item.category === String(category.value)
    );
  }

  return allProjects.value;
});

/**
 * Dynamic counts for filters
 * Creates simple counters for all items and each category.
 * Uses defensive defaults so template can render during initial load.
 * @type {import('vue').ComputedRef<{ all: number, 'logo-animation': number, website: number, 'custom-animation': number }>}
 */
const counts = computed(() => {
  const items = allProjects.value || [];
  return {
    all: items.length,
    "logo-animation": items.filter((i) => i.category === "logo-animation")
      .length,
    website: items.filter((i) => i.category === "website").length,
    "custom-animation": items.filter((i) => i.category === "custom-animation")
      .length,
  };
});

/**
 * Resolve a static thumbnail (used as poster for videos, or as the standalone
 * preview image when a project has no video).
 * @param {{ preview?: string, cover?: string }} p
 * @returns {string | null}
 */
const staticPreviewFor = (p) => p?.preview || p?.cover || null;

// ─── Video playback ───────────────────────────────────────────────────────────
// Two-zone approach:
//
// Pre-buffer zone (top 200%): start loading src as the video approaches viewport.
//   Registers a canplay listener. By the time the video reaches the play zone,
//   it has 1-2 seconds of buffering time behind it.
//
// Play zone (top 80% / bottom 20%): play when data is ready.
//   If readyState ≥ 2 (canplay already fired during pre-buffer) → instant play.
//   If still loading → canplay listener calls applyPlayback() when data arrives.
//
// Muted+playsinline videos do not require a user gesture on iOS Safari, so
// calling play() from a canplay callback is safe.
//
// Mobile: max 1 video playing. Desktop: max 2.

const { $gsap, $ScrollTrigger } = useNuxtApp();
const logger = createVideoLogger({ verbose: isDebugMode.value });

// Paths that have had their src set — drives the loader visibility.
const activatedVideos = reactive(new Set());
// Paths where loadeddata fired — drives loader removal.
const loadedVideos = reactive(new Set());
// Videos currently in the viewport zone (want to play when data is ready).
const inZoneSet = new Set();
// Currently playing video elements — concurrency limit enforcement.
const playingSet = new Set();
// path → 'loading' | 'playing' | 'paused' — drives the debug overlay.
const videoStatuses = reactive(new Map());

const isMobile = () => process.client && window.innerWidth < 768;

const debugSummary = computed(() => ({
  deviceMode: isMobile() ? 'mobile' : 'desktop',
  // playingSet is non-reactive; this computed re-runs whenever videoStatuses
  // changes (every play/pause), keeping playingCount in sync.
  playingCount: playingSet.size,
  totalCount: videoStatuses.size,
}));

// Re-evaluate who should be playing based on current inZoneSet + concurrency limit.
const applyPlayback = () => {
  const maxPlay = isMobile() ? 1 : 2;

  // Pause anyone playing who has since left the zone
  for (const el of playingSet) {
    if (!inZoneSet.has(el)) {
      el.pause();
      playingSet.delete(el);
      videoStatuses.set(el.dataset.videoSrc, 'paused');
    }
  }

  // Play inZone videos up to the limit (insertion order = first-in wins)
  for (const el of inZoneSet) {
    if (playingSet.size >= maxPlay) break;
    if (!playingSet.has(el)) {
      el.play().catch(() => {});
      playingSet.add(el);
      const path = el.dataset.videoSrc;
      videoStatuses.set(path, 'playing');
      logger.play(path.split('/').pop(), 0, playingSet.size);
    }
  }
};

// Debounced wrapper — prevents rapid cycling during fast scroll or ScrollSmoother
// inertia deceleration. Pauses are still immediate; only "start playing" is delayed.
let _applyTimer = null;
const scheduleApplyPlayback = () => {
  clearTimeout(_applyTimer);
  _applyTimer = setTimeout(applyPlayback, 250);
};

// Pre-buffer zone: set src and start fetching. Registers the canplay listener
// that will trigger applyPlayback() once data arrives.
const preloadVideo = (el) => {
  if (el.getAttribute('src')) return; // already loading
  const path = el.dataset.videoSrc;
  if (!path) return;

  el.src = useVideoUrl(path);
  el.load(); // preload="none" won't auto-fetch — this kicks off the request
  activatedVideos.add(path);
  videoStatuses.set(path, 'loading');
  logger.activate(path.split('/').pop(), 'pre-buffer');

  el.addEventListener('canplay', () => {
    // Data arrived — mark ready; play immediately if already in the play zone.
    if (videoStatuses.get(path) !== 'playing') videoStatuses.set(path, 'paused');
    if (inZoneSet.has(el)) scheduleApplyPlayback();
  }, { once: true });
};

// Play zone entry: add to inZoneSet and play if data is ready.
const enterPlayZone = (el) => {
  inZoneSet.add(el);

  if (!el.getAttribute('src')) {
    // Scrolled very fast — skipped pre-buffer zone entirely. Load now.
    preloadVideo(el);
  } else if (el.readyState >= 2) {
    // Pre-buffer fired and canplay already happened — instant play.
    scheduleApplyPlayback();
  }
  // If src is set but readyState < 2: the canplay listener from preloadVideo()
  // will call applyPlayback() when the data arrives.
};

// Play zone exit: remove from inZoneSet, pause if playing, fill gap from queue.
const exitPlayZone = (el) => {
  inZoneSet.delete(el);
  if (playingSet.has(el)) {
    el.pause();
    playingSet.delete(el);
    const path = el.dataset.videoSrc;
    videoStatuses.set(path, 'paused');
    logger.pause(path?.split('/').pop(), 'left-zone');
  }
  scheduleApplyPlayback();
};

// Fade out the loading spinner with GSAP, then let Vue remove it from the DOM.
const handleVideoLoaded = (event) => {
  const videoEl = event.target;
  const src = videoEl?.dataset?.videoSrc;
  if (!src) return;
  const parent = videoEl?.parentElement;
  const overlays = [
    parent?.querySelector('.project-card__preview-loader'),
    parent?.querySelector('.project-card__preview-poster'),
  ].filter(Boolean);

  // Fade overlays out (if present)
  if (overlays.length) {
    $gsap.to(overlays, { opacity: 0, duration: 0.5, ease: 'power2.out' });
  }

  // Fade video in — parallel with overlay fade-out. onComplete on the video tween
  // since videoEl is always present (unlike overlays which may be absent).
  $gsap.to(videoEl, {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out',
    onComplete: () => {
      loadedVideos.add(src);
      if (videoStatuses.get(src) === 'loading') videoStatuses.set(src, 'paused');
    },
  });
};

const videoRefs = ref([]);
let scrollTriggers = [];

const setVideoRef = (el) => {
  if (el) {
    const path = el.dataset.videoSrc;
    // Start hidden for crossfade. Already-loaded videos (e.g. after a filter switch)
    // stay at 1 — loadeddata won't fire again, so they must not get stuck invisible.
    el.style.opacity = loadedVideos.has(path) ? '1' : '0';
    videoRefs.value.push(el);
  }
};

const createVideoTriggers = () => {
  if (!$ScrollTrigger) return;
  for (const el of videoRefs.value) {
    // Zone 1: pre-buffer — start loading ~1 full viewport before play zone.
    // $ScrollTrigger.refresh() fires onEnter immediately for already-past elements,
    // so the first visible video starts loading on mount.
    scrollTriggers.push(
      $ScrollTrigger.create({
        trigger: el,
        start: 'top 200%',
        end:   'bottom -100%',
        onEnter:     () => preloadVideo(el),
        onEnterBack: () => preloadVideo(el),
      })
    );
    // Zone 2: play — play when video is substantially in view.
    scrollTriggers.push(
      $ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        end:   'bottom 20%',
        onEnter:     () => enterPlayZone(el),
        onEnterBack: () => enterPlayZone(el),
        onLeave:     () => exitPlayZone(el),
        onLeaveBack: () => exitPlayZone(el),
      })
    );
  }
  $ScrollTrigger.refresh();
};

const killVideoTriggers = () => {
  clearTimeout(_applyTimer);
  for (const st of scrollTriggers) st.kill();
  scrollTriggers = [];
  playingSet.clear();
  inZoneSet.clear();
};

onMounted(async () => {
  await nextTick();
  createVideoTriggers();
});

onBeforeUnmount(() => {
  killVideoTriggers();
  videoRefs.value = [];
});

// Re-create triggers when the project list changes (filter switch).
watch(
  () => projects.value,
  async () => {
    killVideoTriggers();
    videoRefs.value = [];
    activatedVideos.clear();
    await nextTick();
    createVideoTriggers();
  }
);

useHead({ title: "Projects" });
</script>

<template>
  <section class="projects-page pt-header">
    <div class="projects-container">
      <div class="mb-8">
        <h1 class="projects-title">Projects</h1>

        <!-- Filter Navigation -->
        <div class="filter-nav flex flex-wrap gap-4 justify-center">
          <NuxtLink
            class="filter-button group"
            to="/projects"
            :class="{ 'filter-button--active': !category }"
          >
            <Icon name="mdi:view-grid" class="w-5 h-5" />
            <span>All</span>
            <span class="filter-count">({{ counts.all }})</span>
          </NuxtLink>

          <NuxtLink
            class="filter-button group"
            :to="{ path: '/projects', query: { category: 'logo-animation' } }"
            :class="{ 'filter-button--active': category === 'logo-animation' }"
          >
            <Icon name="mdi:animation" class="w-5 h-5" />
            <span>Logo Animations</span>
            <span class="filter-count">({{ counts["logo-animation"] }})</span>
          </NuxtLink>

          <NuxtLink
            class="filter-button group"
            :to="{ path: '/projects', query: { category: 'website' } }"
            :class="{ 'filter-button--active': category === 'website' }"
          >
            <Icon name="mdi:web" class="w-5 h-5" />
            <span>Websites</span>
            <span class="filter-count">({{ counts.website }})</span>
          </NuxtLink>

          <NuxtLink
            class="filter-button group"
            :to="{ path: '/projects', query: { category: 'custom-animation' } }"
            :class="{
              'filter-button--active': category === 'custom-animation',
            }"
          >
            <Icon name="mdi:palette" class="w-5 h-5" />
            <span>Custom Animations</span>
            <span class="filter-count">({{ counts["custom-animation"] }})</span>
          </NuxtLink>
        </div>
      </div>

      <div v-if="!projects?.length" class="py-16 text-center">
        <p>No projects found.</p>
      </div>

      <!-- Debug overlay: teleported to body to escape ScrollSmoother transform container -->
      <!-- Activate via ?videodebug=1 or localStorage.setItem('videodebug','1') -->
      <ClientOnly>
        <Teleport to="body">
          <VideoDebugOverlay
            v-if="isDebugMode"
            :video-statuses="videoStatuses"
            :debug-summary="debugSummary"
            :copy-logs="() => logger.copyLogs()"
          />
        </Teleport>
      </ClientOnly>

      <TransitionGroup name="list" tag="ul" class="projects-grid">
        <li v-for="p in projects" :key="p.path || p.slug" class="project-card">
          <NuxtLink
            :to="p.path || `/projects/${p.slug}`"
            class="project-card__link"
          >
            <div class="project-card__preview">
              <video
                v-if="p.video"
                :ref="setVideoRef"
                :data-video-src="p.video"
                preload="none"
                muted
                loop
                playsinline
                class="project-card__preview-video"
                @loadeddata="handleVideoLoaded($event)"
              />
              <!-- Poster overlay: cover image sits on top of the video until loadeddata fires,
                   then GSAP fades it out alongside the spinner for a smooth transition -->
              <div
                v-if="p.video && staticPreviewFor(p) && !loadedVideos.has(p.video)"
                class="project-card__preview-poster"
                :style="{ backgroundImage: `url('${staticPreviewFor(p)}')` }"
              />
              <div
                v-if="p.video && activatedVideos.has(p.video) && !loadedVideos.has(p.video)"
                class="project-card__preview-loader"
              >
                <div class="project-card__preview-spinner" />
              </div>
              <div
                v-else-if="staticPreviewFor(p)"
                class="project-card__preview-img"
                :style="{ backgroundImage: `url('${staticPreviewFor(p)}')` }"
                role="img"
                :aria-label="p.title"
              />
              <div v-else class="project-card__preview-placeholder">
                <Icon
                  :name="
                    p.category === 'logo-animation'
                      ? 'mdi:animation'
                      : p.category === 'website'
                        ? 'mdi:web'
                        : 'mdi:palette'
                  "
                  class="w-10 h-10"
                />
              </div>
            </div>

            <div class="project-card__header">
              <span class="project-card__category">
                <Icon
                  :name="
                    p.category === 'logo-animation'
                      ? 'mdi:animation'
                      : p.category === 'website'
                        ? 'mdi:web'
                        : 'mdi:palette'
                  "
                  class="w-4 h-4"
                />
                {{ p.category }}
              </span>
            </div>

            <h3 class="project-card__title">{{ p.title }}</h3>

            <p v-if="p.summary" class="project-card__summary">
              {{ p.summary }}
            </p>

            <div class="project-card__footer">
              <span class="project-card__cta">
                View Project
                <Icon name="mdi:arrow-right" class="w-4 h-4" />
              </span>
            </div>
          </NuxtLink>
        </li>
      </TransitionGroup>
    </div>
  </section>
</template>
