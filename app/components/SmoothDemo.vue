<template>
  <!--
    Simple ScrollSmoother demo component
    - Tailwind-only styling (no SCSS)
    - Uses NuxtImg and a few paragraphs
    - Elements include data-speed/data-lag attributes for GSAP ScrollSmoother effects
    - Keep markup semantic and accessible
  -->
  <section
    aria-labelledby="smooth-demo-heading"
    class="container mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16"
  >
    <!-- Heading with slight parallax speed -->
    <header class="text-center">
      <h2
        id="smooth-demo-heading"
        class="text-3xl sm:text-4xl font-semibold tracking-tight"
        data-speed="0.95"
      >
        Smooth Scrolling Demo
      </h2>
      <p class="mt-4 text-base text-gray-500" data-speed="1.05">
        Minimal demo to verify GSAP ScrollSmoother effects. Scroll to see subtle
        motion on the image and text blocks.
      </p>
    </header>

    <!-- Image block -->
    <figure class="max-w-3xl mx-auto" aria-label="Demo image">
      <!--
        Use a local public asset to avoid external domain config.
        Add data-speed and data-lag so ScrollSmoother can animate it.
      -->
      <NuxtImg
        src="/icon.png"
        alt="Nuxt icon"
        class="w-full h-auto rounded-lg shadow-lg"
        width="1024"
        height="1024"
        sizes="(min-width: 1024px) 768px, 100vw"
        format="webp"
        loading="eager"
        decoding="async"
        data-speed="auto"
        data-lag="0.2"
      />
      <figcaption
        class="mt-3 text-center text-sm text-gray-500"
        data-speed="0.98"
      >
        Image uses data-speed="auto" and data-lag="0.2" for a smooth feel
      </figcaption>
    </figure>

    <!-- Paragraph block 1 -->
    <article class="max-w-3xl mx-auto space-y-6">
      <p class="text-lg leading-relaxed" data-speed="1.06">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vel enim
        vel nisl viverra bibendum. Integer tincidunt, purus id volutpat
        dignissim, libero lectus imperdiet dui, id accumsan ipsum mauris vitae
        risus. Integer egestas, nunc at hendrerit consectetur, ipsum ex
        facilisis lorem, at lobortis eros urna quis metus.
      </p>
      <p class="text-lg leading-relaxed text-gray-700" data-speed="0.94">
        Suspendisse potenti. Cras lobortis, arcu nec egestas rhoncus, felis
        lectus lobortis mi, vitae cursus risus sapien id magna. Donec id dui at
        nibh mattis sagittis. Sed nec faucibus lorem, non tincidunt nibh.
      </p>
    </article>

    <!-- Paragraph block 2 -->
    <article class="max-w-3xl mx-auto space-y-6">
      <p class="text-lg leading-relaxed" data-speed="1.02">
        Proin ac nunc a diam porttitor pulvinar. Morbi at efficitur neque. Donec
        feugiat erat vitae sagittis ornare. Pellentesque habitant morbi
        tristique senectus et netus et malesuada fames ac turpis egestas. Nam
        varius bibendum nunc, id aliquet nunc faucibus non.
      </p>
      <p class="text-lg leading-relaxed text-gray-700" data-speed="0.98">
        Integer porttitor, nisl id dapibus consectetur, mauris risus scelerisque
        nulla, vitae sollicitudin nisl augue at ante. In hac habitasse platea
        dictumst. Phasellus egestas, velit sit amet ullamcorper auctor, nibh sem
        consequat nisl, non vestibulum nibh libero id augue.
      </p>
    </article>
  </section>
  <!-- End of demo component -->
</template>

<script setup>
// No interactive logic required for the demo.
// The GSAP ScrollSmoother plugin (initialized globally) reads the
// data-speed and data-lag attributes when effects: true.

// Accessibility notes:
// - Section is labeled by the heading via aria-labelledby.
// - Figure/figcaption provide semantic description for the image content.
</script>

<!-- TailwindCSS only: No scoped styles. -->
