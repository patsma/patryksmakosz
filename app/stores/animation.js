import { defineStore } from "pinia";

/**
 * Simple Animation Store
 * Just tracks animation states and provides easy methods
 */
export const useAnimationStore = defineStore("animation", () => {
  // Simple animation states with duration tracking
  const animations = ref({
    morphingLogo: {
      isRunning: false,
      isCompleted: false,
      duration: 0,
      startTime: 0,
    },
    logoHorizontal: {
      isRunning: false,
      isCompleted: false,
      duration: 0,
      startTime: 0,
    },
  });

  /**
   * Start an animation with duration
   */
  const startAnimation = (name, duration = 0) => {
    if (animations.value[name]) {
      animations.value[name].isRunning = true;
      animations.value[name].isCompleted = false;
      animations.value[name].duration = duration;
      animations.value[name].startTime = Date.now();
      // console.log(`Started animation: ${name} (duration: ${duration}s)`);
    }
  };

  /**
   * Complete an animation
   */
  const completeAnimation = (name) => {
    if (animations.value[name]) {
      animations.value[name].isRunning = false;
      animations.value[name].isCompleted = true;
      // console.log(`Completed animation: ${name}`);
    }
  };

  /**
   * Check if animation is completed
   */
  const isAnimationCompleted = (name) => {
    return animations.value[name]?.isCompleted || false;
  };

  /**
   * Check if animation is running
   */
  const isAnimationRunning = (name) => {
    return animations.value[name]?.isRunning || false;
  };

  /**
   * Get animation duration
   */
  const getAnimationDuration = (name) => {
    return animations.value[name]?.duration || 0;
  };

  /**
   * Get animation start time
   */
  const getAnimationStartTime = (name) => {
    return animations.value[name]?.startTime || 0;
  };

  /**
   * Calculate when animation will complete (in seconds from now)
   */
  const getAnimationCompletionTime = (name) => {
    const animation = animations.value[name];
    if (!animation || !animation.isRunning) return 0;

    const elapsed = (Date.now() - animation.startTime) / 1000;
    return Math.max(0, animation.duration - elapsed);
  };

  return {
    animations,
    startAnimation,
    completeAnimation,
    isAnimationCompleted,
    isAnimationRunning,
    getAnimationDuration,
    getAnimationStartTime,
    getAnimationCompletionTime,
  };
});
