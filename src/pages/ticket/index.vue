<route lang="json5">
    {
      style: {
        navigationBarTitleText: '门票',
      },
    }
</route>

<template>
  <view class="h-screen overflow-hidden">
    <view class="mx-4">
      <wd-skeleton :row-col="imageGroup" />
    </view>
  </view>
</template>

<script lang="ts" setup>
const imageGroup = [
  { height: '171px' }, 1, { width: '107px' },
]
</script>