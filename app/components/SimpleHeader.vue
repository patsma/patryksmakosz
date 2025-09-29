<template>
  <!-- Minimal Tailwind-only header navigation -->
  <div
    class="bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur border-b border-gray-200"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <nav class="flex items-center justify-between h-14" aria-label="Primary">
        <div class="flex items-center gap-6">
          <NuxtLink
            to="/"
            class="text-sm font-medium text-gray-900 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="text-sm font-medium text-gray-700 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            About
          </NuxtLink>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
// Simple nav only. Renders links to Home and About.
// Styling uses Tailwind utilities exclusively.
</script>

<!-- No scoped styles; Tailwind only. -->
