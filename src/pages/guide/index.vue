<route lang="json5" type="home">
    {
      style: {
        navigationStyle: 'custom'
      },
    }
</route>

<template>
  <view class="main"></view>
</template>

<script lang="ts" setup>

onLoad(async () => {
  uni.switchTab({
    url: '/pages/index/index'
  });
})
</script>

<style>
page,
.main {
  @apply w-full h-screen overflow-hidden;
  height: 100vh;
}
</style>