<template>
  <main class="links-page">
    <div class="links-page__container">
      <!-- Featured link — gradient style -->
      <a
        :href="featuredLink.url"
        target="_blank"
        rel="noopener noreferrer"
        class="link-card link-card--featured btn-standard"
      >
        <span>
          <strong class="link-card__title">{{ featuredLink.title }}</strong>
          <small class="link-card__subtitle link-card__subtitle--light">{{ featuredLink.subtitle }}</small>
        </span>
      </a>

      <!-- Regular links — outlined style -->
      <a
        v-for="link in regularLinks"
        :key="link.url"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="link-card btn-standard-outlined"
      >
        <span>
          <strong class="link-card__title">{{ link.title }}</strong>
          <small class="link-card__subtitle">{{ link.subtitle }}</small>
        </span>
      </a>

      <!-- Social icons -->
      <nav aria-label="Social links" class="links-page__socials">
        <a
          v-for="social in socials"
          :key="social.url"
          :href="social.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="social.label"
          :title="social.label"
          class="links-page__social-link"
        >
          <Icon :name="social.icon" class="w-5 h-5" />
          <span class="sr-only">{{ social.label }}</span>
        </a>
      </nav>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'plain',
})

useHead({
  title: 'Links — Patryk Smakosz',
  meta: [
    {
      name: 'description',
      content: 'Links and resources from Patryk Smakosz — Creative Developer.',
    },
  ],
})

interface LinkItem {
  title: string
  subtitle: string
  url: string
}

const featuredLink: LinkItem = {
  title: 'Nuxt + GSAP Template',
  subtitle: 'Free open-source portfolio template',
  url: 'https://github.com/patsma/nuxt-portfolio-gsap',
}

const regularLinks: LinkItem[] = [
  {
    title: 'YouTube Channel',
    subtitle: '@TastySites',
    url: 'https://www.youtube.com/@TastySites',
  },
  {
    title: 'Video Walkthrough',
    subtitle: 'Nuxt + GSAP Template tutorial',
    url: 'https://www.youtube.com/watch?v=_-5rJ3g3WJo',
  },
  {
    title: 'Live Demo',
    subtitle: 'See the template in action',
    url: 'https://nuxt-portfolio-gsap.netlify.app',
  },
  {
    title: 'Portfolio',
    subtitle: 'patryksmakosz.com',
    url: 'https://patryksmakosz.com',
  },
]

const socials = [
  { icon: 'tabler:brand-github', url: 'https://github.com/patsma', label: 'GitHub' },
  { icon: 'tabler:brand-linkedin', url: 'https://linkedin.com/in/patryksmakosz', label: 'LinkedIn' },
  { icon: 'tabler:brand-dribbble', url: 'https://dribbble.com/tastysites', label: 'Dribbble' },
  { icon: 'simple-icons:bluesky', url: 'https://bsky.app/profile/tastysites.bsky.social', label: 'Bluesky' },
  { icon: 'tabler:brand-tiktok', url: 'https://www.tiktok.com/@tasty.sites', label: 'TikTok' },
]
</script>

<style scoped lang="scss">
@use "../assets/scss/variables" as *;

.links-page {
  display: flex;
  justify-content: center;
  padding: 3rem 1.5rem;
  min-height: calc(100vh - #{$header-height-mobile});
  background-color: var(--color-white);

  @media (min-width: $tablet) {
    padding: 4rem 1.5rem;
    min-height: calc(100vh - #{$header-height-tablet});
  }

  &__container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 480px;
  }

  &__socials {
    display: flex;
    justify-content: center;
    gap: 1.25rem;
    margin-top: 1.5rem;
  }

  &__social-link {
    color: var(--color-gray-5);
    transition: color 0.3s ease-in-out;

    &:hover,
    &:focus-visible {
      color: var(--color-black);
    }

    &:focus-visible {
      outline: $border-1 solid var(--color-primary-2);
      outline-offset: $border-1;
      border-radius: $radius-sm;
    }
  }
}

// Link card overrides — extend btn-standard / btn-standard-outlined for full-width cards
.link-card {
  width: 100% !important;
  height: auto !important;
  padding: 1rem 1.5rem !important;
  text-decoration: none;

  // The span inside btn-standard is a grid — make it stack vertically
  > span {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  &__title {
    font-weight: 500;
    font-size: 1rem;
    line-height: 1.4;
  }

  &__subtitle {
    font-weight: 300;
    font-size: 0.875rem;
    line-height: 1.4;
    color: var(--color-gray-4);
    transition: color 0.3s ease-in-out;

    &--light {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  // On hover, subtitle must turn white so it's readable over the gradient fill
  &:hover &__subtitle {
    color: rgba(255, 255, 255, 0.7);
  }

  &:hover &__subtitle--light {
    color: var(--color-white);
  }
}
</style>
