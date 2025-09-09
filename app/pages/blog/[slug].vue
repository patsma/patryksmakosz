<script setup>
// Simple Blog Post page using @nuxt/content
// Renders a post from the `blog` collection by slug

const route = useRoute();
const slug = computed(() => String(route.params.slug || ""));

// Fetch the post by its path
const {
  data: post,
  status,
  error,
} = await useAsyncData(
  () => `blog-${slug.value}`,
  () => queryCollection("blog").path(`/blog/${slug.value}`).first()
);

const pageTitle = computed(() => post.value?.title || slug.value);
useHead({ title: `${pageTitle.value} • Blog` });

// Build minimal navigation list from all posts, sorted client-side
const { data: allPosts } = await useAsyncData(
  () => "blog-all",
  () => queryCollection("blog").all()
);

const normalizePath = (p) => String(p || "").replace(/\/+$/, "");
const currentPath = computed(() => normalizePath(`/blog/${slug.value}`));
const navList = computed(() => {
  const list = (allPosts.value || []).slice();
  list.sort((a, b) => {
    const timeA = new Date(a?.date || 0).getTime();
    const timeB = new Date(b?.date || 0).getTime();
    return (
      (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
    );
  });
  return list
    .map((p) => ({
      title: p.title || p.slug || "(untitled)",
      path: p.path || p._path,
    }))
    .filter((i) => !!i.path);
});
const navIndex = computed(() =>
  (navList.value || []).findIndex(
    (i) => normalizePath(i.path) === currentPath.value
  )
);
const prevPost = computed(() => {
  const list = navList.value || [];
  return navIndex.value > 0 ? list[navIndex.value - 1] : null;
});
const nextPost = computed(() => {
  const list = navList.value || [];
  return navIndex.value >= 0 && navIndex.value < list.length - 1
    ? list[navIndex.value + 1]
    : null;
});

/**
 * Parse and format date deterministically across SSR/CSR to avoid hydration mismatches.
 */
const parseISODate = (iso) => {
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
  <section class="blog-post pt-header">
    <div v-if="status === 'pending'" class="blog-container">Loading…</div>
    <div v-else-if="error || !post" class="blog-container">
      <div class="empty-state" role="status" aria-live="polite">
        <h2 class="empty-state__title">Post not found</h2>
        <div class="empty-state__actions mt-4">
          <NuxtLink to="/blog" class="btn-standard-outlined"
            ><span>Back to Blog</span></NuxtLink
          >
        </div>
      </div>
    </div>
    <div v-else class="blog-container">
      <article class="prose prose-invert max-w-none">
        <header class="mb-6">
          <h1 class="text-3xl font-light">{{ post.title }}</h1>
          <div class="blog-meta mt-2">
            <time v-if="post.date" :datetime="post.date">{{
              formatDate(post.date)
            }}</time>
            <span
              v-if="post.tags?.length"
              class="blog-meta__dot"
              aria-hidden="true"
              >•</span
            >
            <ul v-if="post.tags?.length" class="blog-tags" aria-label="Tags">
              <li v-for="t in post.tags" :key="t" class="blog-tag">#{{ t }}</li>
            </ul>
          </div>
        </header>

        <ContentRenderer :value="post" />
      </article>

      <!-- Bottom navigation: Previous / Next posts -->
      <nav
        v-if="prevPost || nextPost"
        class="mt-10 flex items-center justify-between"
      >
        <NuxtLink
          v-if="prevPost"
          :to="prevPost.path"
          class="btn-standard-outlined btn-wide"
          aria-label="Previous post"
        >
          <span class="btn-content"
            ><Icon name="tabler:arrow-left" class="w-5 h-5" /> Prev</span
          >
        </NuxtLink>
        <div class="flex-1" />
        <NuxtLink
          v-if="nextPost"
          :to="nextPost.path"
          class="btn-standard-outlined btn-wide"
          aria-label="Next post"
        >
          <span class="btn-content"
            >Next <Icon name="tabler:arrow-right" class="w-5 h-5"
          /></span>
        </NuxtLink>
      </nav>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.blog-container {
  @include padding;
}

.blog-meta {
  display: flex;
  align-items: center;
  gap: space(2);
  color: $gray-4;
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

.empty-state {
  text-align: center;
}
.empty-state__title {
  @include h6;
}
</style>
