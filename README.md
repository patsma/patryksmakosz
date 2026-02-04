# TastySites 2025

[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-Premium-88CE02?logo=greensock&logoColor=white)](https://gsap.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> Creative developer portfolio showcasing interactive motion design, GSAP animations, and modern web experiences.

**[Live Site →](https://patryksmakosz.com)**

---

## Features

- 26+ interactive case studies and projects
- Premium GSAP animations (ScrollSmoother, MorphSVG, DrawSVG, SplitText)
- Buttery smooth scroll experiences
- Responsive design (mobile → 4K)
- Accessibility-first (ARIA, keyboard navigation, skip links)
- Content-driven architecture with Nuxt Content

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Nuxt 4, Vue 3 |
| Styling | TailwindCSS, SCSS |
| Animations | GSAP (Premium), ScrollTrigger, ScrollSmoother |
| State | Pinia |
| Content | Nuxt Content v3 |
| 3D | Three.js via @tresjs/nuxt |
| Icons | Nuxt Icon + Iconify |
| Deployment | Netlify |

## Project Structure

```
app/
├── components/     # Vue components + SVG components
├── composables/    # Animation composables (orbital carousel, parallax)
├── layouts/        # ScrollSmoother layout structure
├── pages/          # Routes (home, about, portfolio, projects, blog)
├── stores/         # Pinia stores
└── assets/scss/    # Global styles

content/
└── projects/       # 26+ markdown case studies

scripts/            # Video processing (ffmpeg)
```

## Getting Started

```bash
npm install
npm run dev         # http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run generate` | Generate static site |
| `npm run convert-videos` | Convert videos to web-optimized MP4 (requires ffmpeg) |
| `npm run convert-gifs` | Convert MP4 to GIFs |

## Architecture Highlights

- **ScrollSmoother Layout**: Fixed header outside smooth container for proper `position: fixed` behavior
- **Orbital Carousel**: 650-line composable with responsive breakpoints, drag physics, auto-rotation
- **Content-Driven**: Projects defined in markdown with component references

## License

MIT License - see [LICENSE](LICENSE) file
