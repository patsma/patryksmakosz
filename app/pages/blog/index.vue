<script setup>
// Simple Blog Index powered by @nuxt/content collections
// Lists posts from `blog` collection sorted by date (newest first)

/**
 * Fetch all blog posts with minimal fields for listing.
 * We keep it lightweight and fast.
 */
const {
  data: posts,
  status,
  error,
} = await useAsyncData(
  () => "blog-index",
  () => queryCollection("blog").all()
);

useHead({ title: "Blog" });

// Sort posts client-side by date (newest first) to satisfy content security
const postsSorted = computed(() => {
  const list = (posts.value || []).slice();
  list.sort((a, b) => {
    const timeA = new Date(a?.date || 0).getTime();
    const timeB = new Date(b?.date || 0).getTime();
    return (
      (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
    );
  });
  return list;
});

/**
 * Format ISO date to a readable short date.
 * Keep it tiny; no external deps.
 * @param {string|undefined} iso
 */
const parseISODate = (iso) => {
  // Ensure stable parsing even on server by forcing UTC midnight for YYYY-MM-DD
  if (!iso) return null;
  const isShort = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const safe = isShort ? `${iso}T00:00:00Z` : iso;
  const d = new Date(safe);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (iso) => {
  const d = parseISODate(iso);
  if (!d) return iso || "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return `${d.getUTCDate().toString().padStart(2, "0")} ${d
      .toLocaleString("en", { month: "short", timeZone: "UTC" })
      .replace(".", "")} ${d.getUTCFullYear()}`;
  }
};
</script>

<template>
  <section class="blog-index pt-header">
    <div class="blog-container">
      <header class="mb-8">
        <h1 class="text-3xl font-light">Blog</h1>
        <p class="text-sm text-gray-400 mt-2">
          Latest notes on Nuxt, Vue, and motion.
        </p>
      </header>

      <div v-if="status === 'pending'">Loading…</div>
      <div v-else-if="error">Failed to load posts.</div>
      <div v-else>
        <ul class="blog-list">
          <li v-for="post in postsSorted" :key="post.path" class="blog-card">
            <NuxtLink
              :to="post.path"
              class="block focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md"
            >
              <article class="blog-card__inner">
                <div>
                  <h2 class="blog-card__title">{{ post.title }}</h2>
                  <p v-if="post.excerpt" class="blog-card__excerpt">
                    {{ post.excerpt }}
                  </p>
                  <div class="blog-meta">
                    <time v-if="post.date" :datetime="post.date">{{
                      formatDate(post.date)
                    }}</time>
                    <span
                      v-if="post.tags?.length"
                      class="blog-meta__dot"
                      aria-hidden="true"
                      >•</span
                    >
                    <ul
                      v-if="post.tags?.length"
                      class="blog-tags"
                      aria-label="Tags"
                    >
                      <li v-for="t in post.tags" :key="t" class="blog-tag">
                        #{{ t }}
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="blog-card__arrow" aria-hidden="true">
                  <Icon name="tabler:arrow-right" class="w-5 h-5" />
                </div>
              </article>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.blog-index {
  // reserved for page-level hooks
}

.blog-container {
  @include padding;
}

.blog-list {
  display: grid;
  gap: space(6);
}

.blog-card {
  padding: space(6);
  background: rgba($white, 0.02);
  border: $border-1 solid rgba($white, 0.06);
  border-radius: $radius-lg;
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba($white, 0.04);
    border-color: rgba($white, 0.12);
  }
}

.blog-card__title {
  @include h6;
  color: $white;
}

.blog-card__excerpt {
  @include paragraph-small;
  color: $gray-5;
  margin-top: space(2);
}

.blog-meta {
  display: flex;
  align-items: center;
  gap: space(2);
  color: $gray-4;
  margin-top: space(3);
  font-size: 0.875rem;
}

.blog-meta__dot {
  opacity: 0.6;
}

.blog-tags {
  display: inline-flex;
  gap: space(2);
}
.blog-tag {
  color: $gray-4;
}
</style>
