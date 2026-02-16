<template>
  <div class="cv-page">
    <!-- Print Button -->
    <button
      class="cv-page__print-btn"
      type="button"
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
        <span v-if="cvData.personal.phone" class="cv-page__contact-item">
          <Icon name="heroicons:phone" class="icon" />
          {{ cvData.personal.phone }}
        </span>
        <span class="cv-page__contact-item">
          <Icon name="heroicons:envelope" class="icon" />
          <a :href="`mailto:${cvData.personal.email}`">{{ cvData.personal.email }}</a>
        </span>
        <span v-if="cvData.personal.website" class="cv-page__contact-item">
          <Icon name="heroicons:globe-alt" class="icon" />
          <a :href="`https://${cvData.personal.website}`" target="_blank">{{ cvData.personal.website }}</a>
        </span>
        <span v-if="cvData.personal.linkedin" class="cv-page__contact-item">
          <Icon name="mdi:linkedin" class="icon" />
          <a :href="`https://${cvData.personal.linkedin}`" target="_blank">LinkedIn</a>
        </span>
        <span class="cv-page__contact-item">
          <Icon name="heroicons:map-pin" class="icon" />
          {{ cvData.personal.location }}
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
            <UBadge
              v-for="skill in category.skills"
              :key="skill"
              variant="soft"
              size="sm"
            >
              {{ skill }}
            </UBadge>
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
          <div class="cv-page__project-name">
            <a v-if="project.url" :href="project.url" target="_blank">
              {{ project.name }}
              <Icon name="heroicons:arrow-top-right-on-square" class="icon" />
            </a>
            <template v-else>{{ project.name }}</template>
          </div>
          <p class="cv-page__project-desc">{{ project.description }}</p>
        </div>
      </div>
    </section>

    <!-- Interests -->
    <section v-if="cvData.interests?.length" class="cv-page__section">
      <h2 class="cv-page__section-title">Interests</h2>
      <div class="cv-page__interests">
        <UBadge
          v-for="interest in cvData.interests"
          :key="interest"
          variant="outline"
          size="sm"
        >
          {{ interest }}
        </UBadge>
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
</script>
