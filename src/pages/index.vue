<script setup>
import AppFooter from '@/components/AppFooter.vue'
import AppLogos from '@/components/AppLogos.vue'
import InputEntry from '@/components/InputEntry.vue'
</script>

<template>
  <view class="root-container">
    <AppLogos />
    <InputEntry />
    <AppFooter />
  </view>
</template>

<style lang="scss" scoped>
.root-container {
  padding: 5rem 2.5rem;
  text-align: center;
  background: $uni-bg-color-page;
  min-height: 100vh;
}
</style>
