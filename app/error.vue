<script setup>
// Custom Nuxt error page with a consistent empty state UI
// - Uses our SCSS tokens (space(), $primary-*, radii, borders)
// - Provides clear actions and gentle animation
// - Works for 404 and generic errors

const props = defineProps({
  error: { type: Object, default: () => ({}) },
});

const statusCode = computed(
  () =>
    props.error?.statusCode ||
    props.error?.status ||
    props.error?.response?.status ||
    500
);
const is404 = computed(() => Number(statusCode.value) === 404);

const iconName = computed(() =>
  is404.value ? "mdi:map-search-outline" : "mdi:alert-circle-outline"
);
const title = computed(() =>
  is404.value ? "Page not found" : "Something went wrong"
);
const message = computed(() => {
  if (is404.value) return "We couldn’t find the page you’re looking for.";
  return props.error?.message || "An unexpected error occurred.";
});

const handleGoHome = () => {
  // Clear Nuxt error state and redirect to home
  clearError({ redirect: "/" });
};

// ----------------------------------------------------------------------------
// Developer-friendly error payload for support/debugging
// - Structured details are rendered nicely and can be copied by the user
// ----------------------------------------------------------------------------
const errorInfo = computed(() => ({
  url: props.error?.url || props.error?.data?.url || "",
  statusCode: statusCode.value,
  statusMessage:
    props.error?.statusMessage || props.error?.response?.statusText || "",
  message: props.error?.message || "",
  description: props.error?.description || "",
  data: props.error?.data,
  stack: props.error?.stack || props.error?.cause?.stack || "",
}));

const errorJson = computed(() => {
  try {
    return JSON.stringify(errorInfo.value, null, 2);
  } catch (e) {
    return String(errorInfo.value || "");
  }
});

const copyStatus = ref("");
const handleCopyError = async () => {
  try {
    const text = `Nuxt Error Details\n\n${errorJson.value}`;
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "absolute";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    copyStatus.value = "Copied";
  } catch (e) {
    copyStatus.value = "Copy failed";
  } finally {
    setTimeout(() => (copyStatus.value = ""), 1600);
  }
};
</script>

<template>
  <section class="min-h-screen grid place-items-center">
    <div class="empty-state" role="status" aria-live="polite">
      <div class="empty-state__icon" aria-hidden="true">
        <Icon :name="iconName" />
      </div>
      <h1 class="empty-state__title">{{ title }}</h1>
      <p class="empty-state__copy">{{ message }}</p>
      <div class="empty-state__actions">
        <button type="button" class="btn-standard" @click="handleGoHome">
          <span>Go Home</span>
        </button>
        <NuxtLink to="/projects" class="btn-standard-outlined">
          <span>Browse Projects</span>
        </NuxtLink>
      </div>
      <p v-if="statusCode" class="empty-state__meta">Error {{ statusCode }}</p>
      <details class="tech">
        <summary>Technical details</summary>
        <pre class="tech__pre" tabindex="0">{{ errorJson }}</pre>
        <div class="tech__actions">
          <button
            type="button"
            class="btn-standard-outlined"
            @click="handleCopyError"
          >
            <span>{{ copyStatus || "Copy details" }}</span>
          </button>
        </div>
      </details>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use "~/assets/scss/variables" as *;

.empty-state {
  display: grid;
  justify-items: center;
  gap: space(4);
  padding: space(24) space(6);
  text-align: center;

  &__icon {
    width: 4.5rem;
    height: 4.5rem;
    color: $primary-2;
    background: rgba($primary-2, 0.08);
    border: $border-1 solid rgba($primary-2, 0.2);
    border-radius: $radius-full;
    display: grid;
    place-items: center;
    animation: pulseGlow 2s ease-in-out infinite;

    svg,
    .iconify {
      width: 2rem;
      height: 2rem;
    }
  }

  &__title {
    font-weight: 800;
    font-size: 1.75rem;
    color: $primary-1;
  }

  &__copy {
    max-width: 38rem;
    color: $gray-5;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: space(2);
  }

  &__actions {
    display: grid;
    grid-auto-flow: column;
    gap: space(4);
    align-items: center;
    justify-content: center;
  }

  &__meta {
    color: $gray-4;
    font-size: 0.875rem;
  }
}

.tech {
  margin-top: space(6);
  width: min(64rem, 100%);
  text-align: left;

  summary {
    cursor: pointer;
    color: $primary-2;
    font-weight: 600;
    margin-bottom: space(3);
    outline: none;
  }

  &__pre {
    background: $gray-1;
    color: $gray-6;
    border: $border-1 solid $gray-3;
    border-radius: $radius-md;
    padding: space(4);
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 18rem;
    overflow: auto;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  &__actions {
    display: grid;
    justify-content: start;
    margin-top: space(3);
  }
}

@keyframes pulseGlow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba($primary-2, 0.25);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 12px rgba($primary-2, 0);
    transform: scale(1.04);
  }
}
</style>
