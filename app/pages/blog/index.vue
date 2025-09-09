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
  <div class="pt-header">
    <section class="blog-index">
      <!-- Background Parallax Elements -->
      <div class="parallax-bg">
        <div 
          class="parallax-element parallax-element--1" 
          data-speed="0.3" 
          data-lag="0.2"
        ></div>
        <div 
          class="parallax-element parallax-element--2" 
          data-speed="0.5" 
          data-lag="0.15"
        ></div>
        <div 
          class="parallax-element parallax-element--3" 
          data-speed="0.2" 
          data-lag="0.25"
        ></div>
      </div>

      <div class="blog-container">
        <!-- Hero Header Section -->
        <header class="blog-hero" data-lag="0.1">
          <div class="blog-hero__content">
            <h1 class="blog-hero__title" data-speed="0.8" data-lag="0.15">
              <span class="blog-hero__title-main">Blog</span>
              <span class="blog-hero__title-sub gradient-text">& Insights</span>
            </h1>
            <p class="blog-hero__description" data-speed="0.9" data-lag="0.1">
              Latest notes on web animation mastery, Nuxt wizardry, Vue composition, and the art of motion design that brings digital experiences to life.
            </p>
            <div class="blog-hero__stats" data-speed="0.85" data-lag="0.2">
              <div class="blog-stat">
                <span class="blog-stat__number">{{ postsSorted.length }}</span>
                <span class="blog-stat__label">Articles</span>
              </div>
              <div class="blog-stat">
                <span class="blog-stat__number">∞</span>
                <span class="blog-stat__label">Ideas</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Loading & Error States -->
        <div v-if="status === 'pending'" class="blog-loading">
          <div class="loading-spinner"></div>
          <p>Crafting pixels...</p>
        </div>
        <div v-else-if="error" class="blog-error">
          <h2 class="blog-error__title">Oops! Something went sideways</h2>
          <p class="blog-error__message">Failed to load posts. The internet gremlins are at it again.</p>
        </div>
        
        <!-- Blog Posts Grid -->
        <div v-else class="blog-content" data-lag="0.05">
          <div class="blog-grid">
            <article 
              v-for="(post, index) in postsSorted" 
              :key="post.path" 
              class="blog-card"
              :class="`blog-card--${index % 3}`"
              :data-speed="0.95 + (index % 3) * 0.02"
              :data-lag="0.1 + (index % 3) * 0.05"
            >
              <NuxtLink
                :to="post.path"
                class="blog-card__link"
                :aria-label="`Read article: ${post.title}`"
              >
                <div class="blog-card__inner">
                  <div class="blog-card__content">
                    <div class="blog-card__meta">
                      <time v-if="post.date" :datetime="post.date" class="blog-card__date">
                        {{ formatDate(post.date) }}
                      </time>
                      <div v-if="post.tags?.length" class="blog-card__tags">
                        <span v-for="t in post.tags.slice(0, 2)" :key="t" class="blog-card__tag">
                          {{ t }}
                        </span>
                      </div>
                    </div>
                    <h2 class="blog-card__title">{{ post.title }}</h2>
                    <p v-if="post.excerpt" class="blog-card__excerpt">
                      {{ post.excerpt }}
                    </p>
                  </div>
                  <div class="blog-card__arrow">
                    <div class="arrow-circle">
                      <Icon name="tabler:arrow-up-right" class="arrow-icon" />
                    </div>
                  </div>
                </div>
                <div class="blog-card__glow"></div>
              </NuxtLink>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.blog-index {
  min-height: 100vh;
  background: $white;
  position: relative;
}

.blog-container {
  @include padding;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

// Parallax Background Elements
.parallax-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  overflow: hidden;
  z-index: 1;
}

.parallax-element {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
  
  &--1 {
    top: 10%;
    left: 10%;
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, rgba($alternative-1, 0.15) 0%, rgba($alternative-2, 0.1) 100%);
  }
  
  &--2 {
    top: 60%;
    right: 15%;
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, rgba($alternative-2, 0.12) 0%, rgba($primary-2, 0.08) 100%);
  }
  
  &--3 {
    bottom: 20%;
    left: 20%;
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, rgba($primary-2, 0.1) 0%, rgba($alternative-1, 0.08) 100%);
  }
}

// Hero Section
.blog-hero {
  text-align: center;
  padding: space(16) 0 space(20);
  position: relative;
  
  @include tablet {
    padding: space(20) 0 space(24);
  }
}

.blog-hero__content {
  position: relative;
  z-index: 1;
}

.blog-hero__title {
  margin-bottom: space(6);
}

.blog-hero__title-main {
  @include mobile-h1;
  color: $black;
  display: block;
  
  @include tablet {
    @include h1;
  }
  
  @include desktop {
    @include desktop-h1-extralight;
  }
}

.blog-hero__title-sub {
  @include mobile-h2-extralight;
  display: block;
  margin-top: space(2);
  
  @include tablet {
    @include h2-extralight;
  }
}

.gradient-text {
  @include text-gradient-1;
}

.blog-hero__description {
  @include paragraph;
  color: $gray-6;
  max-width: 600px;
  margin: 0 auto space(8);
  
  @include tablet {
    @include paragraph-large;
  }
}

.blog-hero__stats {
  display: flex;
  justify-content: center;
  gap: space(12);
  margin-top: space(8);
}

.blog-stat {
  text-align: center;
}

.blog-stat__number {
  @include h3;
  color: $alternative-1;
  display: block;
  line-height: 1;
}

.blog-stat__label {
  @include caption-small;
  color: $gray-6;
  margin-top: space(2);
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
.blog-error {
  text-align: center;
  padding: space(16) 0;
}

.blog-error__title {
  @include h5;
  color: $white;
  margin-bottom: space(4);
}

.blog-error__message {
  @include paragraph;
  color: $gray-4;
}

// Blog Content
.blog-content {
  margin-top: space(8);
}

.blog-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: space(8);
  
  @include tablet {
    grid-template-columns: repeat(2, 1fr);
    gap: space(10);
  }
  
  @include desktop {
    grid-template-columns: repeat(3, 1fr);
    gap: space(12);
  }
}

// Blog Cards
.blog-card {
  position: relative;
  height: 100%;
  
  // Staggered animation delays
  &--0 { animation-delay: 0ms; }
  &--1 { animation-delay: 100ms; }
  &--2 { animation-delay: 200ms; }
}

.blog-card__link {
  display: block;
  height: 100%;
  position: relative;
  text-decoration: none;
  border-radius: $radius-xl;
  overflow: hidden;
  background: $white;
  border: $border-1 solid rgba($gray-3, 0.3);
  box-shadow: 0 4px 20px rgba($black, 0.08);
  transition: all 300ms ease;
  
  &:hover {
    transform: translateY(-8px);
    border-color: rgba($alternative-1, 0.4);
    box-shadow: 0 12px 40px rgba($black, 0.12);
    
    .blog-card__glow {
      opacity: 1;
    }
    
    .arrow-circle {
      transform: scale(1.1) rotate(45deg);
      background: $alternative-1;
    }
    
    .arrow-icon {
      color: $white;
    }
    
    .blog-card__title {
      color: $alternative-1;
    }
  }
  
  &:focus-visible {
    outline: 2px solid $alternative-1;
    outline-offset: 4px;
  }
}

.blog-card__inner {
  padding: space(8);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.blog-card__content {
  flex: 1;
}

.blog-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: space(6);
  flex-wrap: wrap;
  gap: space(2);
}

.blog-card__date {
  @include caption-small;
  color: $gray-6;
}

.blog-card__tags {
  display: flex;
  gap: space(2);
  flex-wrap: wrap;
}

.blog-card__tag {
  @include caption-small;
  color: $alternative-2;
  background: rgba($alternative-2, 0.1);
  padding: space(1) space(2);
  border-radius: $radius-sm;
  border: 1px solid rgba($alternative-2, 0.2);
}

.blog-card__title {
  @include h6;
  color: $black;
  margin-bottom: space(4);
  transition: color 300ms ease;
  line-height: 1.3;
  
  @media (max-width: #{$tablet - 1px}) {
    @include mobile-h6;
  }
}

.blog-card__excerpt {
  @include paragraph-small;
  color: $gray-6;
  line-height: 1.6;
  margin-bottom: space(6);
}

.blog-card__arrow {
  display: flex;
  justify-content: flex-end;
  margin-top: space(4);
}

.arrow-circle {
  width: $size-circle-btn;
  height: $size-circle-btn;
  border-radius: 50%;
  background: rgba($gray-2, 0.5);
  border: $border-1 solid rgba($gray-3, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms ease;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: $gray-6;
  transition: color 300ms ease;
}

.blog-card__glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba($alternative-1, 0.05) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 300ms ease;
  pointer-events: none;
  border-radius: $radius-xl;
}

// Responsive adjustments
@media (max-width: #{$tablet - 1px}) {
  .blog-hero {
    padding: space(12) 0 space(16);
  }
  
  .blog-hero__stats {
    gap: space(8);
  }
  
  .blog-grid {
    gap: space(6);
  }
  
  .blog-card__inner {
    padding: space(6);
  }
}
</style>
