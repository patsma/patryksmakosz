# Header Compensation System

This system provides CSS utilities to properly handle layout when using a fixed header that might cover content.

## Available Classes

### Height Utilities
```scss
.h-dvh-minus-header      // height: calc(100dvh - var(--header-height))
.h-svh-minus-header      // height: calc(100svh - var(--header-height))  
.h-screen-minus-header   // height: calc(100vh - var(--header-height))

.min-h-dvh-minus-header  // min-height variants
.min-h-svh-minus-header
.min-h-screen-minus-header
```

### Padding Utilities  
```scss
.pt-header               // padding-top: var(--header-height)
.pt-header-plus          // padding-top: calc(var(--header-height) + 1rem)
.pt-header-plus-lg       // padding-top: calc(var(--header-height) + 2rem)
```

### Positioning Utilities
```scss
.top-header              // top: var(--header-height)
.top-header-plus         // top: calc(var(--header-height) + 1rem)
.mt-header               // margin-top: var(--header-height)
.mt-header-plus          // margin-top: calc(var(--header-height) + 1rem)
```

## Usage Examples

### Full-height sections
```html
<!-- Before: Hard-coded height that gets covered by header -->
<section class="h-dvh">Content gets covered by header</section>

<!-- After: Compensated height that accounts for header -->
<section class="h-dvh-minus-header">Content is fully visible</section>
```

### Content that needs padding from top
```html
<!-- Add space equal to header height -->
<div class="pt-header">Content starts below header</div>

<!-- Add header height plus extra space -->  
<div class="pt-header-plus">Content with extra breathing room</div>
```

### Absolutely positioned elements
```html
<!-- Position element right below header -->
<div class="absolute top-header">Positioned below header</div>
```

## Responsive Behavior

The system automatically adjusts header height based on breakpoints:
- Mobile: 4.5rem total (3rem content + 1.5rem padding)
- Tablet+: 5rem total (3rem content + 2rem padding)

## Implementation Details

Header height is calculated as:
```scss
$header-height-mobile: $header-content-height + ($header-padding-mobile * 2)  // 4.5rem
$header-height-tablet: $header-content-height + ($header-padding-tablet * 2)  // 5rem
```

CSS custom property updates responsively:
```css
:root {
  --header-height: 4.5rem;
}

@media (min-width: 768px) {
  :root {
    --header-height: 5rem;
  }
}
```

## Migration Guide

Replace hard-coded viewport heights in components:

```scss
// Before
.animation-component--arttech {
  height: 100svh;
  height: 100dvh;
}

// After  
.animation-component--arttech {
  @extend .h-dvh-minus-header;
}
```

This ensures consistent behavior across all components and eliminates header overlay issues.