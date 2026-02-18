# CV Page Documentation

Complete guide to the CV/resume page - data structure, styling, QR codes, and print optimization.

## Quick Start

**Edit your CV content:**
```
app/data/cv-data.ts
```

**View the CV:**
```
http://localhost:3000/cv
```

**Print/Save as PDF:**
Click the "Print CV" button or press `Cmd+P` / `Ctrl+P`

---

## Data Structure

The CV content is defined in `app/data/cv-data.ts`. Here's the complete structure:

### Personal Information

```typescript
personal: {
  name: string           // Your full name
  title: string          // Job title/tagline
  location: string       // City, Country
  email: string          // Contact email
  phone?: string         // Phone number (optional)
  website?: string       // Website domain without https://
  linkedin?: string      // LinkedIn URL without https://
}
```

### Professional Summary

```typescript
summary: string  // 2-3 sentence professional summary
```

### Skills

```typescript
skills: Array<{
  category: string       // Category name (e.g., "Front-End")
  skills: string[]       // List of skills in this category
}>
```

### Work Experience

```typescript
experience: Array<{
  company: string           // Company name
  role: string              // Job title
  startDate: string         // Start date (e.g., "May 2022")
  endDate?: string          // End date or omit for "Present"
  responsibilities: string[] // List of key achievements/duties
}>
```

### Education

```typescript
education: Array<{
  institution: string    // School/institution name
  degree: string         // Degree/certification title
  startDate: string      // Start year
  endDate: string        // End year
  description?: string   // Optional additional details
}>
```

### Projects

```typescript
projects: Array<{
  name: string           // Project name
  description: string    // Brief description
  url?: string           // Live URL (optional, enables QR code)
}>
```

### GitHub Repositories

```typescript
githubRepos?: Array<{
  name: string           // Repository name
  description: string    // Repo description
  url: string            // GitHub URL (enables QR code)
  language?: string      // Primary language badge
}>
```

### Interests

```typescript
interests?: string[]     // List of personal interests
```

---

## QR Codes

QR codes are automatically generated for all links, making the printed CV scannable.

### Where QR Codes Appear

| Section | QR Code For |
|---------|-------------|
| Header | Website, LinkedIn |
| Projects | Each project with a URL |
| GitHub | Each repository |

### Technical Implementation

- **Library:** `qrcode.vue` - lightweight SVG QR code generator
- **Component:** `app/components/QrCode.vue`
- **Current size:** 56px (all QR codes use the same size)
- **Format:** SVG for crisp print quality
- **Error correction:** Level L (simpler pattern, easier to scan at small sizes)

### Customizing QR Code Size

All QR codes use the same size for consistency. To change:

1. **Update all instances** in `app/pages/cv.vue`:
   ```vue
   <QrCode :url="someUrl" :size="56" />
   ```

2. **Update default** in `app/components/QrCode.vue`:
   ```typescript
   const props = withDefaults(defineProps<Props>(), {
     size: 56,  // Change this value
   })
   ```

**Recommended sizes:**
- **20-28px** - Minimal footprint, may be hard to scan
- **56px** - Current default, good balance of size and scannability
- **80-100px** - Large, very easy to scan

---

## Styling

### SCSS Location

```
app/assets/scss/components/_cv-page.scss
```

### Key CSS Classes

| Class | Purpose |
|-------|---------|
| `.cv-page` | Main container |
| `.cv-page__header` | Name, title, contact info |
| `.cv-page__section` | Each content section |
| `.cv-page__section-title` | Section headings |
| `.cv-page__badge` | Skill/interest tags |
| `.cv-page__timeline-item` | Work experience entries |
| `.cv-page__project` | Project cards |
| `.cv-page__repo` | GitHub repo cards |

### Badge Variants

```scss
.cv-page__badge--soft     // Blue background (skills)
.cv-page__badge--outline  // Border only (interests)
.cv-page__badge--neutral  // Gray background (languages)
```

### Color Variables

Colors are defined in `app/assets/scss/_variables.scss`:

- `$primary-1` - Primary brand color (headings, accents)
- `$primary-2` - Secondary brand color (links, highlights)
- `$gray-1` through `$gray-6` - Gray scale for text/backgrounds

---

## Print Optimization

### Print Button

The floating "Print CV" button triggers `window.print()`. It's hidden during printing.

### Page Setup

```scss
@page {
  size: A4;
  margin: 0;  // Removes browser headers/footers
}
```

Internal padding is applied to `.cv-page` instead.

### Print-Specific Styles

- Reduced font sizes for print density
- Page break control to prevent orphaned content
- Forced color printing for backgrounds/badges
- QR codes print at full contrast

### Removing Browser Headers/Footers

The CSS uses `@page { margin: 0 }` to eliminate space for browser-added headers/footers. If they still appear:

1. Open print dialog (Cmd+P)
2. Click "More settings" or equivalent
3. Uncheck "Headers and footers"

---

## Layout

The CV uses a dedicated layout: `app/layouts/cv.vue`

This layout:
- Removes the main site navigation
- Provides a clean, printable container
- Keeps the print button accessible

---

## Adding New Sections

1. **Add data** to the type in `app/types/cv.ts`
2. **Add content** to `app/data/cv-data.ts`
3. **Add template** section in `app/pages/cv.vue`
4. **Add styles** in `app/assets/scss/components/_cv-page.scss`

### Example: Adding Certifications

```typescript
// In cv-data.ts
certifications: [
  {
    name: 'AWS Solutions Architect',
    issuer: 'Amazon Web Services',
    date: '2024',
    url: 'https://...'
  }
]
```

```vue
<!-- In cv.vue -->
<section v-if="cvData.certifications?.length" class="cv-page__section">
  <h2 class="cv-page__section-title">Certifications</h2>
  <!-- ... -->
</section>
```

---

## Type Definitions

Full TypeScript types are in `app/types/cv.ts`:

```typescript
export interface CVData {
  personal: PersonalInfo
  summary: string
  skills: SkillCategory[]
  experience: WorkExperience[]
  education: Education[]
  projects: Project[]
  githubRepos?: GitHubRepo[]
  interests?: string[]
}
```

---

## Troubleshooting

### QR Codes Not Showing

- Check if the URL is valid
- Ensure `qrcode.vue` is installed: `npm install qrcode.vue`
- Verify the component is imported correctly

### Print Layout Issues

- Use Chrome/Edge for best print CSS support
- Check `@media print` styles are not being overridden
- Ensure page breaks aren't cutting content awkwardly

### Colors Not Printing

Add to your print styles:
```scss
-webkit-print-color-adjust: exact !important;
print-color-adjust: exact !important;
```

---

## File Reference

| File | Purpose |
|------|---------|
| `app/pages/cv.vue` | Main CV page component |
| `app/data/cv-data.ts` | CV content/data |
| `app/types/cv.ts` | TypeScript interfaces |
| `app/layouts/cv.vue` | Dedicated CV layout |
| `app/components/QrCode.vue` | QR code component |
| `app/assets/scss/components/_cv-page.scss` | All CV styles |
