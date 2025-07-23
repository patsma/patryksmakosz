import { defineStore } from "pinia";

/**
 * Simple Animation Store
 * Just tracks animation states and provides easy methods
 */
export const useAnimationStore = defineStore("animation", () => {
  // Simple animation states
  const animations = ref({
    morphingLogo: { isRunning: false, isCompleted: false },
    logoHorizontal: { isRunning: false, isCompleted: false },
  });

  /**
   * Start an animation
   */
  const startAnimation = (name) => {
    if (animations.value[name]) {
      animations.value[name].isRunning = true;
      animations.value[name].isCompleted = false;
      console.log(`Started animation: ${name}`);
    }
  };

  /**
   * Complete an animation
   */
  const completeAnimation = (name) => {
    if (animations.value[name]) {
      animations.value[name].isRunning = false;
      animations.value[name].isCompleted = true;
      console.log(`Completed animation: ${name}`);
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

  return {
    animations,
    startAnimation,
    completeAnimation,
    isAnimationCompleted,
    isAnimationRunning,
  };
});
