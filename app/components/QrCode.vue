<template>
  <QrcodeVue
    :value="url"
    :size="size"
    level="L"
    render-as="svg"
    class="qr-code"
    :style="{ width: `${size}px`, height: `${size}px` }"
  />
</template>

<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'

interface Props {
  url: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 56,
})

const { size } = props
</script>

<style lang="scss" scoped>
.qr-code {
  flex-shrink: 0;
  opacity: 0.85;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

@media print {
  .qr-code {
    opacity: 1 !important;
  }
}
</style>
