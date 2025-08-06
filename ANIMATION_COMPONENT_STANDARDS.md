# Animation Component Standards

This document outlines the standard patterns for creating reusable GSAP animation components in our Nuxt 4.x project.

## Standard Structure

### Template

```vue
<template>
  <div ref="containerRef" class="animation-container">
    <!-- Your SVG/animation content here -->
    <svg>
      <!-- Animation elements with refs -->
      <circle ref="elementRef" />
    </svg>
  </div>
</template>
```

### Script Setup Pattern

```vue
<script setup>
// Get GSAP from Nuxt app
const { $gsap } = useNuxtApp();
const { $GSDevTools } = useNuxtApp();

// Standard refs for animation components
const containerRef = ref(null);
const timeline = ref(null);

// Component-specific animation element refs
const elementRef = ref(null);

// Standard props for customization
const props = defineProps({
  showDevTools: {
    type: Boolean,
    default: false,
  },
  devToolsId: {
    type: String,
    default: () => `component-${Math.random().toString(36).substr(2, 9)}`,
  },
});

/**
 * Creates the animation timeline
 * Standard pattern for animation components
 * @returns {GSAPTimeline} The animation timeline
 */
const createAnimation = () => {
  // Ensure refs are available
  if (!elementRef.value) {
    console.warn("Component: Animation elements not found");
    return null;
  }

  // Create timeline
  const tl = $gsap.timeline({ repeat: -1 });

  // Your animation logic here
  tl.to(elementRef.value, {
    /* animation properties */
  });

  // Store timeline reference
  timeline.value = tl;

  // Create GSDevTools if enabled
  if (props.showDevTools) {
    nextTick(() => {
      $GSDevTools.create({
        animation: tl,
        container: containerRef.value,
        minimal: true,
        id: props.devToolsId,
        globalSync: false,
      });
    });
  }

  return tl;
};

// Standard animation component lifecycle
onMounted(() => {
  nextTick(() => {
    createAnimation();
  });
});

// Standard cleanup for animation components
onUnmounted(() => {
  if (timeline.value) {
    timeline.value.kill();
  }

  if (props.showDevTools) {
    try {
      $GSDevTools.getById(props.devToolsId)?.kill();
    } catch (e) {
      console.debug("GSDevTools cleanup:", e);
    }
  }
});

// Standard API for animation components
defineExpose({
  // Core refs and timeline
  containerRef,
  timeline,

  // Standard control methods
  play: () => timeline.value?.play(),
  pause: () => timeline.value?.pause(),
  restart: () => timeline.value?.restart(),
  reverse: () => timeline.value?.reverse(),
  seek: (time) => timeline.value?.seek(time),
});
</script>
```

### Standard Styles

```vue
<style scoped>
/* Standard animation component container */
.animation-container {
  background-color: #1e2843; /* Customize as needed */
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Standard GSDevTools integration */
.animation-container :deep(.gs-dev-tools) {
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8) !important;
  border-radius: 0 0 8px 8px !important;
}

/* Standard GSDevTools compact styling */
.animation-container :deep(.gs-dev-tools .gs-top) {
  padding: 0 0 !important;
  font-size: 11px !important;
}

.animation-container :deep(.gs-dev-tools .gs-bottom) {
  padding: 0 0 0 4px !important;
}

/* Standard SVG styling */
.animation-container :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
```

## Usage Examples

### Basic Usage

```vue
<ProjectBlueberry />
```

### With GSDevTools

```vue
<ProjectBlueberry :show-dev-tools="true" />
```

### Multiple Instances

```vue
<ProjectBlueberry :show-dev-tools="true" dev-tools-id="anim-1" />
<ProjectBlueberry :show-dev-tools="true" dev-tools-id="anim-2" />
```

### External Control

```vue
<template>
  <ProjectBlueberry ref="animRef" />
  <button @click="animRef?.pause()">Pause</button>
</template>

<script setup>
const animRef = ref(null);
</script>
```

## Standards Summary

### Required Refs

- `containerRef` - Main container element
- `timeline` - GSAP timeline reference

### Required Methods

- `createAnimation()` - Main animation setup
- Standard lifecycle: `onMounted()`, `onUnmounted()`

### Required Props

- `showDevTools` - Boolean for GSDevTools
- `devToolsId` - Unique ID for GSDevTools

### Required Exposed API

- `containerRef`, `timeline`
- `play()`, `pause()`, `restart()`, `reverse()`, `seek()`

### Required CSS Classes

- `.animation-container` - Main wrapper
- GSDevTools integration styles

This pattern ensures consistency across all animation components while allowing for customization where needed.
