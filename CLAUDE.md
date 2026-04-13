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

### Uploading Videos to Cloudflare R2
- Upload a single video: `npx wrangler r2 object put "tastysites-videos/movies/web-optimized/NAME.mp4" --file "public/movies/web-optimized/NAME.mp4" --content-type "video/mp4" --remote`
- Upload a banner: `npx wrangler r2 object put "tastysites-videos/movies/banners-optimized/PROJECT/BANNER.mp4" --file "public/movies/banners-optimized/PROJECT/BANNER.mp4" --content-type "video/mp4" --remote`
- Requires `npx wrangler login` first (one-time auth)

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
  - `movies/` - Video assets (local copies; production serves from Cloudflare R2)

- `scripts/` - Node.js utility scripts for media processing

#### Key Architecture Patterns

**Layout Structure**:
- Two layouts available:
  - `default.vue` — Full site with GSAP ScrollSmoother + MorphingLogo page transition. Uses `#smooth-wrapper` and `#smooth-content` containers. Fixed header outside smooth content to avoid position:fixed issues
  - `plain.vue` — Simple layout with site header (logo + hamburger menu), no ScrollSmoother or MorphingLogo. Used by `/links` and `/test` pages. Has `bg-white` to counter the html.dark class
- Accessibility features including skip links and ARIA roles

**Links Page** (`app/pages/links.vue`):
- Link-in-bio page at `/links` — permanent URL for TikTok, Instagram, Dribbble bio links
- Uses `plain` layout (no ScrollSmoother needed for a utility page)
- Featured/newest link uses `btn-standard` (gradient), remaining links use `btn-standard-outlined`
- Social icons row at bottom (GitHub, LinkedIn, Dribbble, Bluesky)
- To add new links: add to `featuredLink` (to promote) or prepend to `regularLinks` array, push older ones down
- To add new social icons: add to `socials` array using `tabler:brand-*` or `simple-icons:*` icon names

**Known Issue — Dark Background Bleed**:
- The `<html>` element receives a `dark` class (likely from Nuxt UI color mode), causing dark background to show through wherever `bg-white` is not explicitly set
- Current workaround: `bg-white` on plain layout wrapper and `.links-page`
- Proper fix needed: disable dark mode globally or force light color mode preference

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

**Video Assets & CDN**:
- Videos are hosted on **Cloudflare R2** in production, not served from `public/movies/`
- R2 bucket: `tastysites-videos` (Eastern Europe region)
- Public URL: `https://pub-c9bfd14ac21c42f2b7f26ea1ddaf0e7e.r2.dev`
- `NUXT_PUBLIC_VIDEO_BASE_URL` env var controls where videos load from (empty = local, set = R2)
- `useVideoUrl()` composable (`app/composables/useVideoUrl.js`) resolves video paths - prepends CDN base URL when configured
- Used in `HeroVideo.vue` (resolves `src` prop internally) and `projects/index.vue` (wraps `p.video`)
- Content frontmatter keeps local-style paths (`video: "/movies/web-optimized/file.mp4"`), composable handles the rest
- Local dev works without the env var (falls back to `public/movies/`)
- CORS configured for `patryksmakosz.com` and `localhost:3000`
- **Pre-commit auto-sync**: A git hook runs `scripts/check-r2-sync.js` before each commit - automatically uploads any local MP4s that are missing from R2 OR have changed (detects size mismatch via Content-Length). Also available as `npm run check:r2`
- **Replacing a video**: Just overwrite the local MP4 with the new file (same name) - the pre-commit hook compares file sizes and will auto-upload the replacement to R2
- **Adding a new video**: 1) Add MP4 to `public/movies/web-optimized/`, 2) Commit - the pre-commit hook auto-uploads to R2, 3) Reference in content frontmatter as `video: "/movies/web-optimized/name.mp4"`

### Build & Deployment
- Netlify deployment configured with `netlify.toml`
- Static generation support via `nuxt generate`
- Environment-specific configuration for site URLs and metadata
- **Required Netlify env var**: `NUXT_PUBLIC_VIDEO_BASE_URL=https://pub-c9bfd14ac21c42f2b7f26ea1ddaf0e7e.r2.dev` (serves videos from R2 CDN)