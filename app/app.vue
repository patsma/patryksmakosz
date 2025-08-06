<template>
  <div class="min-h-screen">
    <!-- Infinite Drag Grid Component -->
    <!-- <InfiniteDragGrid /> -->

    <MorphingLogo
      class="fixed z-10 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto"
    />
    <LogoHorizontal
      class="fixed z-10 cursor-pointer left-1/2 top-8 -translate-x-1/2 -translate-y-1/2 w-full h-10"
    />

    <!-- Test the Blueberry component -->
    <ProjectBlueberry
      ref="blueberryRef"
      class="z-20 bottom-4 right-4 w-96 h-96 rounded-lg shadow-lg"
    />

    <!-- Control buttons for testing -->
    <div class="fixed top-4 left-4 flex gap-2 z-30">
      <button
        @click="handlePause"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Pause
      </button>
      <button
        @click="handlePlay"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Play
      </button>
      <button
        @click="handleRestart"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Restart
      </button>
    </div>
  </div>
</template>

<script setup>
// Template ref for the ProjectBlueberry component
const blueberryRef = ref(null);

// Control methods with proper error handling
const handlePause = () => {
  if (blueberryRef.value?.pause) {
    blueberryRef.value.pause();
  } else {
    console.warn("Blueberry component not ready or pause method not available");
  }
};

const handlePlay = () => {
  if (blueberryRef.value?.play) {
    blueberryRef.value.play();
  } else {
    console.warn("Blueberry component not ready or play method not available");
  }
};

const handleRestart = () => {
  if (blueberryRef.value?.restart) {
    blueberryRef.value.restart();
  } else {
    console.warn(
      "Blueberry component not ready or restart method not available"
    );
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  appearance: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  overscroll-behavior-x: none; /* Prevent go to previous page */
  overflow: hidden;
}

/* SVG styles */
svg {
  width: 100%;
  height: 100%;
}
</style>
