<template>
  <div class="cv-page">
    <!-- Print Button -->
    <button
      type="button"
      class="cv-page__print-btn"
      aria-label="Print CV"
      @click="handlePrint"
    >
      <Icon name="heroicons:printer" class="icon" />
      Print CV
    </button>

    <!-- Header -->
    <header class="cv-page__header">
      <h1 class="cv-page__name">{{ cvData.personal.name }}</h1>
      <p class="cv-page__title">{{ cvData.personal.title }}</p>

      <div class="cv-page__contact">
        <!-- Phone — tel: link + QR -->
        <span v-if="cvData.personal.phone" class="cv-page__contact-item cv-page__contact-item--with-qr">
          <Icon name="heroicons:phone" class="icon" />
          <a :href="`tel:${cvData.personal.phone.replace(/\s/g, '')}`">{{ cvData.personal.phone }}</a>
          <QrCode :url="`tel:${cvData.personal.phone.replace(/\s/g, '')}`" :size="56" />
        </span>

        <!-- Email — mailto: link + QR -->
        <span class="cv-page__contact-item cv-page__contact-item--with-qr">
          <Icon name="heroicons:envelope" class="icon" />
          <a :href="`mailto:${cvData.personal.email}`">{{ cvData.personal.email }}</a>
          <QrCode :url="`mailto:${cvData.personal.email}`" :size="56" />
        </span>

        <!-- Personal site (patryksmakosz.com) -->
        <span v-if="cvData.personal.personalSite" class="cv-page__contact-item cv-page__contact-item--with-qr">
          <Icon name="heroicons:user-circle" class="icon" />
          <a :href="`https://${cvData.personal.personalSite}`" target="_blank">{{ cvData.personal.personalSite }}</a>
          <QrCode :url="`https://${cvData.personal.personalSite}`" :size="56" />
        </span>

        <!-- LinkedIn -->
        <span v-if="cvData.personal.linkedin" class="cv-page__contact-item cv-page__contact-item--with-qr">
          <Icon name="mdi:linkedin" class="icon" />
          <a :href="`https://${cvData.personal.linkedin}`" target="_blank">LinkedIn</a>
          <QrCode :url="`https://${cvData.personal.linkedin}`" :size="56" />
        </span>

        <!-- Location — Google Maps link + QR -->
        <span class="cv-page__contact-item cv-page__contact-item--with-qr">
          <Icon name="heroicons:map-pin" class="icon" />
          <a :href="`https://maps.google.com/?q=${encodeURIComponent(cvData.personal.location)}`" target="_blank">{{ cvData.personal.location }}</a>
          <QrCode :url="`https://maps.google.com/?q=${encodeURIComponent(cvData.personal.location)}`" :size="56" />
        </span>
      </div>
    </header>

    <!-- Professional Summary -->
    <section class="cv-page__section">
      <h2 class="cv-page__section-title">Professional Summary</h2>
      <p class="cv-page__summary">{{ cvData.summary }}</p>
    </section>

    <!-- Technical Skills -->
    <section class="cv-page__section">
      <h2 class="cv-page__section-title">Technical Skills</h2>
      <div class="cv-page__skills-grid">
        <div
          v-for="category in cvData.skills"
          :key="category.category"
          class="cv-page__skill-category"
        >
          <h4>{{ category.category }}</h4>
          <div class="cv-page__skill-tags">
            <span
              v-for="skill in category.skills"
              :key="skill"
              class="cv-page__badge cv-page__badge--soft"
            >
              {{ skill }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Work Experience -->
    <section class="cv-page__section">
      <h2 class="cv-page__section-title">Work Experience</h2>
      <div class="cv-page__timeline">
        <div
          v-for="job in cvData.experience"
          :key="`${job.company}-${job.startDate}`"
          class="cv-page__timeline-item"
        >
          <div class="cv-page__timeline-header">
            <span class="cv-page__company">{{ job.company }}</span>
            <span class="cv-page__role">{{ job.role }}</span>
            <span class="cv-page__dates">
              {{ job.startDate }} - {{ job.endDate || 'Present' }}
            </span>
          </div>
          <ul class="cv-page__responsibilities">
            <li v-for="(resp, idx) in job.responsibilities" :key="idx">
              {{ resp }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Education -->
    <section class="cv-page__section">
      <h2 class="cv-page__section-title">Education</h2>
      <div class="cv-page__education-list">
        <div
          v-for="edu in cvData.education"
          :key="`${edu.institution}-${edu.startDate}`"
          class="cv-page__education-item"
        >
          <span class="cv-page__institution">{{ edu.institution }}</span>
          <span class="cv-page__degree">{{ edu.degree }}</span>
          <span class="cv-page__edu-dates">{{ edu.startDate }} - {{ edu.endDate }}</span>
          <p v-if="edu.description" class="cv-page__edu-description">
            {{ edu.description }}
          </p>
        </div>
      </div>
    </section>

    <!-- Selected Projects -->
    <section class="cv-page__section">
      <h2 class="cv-page__section-title">Selected Projects</h2>
      <div class="cv-page__projects-grid">
        <div
          v-for="project in cvData.projects"
          :key="project.name"
          class="cv-page__project"
        >
          <div class="cv-page__project-header">
            <div class="cv-page__project-name">
              <NuxtLink v-if="project.url" :to="project.url">
                {{ project.name }}
                <Icon name="heroicons:arrow-top-right-on-square" class="icon" />
              </NuxtLink>
              <template v-else>{{ project.name }}</template>
            </div>
            <QrCode v-if="project.url" :url="absoluteUrl(project.url)" :size="56" />
          </div>
          <p class="cv-page__project-desc">{{ project.description }}</p>
        </div>
      </div>
    </section>

    <!-- GitHub Repositories -->
    <section v-if="cvData.githubRepos?.length" class="cv-page__section">
      <h2 class="cv-page__section-title">Open Source & GitHub</h2>
      <div class="cv-page__repos-grid">
        <div
          v-for="repo in cvData.githubRepos"
          :key="repo.name"
          class="cv-page__repo"
        >
          <div class="cv-page__repo-header">
            <div class="cv-page__repo-info">
              <a :href="repo.url" target="_blank" class="cv-page__repo-name">
                <Icon name="mdi:github" class="icon" />
                {{ repo.name }}
              </a>
              <span v-if="repo.language" class="cv-page__badge cv-page__badge--neutral">
                {{ repo.language }}
              </span>
            </div>
            <QrCode v-if="repo.url" :url="repo.url" :size="56" />
          </div>
          <p class="cv-page__repo-desc">{{ repo.description }}</p>
        </div>
      </div>
    </section>

    <!-- Interests -->
    <section v-if="cvData.interests?.length" class="cv-page__section">
      <h2 class="cv-page__section-title">Interests</h2>
      <div class="cv-page__interests">
        <span
          v-for="interest in cvData.interests"
          :key="interest"
          class="cv-page__badge cv-page__badge--outline"
        >
          {{ interest }}
        </span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { cvData } from '~/data/cv-data'

// Use dedicated CV layout - no menu, clean for printing
definePageMeta({
  layout: 'cv',
})

// SEO meta
useSeoMeta({
  title: `CV - ${cvData.personal.name}`,
  description: cvData.summary,
})

// Print handler
function handlePrint() {
  window.print()
}

// Resolve relative paths to absolute URLs for QR code generation
function absoluteUrl(url: string): string {
  if (url.startsWith('http')) return url
  if (import.meta.client) return `${window.location.origin}${url}`
  return `https://patryksmakosz.com${url}`
}
</script>
