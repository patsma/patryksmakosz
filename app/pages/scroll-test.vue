<template>
  <div class="scroll-test-page">
    <!-- Header section -->
    <section class="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
      <h1 class="text-6xl font-bold text-white text-center mb-8">ScrollSmoother Test</h1>
      
      <!-- Background elements with different data-speed values -->
      <div 
        class="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full"
        data-speed="0.5"
      ></div>
      <div 
        class="absolute top-20 right-20 w-24 h-24 bg-yellow-400/30 rounded-full"
        data-speed="0.3"
      ></div>
      <div 
        class="absolute bottom-32 left-1/4 w-40 h-40 bg-pink-400/25 rounded-full"
        data-speed="0.8"
      ></div>
    </section>

    <!-- Test section 1: data-speed variations -->
    <section class="min-h-screen bg-gray-100 py-20 relative">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-16">Data-Speed Effects</h2>
        
        <!-- Normal speed (no attribute) -->
        <div class="mb-16 p-8 bg-white rounded-lg shadow-lg">
          <h3 class="text-2xl font-semibold mb-4">Normal Speed (no data-speed)</h3>
          <p class="text-lg text-gray-700">This element moves at normal scroll speed.</p>
        </div>
        
        <!-- Slow speed -->
        <div class="mb-16 p-8 bg-blue-50 rounded-lg shadow-lg" data-speed="0.5">
          <h3 class="text-2xl font-semibold mb-4">Slow Speed (data-speed="0.5")</h3>
          <p class="text-lg text-gray-700">This element moves slower than the scroll, creating a parallax effect.</p>
        </div>
        
        <!-- Very slow speed -->
        <div class="mb-16 p-8 bg-green-50 rounded-lg shadow-lg" data-speed="0.2">
          <h3 class="text-2xl font-semibold mb-4">Very Slow Speed (data-speed="0.2")</h3>
          <p class="text-lg text-gray-700">This element moves much slower, creating a strong parallax effect.</p>
        </div>
        
        <!-- Fast speed -->
        <div class="mb-16 p-8 bg-red-50 rounded-lg shadow-lg" data-speed="1.5">
          <h3 class="text-2xl font-semibold mb-4">Fast Speed (data-speed="1.5")</h3>
          <p class="text-lg text-gray-700">This element moves faster than normal scroll speed.</p>
        </div>
      </div>
    </section>

    <!-- Test section 2: data-lag effects -->
    <section class="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 py-20 relative">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-16 text-white">Data-Lag Effects</h2>
        
        <!-- No lag -->
        <div class="mb-16 p-8 bg-white/90 rounded-lg shadow-lg">
          <h3 class="text-2xl font-semibold mb-4">No Lag (no data-lag)</h3>
          <p class="text-lg text-gray-700">This element has no lag effect.</p>
        </div>
        
        <!-- Small lag -->
        <div class="mb-16 p-8 bg-white/90 rounded-lg shadow-lg" data-lag="0.2">
          <h3 class="text-2xl font-semibold mb-4">Small Lag (data-lag="0.2")</h3>
          <p class="text-lg text-gray-700">This element has a subtle lag effect, creating smooth motion.</p>
        </div>
        
        <!-- Medium lag -->
        <div class="mb-16 p-8 bg-white/90 rounded-lg shadow-lg" data-lag="0.5">
          <h3 class="text-2xl font-semibold mb-4">Medium Lag (data-lag="0.5")</h3>
          <p class="text-lg text-gray-700">This element has a more noticeable lag effect.</p>
        </div>
        
        <!-- High lag -->
        <div class="mb-16 p-8 bg-white/90 rounded-lg shadow-lg" data-lag="0.8">
          <h3 class="text-2xl font-semibold mb-4">High Lag (data-lag="0.8")</h3>
          <p class="text-lg text-gray-700">This element has a strong lag effect, creating dramatic motion.</p>
        </div>
      </div>
    </section>

    <!-- Test section 3: Combined effects -->
    <section class="min-h-screen bg-gray-900 py-20 relative overflow-hidden">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-16 text-white">Combined Effects</h2>
        
        <!-- Background shapes with combined effects -->
        <div 
          class="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-30"
          data-speed="0.3"
          data-lag="0.4"
        ></div>
        <div 
          class="absolute top-1/2 right-20 w-48 h-48 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-40"
          data-speed="0.7"
          data-lag="0.2"
        ></div>
        <div 
          class="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-25"
          data-speed="0.1"
          data-lag="0.6"
        ></div>
        
        <!-- Content with combined effects -->
        <div class="relative z-10">
          <div class="mb-16 p-8 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20" data-speed="0.6" data-lag="0.3">
            <h3 class="text-2xl font-semibold mb-4 text-white">Speed + Lag Combo 1</h3>
            <p class="text-lg text-gray-300">data-speed="0.6" data-lag="0.3" - Smooth and elegant motion.</p>
          </div>
          
          <div class="mb-16 p-8 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20" data-speed="1.2" data-lag="0.5">
            <h3 class="text-2xl font-semibold mb-4 text-white">Speed + Lag Combo 2</h3>
            <p class="text-lg text-gray-300">data-speed="1.2" data-lag="0.5" - Fast with smooth transitions.</p>
          </div>
          
          <div class="mb-16 p-8 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20" data-speed="0.2" data-lag="0.8">
            <h3 class="text-2xl font-semibold mb-4 text-white">Speed + Lag Combo 3</h3>
            <p class="text-lg text-gray-300">data-speed="0.2" data-lag="0.8" - Very slow with dramatic lag.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Image Parallax Test Section -->
    <section class="min-h-screen bg-gradient-to-b from-orange-400 to-red-500 py-20 relative">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-16 text-white">Image Parallax Tests</h2>
        
        <!-- Test different image parallax speeds -->
        <div class="grid md:grid-cols-3 gap-8 mb-16">
          <!-- Auto-calculated parallax (recommended) -->
          <div class="image image--parallax-01 h-64 rounded-lg overflow-hidden relative">
            <NuxtImg
              src="/og.jpg"
              alt="Auto parallax test"
              data-speed="auto"
              data-lag="0.2"
              class="w-full h-[120%] object-cover"
              format="webp"
            />
            <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
              <p class="text-white font-semibold">data-speed="auto"</p>
              <p class="text-white text-sm mt-1">Auto-calculated optimal distance</p>
            </div>
          </div>

          <!-- Manual slow parallax -->
          <div class="image image--parallax-01 h-64 rounded-lg overflow-hidden relative">
            <NuxtImg
              src="/og.jpg"
              alt="Slow parallax test"
              data-speed="0.3"
              data-lag="0.15"
              class="w-full h-[130%] object-cover"
              format="webp"
            />
            <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
              <p class="text-white font-semibold">data-speed="0.3"</p>
              <p class="text-white text-sm mt-1">Manual slow parallax</p>
            </div>
          </div>

          <!-- Manual fast parallax -->
          <div class="image image--parallax-01 h-64 rounded-lg overflow-hidden relative">
            <NuxtImg
              src="/og.jpg"
              alt="Fast parallax test"
              data-speed="1.2"
              data-lag="0.1"
              class="w-full h-[140%] object-cover"
              format="webp"
            />
            <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
              <p class="text-white font-semibold">data-speed="1.2"</p>
              <p class="text-white text-sm mt-1">Manual fast parallax</p>
            </div>
          </div>
        </div>

        <!-- Large hero-style parallax image with auto calculation -->
        <div class="image image--parallax-01 h-96 rounded-2xl overflow-hidden relative">
          <NuxtImg
            src="/og.jpg"
            alt="Hero parallax test"
            data-speed="auto"
            data-lag="0.3"
            class="w-full h-[125%] object-cover"
            format="webp"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center p-8">
            <div class="text-center text-white">
              <h3 class="text-3xl font-bold mb-2">Hero Auto Parallax</h3>
              <p class="text-lg opacity-90">data-speed="auto" data-lag="0.3"</p>
              <p class="text-sm opacity-75 mt-2">ScrollSmoother calculates perfect movement range</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Instructions section -->
    <section class="min-h-screen bg-white py-20">
      <div class="container mx-auto px-4 max-w-4xl">
        <h2 class="text-4xl font-bold text-center mb-16">ScrollSmoother Usage Guide</h2>
        
        <div class="prose prose-lg max-w-none">
          <h3>Data Attributes</h3>
          <ul>
            <li><strong>data-speed</strong>: Controls parallax speed
              <ul>
                <li><strong>"auto"</strong> = ScrollSmoother automatically calculates optimal parallax distance based on element overflow (RECOMMENDED)</li>
                <li>0.5 = moves at half scroll speed (slower parallax)</li>
                <li>1.0 = normal scroll speed (default)</li>
                <li>1.5 = moves faster than scroll</li>
              </ul>
            </li>
            <li><strong>data-lag</strong>: Controls motion lag/easing (0-1 range)
              <ul>
                <li>0 = no lag (immediate)</li>
                <li>0.5 = medium lag (smooth)</li>
                <li>0.9 = high lag (very smooth/floating)</li>
              </ul>
            </li>
          </ul>
          
          <h3>Best Practices</h3>
          <ul>
            <li>Use subtle values for better UX (avoid extreme effects)</li>
            <li>Test on different devices and screen sizes</li>
            <li>Combine data-speed and data-lag for rich motion</li>
            <li>Consider accessibility - provide option to disable effects</li>
          </ul>
          
          <h3>Technical Notes</h3>
          <ul>
            <li>Effects are disabled on touch devices by default</li>
            <li>ScrollSmoother works within #smooth-wrapper and #smooth-content</li>
            <li>Uses transform-based animations for better performance</li>
            <li>Automatically syncs with ScrollTrigger</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Test page for ScrollSmoother data-speed and data-lag effects
// Navigate to /scroll-test to see all effects in action

useHead({
  title: 'ScrollSmoother Test Page',
  meta: [
    { name: 'description', content: 'Test page for GSAP ScrollSmoother data-speed and data-lag effects' }
  ]
})

// ScrollSmoother handles data-speed and data-lag automatically - no composable needed
</script>

<style scoped>
.scroll-test-page {
  /* Ensure smooth scrolling behavior */
  scroll-behavior: smooth;
}

/* Add some visual interest to test elements */
.scroll-test-page section {
  position: relative;
}

/* Ensure proper stacking context for layered effects */
.scroll-test-page .relative {
  position: relative;
}

/* Smooth transitions for interactive elements */
.scroll-test-page [data-speed],
.scroll-test-page [data-lag] {
  transition-property: transform;
  will-change: transform;
}
</style>