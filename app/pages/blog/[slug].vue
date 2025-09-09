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

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <div class="pt-header">
    <!-- Loading State -->
    <section v-if="status === 'pending'" class="blog-post blog-post--loading">
      <div class="blog-container">
        <div class="blog-loading">
          <div class="loading-spinner"></div>
          <p>Brewing the perfect article...</p>
        </div>
      </div>
    </section>
    
    <!-- Error State -->
    <section v-else-if="error || !post" class="blog-post blog-post--error">
      <div class="blog-container">
        <div class="empty-state" role="status" aria-live="polite">
          <div class="empty-state__icon">
            <Icon name="tabler:file-off" class="w-16 h-16" />
          </div>
          <h1 class="empty-state__title">Article Not Found</h1>
          <p class="empty-state__message">
            This post seems to have vanished into the digital void. Perhaps it's still brewing in our creative cauldron.
          </p>
          <div class="empty-state__actions">
            <NuxtLink to="/blog" class="btn-back">
              <Icon name="tabler:arrow-left" class="btn-back__icon" />
              <span>Back to Blog</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Article Content -->
    <section v-else class="blog-post">
      <div class="blog-container">
        <!-- Article Header -->
        <header class="blog-post__header">
          <div class="blog-post__breadcrumb">
            <NuxtLink to="/blog" class="breadcrumb-link">
              <Icon name="tabler:arrow-left" class="breadcrumb-icon" />
              Blog
            </NuxtLink>
          </div>
          
          <div class="blog-post__meta">
            <time v-if="post.date" :datetime="post.date" class="blog-post__date">
              {{ formatDate(post.date) }}
            </time>
            <div v-if="post.tags?.length" class="blog-post__tags">
              <span v-for="t in post.tags" :key="t" class="blog-post__tag">
                {{ t }}
              </span>
            </div>
          </div>
          
          <h1 class="blog-post__title">
            {{ post.title }}
          </h1>
          
          <div v-if="post.excerpt" class="blog-post__excerpt">
            {{ post.excerpt }}
          </div>
          
          <div class="blog-post__author" v-if="post.author">
            <span class="author-label">By</span>
            <span class="author-name">{{ post.author }}</span>
          </div>
        </header>

        <!-- Article Content -->
        <article class="blog-post__content">
          <div class="prose-wrapper">
            <ContentRenderer :value="post" class="prose prose-invert" />
          </div>
        </article>

        <!-- Navigation -->
        <nav v-if="prevPost || nextPost" class="blog-post__nav">
          <div class="blog-nav">
            <NuxtLink
              v-if="prevPost"
              :to="prevPost.path"
              class="blog-nav__link blog-nav__link--prev"
              :aria-label="`Previous post: ${prevPost.title}`"
            >
              <div class="blog-nav__direction">
                <Icon name="tabler:arrow-left" class="blog-nav__icon" />
                <span class="blog-nav__label">Previous</span>
              </div>
              <h3 class="blog-nav__title">{{ prevPost.title }}</h3>
            </NuxtLink>
            
            <div class="blog-nav__spacer"></div>
            
            <NuxtLink
              v-if="nextPost"
              :to="nextPost.path"
              class="blog-nav__link blog-nav__link--next"
              :aria-label="`Next post: ${nextPost.title}`"
            >
              <div class="blog-nav__direction">
                <span class="blog-nav__label">Next</span>
                <Icon name="tabler:arrow-right" class="blog-nav__icon" />
              </div>
              <h3 class="blog-nav__title">{{ nextPost.title }}</h3>
            </NuxtLink>
          </div>
        </nav>
        
        <!-- Back to top -->
        <div class="blog-post__footer">
          <button 
            @click="scrollToTop" 
            class="back-to-top"
            aria-label="Scroll to top"
          >
            <Icon name="tabler:arrow-up" class="back-to-top__icon" />
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.blog-post {
  min-height: 100vh;
  background: linear-gradient(135deg, $black 0%, rgba($primary-1, 0.05) 100%);
  
  &--loading,
  &--error {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.blog-container {
  @include padding;
  max-width: 900px;
  margin: 0 auto;
}

// Loading State
.blog-loading {
  text-align: center;
  padding: space(16) 0;
  
  p {
    @include paragraph;
    color: $gray-4;
    margin-top: space(4);
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba($alternative-1, 0.1);
  border-top: 3px solid $alternative-1;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// Error State
.empty-state {
  text-align: center;
  padding: space(16) 0;
}

.empty-state__icon {
  color: $gray-4;
  margin-bottom: space(6);
}

.empty-state__title {
  @include h4;
  color: $white;
  margin-bottom: space(4);
  
  @media (max-width: #{$tablet - 1px}) {
    @include mobile-h4;
  }
}

.empty-state__message {
  @include paragraph;
  color: $gray-4;
  margin-bottom: space(8);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.empty-state__actions {
  margin-top: space(8);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: space(3);
  padding: space(4) space(6);
  background: rgba($white, 0.05);
  border: $border-1 solid rgba($white, 0.15);
  border-radius: $radius-lg;
  color: $white;
  text-decoration: none;
  transition: all 300ms ease;
  
  &:hover {
    background: rgba($alternative-1, 0.1);
    border-color: rgba($alternative-1, 0.3);
    transform: translateX(-4px);
  }
}

.btn-back__icon {
  width: 18px;
  height: 18px;
  transition: transform 300ms ease;
}

.btn-back:hover .btn-back__icon {
  transform: translateX(-2px);
}

// Article Header
.blog-post__header {
  padding: space(12) 0 space(16);
  text-align: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba($alternative-1, 0.08) 0%, transparent 60%);
    border-radius: 50%;
    z-index: 0;
  }
}

.blog-post__breadcrumb {
  margin-bottom: space(8);
  position: relative;
  z-index: 1;
}

.breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: space(2);
  color: $gray-4;
  text-decoration: none;
  @include caption;
  transition: all 300ms ease;
  
  &:hover {
    color: $alternative-1;
    transform: translateX(-2px);
  }
}

.breadcrumb-icon {
  width: 14px;
  height: 14px;
  transition: transform 300ms ease;
}

.breadcrumb-link:hover .breadcrumb-icon {
  transform: translateX(-1px);
}

.blog-post__meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: space(4);
  margin-bottom: space(8);
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.blog-post__date {
  @include caption-small;
  color: $gray-4;
}

.blog-post__tags {
  display: flex;
  gap: space(2);
  flex-wrap: wrap;
  justify-content: center;
}

.blog-post__tag {
  @include caption-small;
  color: $alternative-2;
  background: rgba($alternative-2, 0.1);
  padding: space(1) space(3);
  border-radius: $radius-md;
  border: 1px solid rgba($alternative-2, 0.2);
}

.blog-post__title {
  @include mobile-h2;
  color: $white;
  margin-bottom: space(6);
  line-height: 1.2;
  position: relative;
  z-index: 1;
  
  @include tablet {
    @include h2;
  }
  
  @include desktop {
    font-size: 3.5rem;
  }
}

.blog-post__excerpt {
  @include paragraph-large;
  color: $gray-4;
  margin-bottom: space(8);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;
}

.blog-post__author {
  position: relative;
  z-index: 1;
}

.author-label {
  @include caption;
  color: $gray-5;
  margin-right: space(2);
}

.author-name {
  @include caption;
  color: $alternative-1;
  font-weight: 600;
}

// Article Content
.blog-post__content {
  margin: space(16) 0;
}

.prose-wrapper {
  background: rgba($white, 0.02);
  border: $border-1 solid rgba($white, 0.06);
  border-radius: $radius-xl;
  padding: space(12);
  backdrop-filter: blur(10px);
  
  @include tablet {
    padding: space(16);
  }
}

// Enhanced prose styles
:deep(.prose) {
  max-width: none;
  color: $gray-3;
  
  h1, h2, h3, h4, h5, h6 {
    color: $white;
    font-weight: 500;
    margin-top: space(12);
    margin-bottom: space(6);
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  h2 {
    @include h5;
    color: $alternative-1;
    position: relative;
    padding-left: space(6);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 60%;
      background: linear-gradient(135deg, $alternative-1, $alternative-2);
      border-radius: 2px;
    }
  }
  
  h3 {
    @include h6;
    color: $white;
  }
  
  p {
    @include paragraph;
    margin-bottom: space(6);
    line-height: 1.7;
  }
  
  code {
    background: rgba($alternative-2, 0.1);
    color: $alternative-1;
    padding: space(1) space(2);
    border-radius: $radius-sm;
    font-size: 0.9em;
    border: 1px solid rgba($alternative-2, 0.2);
  }
  
  pre {
    background: rgba($black, 0.5);
    border: $border-1 solid rgba($white, 0.1);
    border-radius: $radius-lg;
    padding: space(6);
    margin: space(8) 0;
    overflow-x: auto;
    
    code {
      background: none;
      border: none;
      padding: 0;
      color: $gray-2;
    }
  }
  
  blockquote {
    border-left: 4px solid $alternative-1;
    padding-left: space(6);
    margin: space(8) 0;
    background: rgba($alternative-1, 0.05);
    padding: space(6);
    border-radius: 0 $radius-lg $radius-lg 0;
    
    p {
      @include quote;
      color: $gray-3;
      font-style: italic;
      margin: 0;
    }
  }
  
  ul, ol {
    margin: space(6) 0;
    padding-left: space(6);
    
    li {
      margin-bottom: space(3);
      color: $gray-3;
      
      &::marker {
        color: $alternative-1;
      }
    }
  }
  
  a {
    color: $alternative-1;
    text-decoration: underline;
    text-decoration-color: rgba($alternative-1, 0.3);
    text-underline-offset: 2px;
    transition: all 300ms ease;
    
    &:hover {
      color: $alternative-2;
      text-decoration-color: $alternative-2;
    }
  }
}

// Navigation
.blog-post__nav {
  margin: space(20) 0 space(16);
}

.blog-nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: space(6);
  align-items: center;
  
  @media (max-width: #{$tablet - 1px}) {
    grid-template-columns: 1fr;
    gap: space(8);
  }
}

.blog-nav__spacer {
  @media (max-width: #{$tablet - 1px}) {
    display: none;
  }
}

.blog-nav__link {
  display: block;
  padding: space(6);
  background: rgba($white, 0.02);
  border: $border-1 solid rgba($white, 0.06);
  border-radius: $radius-lg;
  text-decoration: none;
  transition: all 300ms ease;
  
  &:hover {
    background: rgba($white, 0.04);
    border-color: rgba($alternative-1, 0.3);
    transform: translateY(-2px);
  }
  
  &--prev {
    text-align: left;
  }
  
  &--next {
    text-align: right;
  }
  
  @media (max-width: #{$tablet - 1px}) {
    &--prev,
    &--next {
      text-align: left;
    }
  }
}

.blog-nav__direction {
  display: flex;
  align-items: center;
  gap: space(2);
  margin-bottom: space(2);
  
  .blog-nav__link--next & {
    justify-content: flex-end;
    
    @media (max-width: #{$tablet - 1px}) {
      justify-content: flex-start;
    }
  }
}

.blog-nav__label {
  @include caption-small;
  color: $gray-4;
}

.blog-nav__icon {
  width: 14px;
  height: 14px;
  color: $gray-4;
  transition: transform 300ms ease;
}

.blog-nav__link:hover .blog-nav__icon {
  &.tabler-arrow-left {
    transform: translateX(-2px);
  }
  
  &.tabler-arrow-right {
    transform: translateX(2px);
  }
}

.blog-nav__title {
  @include paragraph;
  color: $white;
  margin: 0;
  font-weight: 500;
}

// Footer
.blog-post__footer {
  text-align: center;
  padding: space(12) 0;
  border-top: $border-1 solid rgba($white, 0.06);
  margin-top: space(16);
}

.back-to-top {
  display: inline-flex;
  align-items: center;
  gap: space(2);
  padding: space(3) space(5);
  background: rgba($white, 0.05);
  border: $border-1 solid rgba($white, 0.15);
  border-radius: $radius-md;
  color: $gray-4;
  cursor: pointer;
  transition: all 300ms ease;
  @include caption;
  
  &:hover {
    background: rgba($alternative-1, 0.1);
    border-color: rgba($alternative-1, 0.3);
    color: $alternative-1;
    transform: translateY(-2px);
  }
}

.back-to-top__icon {
  width: 16px;
  height: 16px;
  transition: transform 300ms ease;
}

.back-to-top:hover .back-to-top__icon {
  transform: translateY(-1px);
}

// Responsive adjustments
@media (max-width: #{$tablet - 1px}) {
  .blog-post__header {
    padding: space(8) 0 space(12);
  }
  
  .prose-wrapper {
    padding: space(8);
  }
  
  .blog-post__content {
    margin: space(12) 0;
  }
  
  .blog-post__nav {
    margin: space(16) 0 space(12);
  }
}
</style>
