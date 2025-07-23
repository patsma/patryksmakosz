# Simple GSAP Animation System for Nuxt 4

A clean and simple animation system built with GSAP, Pinia, and Nuxt 4 that makes it easy to coordinate animations across your app.

## Features

- **Simple State Tracking**: Know when animations start and complete
- **Animation Coordination**: Trigger animations when others finish
- **Easy-to-Use API**: Just two main functions to learn
- **No Overhead**: Lightweight and straightforward

## How It Works

### 1. Animation Store (`stores/animation.js`)

Tracks animation states with simple methods:

```javascript
const animationStore = useAnimationStore();

// Start an animation
animationStore.startAnimation("myAnimation");

// Complete an animation
animationStore.completeAnimation("myAnimation");

// Check if animation is done
if (animationStore.isAnimationCompleted("myAnimation")) {
  // Do something
}
```

### 2. Animation Manager (`composables/useAnimationManager.js`)

Two main functions for creating animations:

```javascript
const { createAnimation, waitForAnimation } = useAnimationManager();
```

## Usage Examples

### Basic Animation

```javascript
// In a component
const { createAnimation } = useAnimationManager();
const { $gsap } = useNuxtApp();

const startMyAnimation = () => {
  createAnimation("myAnimation", () => {
    return $gsap.timeline().to(".my-element", {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
    });
  });
};
```

### Animation Coordination

```javascript
// Wait for one animation to complete, then start another
const { createAnimation, waitForAnimation } = useAnimationManager();

const startSequence = async () => {
  // Wait for first animation to complete
  await waitForAnimation("firstAnimation");

  // Start second animation
  createAnimation("secondAnimation", () => {
    return $gsap
      .timeline()
      .fromTo(
        ".logo",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 }
      );
  });
};
```

### Real Example: Logo Fade-In After Morphing

```javascript
// In LogoHorizontal.vue
const startFadeInAnimation = async () => {
  // Wait for morphing logo to complete
  await waitForAnimation("morphingLogo");

  // Create fade-in animation
  createAnimation("logoHorizontal", () => {
    return $gsap
      .timeline()
      .fromTo(
        ".logo-horizontal",
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: "power2.out" }
      );
  });
};
```

## Animation States

The system tracks these animation states:

- `morphingLogo`: The initial logo morphing animation
- `logoHorizontal`: The horizontal logo fade-in animation

### Adding New Animation States

```javascript
// In stores/animation.js
const animations = ref({
  // ... existing states
  myNewAnimation: { isRunning: false, isCompleted: false },
});
```

## Best Practices

### 1. Use Descriptive Names

```javascript
// ✅ Good
createAnimation("heroSectionFadeIn", () => timeline);

// ❌ Avoid
createAnimation("anim1", () => timeline);
```

### 2. Wait for Dependencies

```javascript
// ✅ Good - wait for completion
await waitForAnimation("previousAnimation");
createAnimation("nextAnimation", () => timeline);

// ❌ Avoid - might start too early
createAnimation("nextAnimation", () => timeline);
```

### 3. Keep Animations Simple

```javascript
// ✅ Good - one clear purpose
createAnimation("fadeIn", () => {
  return $gsap.timeline().to(".element", { opacity: 1, duration: 1 });
});

// ❌ Avoid - too complex
createAnimation("everything", () => {
  return $gsap
    .timeline()
    .to(".element1", { opacity: 1 })
    .to(".element2", { scale: 1.2 })
    .to(".element3", { rotation: 360 });
  // ... many more
});
```

## API Reference

### `createAnimation(name, timelineCreator)`

Creates and plays a GSAP animation, automatically tracking its state.

**Parameters:**

- `name` (string): Animation name for tracking
- `timelineCreator` (function): Function that returns a GSAP timeline

**Returns:** GSAP timeline

### `waitForAnimation(animationName)`

Returns a promise that resolves when the specified animation completes.

**Parameters:**

- `animationName` (string): Name of animation to wait for

**Returns:** Promise

## Troubleshooting

### Animation Not Starting

- Check if animation name exists in store
- Make sure timelineCreator returns a timeline
- Check console for GSAP errors

### Animation Not Completing

- Ensure timeline has proper duration
- Check if timeline is being killed prematurely
- Verify onComplete callback is working

### Coordination Not Working

- Make sure you're using `await waitForAnimation()`
- Check animation names match exactly
- Verify animation actually completes

## Migration from Complex Systems

If you have existing complex animation systems:

1. Replace complex stores with simple state tracking
2. Use `createAnimation()` instead of manual timeline management
3. Use `waitForAnimation()` for coordination instead of complex queues
4. Remove unnecessary contexts and cleanup code

## That's It!

This system is intentionally simple. You can:

- ✅ Track animation states
- ✅ Coordinate animations
- ✅ Create GSAP timelines
- ✅ Wait for animations to complete

No complex queues, contexts, or managers needed. Just create animations and coordinate them when needed.
