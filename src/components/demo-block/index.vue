<template>
  <view class="demo-block">
    <view class="px-4 py-2 text-sm">{{ title }}</view>
    <view class="demo-container">
      <slot />
    </view>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
})
</script>

<style lang="scss" scoped>
.demo-block {
  color: #666;

  &:not(:first-child) {
    margin-top: 15px;
  }

  &:not(:last-child) {
    margin-bottom: 15px;
  }
}
</style>
