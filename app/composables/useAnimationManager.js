/**
 * Simple Animation Manager
 * Just helps create GSAP animations and connect them to the store
 */
export const useAnimationManager = () => {
  const animationStore = useAnimationStore();
  const { $gsap } = useNuxtApp();

  /**
   * Create a simple animation that updates the store
   */
  const createAnimation = (name, timelineCreator) => {
    // Start the animation in the store
    animationStore.startAnimation(name);

    // Create and play the timeline
    const timeline = timelineCreator();

    // When animation completes, update the store
    timeline.eventCallback("onComplete", () => {
      animationStore.completeAnimation(name);
    });

    return timeline;
  };

  /**
   * Wait for an animation to complete
   */
  const waitForAnimation = (animationName) => {
    return new Promise((resolve) => {
      // If already completed, resolve immediately
      if (animationStore.isAnimationCompleted(animationName)) {
        resolve();
        return;
      }

      // Watch for completion
      const unwatch = watch(
        () => animationStore.isAnimationCompleted(animationName),
        (completed) => {
          if (completed) {
            unwatch();
            resolve();
          }
        }
      );
    });
  };

  return {
    createAnimation,
    waitForAnimation,
  };
};
