# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run generate` - Generate static site

### Video Processing Scripts
- `npm run convert-videos` - Convert videos in `public/movies/` to web-optimized MP4 format (requires ffmpeg)
- `node scripts/convert-to-gifs.js` - Convert web-optimized videos to GIFs
- `npm run fetch:icons` - Fetch and process icons

### Linting & Type Checking
- The project uses ESLint via `@nuxt/eslint` module (configuration in `eslint.config.mjs`)
- TypeScript configuration in `tsconfig.json` and Nuxt-generated `.nuxt/tsconfig.json`

## Architecture Overview

### Tech Stack
- **Framework**: Nuxt 4 (Vue 3)
- **Styling**: TailwindCSS + SCSS
- **Animations**: GSAP with premium plugins (ScrollSmoother, ScrollTrigger, MorphSVG, etc.)
- **State Management**: Pinia
- **Content**: Nuxt Content with TypeScript validation
- **UI Components**: Maz UI + custom components
- **Icons**: Nuxt Icon with Iconify

### Project Structure

#### Core Directories
- `app/` - Main application code (Nuxt 4 structure)
  - `components/` - Vue components including SVG components in `SVG/` subdirectory
  - `composables/` - Reusable Vue composition functions
  - `layouts/` - Layout components (`default.vue` with GSAP ScrollSmoother, `plain.vue`)
  - `pages/` - Page components and routing
  - `stores/` - Pinia stores
  - `assets/scss/` - SCSS stylesheets

- `content/` - Nuxt Content markdown files
  - `projects/` - Project case studies with structured metadata

- `public/` - Static assets
  - `movies/` - Video assets (original and web-optimized versions)

- `scripts/` - Node.js utility scripts for media processing

#### Key Architecture Patterns

**Layout Structure**: 
- Uses GSAP ScrollSmoother with `#smooth-wrapper` and `#smooth-content` containers
- Fixed header outside smooth content to avoid position:fixed issues
- Accessibility features including skip links and ARIA roles

**Animation System**:
- GSAP with premium plugins configured in `nuxt.config.ts`
- Custom composables like `useOrbitalCarousel.js` for complex animations
- SVG morphing and animation components

**Content Management**:
- Structured content collections with TypeScript validation
- Project metadata schema including title, category, cover, video, and component references

**State Management**:
- Pinia stores in `app/stores/` 
- Menu state management for navigation

**Component Architecture**:
- Modular component system with clear separation
- SVG components isolated in dedicated directory
- Project-specific components with descriptive naming

### Development Guidelines

**Code Standards** (from .cursorrules):
- Use Vue 3 Composition API with `<script setup>`
- JavaScript with JSDoc type annotations (no TypeScript in components)
- TailwindCSS for styling, avoid scoped styles
- Implement accessibility features (ARIA attributes, keyboard navigation)
- Write extensive explanatory comments
- Use descriptive naming conventions

**Animation Guidelines**:
- Leverage GSAP premium plugins for advanced animations
- Use ScrollSmoother for smooth scrolling experiences
- Implement proper performance optimization for animations

**Content Strategy**:
- Projects are content-driven with markdown files
- Structured metadata validation through content.config.ts
- Component references allow dynamic rendering of project-specific elements

### Build & Deployment
- Netlify deployment configured with `netlify.toml`
- Static generation support via `nuxt generate`
- Environment-specific configuration for site URLs and metadata