<template>
  <!--
    Alternative SmoothSmoother demo component
    - Tailwind-only, no SCSS
    - Two-column layout: image + text (and reversed block)
    - Uses NuxtImg with data-speed/data-lag for subtle effects
  -->
  <section aria-labelledby="alt-smooth-heading" class="py-16">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
      <header class="text-center">
        <h2
          id="alt-smooth-heading"
          class="text-3xl sm:text-4xl font-semibold tracking-tight"
          data-speed="1.04"
        >
          Smooth Demo (Alt Layout)
        </h2>
        <p class="mt-4 text-base text-gray-500" data-speed="0.96">
          A simple two-column composition to test ScrollSmoother on another page.
        </p>
      </header>

      <!-- Block A: Image left, text right -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <figure class="order-1" aria-label="Wide demo image">
          <NuxtImg
            src="/og.jpg"
            alt="Sample wide image"
            class="w-full h-auto rounded-xl shadow-md"
            width="1200"
            height="630"
            sizes="(min-width: 1024px) 900px, 100vw"
            format="webp"
            loading="eager"
            decoding="async"
            data-speed="auto"
            data-lag="0.25"
          />
          <figcaption class="mt-3 text-sm text-gray-500" data-speed="1.02">
            Wide image with auto speed and small lag
          </figcaption>
        </figure>

        <article class="order-2 space-y-5">
          <h3 class="text-2xl font-medium" data-speed="0.97">Clean and minimal</h3>
          <p class="text-lg leading-relaxed text-gray-800" data-speed="1.06">
            This layout uses a simple grid. The image on the left moves slightly
            differently than the text on the right, creating a subtle depth
            effect while scrolling.
          </p>
          <p class="text-lg leading-relaxed text-gray-700" data-speed="0.94">
            Tailwind utilities provide spacing and typography. No component
            logic is required. The ScrollSmoother plugin picks up the
            data-speed/data-lag attributes automatically.
          </p>
        </article>
      </div>

      <!-- Block B: Text left, image right -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <article class="order-2 lg:order-1 space-y-5">
          <h3 class="text-2xl font-medium" data-speed="1.03">Reversed section</h3>
          <p class="text-lg leading-relaxed text-gray-800" data-speed="0.95">
            Here we reverse the grid order on large screens to verify effects in
            different content flows. Try fast and slow scrolls to observe the
            easing behavior.
          </p>
          <p class="text-lg leading-relaxed text-gray-700" data-speed="1.05">
            You can tweak the numbers (e.g., 0.9 or 1.1) if you need stronger
            motion. Keep values close to 1.0 for subtlety.
          </p>
        </article>

        <figure class="order-1 lg:order-2" aria-label="Icon demo image">
          <NuxtImg
            src="/icon.png"
            alt="Nuxt icon"
            class="w-full max-w-lg mx-auto h-auto rounded-2xl shadow-lg"
            width="1024"
            height="1024"
            sizes="(min-width: 1024px) 600px, 100vw"
            format="webp"
            loading="lazy"
            decoding="async"
            data-speed="auto"
            data-lag="0.15"
          />
          <figcaption class="mt-3 text-center text-sm text-gray-500" data-speed="1.0">
            Icon with a lighter lag value
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup>
// No component logic necessary. GSAP ScrollSmoother reads data attributes.
// Accessibility: aria-labelledby ties the section to the heading.
</script>

<!-- Tailwind-only styles -->

